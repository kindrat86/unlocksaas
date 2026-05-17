#!/usr/bin/env python3
"""
One-shot setup for CRON_SECRET — the Bearer token Vercel Crons inject on every
scheduled request, verified by the /api/cron/* route handlers.

Why this exists: the locked secret-entry convention (see memory file
project_unlocksaas_infra.md) requires every secret to flow through a
dedicated setup-*.py script. CRON_SECRET differs from every other secret in
the repo in one important way — it is GENERATED, not provided by a vendor.
That means there's nothing for the operator to paste, and we can take the
human entirely out of the loop, eliminating the paste-leak attack surface
entirely.

Flow:
  1. Verify this worktree is linked to the unlocksaas Vercel project. If not,
     run `vercel link --yes` with the project + scope locked in
     project_unlocksaas_vercel.md memory.
  2. Generate a 32-byte hex secret via secrets.token_hex(32). The value lives
     only in this process's memory until step 3.
  3. Pipe the value to `vercel env add CRON_SECRET <env> --sensitive --yes`
     via subprocess stdin. The value never touches the shell, never lands in
     ~/.zsh_history, never appears in process listings (ps), never goes to
     scrollback.
  4. Optionally also write to .env.development.local for local cron testing.

Targets:
  --env production    (default — required for live cron auth)
  --env preview       (only if you want preview deploys to run crons)
  --env development   (writes to .env.development.local AND/OR Vercel dev env)
  --env all           (production + preview + writes to local dev file)

Rotation: re-run any time. Each invocation generates a NEW secret. Previous
in-flight cron requests authenticated with the old secret will start failing
the moment the new value lands on Vercel. Vercel Crons re-fetch the env on
each invocation, so the next scheduled tick uses the new value.

Usage:
  python3 scripts/setup-cron-secret.py                # production only
  python3 scripts/setup-cron-secret.py --env all      # all envs + local file
  python3 scripts/setup-cron-secret.py --env preview  # preview only (rare)
"""

from __future__ import annotations

import argparse
import json
import os
import secrets
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VERCEL_PROJECT = "unlocksaas"
VERCEL_SCOPE = "sales-3429s-projects"
ENV_LOCAL_FILE = REPO_ROOT / ".env.development.local"
ENV_TEMPLATE = REPO_ROOT / ".env.example"
KEY_NAME = "CRON_SECRET"


