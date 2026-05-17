#!/usr/bin/env python3
"""
One-shot setup for VERCEL_WEBHOOK_SECRET — the HMAC-SHA1 signing secret
shown ONCE by Vercel when the operator creates a project webhook. Verified
by /api/webhooks/vercel/deployment on every incoming deployment event.

Why this script: unlike CRON_SECRET (we generate it) and INDEXNOW_KEY
(we generate it), the webhook secret is GIVEN by Vercel and shown only
once. The operator must paste it from the Vercel dashboard, and the paste
must never land in shell history. This script reads it via getpass so the
value is never echoed to the terminal, then pipes it to `vercel env add`
via stdin so it never appears on the command line.

Operator flow (do this once per environment):

  1. Open Vercel dashboard → project settings → Webhooks → Create webhook
  2. Endpoint URL:  https://unlocksaas.com/api/webhooks/vercel/deployment
  3. Events:        deployment.succeeded
  4. Copy the signing secret displayed on creation (Vercel will NOT show
     it again — re-create the webhook if you lose it).
  5. Run: python3 scripts/setup-vercel-webhook-secret.py
  6. Paste the secret at the prompt. The next deploy will trigger the
     IndexNow ping on its own.

Rotation: delete the existing webhook in Vercel, create a new one,
re-run this script. The old secret stops verifying signatures the moment
the new value lands.

Usage:
  python3 scripts/setup-vercel-webhook-secret.py                # production only
  python3 scripts/setup-vercel-webhook-secret.py --env all      # all envs
"""

from __future__ import annotations

import argparse
import getpass
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VERCEL_PROJECT = "unlocksaas"
VERCEL_SCOPE = "sales-3429s-projects"
KEY_NAME = "VERCEL_WEBHOOK_SECRET"


def ensure_linked() -> None:
    project_json = REPO_ROOT / ".vercel" / "project.json"
    if project_json.exists():
        return
    print(f"[setup-vercel-webhook-secret] linking worktree to {VERCEL_PROJECT}…")
    result = subprocess.run(
        ["vercel", "link", "--yes",
         "--project", VERCEL_PROJECT, "--scope", VERCEL_SCOPE],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit("ERROR: `vercel link` failed. Run `vercel login` and retry.")


def prompt_for_secret() -> str:
    """
    getpass.getpass reads stdin WITHOUT echoing. The secret never touches
    the terminal scrollback, never goes to ~/.zsh_history, never appears
    in any ps listing. If stdin isn't a tty (CI, pipe), this still works
    but the value lands in raw stdin — refuse rather than risk a leak.
    """
    if not sys.stdin.isatty():
        sys.exit(
            "ERROR: stdin is not a terminal. Run this script interactively — "
            "the webhook secret must be pasted by hand."
        )
    print(
        "Paste the VERCEL_WEBHOOK_SECRET from the Vercel dashboard.\n"
        "  (Vercel dashboard → project → Settings → Webhooks → your webhook\n"
        "  → 'Signing secret' field.)\n"
        "Input will not be echoed:\n"
    )
    value = getpass.getpass("VERCEL_WEBHOOK_SECRET: ").strip()
    if not value:
        sys.exit("ERROR: empty value rejected.")
    # Vercel webhook secrets are random base64 strings, typically 32+ chars.
    # Reject anything obviously wrong so we fail loud instead of silently
    # pushing a malformed value.
    if len(value) < 20:
        sys.exit(
            f"ERROR: secret is suspiciously short ({len(value)} chars). "
            "Vercel signing secrets are typically 32+ chars."
        )
    confirm = getpass.getpass("Confirm by pasting again: ").strip()
    if value != confirm:
        sys.exit("ERROR: values do not match.")
    return value


def push_to_vercel(env_target: str, value: str) -> None:
    args = ["vercel", "env", "add", KEY_NAME, env_target, "--force", "--yes"]
    if env_target == "preview":
        args.insert(5, "")
    if env_target != "development":
        # Webhook secret IS sensitive — flag it accordingly on production +
        # preview. The Vercel CLI quirk that breaks --sensitive on
        # development is documented in project_unlocksaas_vercel.md.
        args.append("--sensitive")

    print(f"[setup-vercel-webhook-secret] pushing {KEY_NAME} to Vercel {env_target}…")
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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--env",
        choices=["production", "preview", "development", "all"],
        default="production",
        help="Which Vercel env(s) to update. Default: production (the only "
             "env that actually receives Vercel webhooks).",
    )
    args = parser.parse_args()

    ensure_linked()
    value = prompt_for_secret()

    targets = (
        ["production", "preview", "development"]
        if args.env == "all"
        else [args.env]
    )
    for env in targets:
        push_to_vercel(env, value)

    print()
    print("✓ Done. The next production deploy.succeeded event from Vercel")
    print("  will trigger /api/webhooks/vercel/deployment, which will")
    print("  POST the sitemap URLs to api.indexnow.org.")


if __name__ == "__main__":
    main()
