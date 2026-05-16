#!/usr/bin/env python3
"""
One-shot interactive setup for .env.development.local.

Prompts for Namecheap username (visible) and API key (hidden via getpass),
writes them into .env.development.local. Never echoes the key to terminal
or chat history.

Usage:
  python3 scripts/setup-namecheap-env.py
"""

import getpass
import shutil
import sys
from pathlib import Path

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")


def main() -> None:
    if not TEMPLATE.exists():
        sys.exit(f"ERROR: {TEMPLATE} not found. Are you in /Users/sipi/unlocksaas?")

    # Copy template if env file is missing.
    if not ENV_FILE.exists():
        shutil.copy(TEMPLATE, ENV_FILE)
        print(f"Created {ENV_FILE} from template.")
    else:
        print(f"{ENV_FILE} already exists — will update placeholder/empty values.")

    print()
    nc_user = input("Namecheap username: ").strip()
    if not nc_user:
        sys.exit("ERROR: username cannot be empty.")

    nc_key = getpass.getpass("Namecheap API key (typing is hidden): ").strip()
    if not nc_key:
        sys.exit("ERROR: API key cannot be empty.")

    if len(nc_key) < 20:
        print(f"WARN: API key seems short ({len(nc_key)} chars). Namecheap keys are usually 40+. Continuing anyway.")

    text = ENV_FILE.read_text()
    # Replace whichever marker is present: placeholder OR empty value.
    text = text.replace("your-namecheap-username", nc_user)
    text = text.replace("paste-the-long-key-here", nc_key)
    text = text.replace("NAMECHEAP_API_USER=\n", f"NAMECHEAP_API_USER={nc_user}\n")
    text = text.replace("NAMECHEAP_API_KEY=\n", f"NAMECHEAP_API_KEY={nc_key}\n")
    text = text.replace("NAMECHEAP_USERNAME=\n", f"NAMECHEAP_USERNAME={nc_user}\n")
    ENV_FILE.write_text(text)

    print()
    print("OK — .env.development.local updated.")
    print("Username and IP and domain are written in plaintext (not secret).")
    print("API key is in the file but was never echoed to terminal or shell history.")


if __name__ == "__main__":
    main()
