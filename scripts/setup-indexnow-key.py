#!/usr/bin/env python3
"""
One-shot setup for INDEXNOW_KEY — the public token Bing/Yandex/Naver/Seznam
fetch from /indexnow-key to verify that URL submissions to api.indexnow.org
were sent by the legitimate site owner.

How the integration works once this script has run:
  1. /indexnow-key (app/src/app/indexnow-key/route.ts) serves the key
     verbatim. The route 503s when the env is missing — loud failure
     so the gap is visible in Vercel logs the first time an IndexNow
     validator hits the endpoint after deploy.
  2. /api/cron/indexnow (vercel.json schedule: 0 18 * * *) wakes daily,
     reads the same env, and POSTs every public marketing URL to
     api.indexnow.org with keyLocation=https://unlocksaas.com/indexnow-key.
  3. Bing, Yandex, Naver, Seznam re-index within seconds-to-minutes
     instead of the 1–3 day passive sitemap crawl cadence.

This script just handles step 0: generate a real key, push it to Vercel
without ever exposing it in shell history.

Format contract (must match the validator in app/src/app/indexnow-key/route.ts
AND app/src/app/api/cron/indexnow/route.ts): 8+ characters from [a-f0-9-].
We emit 32 hex chars from secrets.token_hex(16), which is unambiguously
inside the validator regex and well above the 8-char floor.

Sensitive flag: NO. INDEXNOW_KEY is a public token by protocol design —
it's served on a public URL at /indexnow-key. Marking it sensitive in
Vercel would mislead the UI about its threat model. Loss-of-value is
zero; rotation cost is one re-run of this script + one redeploy.

Rotation: re-run any time. The next deploy serves the new key; any
in-flight IndexNow submissions sent with the old key will be rejected
when the engine re-fetches /indexnow-key and sees a different value.
Operationally rotate when there's evidence the key has been used to
submit spam URLs against your domain (engines blocklist abusive hosts).

Usage:
  python3 scripts/setup-indexnow-key.py                # production only
  python3 scripts/setup-indexnow-key.py --env all      # all envs + local file
"""

from __future__ import annotations

import argparse
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
KEY_NAME = "INDEXNOW_KEY"
KEY_LENGTH = 32  # well inside the 8–128 spec window; large enough that
                 # accidental collisions across rotations are improbable.


def ensure_linked() -> None:
    """If .vercel/project.json is missing in this worktree, run vercel link."""
    project_json = REPO_ROOT / ".vercel" / "project.json"
    if project_json.exists():
        return
    print(f"[setup-indexnow-key] linking worktree to {VERCEL_PROJECT}…")
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


def generate_key() -> str:
    """
    Generate a 32-char hex IndexNow key.

    The route + cron validators both accept [a-f0-9-]+ with a minimum
    length of 8. We emit 32 hex characters from secrets.token_hex(16),
    which is well inside the validator regex, has 128 bits of entropy
    (collision-resistant across rotations), and exactly matches the
    format the parallel cron expects.

    The hyphen is allowed by the validator but never emitted by
    token_hex — hyphen-free keys read more naturally in the served
    text file and avoid any edge case where a leading or trailing
    hyphen confuses a hand-typed verification check.
    """
    # 16 bytes = 32 hex chars. secrets.token_hex is the right cryptographic
    # primitive even though INDEXNOW_KEY isn't a secret — it gives us a
    # uniformly-distributed, unguessable token without re-implementing
    # hex generation by hand.
    return secrets.token_hex(KEY_LENGTH // 2)


def push_to_vercel(env_target: str, value: str) -> None:
    """
    Add INDEXNOW_KEY to a single Vercel env. NO --sensitive flag because the
    value is intentionally served at a public URL — marking it sensitive
    would lie to the Vercel UI about its threat model.
    """
    args = ["vercel", "env", "add", KEY_NAME, env_target, "--force", "--yes"]
    # Mirrors the agent-mode quirk handled in setup-cron-secret.py: passing
    # an empty positional after `preview` applies the var to all preview
    # branches instead of one specific branch.
    if env_target == "preview":
        args.insert(5, "")

    print(f"[setup-indexnow-key] pushing {KEY_NAME} to Vercel {env_target}…")
    result = subprocess.run(
        args,
        cwd=REPO_ROOT,
        input=value + "\n",
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        # The value is public, but redacting from error output keeps
        # scrollback clean if the operator screenshots a failure.
        safe_err = result.stderr.replace(value, "<redacted>")
        safe_out = result.stdout.replace(value, "<redacted>")
        print(safe_out, file=sys.stderr)
        print(safe_err, file=sys.stderr)
        sys.exit(f"ERROR: vercel env add failed for env={env_target}.")
    print(f"  ✓ Vercel {env_target} updated.")


def write_local(value: str) -> None:
    """Persist INDEXNOW_KEY in .env.development.local for local /indexnow.txt."""
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
        help="Which Vercel env(s) to update. Default: production.",
    )
    parser.add_argument(
        "--local",
        action="store_true",
        help="Also write to .env.development.local.",
    )
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
    print("[setup-indexnow-key] verifying via `vercel env ls`…")
    ls = subprocess.run(
        ["vercel", "env", "ls"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    matches = [line for line in ls.stdout.splitlines() if KEY_NAME in line]
    if not matches:
        sys.exit(
            "WARN: vercel env ls did not list INDEXNOW_KEY — push may have "
            "succeeded but readback failed. Check `vercel env ls` manually."
        )
    for line in matches:
        print(f"  {line.strip()}")

    print()
    print("✓ Done. After the next production deploy:")
    print("    https://unlocksaas.com/indexnow-key  → serves the key")
    print("    /api/cron/indexnow                   → daily push to")
    print("                                          Bing + Yandex + Naver + Seznam")
    print("                                          (schedule: 0 18 * * * UTC)")


if __name__ == "__main__":
    main()
