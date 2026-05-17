#!/usr/bin/env python3
"""
One-shot setup for INDEXNOW_KEY — the public token Bing / Yandex / Naver /
Seznam / Yep fetch from /indexnow.txt to verify that URL submissions to
api.indexnow.org were sent by the legitimate site owner.

Why this exists: the SEO audit deduction "no IndexNow ping on deploy" is
fixed by three pieces — the route handler at app/src/app/indexnow.txt that
serves the key, the helper at app/src/lib/seo/indexnow.ts that POSTs to the
API, and the webhook + cron that fire the submission. All three read
INDEXNOW_KEY from env. This script is what puts the value behind those
readers.

Differs from the other setup-*.py scripts in two ways:
  1. INDEXNOW_KEY is intentionally PUBLIC. The handler serves it verbatim
     at https://unlocksaas.com/indexnow.txt — that's the protocol's design.
     So we skip --sensitive on Vercel envs.
  2. Generation rules: IndexNow keys must be 8–128 chars from [A-Za-z0-9-].
     We generate 32 chars from secrets.token_urlsafe and strip non-alphanum
     so the result fits the spec and reads cleanly in the on-disk text file.

Flow:
  1. Verify this worktree is linked to the unlocksaas Vercel project.
  2. Generate a 32-char alphanumeric key.
  3. `vercel env add INDEXNOW_KEY <env>` (NO --sensitive — public token).
  4. Optionally write to .env.development.local so the local dev server's
     /indexnow.txt route serves the same key.

Rotation: re-run any time. The next deploy serves the new key; in-flight
submissions sent with the old key will be rejected by the engines (they
re-fetch /indexnow.txt and see a different value). Practical rotation
trigger: when you suspect the key has been used by someone else to submit
spam URLs against your domain — the engines blocklist domains that submit
junk so this matters.

Usage:
  python3 scripts/setup-indexnow-key.py                # production only
  python3 scripts/setup-indexnow-key.py --env all      # all envs + local file
"""

from __future__ import annotations

import argparse
import os
import secrets
import string
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VERCEL_PROJECT = "unlocksaas"
VERCEL_SCOPE = "sales-3429s-projects"
ENV_LOCAL_FILE = REPO_ROOT / ".env.development.local"
ENV_TEMPLATE = REPO_ROOT / ".env.example"
KEY_NAME = "INDEXNOW_KEY"
KEY_LEN = 32  # well inside IndexNow's [8, 128] window
KEY_ALPHABET = string.ascii_letters + string.digits  # [A-Za-z0-9]


def ensure_linked() -> None:
    project_json = REPO_ROOT / ".vercel" / "project.json"
    if project_json.exists():
        return
    print(f"[setup-indexnow-key] linking worktree to {VERCEL_PROJECT}…")
    result = subprocess.run(
        ["vercel", "link", "--yes",
         "--project", VERCEL_PROJECT, "--scope", VERCEL_SCOPE],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit("ERROR: `vercel link` failed. Run `vercel login` and retry.")


def generate_key() -> str:
    """32 chars from [A-Za-z0-9]. Matches the regex in src/lib/seo/indexnow.ts."""
    return "".join(secrets.choice(KEY_ALPHABET) for _ in range(KEY_LEN))


def push_to_vercel(env_target: str, value: str) -> None:
    """
    Add INDEXNOW_KEY to a single Vercel env. The token is PUBLIC by protocol
    design — served verbatim at /indexnow.txt — so we do NOT pass --sensitive
    here. That keeps the value retrievable via `vercel env pull` for the
    operator who needs to confirm what's deployed.
    """
    args = ["vercel", "env", "add", KEY_NAME, env_target, "--force", "--yes"]
    if env_target == "preview":
        # Apply to all preview branches (see setup-cron-secret.py for the
        # documented Vercel-CLI agent-mode quirk).
        args.insert(5, "")
    print(f"[setup-indexnow-key] pushing {KEY_NAME} to Vercel {env_target}…")
    result = subprocess.run(
        args, cwd=REPO_ROOT, input=value + "\n",
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        safe_err = result.stderr.replace(value, "<redacted>")
        safe_out = result.stdout.replace(value, "<redacted>")
        print(safe_out, file=sys.stderr)
        print(safe_err, file=sys.stderr)
        sys.exit(f"ERROR: vercel env add failed for env={env_target}.")
    print(f"  ✓ Vercel {env_target} updated.")


def write_local(value: str) -> None:
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
    os.chmod(ENV_LOCAL_FILE, 0o600)
    print(f"  ✓ {ENV_LOCAL_FILE.name} updated (mode 0600).")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--env",
        choices=["production", "preview", "development", "all"],
        default="production",
    )
    parser.add_argument("--local", action="store_true")
    args = parser.parse_args()

    ensure_linked()
    value = generate_key()

    targets = (
        ["production", "preview", "development"]
        if args.env == "all"
        else [args.env]
    )
    for env in targets:
        push_to_vercel(env, value)

    if args.local or args.env in ("development", "all"):
        write_local(value)

    print()
    print("✓ Done. INDEXNOW_KEY is set. After the next deploy:")
    print("  - https://unlocksaas.com/indexnow.txt will serve the key.")
    print("  - The Vercel deployment webhook will ping api.indexnow.org.")
    print("  - The weekly cron at /api/cron/indexnow will re-submit on Sundays.")


if __name__ == "__main__":
    main()
