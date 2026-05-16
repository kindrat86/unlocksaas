#!/usr/bin/env python3
"""
One-shot interactive setup for Supabase dashboard-only secrets.

Only TWO values must be retrieved from the dashboard:
  1. The service role key (settings → api-keys → reveal "service_role")
  2. The database password (settings → database → "Database password" → reset or reveal)

This script then CONSTRUCTS the two pooler connection strings deterministically
(format is fixed by Supabase's pooler convention):
  DATABASE_URL              = transaction pooler, port 6543
  POSTGRES_URL_NON_POOLING  = session pooler,    port 5432

Both values are typed with hidden input (getpass). Nothing is echoed to the
terminal or shell history. The password is URL-encoded before being embedded.

Open these two dashboard pages first, then run the script:
  https://supabase.com/dashboard/project/iihtadgnpheuwkcuumhw/settings/api-keys
  https://supabase.com/dashboard/project/iihtadgnpheuwkcuumhw/settings/database

Usage:
  python3 scripts/setup-supabase-secrets.py
"""

from __future__ import annotations

import argparse
import getpass
import shutil
import sys
from pathlib import Path
from urllib.parse import quote

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")

PROJECT_REF = "iihtadgnpheuwkcuumhw"
REGION = "eu-central-1"
# Newer Supabase projects (post-2025-Q3) route through the aws-1 pooler in eu-central-1.
# Verified for this project via DNS + Supavisor tenant lookup.
POOLER_HOST = f"aws-1-{REGION}.pooler.supabase.com"
POOLER_USER = f"postgres.{PROJECT_REF}"

DASH_API = f"https://supabase.com/dashboard/project/{PROJECT_REF}/settings/api-keys"
DASH_DB = f"https://supabase.com/dashboard/project/{PROJECT_REF}/settings/database"

KEYS_TO_FILL = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
    "POSTGRES_URL_NON_POOLING",
]


def mask(value: str) -> str:
    if len(value) <= 12:
        return "*" * len(value)
    return f"{value[:6]}…{value[-4:]} ({len(value)} chars)"


SHELL_COMMAND_PREFIXES = (
    "cd ", "ls ", "cat ", "echo ", "python", "node", "npm ", "pnpm ",
    "git ", "curl ", "wget ", "ssh ", "sudo ", "bash ", "sh ", "rm ", "mv ", "cp ",
)


def prompt_service_role() -> str:
    attempts = 0
    while True:
        attempts += 1
        v = getpass.getpass("  SUPABASE_SERVICE_ROLE_KEY (hidden, paste then Enter): ").strip()
        if not v:
            print("    ✗ empty — try again, or Ctrl+C to abort.")
            continue
        # SPACE CHECK FIRST — catches the "clipboard had a shell command" trap.
        if " " in v:
            print(f"    ✗ contains spaces ({len(v)} chars). Supabase keys have no spaces.")
            print(f"        Your clipboard likely had something else. First 8 chars: '{v[:8]}…'")
            print(f"        Re-copy from the dashboard 'service_role' field. If your copy")
            print(f"        seems to fail, paste-test into a Notes app first to confirm clipboard.")
            continue
        if any(v.startswith(p) for p in SHELL_COMMAND_PREFIXES):
            print(f"    ✗ that's a shell command. Re-copy from the dashboard.")
            continue
        # Diagnostic anti-patterns: catch obviously-wrong pastes with a helpful message.
        if v.startswith("http://") or v.startswith("https://"):
            print(f"    ✗ that's a URL ({len(v)} chars). You want the value inside the 'service_role' field, not a URL.")
            continue
        if v.startswith("postgres://") or v.startswith("postgresql://"):
            print("    ✗ that's a Postgres connection string. Wrong page — you're at /settings/database; you want /settings/api-keys.")
            continue
        if v.startswith("sb_publishable_"):
            print("    ✗ that's the publishable key (already saved). You want the SECRET / service_role key.")
            continue
        if v.startswith("sk_") and len(v) < 80:
            print("    ✗ that looks like a Stripe key. Wrong service.")
            continue
        if len(v) < 30:
            print(f"    ✗ only {len(v)} chars — service role keys are 80+ chars. Probably copied partial.")
            continue
        # If a 3rd+ try and still no eyJ / sb_ prefix, offer a force-accept escape hatch.
        if attempts >= 3 and not (v.startswith("eyJ") or v.startswith("sb_")):
            print(f"    ⚠️  '{v[:3]}…' is an unusual prefix for a Supabase key. Accept it anyway? Type 'yes' to force, anything else to retry.")
            confirm = input("    Force-accept? ").strip().lower()
            if confirm == "yes":
                return v
            continue
        # Default: accept anything ≥30 chars that isn't an obvious anti-pattern.
        return v


