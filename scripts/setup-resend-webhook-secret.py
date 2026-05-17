#!/usr/bin/env python3
"""
One-shot interactive setup for the Resend webhook signing secret.

Why this exists: the secret-entry convention (locked 2026-05-17 after the
zsh-leak incident) requires every secret to be entered via a dedicated
getpass-based script. NEVER use `echo "RESEND_WEBHOOK_SECRET=whsec_..."
>> .env...` or zsh `read -s -p` — those leak the secret to scrollback +
~/.zsh_history.

Usage:
  python3 scripts/setup-resend-webhook-secret.py

Writes/updates RESEND_WEBHOOK_SECRET in .env.development.local.

Operator flow:
  1. Resend dashboard → Webhooks → Add endpoint:
       URL:    https://unlocksaas.com/api/webhooks/resend
       Events: email.sent, email.delivered, email.bounced,
               email.complained, email.opened, email.clicked
  2. Copy the signing secret (starts with whsec_).
  3. Run this script (paste the whsec_... value when prompted).
  4. Push to Vercel for all 3 environments:
       vercel env add RESEND_WEBHOOK_SECRET production --sensitive
       vercel env add RESEND_WEBHOOK_SECRET preview --sensitive
       vercel env add RESEND_WEBHOOK_SECRET development
     (--sensitive fails on development per Vercel CLI limitation — same
     branching the other setup scripts handle.)

Until the env var is set in Vercel, the handler at
app/src/app/api/webhooks/resend/route.ts accepts events without
signature verification AND logs a loud warning. Production must have
this set.
"""

import getpass
import sys
from pathlib import Path

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")
KEY_NAME = "RESEND_WEBHOOK_SECRET"
EXPECTED_PREFIX = "whsec_"


def clean_paste(value: str) -> str:
    v = value.strip()
    # Strip surrounding quotes
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1].strip()
    # Strip env-var assignment if user pasted "RESEND_WEBHOOK_SECRET=whsec_..."
    if "=" in v and not v.startswith(EXPECTED_PREFIX):
        v = v.split("=", 1)[1].strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
            v = v[1:-1].strip()
    # Strip shell-command prefixes
    for prefix in ("echo ", "export ", "set "):
        if v.startswith(prefix):
            v = v[len(prefix):].strip()
    # Validate
    if not v.startswith(EXPECTED_PREFIX):
        sys.exit(
            f"ERROR: Resend webhook secret should start with {EXPECTED_PREFIX!r} "
            f"but got {v[:8]!r}... (likely paste error or wrong secret — note "
            f"this is NOT the Resend API key which starts with 're_')"
        )
    if " " in v or "\n" in v or "\t" in v:
        sys.exit("ERROR: secret contains whitespace — paste error.")
    if len(v) < 20:
        sys.exit(f"ERROR: secret suspiciously short ({len(v)} chars).")
    return v


def main() -> None:
    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            ENV_FILE.write_text(TEMPLATE.read_text())
        else:
            ENV_FILE.touch()

    raw = getpass.getpass("Resend webhook secret (whsec_..., typing is hidden): ")
    if not raw.strip():
        sys.exit("ERROR: secret cannot be empty.")
    cleaned = clean_paste(raw)

    lines = ENV_FILE.read_text().splitlines()
    found = False
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            k = stripped.split("=", 1)[0].strip()
            if k == KEY_NAME:
                new_lines.append(f"{KEY_NAME}={cleaned}")
                found = True
                continue
        new_lines.append(line)

    if not found:
        new_lines.append("")
        new_lines.append(
            "# ── Resend webhook (managed by scripts/setup-resend-webhook-secret.py) ──"
        )
        new_lines.append(f"{KEY_NAME}={cleaned}")

    ENV_FILE.write_text("\n".join(new_lines) + "\n")

    action = "updated in place" if found else "appended (new)"
    print()
    print(f"OK — {KEY_NAME} {action} in {ENV_FILE}.")
    print(f"  Value: SET ({len(cleaned)} chars, hidden)")
    print()
    print("Next: push to Vercel for all 3 environments:")
    print("  vercel env add RESEND_WEBHOOK_SECRET production --sensitive")
    print("  vercel env add RESEND_WEBHOOK_SECRET preview --sensitive")
    print("  vercel env add RESEND_WEBHOOK_SECRET development")
    print()
    print("Reminder: if you're rotating after a leak, ROTATE the secret at")
    print("https://resend.com/webhooks FIRST. The old secret works until you rotate it.")


if __name__ == "__main__":
    main()
