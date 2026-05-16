#!/usr/bin/env python3
"""
One-shot interactive setup for Private Email IMAP/SMTP credentials.

Prompts for the mailbox address (visible) and password (hidden via getpass),
writes them into .env.development.local. The password is never echoed to
terminal or shell history.

Usage:
  python3 scripts/setup-mail-creds.py
"""

import getpass
import shutil
import sys
from pathlib import Path

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")

DEFAULTS = {
    "MAIL_ADDRESS": "maryan@unlocksaas.com",
    "MAIL_IMAP_HOST": "mail.privateemail.com",
    "MAIL_IMAP_PORT": "993",
    "MAIL_SMTP_HOST": "mail.privateemail.com",
    "MAIL_SMTP_PORT": "587",
}


def main() -> None:
    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            shutil.copy(TEMPLATE, ENV_FILE)
            print(f"Created {ENV_FILE} from template.")
        else:
            sys.exit(f"ERROR: neither {ENV_FILE} nor {TEMPLATE} exists.")

    print()
    address = input(f"Mailbox address [{DEFAULTS['MAIL_ADDRESS']}]: ").strip() or DEFAULTS['MAIL_ADDRESS']
    password = getpass.getpass(f"Mailbox password for {address} (typing is hidden): ").strip()
    if not password:
        sys.exit("ERROR: password cannot be empty.")

    settings = {
        "MAIL_ADDRESS": address,
        "MAIL_PASSWORD": password,
        "MAIL_IMAP_HOST": DEFAULTS["MAIL_IMAP_HOST"],
        "MAIL_IMAP_PORT": DEFAULTS["MAIL_IMAP_PORT"],
        "MAIL_SMTP_HOST": DEFAULTS["MAIL_SMTP_HOST"],
        "MAIL_SMTP_PORT": DEFAULTS["MAIL_SMTP_PORT"],
    }

    # Update existing lines in place; append any that don't exist yet.
    lines = ENV_FILE.read_text().splitlines()
    seen = set()
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            k = stripped.split("=", 1)[0].strip()
            if k in settings:
                new_lines.append(f"{k}={settings[k]}")
                seen.add(k)
                continue
        new_lines.append(line)

    missing = [k for k in settings if k not in seen]
    if missing:
        new_lines.append("")
        new_lines.append("# ── Private Email IMAP/SMTP (for scripts/mail.py) ─────────────────────────────")
        for k in missing:
            new_lines.append(f"{k}={settings[k]}")

    ENV_FILE.write_text("\n".join(new_lines) + "\n")

    print()
    print(f"OK — mail credentials written to {ENV_FILE}.")
    print(f"  Address:  {address} (visible)")
    print(f"  Password: SET ({len(password)} chars, never displayed)")
    print(f"  Server:   {DEFAULTS['MAIL_IMAP_HOST']} (IMAP {DEFAULTS['MAIL_IMAP_PORT']}, SMTP {DEFAULTS['MAIL_SMTP_PORT']})")
    print()
    print("Next: run `python3 scripts/mail.py folders` to verify connection.")


if __name__ == "__main__":
    main()
