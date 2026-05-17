#!/usr/bin/env python3
"""
One-shot CSV export of every owned-traffic subscriber list.

Why this exists: Traffic Secrets Secret #5 (Traffic You Own) demands a list
is portable, off-platform-reachable, and replicable on a second provider.
This script is the portability proof — proves that UnlockSaaS owns the lists
because the rows can be dumped to disk at any time, with no vendor cooperation.

Cadence (per strategy/owned-traffic.md §4):
- Before any ESP migration (Resend → Kit at 100 subs).
- Before any major schema migration touching subscriber tables.
- Monthly during pre-revenue phase.
- On demand for GDPR Article 20 data-portability requests.

Usage:
  # Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from os.environ.
  # Service-role key NEVER passed as CLI arg (avoids shell-history leak).
  python3 scripts/export-subscribers.py

  # Include unsubscribed/bounced rows (legal compliance, account deletion):
  python3 scripts/export-subscribers.py --include-unsubscribed

Outputs:
  exports/<ISO-8601 UTC>/soap_opera.csv
  exports/<ISO-8601 UTC>/seinfeld.csv
  exports/<ISO-8601 UTC>/founding_waitlist.csv
  exports/<ISO-8601 UTC>/challenge.csv
  exports/<ISO-8601 UTC>/MANIFEST.md

Output to stdout contains row counts only — never email addresses.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ─── Table inventory ──────────────────────────────────────────────────────────
# Each entry is the canonical Supabase table backing one owned-traffic list.
# Columns are the export shape — every column we include passes the "portable
# to any ESP" test (email, status, sequence position, source attribution,
# timestamps). Schema-internal columns (UUIDs, RLS keys) are deliberately
# excluded — ESP imports do not need them.
TABLES = [
    {
        "name": "soap_opera",
        "table": "soap_opera_subscribers",
        "columns": [
            "email",
            "status",
            "current_day",
            "source",
            "diagnostic_label",
            "created_at",
            "last_sent_at",
        ],
        "active_status_filter": "subscribed",
    },
    {
        "name": "seinfeld",
        "table": "seinfeld_subscribers",
        "columns": [
            "email",
            "status",
            "emails_sent",
            "source",
            "created_at",
            "last_sent_at",
        ],
        "active_status_filter": "subscribed",
    },
    {
        "name": "founding_waitlist",
        "table": "founding_waitlist",
        "columns": [
            "email",
            "status",
            "emails_sent",
            "source",
            "ab_identity_variant",
            "created_at",
            "converted_to_founding_at",
        ],
        "active_status_filter": "subscribed",
    },
    {
        "name": "challenge",
        "table": "challenge_subscribers",
        "columns": [
            "email",
            "status",
            "current_day",
            "source",
            "created_at",
            "last_sent_at",
        ],
        "active_status_filter": "subscribed",
    },
]


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        sys.exit(
            f"error: ${name} is not set. Source .env.development.local or set "
            f"the variable in your shell before running this script."
        )
    return value


def supabase_select(
    base_url: str,
    service_role_key: str,
    table: str,
    columns: list[str],
    status_filter: str | None,
) -> list[dict]:
    """
    Page through every row via PostgREST. Range header pagination respects
    Supabase's 1,000-row default cap. Returns parsed JSON rows.
    """
    select = ",".join(columns)
    rows: list[dict] = []
    page_size = 1000
    offset = 0

    while True:
        params = {"select": select}
        if status_filter:
            params["status"] = f"eq.{status_filter}"

        url = f"{base_url}/rest/v1/{table}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(
            url,
            headers={
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Accept": "application/json",
                "Range-Unit": "items",
                "Range": f"{offset}-{offset + page_size - 1}",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                page = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            # 416 = requested range beyond available rows; treat as end-of-paging.
            if exc.code == 416:
                break
            body = exc.read().decode("utf-8", errors="replace")
            sys.exit(
                f"error: Supabase REST returned HTTP {exc.code} on {table}: {body}"
            )
        except urllib.error.URLError as exc:
            sys.exit(f"error: network error reading {table}: {exc.reason}")

        if not page:
            break
        rows.extend(page)
        if len(page) < page_size:
            break
        offset += page_size

    return rows


def write_csv(out_path: Path, columns: list[str], rows: list[dict]) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({col: row.get(col, "") for col in columns})


def write_manifest(
    out_dir: Path,
    counts: dict[str, int],
    include_unsubscribed: bool,
    timestamp: str,
) -> None:
    manifest = out_dir / "MANIFEST.md"
    lines = [
        "# UnlockSaaS Subscriber Export — Manifest",
        "",
        f"**Exported at:** {timestamp}",
        f"**Include unsubscribed/bounced:** {'yes' if include_unsubscribed else 'no'}",
        f"**Source:** Supabase project (from $SUPABASE_URL)",
        "",
        "## Row counts",
        "",
        "| List | Source table | Rows |",
        "|---|---|---|",
    ]
    for entry in TABLES:
        name = entry["name"]
        lines.append(f"| {name} | `{entry['table']}` | {counts.get(name, 0)} |")
    lines.extend(
        [
            "",
            "## Portability",
            "",
            "These CSVs are the canonical UnlockSaaS owned-traffic asset dump.",
            "They are sufficient input for any major ESP migration (Kit, Loops,",
            "Postmark, Customer.io). The `email` column is the join key; the",
            "`status` column preserves subscribed/unsubscribed state so the new",
            "ESP can honor existing unsubscribes.",
            "",
            "## Compliance",
            "",
            "Use these files for: ESP migration, GDPR Article 20 data-portability",
            "requests, schema-migration backups, monthly portability proofs.",
            "",
            "Do NOT use these files for: any send from a third party without a",
            "sender-identity match to `maryan@unlocksaas.com` (the Attractive",
            "Character signature is locked — see memory `project_unlocksaas_email_identity`).",
            "",
            "## Source policy",
            "",
            "Generated by `scripts/export-subscribers.py`. See `strategy/owned-traffic.md`",
            "Part 4 for the full portability-proof policy.",
            "",
        ]
    )
    manifest.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export every UnlockSaaS subscriber list to timestamped CSVs."
    )
    parser.add_argument(
        "--include-unsubscribed",
        action="store_true",
        help="Include unsubscribed/bounced rows. Default is subscribed-only.",
    )
    parser.add_argument(
        "--out-dir",
        default="exports",
        help="Base output directory (default: exports/). A timestamped subdir is created inside.",
    )
    args = parser.parse_args()

    base_url = require_env("SUPABASE_URL").rstrip("/")
    service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")
    out_dir = Path(args.out_dir) / timestamp
    counts: dict[str, int] = {}

    print(f"export-subscribers: writing to {out_dir}/")
    for entry in TABLES:
        name = entry["name"]
        table = entry["table"]
        status_filter = (
            None if args.include_unsubscribed else entry["active_status_filter"]
        )
        try:
            rows = supabase_select(
                base_url=base_url,
                service_role_key=service_role_key,
                table=table,
                columns=entry["columns"],
                status_filter=status_filter,
            )
        except SystemExit:
            raise
        except Exception as exc:  # noqa: BLE001
            sys.exit(f"error: unexpected failure on {table}: {exc!r}")

        write_csv(out_dir / f"{name}.csv", entry["columns"], rows)
        counts[name] = len(rows)
        # Row count only — never an email.
        print(f"  {name:20s} {len(rows):>6} rows → {name}.csv")

    write_manifest(out_dir, counts, args.include_unsubscribed, timestamp)
    print(f"  MANIFEST.md written.")
    print(f"export-subscribers: done. {sum(counts.values())} rows total.")


if __name__ == "__main__":
    main()