def prompt_db_password() -> str:
    while True:
        v = getpass.getpass("  Database password (hidden, paste then Enter): ").strip()
        if not v:
            print("    ✗ empty — try again, or Ctrl+C to abort.")
            continue
        if len(v) < 8:
            print(f"    ✗ only {len(v)} chars — Supabase passwords are 16+. Try again.")
            continue
        # Confirm once because typos here mean the DB simply won't connect later.
        v2 = getpass.getpass("  Database password (paste again to confirm): ").strip()
        if v != v2:
            print("    ✗ mismatch — try again.")
            continue
        return v


def build_pooler_url(password_encoded: str, port: int) -> str:
    return f"postgresql://{POOLER_USER}:{password_encoded}@{POOLER_HOST}:{port}/postgres"


def main() -> None:
    parser = argparse.ArgumentParser(description="Set Supabase dashboard-only secrets in .env.development.local")
    parser.add_argument(
        "--only",
        choices=["service_role", "db_password"],
        help="Only prompt for one secret. Use after a partial failure to avoid re-entering values that already worked.",
    )
    args = parser.parse_args()

    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            shutil.copy(TEMPLATE, ENV_FILE)
            print(f"Created {ENV_FILE} from template.")
        else:
            sys.exit(f"ERROR: neither {ENV_FILE} nor {TEMPLATE} exists. Run from repo root.")

    do_role = args.only != "db_password"
    do_pw = args.only != "service_role"

    print()
    if args.only:
        print(f"Mode: --only {args.only}. Skipping the other secret.")
    print("Open these dashboard pages as needed:")
    if do_role:
        print(f"  • {DASH_API}")
    if do_pw:
        print(f"  • {DASH_DB}")
    print()
    print("Paste each value below. Typing is hidden.")
    if do_pw:
        print("Tip: on the database page, click 'Reset database password' if you didn't save it.")
    print()

    values: dict[str, str] = {}

    if do_role:
        values["SUPABASE_SERVICE_ROLE_KEY"] = prompt_service_role()

    if do_pw:
        db_password = prompt_db_password()
        # URL-encode the password (Supabase passwords can contain @ : / & etc.).
        pw_encoded = quote(db_password, safe="")
        values["DATABASE_URL"] = build_pooler_url(pw_encoded, 6543)
        values["POSTGRES_URL_NON_POOLING"] = build_pooler_url(pw_encoded, 5432)

    # Update existing KEY= lines in place; append any that don't exist.
    lines = ENV_FILE.read_text().splitlines()
    seen: set[str] = set()
    new_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            k = stripped.split("=", 1)[0].strip()
            if k in values:
                new_lines.append(f"{k}={values[k]}")
                seen.add(k)
                continue
        new_lines.append(line)

    missing = [k for k in values if k not in seen]
    if missing:
        new_lines.append("")
        new_lines.append("# ── Supabase dashboard-only secrets (filled by setup-supabase-secrets.py) ─")
        for k in missing:
            new_lines.append(f"{k}={values[k]}")

    ENV_FILE.write_text("\n".join(new_lines) + "\n")

    print()
    print(f"OK — Supabase secrets written to {ENV_FILE}.")
    if "SUPABASE_SERVICE_ROLE_KEY" in values:
        print(f"  SUPABASE_SERVICE_ROLE_KEY: {mask(values['SUPABASE_SERVICE_ROLE_KEY'])}")
    if "DATABASE_URL" in values:
        print(f"  DATABASE_URL:              postgresql://{POOLER_USER}:****@{POOLER_HOST}:6543/postgres")
        print(f"  POSTGRES_URL_NON_POOLING:  postgresql://{POOLER_USER}:****@{POOLER_HOST}:5432/postgres")
    print()
    print("Verify the connection (optional, requires `psycopg2` or just curl the REST API):")
    print(f"  curl -s -o /dev/null -w '%{{http_code}}\\n' \\")
    print(f"    -H \"apikey: $(grep '^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=' {ENV_FILE} | cut -d= -f2)\" \\")
    print(f"    https://{PROJECT_REF}.supabase.co/rest/v1/")
    print("  (expect 200)")


if __name__ == "__main__":
    main()