def ensure_linked() -> None:
    """If .vercel/project.json is missing in this worktree, run vercel link."""
    project_json = REPO_ROOT / ".vercel" / "project.json"
    if project_json.exists():
        return
    print(f"[setup-cron-secret] linking worktree to {VERCEL_PROJECT}…")
    result = subprocess.run(
        [
            "vercel",
            "link",
            "--yes",
            "--project",
            VERCEL_PROJECT,
            "--scope",
            VERCEL_SCOPE,
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit(
            "ERROR: `vercel link` failed. Run `vercel login` and retry, or "
            "link manually with `vercel link --yes --project unlocksaas "
            f"--scope {VERCEL_SCOPE}`."
        )


def push_to_vercel(env_target: str, value: str) -> None:
    """
    Add CRON_SECRET to a single Vercel env (production | preview | development).

    Uses --force to overwrite any existing value (rotation case). The value is
    piped via stdin so it never appears on the command line or in shell history.

    --sensitive is honoured on production + preview but rejected server-side on
    development (per the Vercel CLI quirk documented in
    project_unlocksaas_vercel.md). Skip it for development.
    """
    args = ["vercel", "env", "add", KEY_NAME, env_target, "--force", "--yes"]
    # Vercel CLI agent-mode quirk (documented in project_unlocksaas_vercel.md):
    # with the claude-code-hint header set, `vercel env add NAME preview`
    # refuses to proceed without an explicit Git branch positional. Passing an
    # empty string applies the var to ALL preview branches, which is what we
    # want for a globally-generated secret.
    if env_target == "preview":
        args.insert(5, "")
    if env_target != "development":
        args.append("--sensitive")

    print(f"[setup-cron-secret] pushing {KEY_NAME} to Vercel {env_target}…")
    result = subprocess.run(
        args,
        cwd=REPO_ROOT,
        input=value + "\n",
        capture_output=True,
        text=True,
    )
    # Vercel CLI exits 0 on success and prints the new var name. Bail on any
    # other outcome and surface the stderr for triage.
    if result.returncode != 0:
        # Filter any accidental echo of the value out of error output before
        # printing — defence in depth.
        safe_err = result.stderr.replace(value, "<redacted>")
        safe_out = result.stdout.replace(value, "<redacted>")
        print(safe_out, file=sys.stderr)
        print(safe_err, file=sys.stderr)
        sys.exit(f"ERROR: vercel env add failed for env={env_target}.")
    print(f"  ✓ Vercel {env_target} updated.")


def write_local(value: str) -> None:
    """Persist CRON_SECRET in .env.development.local so local cron testing works."""
    if not ENV_LOCAL_FILE.exists():
        if ENV_TEMPLATE.exists():
            ENV_LOCAL_FILE.write_text(ENV_TEMPLATE.read_text())
        else:
            ENV_LOCAL_FILE.write_text("")
    text = ENV_LOCAL_FILE.read_text()
    lines = text.splitlines()
    new_line = f"{KEY_NAME}={value}"
    replaced = False
    out_lines = []
    for line in lines:
        # Match real assignments only; ignore commented lines.
        if line.lstrip().startswith("#"):
            out_lines.append(line)
            continue
        if line.split("=", 1)[0].strip() == KEY_NAME:
            out_lines.append(new_line)
            replaced = True
        else:
            out_lines.append(line)
    if not replaced:
        if out_lines and out_lines[-1] != "":
            out_lines.append("")
        out_lines.append(new_line)
    ENV_LOCAL_FILE.write_text("\n".join(out_lines) + "\n")
    # 0600 so other users on the same Mac can't read it.
    os.chmod(ENV_LOCAL_FILE, 0o600)
    print(f"  ✓ {ENV_LOCAL_FILE.name} updated (mode 0600).")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--env",
        choices=["production", "preview", "development", "all"],
        default="production",
        help="Which Vercel env(s) to update. Default: production.",
    )
    parser.add_argument(
        "--local",
        action="store_true",
        help="Also write to .env.development.local (implied when --env=development or --env=all).",
    )
    args = parser.parse_args()

    ensure_linked()

    # Generate the secret. 32 bytes hex = 64 chars; well above Vercel's
    # signing recommendation and high enough entropy that brute-force is
    # computationally infeasible even with a leaked HMAC oracle.
    value = secrets.token_hex(32)

    targets = (
        ["production", "preview", "development"]
        if args.env == "all"
        else [args.env]
    )
    for env in targets:
        push_to_vercel(env, value)

    if args.local or args.env in ("development", "all"):
        write_local(value)

    # Sanity readback: confirm Vercel returns the var. We DO NOT print the
    # value back — `vercel env ls` returns only metadata, which is what we
    # want.
    print()
    print("[setup-cron-secret] verifying via `vercel env ls`…")
    ls = subprocess.run(
        ["vercel", "env", "ls"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    matches = [line for line in ls.stdout.splitlines() if KEY_NAME in line]
    if not matches:
        sys.exit(
            "WARN: vercel env ls did not list CRON_SECRET — push may have "
            "succeeded but readback failed. Check `vercel env ls` manually."
        )
    for line in matches:
        print(f"  {line.strip()}")

    print()
    print("✓ Done. The Seinfeld cron at /api/cron/seinfeld now has an auth secret.")
    print("  Next scheduled tick: Mon/Wed/Fri 15:00 UTC.")


if __name__ == "__main__":
    main()
