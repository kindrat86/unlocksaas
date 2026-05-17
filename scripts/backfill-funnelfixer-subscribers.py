#!/usr/bin/env python3
"""
One-shot backfill: import FunnelFixer subscribers into soap_opera_subscribers.

These 36 rows are pre-existing subscribers from the previous FunnelFixer
product who were carried over for a later re-engagement campaign. They are
inserted PAUSED so the Soap Opera cron does not touch them.

When ready to start a campaign:

  UPDATE public.soap_opera_subscribers
     SET status='active', next_send_at = now()
   WHERE source LIKE 'funnelfixer%' AND status='paused';

Usage:
  set -a; source /Users/sipi/unlocksaas/.env.development.local; set +a
  python3 scripts/backfill-funnelfixer-subscribers.py            # dry-run
  python3 scripts/backfill-funnelfixer-subscribers.py --commit   # actually insert

Idempotent: ON CONFLICT (email) DO NOTHING via PostgREST resolution=ignore-duplicates.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

# (email, auth_method, signup_date_iso)
# auth_method captured from the FunnelFixer export ('email', 'google', or both).
# Packed into source as 'funnelfixer_<method>' so it survives the migration.
SUBSCRIBERS: list[tuple[str, str, str]] = [
    ("ceo@airadvisor.com",                       "email",        "2026-05-02"),
    ("itsbabykyy@gmail.com",                     "email",        "2026-04-21"),
    ("megan@womensrein.com",                     "email",        "2026-04-21"),
    ("priyankagoyal26@gmail.com",                "email",        "2026-04-11"),
    ("brioncraig@outlook.com",                   "email",        "2026-04-06"),
    ("mdiaz@2danimation101.com",                 "google",       "2026-02-12"),
    ("andyly987@gmail.com",                      "google",       "2026-02-03"),
    ("ahounoukhaled@gmail.com",                  "google",       "2026-02-03"),
    ("greta.miklove@theimpactbrands.com",        "google",       "2026-02-02"),
    ("kgray@pgamember.org.au",                   "google",       "2026-01-31"),
    ("colinsteele81@googlemail.com",             "google",       "2026-01-29"),
    ("0318josef@gmail.com",                      "email",        "2026-01-26"),
    ("surfprecisionacademy@gmail.com",           "google",       "2026-01-22"),
    ("ediansounds@gmail.com",                    "google",       "2026-01-15"),
    ("matheuscarcanholo@pecege.com",             "google",       "2026-01-12"),
    ("delbert.ty@rockstar-automations.com",      "google",       "2026-01-09"),
    ("cms4973@icloud.com",                       "email",        "2026-01-01"),
    ("randomspastlol@gmail.com",                 "email",        "2025-12-28"),
    ("caudetano@gmail.com",                      "email",        "2025-12-23"),
    ("sht_jck@yahoo.com",                        "email",        "2025-12-21"),
    ("bshhas@shhss.com",                         "email",        "2025-12-07"),
    ("tagmouti.abla@gmail.com",                  "email",        "2025-12-02"),
    ("the.digital.nomad.entrepreneur@gmail.com", "email",        "2025-11-29"),
    ("kaaraboddeee@gmail.com",                   "email",        "2025-11-21"),
    ("karabode1@gmail.com",                      "email",        "2025-11-21"),
    ("alexbiega@outlook.com",                    "email",        "2025-11-17"),
    ("mkondratyuk86@gmail.com",                  "email_google", "2026-01-01"),
    ("sheller999@gmail.com",                     "email",        "2025-11-16"),
    ("jonielterrible@gmail.com",                 "email",        "2025-11-16"),
    ("turibiohilaire@gmail.com",                 "email",        "2025-11-15"),
    ("gkriston84@gmail.com",                     "email",        "2025-11-15"),
    ("kirk@treyzadigital.com",                   "email",        "2025-11-15"),
    ("angelwhite13@icloud.com",                  "email",        "2025-11-13"),
    ("fourtt423@gmail.com",                      "email",        "2025-11-13"),
    ("hello@bonnetsboots.com",                   "email",        "2025-11-13"),
    ("faiza.fehri.dev@gmail.com",                "email",        "2025-11-11"),
]


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        sys.exit(
            f"error: ${name} is not set. Source .env.development.local "
            f"(set -a; source .env.development.local; set +a) before running."
        )
    return value


def build_rows() -> list[dict]:
    rows: list[dict] = []
    seen: set[str] = set()
    for email, method, date in SUBSCRIBERS:
        normalized = email.strip().lower()
        if normalized in seen:
            print(f"warn: duplicate in input list, skipping: {normalized}", file=sys.stderr)
            continue
        seen.add(normalized)
        rows.append(
            {
                "email": normalized,
                "source": f"funnelfixer_{method}",
                "status": "paused",
                "emails_sent": 0,
                "subscribed_at": f"{date}T00:00:00Z",
            }
        )
    return rows


def insert_rows(base_url: str, service_role_key: str, rows: list[dict]) -> list[dict]:
    """
    Bulk POST with on_conflict=email + resolution=ignore-duplicates.
    Returns the list of rows actually inserted (skipped duplicates are absent).
    """
    url = f"{base_url}/rest/v1/soap_opera_subscribers?on_conflict=email"
    req = urllib.request.Request(
        url,
        data=json.dumps(rows).encode("utf-8"),
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else []
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        sys.exit(f"error: Supabase REST returned HTTP {exc.code}: {body}")
    except urllib.error.URLError as exc:
        sys.exit(f"error: network error: {exc.reason}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--commit",
        action="store_true",
        help="Actually insert. Without this flag, the script prints a dry-run summary only.",
    )
    args = parser.parse_args()

    rows = build_rows()
    print(f"backfill-funnelfixer: prepared {len(rows)} unique rows for soap_opera_subscribers")
    print(f"  status=paused, source=funnelfixer_<email|google|email_google>, emails_sent=0")

    if not args.commit:
        print()
        print("Dry-run. First 3 rows:")
        for r in rows[:3]:
            print(f"  {r}")
        print()
        print("Re-run with --commit to insert.")
        return

    base_url = require_env("NEXT_PUBLIC_SUPABASE_URL").rstrip("/")
    service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")

    inserted = insert_rows(base_url, service_role_key, rows)
    print(f"backfill-funnelfixer: inserted {len(inserted)} new rows "
          f"({len(rows) - len(inserted)} skipped as duplicates).")


if __name__ == "__main__":
    main()
