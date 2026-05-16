#!/usr/bin/env python3
"""
One-shot interactive setup for the Resend API key.

Why this exists: zsh's `read -s -p` silently fails and falls through to
plaintext `echo`, leaking the key to scrollback + ~/.zsh_history. This script
is the sanctioned entry point — uses Python's getpass() (hidden input, works
in any shell), validates the `re_` prefix, and rejects paste anti-patterns.

Usage:
  python3 scripts/setup-resend-key.py

Writes/updates RESEND_API_KEY in .env.development.local.

NEVER use `echo "RESEND_API_KEY=re_..." >> .env...` or zsh `read -s -p` —
those leak the key to your shell history. Use this script only.
"""

import getpass
import sys
from pathlib import Path

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")
KEY_NAME = "RESEND_API_KEY"
EXPECTED_PREFIX = "re_"


def clean_paste(value: str) -> str:
    v = value.strip()
    # Strip surrounding quotes
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1].strip()
    # Strip env-var assignment if user pasted "RESEND_API_KEY=re_..."
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
            f"ERROR: Resend key should start with {EXPECTED_PREFIX!r} but got "
            f"{v[:8]!r}... (likely paste error or wrong key)"
        )
    if " " in v or "\n" in v or "\t" in v:
        sys.exit("ERROR: key contains whitespace — paste error.")
    if len(v) < 20:
        sys.exit(f"ERROR: key suspiciously short ({len(v)} chars).")
    return v


def main() -> None:
    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            ENV_FILE.write_text(TEMPLATE.read_text())
        else:
            ENV_FILE.touch()

    raw = getpass.getpass("Resend API key (re_..., typing is hidden): ")
    if not raw.strip():
        sys.exit("ERROR: key cannot be empty.")
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
        new_lines.append("# ── Resend (managed by scripts/setup-resend-key.py) ───────────────────────────")
        new_lines.append(f"{KEY_NAME}={cleaned}")

    ENV_FILE.write_text("\n".join(new_lines) + "\n")

    action = "updated in place" if found else "appended (new)"
    print()
    print(f"OK — {KEY_NAME} {action} in {ENV_FILE}.")
    print(f"  Value: SET ({len(cleaned)} chars, hidden)")
    print()
    print("Reminder: if you're rotating after a leak, REVOKE the old key at")
    print("https://resend.com/api-keys FIRST. The old key works until you revoke it.")


if __name__ == "__main__":
    main()
