#!/usr/bin/env python3
"""
One-shot interactive setup for Stripe LIVE keys.

Why this exists: zsh's `read -s -p` silently fails (no-coprocess error) and
falls through to plaintext `echo`, leaking keys to scrollback + ~/.zsh_history.
This script is the sanctioned entry point — uses Python's getpass() (hidden
input, works in any shell), validates prefixes, and rejects common paste
anti-patterns (shell-prefix `STRIPE_SECRET_KEY=`, surrounding quotes,
embedded spaces from line-wrapped pastes).

Usage:
  python3 scripts/setup-stripe-keys.py                       # both keys
  python3 scripts/setup-stripe-keys.py --only secret_key     # just SECRET
  python3 scripts/setup-stripe-keys.py --only publishable_key

Writes to .env.development.local. Updates in place if already present.

NEVER use `echo`, `read -s -p`, or paste directly into your editor — those
all leak. Use this script only.
"""

import argparse
import getpass
import sys
from pathlib import Path

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")


def clean_paste(value: str, expected_prefix: str, key_name: str) -> str:
    """Strip common paste artifacts, validate, exit on bad input."""
    v = value.strip()
    # Strip surrounding quotes if present
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1].strip()
    # Strip env-var assignment if user pasted "KEY=value"
    if "=" in v and not v.startswith(expected_prefix):
        v = v.split("=", 1)[1].strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
            v = v[1:-1].strip()
    # Strip shell-command prefixes like `echo `, `export `
    for prefix in ("echo ", "export ", "set "):
        if v.startswith(prefix):
            v = v[len(prefix):].strip()
    # Validate
    if not v.startswith(expected_prefix):
        sys.exit(
            f"ERROR: {key_name} should start with {expected_prefix!r} but got "
            f"{v[:12]!r}... (likely paste error or wrong key)"
        )
    if " " in v or "\n" in v or "\t" in v:
        sys.exit(f"ERROR: {key_name} contains whitespace — paste error.")
    if len(v) < 32:
        sys.exit(f"ERROR: {key_name} suspiciously short ({len(v)} chars).")
    return v


def upsert_env(settings: dict, section_header: str) -> tuple:
    """Update existing keys in-place; append new ones in a new section."""
    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            ENV_FILE.write_text(TEMPLATE.read_text())
        else:
            ENV_FILE.touch()

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

    appended = [k for k in settings if k not in seen]
    if appended:
        new_lines.append("")
        new_lines.append(section_header)
        for k in appended:
            new_lines.append(f"{k}={settings[k]}")

    ENV_FILE.write_text("\n".join(new_lines) + "\n")
    updated_in_place = list(seen)
    return updated_in_place, appended


def main() -> None:
    p = argparse.ArgumentParser(description="Interactive Stripe LIVE key entry")
    p.add_argument(
        "--only",
        choices=["secret_key", "publishable_key"],
        help="Only update one key (e.g. after rotating just the secret)",
    )
    args = p.parse_args()

    settings = {}

    if not args.only or args.only == "secret_key":
        raw = getpass.getpass(
            "Stripe SECRET key (sk_live_..., typing is hidden, paste then Enter): "
        )
        if not raw.strip():
            sys.exit("ERROR: secret key cannot be empty.")
        cleaned = clean_paste(raw, "sk_", "STRIPE_SECRET_KEY")
        settings["STRIPE_SECRET_KEY"] = cleaned
        if not cleaned.startswith("sk_live_"):
            print(
                f"WARN: secret key prefix is {cleaned[:8]!r}, not 'sk_live_'. "
                f"Continuing — but you wanted LIVE keys, right?"
            )

    if not args.only or args.only == "publishable_key":
        raw = getpass.getpass(
            "Stripe PUBLISHABLE key (pk_live_..., typing is hidden): "
        )
        if not raw.strip():
            sys.exit("ERROR: publishable key cannot be empty.")
        cleaned = clean_paste(raw, "pk_", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
        settings["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] = cleaned
        if not cleaned.startswith("pk_live_"):
            print(
                f"WARN: publishable key prefix is {cleaned[:8]!r}, not 'pk_live_'."
            )

    updated, appended = upsert_env(
        settings,
        section_header="# ── Stripe (managed by scripts/setup-stripe-keys.py) ─────────────────────────"
    )

    print()
    print(f"OK — {len(settings)} key(s) written to {ENV_FILE}.")
    for k, v in settings.items():
        action = "updated in place" if k in updated else "appended (new)"
        print(f"  {k}: SET ({len(v)} chars, hidden) — {action}")
    print()
    print("Reminder: if you're rotating after a leak, roll the OLD secret key")
    print("at https://dashboard.stripe.com/apikeys FIRST. The old key is")
    print("compromised until you click 'Roll key'.")


if __name__ == "__main__":
    main()
