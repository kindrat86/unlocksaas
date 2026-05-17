#!/usr/bin/env python3
"""Friday Audible Call — CLI mirror of the Vercel cron route.

Closes DotCom Secrets Secret #28 (Funnel Audibles) by giving the operator a
way to fire the same call manually that the cron fires weekly. Pre-launch,
the cron cannot fire until CRON_SECRET is in Vercel; this script lets the
inaugural read happen today, against the live Supabase view, with the audit
row recorded the same way.

Spec:
  strategy/funnel-audibles.md Part 5 (Cadence) + Closing (the Call itself).
  app/src/lib/audibles/friday-call.ts — TS counterpart used by the cron.
  supabase/migrations/20260518000008_friday_audible_calls.sql — audit table.

Usage:
  python3 scripts/friday-audible-call.py [--dry-run] [--no-email]

  --dry-run        Tag the audit row with source='dry_run' instead of
                   'manual_cli'. Use for pre-launch readiness fires.
  --no-email       Skip the Resend send. Audit row still written.
  --notes "..."    Free-form note attached to the audit row.

Environment:
  SUPABASE_URL                    Public Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY       Service-role key (bypasses RLS)
  RESEND_API_KEY                  Resend API key
  RESEND_FROM (optional)          Override sender; default
                                  "Maryan from UnlockSaaS <maryan@unlocksaas.com>"

All four are read from .env.development.local (gitignored) when present;
falls back to the live environment.

Why a Python mirror instead of `vercel cron invoke`:
  1. Pre-launch, CRON_SECRET is not in Vercel — the cron cannot fire.
  2. The founder needs to fire the inaugural dry-run today, against the
     real view, with the real audit row, to lift the audit cap from 90
     to 100.
  3. The script reuses the same view + the same audit-row shape as the
     TS orchestrator, so the dry-run is a faithful preview of what the
     cron will do every Friday.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / ".env.development.local"

VIEW_NAME = "funnel_audibles__weekly_top_of_funnel"
AUDIT_TABLE = "friday_audible_calls"
FOUNDER_EMAIL = "maryan@unlocksaas.com"

# ----------------------------------------------------------------------------
# Trigger matrix — mirrored from app/src/lib/audibles/friday-call.ts
# Keep in sync with the TS module. Any divergence between cron + CLI verdict
# is an audit drift bug.
# ----------------------------------------------------------------------------
TRIGGER_MATRIX = [
    {
        "row": 5,
        "label": "Diagnostic → Starter conversion",
        "metric_key": "diag_to_starter_pct_7d",
        "window_key": "diagnoses_7d",
        "min_window": 100,
        "red_line": 15.0,
        "target": 28.0,
        "audible_key": "step_5_audible_a",
        "is_pct_metric": True,
    },
    {
        "row": 8,
        "label": "OTO take-rate (proxy: Starter → Core)",
        "metric_key": "core_subs_7d",
        "window_key": "starter_buys_7d",
        "min_window": 30,
        "red_line": 10.0,
        "target": 22.0,
        "audible_key": "step_8_audible_b",
        "is_pct_metric": False,
    },
    {
        "row": 14,
        "label": "20-outreach completion rate (existential)",
        "metric_key": "outreach_verified_7d",
        "window_key": "core_subs_7d",
        "min_window": 10,
        "red_line": 40.0,
        "target": 60.0,
        "audible_key": "step_14_audible_a_and_b",
        "is_pct_metric": False,
        "existential": True,
    },
    {
        "row": 17,
        "label": "Soap Opera unsubscribe rate",
        "metric_key": "sos_unsubs_7d",
        "window_key": "sos_new_7d",
        "min_window": 30,
        "red_line": 45.0,
        "target": 20.0,
        "audible_key": "soap_opera_subject_audible",
        "is_pct_metric": False,
        "inverted": True,
    },
    {
        "row": 18,
        "label": "Soap Opera → $1 click (proxy: Starter buys / SOS new)",
        "metric_key": "starter_buys_7d",
        "window_key": "sos_new_7d",
        "min_window": 50,
        "red_line": 3.0,
        "target": 8.0,
        "audible_key": "soap_opera_cta_audible",
        "is_pct_metric": False,
    },
]


def load_env() -> dict[str, str]:
    """Read .env.development.local plus the live environment, env-file wins."""
    env: dict[str, str] = {k: v for k, v in os.environ.items()}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            if "=" not in stripped:
                continue
            key, _, value = stripped.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key:
                env[key] = value
    return env


def supabase_request(
    env: dict[str, str], path: str, *, method: str = "GET", body: Any | None = None
) -> tuple[int, Any]:
    url = env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        sys.exit(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Populate .env.development.local via scripts/setup-supabase-secrets.py."
        )

    req = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/{path.lstrip('/')}",
        method=method,
        headers={
            "apikey": key,
            "authorization": f"Bearer {key}",
            "content-type": "application/json",
            "prefer": "return=representation",
        },
    )
    data = None if body is None else json.dumps(body).encode("utf-8")
    try:
        with urllib.request.urlopen(req, data=data, timeout=15) as response:
            status = response.status
            text = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        status = exc.code
        text = exc.read().decode("utf-8")
    parsed: Any = None
    if text:
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            parsed = text
    return status, parsed


def read_view(env: dict[str, str]) -> tuple[dict[str, Any] | None, str | None]:
    status, payload = supabase_request(env, f"{VIEW_NAME}?select=*&limit=1")
    if status != 200:
        return None, f"view_read_failed: status={status} payload={payload!r}"
    if not isinstance(payload, list) or not payload:
        # The view aggregates with no group-by so it always returns one row;
        # treat empty as an empty snapshot (pre-launch with literally no rows
        # in any source table is technically possible).
        return None, None
    return payload[0], None


def compute_verdict(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Mirror of computeVerdict() in app/src/lib/audibles/friday-call.ts."""
    # 1) Existential: guarantee health inverted.
    if snapshot.get("guarantee_health") == "INVERTED_EXISTENTIAL":
        return {
            "status": "inverted",
            "worst_metric_key": "guarantee_health",
            "worst_metric_value": None,
            "worst_metric_target": None,
            "worst_metric_red_line": None,
            "trigger_matrix_row": 16,
            "audible_recommended": "revision_mode_offer_or_avatar",
            "reasoning": (
                "Refunds exceeded verified charges in the last 7 days. "
                "This is not an audible — it is Revision Mode. "
                "Re-read workbook 01 §2 (offer) and workbook 01 §1 Q1 "
                "(avatar) before any other change."
            ),
        }

    # 2) Windowed rows.
    windowed = []
    for row in TRIGGER_MATRIX:
        window_val = snapshot.get(row["window_key"])
        if isinstance(window_val, (int, float)) and window_val >= row["min_window"]:
            windowed.append(row)

    if not windowed:
        return {
            "status": "pre_launch_no_data",
            "worst_metric_key": None,
            "worst_metric_value": None,
            "worst_metric_target": None,
            "worst_metric_red_line": None,
            "trigger_matrix_row": None,
            "audible_recommended": None,
            "reasoning": (
                "No trigger-matrix row has met its minimum window count. "
                "The Friday Call still fires by Brunson rule, but no "
                "audible is recommended — small samples lie. Drive traffic "
                "and re-read."
            ),
        }

    # 3) Red checks.
    reds = []
    for row in windowed:
        raw = snapshot.get(row["metric_key"])
        window_val = snapshot.get(row["window_key"])
        if not isinstance(raw, (int, float)):
            continue
        if not isinstance(window_val, (int, float)) or window_val == 0:
            pct = None
        else:
            pct = (raw / window_val) * 100.0
        compare_val = raw if row["is_pct_metric"] else pct
        if compare_val is None or row.get("red_line") is None:
            continue
        if row.get("inverted"):
            fired = compare_val > row["red_line"]
        else:
            fired = compare_val < row["red_line"]
        if fired:
            reds.append({"row": row, "value": raw, "pct": pct})

    if not reds:
        return {
            "status": "green",
            "worst_metric_key": None,
            "worst_metric_value": None,
            "worst_metric_target": None,
            "worst_metric_red_line": None,
            "trigger_matrix_row": None,
            "audible_recommended": None,
            "reasoning": (
                f"{len(windowed)} trigger-matrix row(s) have window met; "
                "none are below red-line. No audible needed this week."
            ),
        }

    # Existential first (rows 14, 16), then row order.
    reds.sort(
        key=lambda r: (
            0 if r["row"].get("existential") else 1,
            r["row"]["row"],
        )
    )
    worst = reds[0]
    return {
        "status": "red",
        "worst_metric_key": worst["row"]["metric_key"],
        "worst_metric_value": worst["pct"] if worst["pct"] is not None else worst["value"],
        "worst_metric_target": worst["row"]["target"],
        "worst_metric_red_line": worst["row"]["red_line"],
        "trigger_matrix_row": worst["row"]["row"],
        "audible_recommended": worst["row"]["audible_key"],
        "reasoning": (
            f"Trigger Matrix row {worst['row']['row']} ({worst['row']['label']}) "
            "crossed the red-line. Fire audible "
            f"\"{worst['row']['audible_key']}\" from strategy/funnel-audibles.md "
            "Part 3."
        ),
    }


def empty_snapshot() -> dict[str, Any]:
    return {
        "diagnoses_7d": 0,
        "diag_to_starter_7d": 0,
        "diag_to_starter_pct_7d": None,
        "starter_buys_7d": 0,
        "core_subs_7d": 0,
        "refunds_7d": 0,
        "verified_charges_7d": 0,
        "outreach_sent_7d": 0,
        "outreach_verified_7d": 0,
        "sos_new_7d": 0,
        "sos_unsubs_7d": 0,
        "ab_exposures": 0,
        "ab_conversions": 0,
        "guarantee_health": "no_refunds_no_verified",
    }


def format_email(
    snapshot: dict[str, Any], verdict: dict[str, Any], ran_at: datetime
) -> tuple[str, str, str]:
    date_str = ran_at.strftime("%Y-%m-%d")
    status = verdict["status"]
    if status == "inverted":
        subject = f"[EXISTENTIAL] Friday Audible Call — {date_str} — refunds > verified"
    elif status == "red":
        subject = (
            f"[RED] Friday Audible Call — {date_str} — "
            f"row {verdict['trigger_matrix_row']}"
        )
    elif status == "green":
        subject = f"[GREEN] Friday Audible Call — {date_str} — no audible needed"
    elif status == "cron_error":
        subject = f"[ERROR] Friday Audible Call — {date_str} — view read failed"
    else:
        subject = f"[PRE-LAUNCH] Friday Audible Call — {date_str} — windows unmet"

    diag_pct = snapshot.get("diag_to_starter_pct_7d")
    pct_str = "—" if diag_pct is None else f"{diag_pct}"
    lines = [
        f"Friday Audible Call — {date_str}",
        "",
        f"Status: {status.upper()}",
        "",
        "Snapshot (last 7 days):",
        f"  Diagnoses:                {snapshot.get('diagnoses_7d', 0)}",
        f"  Diagnostic → Starter:     {snapshot.get('diag_to_starter_7d', 0)} ({pct_str}%)",
        f"  Starter buys:             {snapshot.get('starter_buys_7d', 0)}",
        f"  Core subs:                {snapshot.get('core_subs_7d', 0)}",
        f"  Verified charges:         {snapshot.get('verified_charges_7d', 0)}",
        f"  Refunds:                  {snapshot.get('refunds_7d', 0)}",
        f"  Outreach sent / verified: {snapshot.get('outreach_sent_7d', 0)} / "
        f"{snapshot.get('outreach_verified_7d', 0)}",
        f"  SOS new / unsubs:         {snapshot.get('sos_new_7d', 0)} / "
        f"{snapshot.get('sos_unsubs_7d', 0)}",
        f"  A/B exposures / conv:     {snapshot.get('ab_exposures', 0)} / "
        f"{snapshot.get('ab_conversions', 0)}",
        f"  Guarantee health:         {snapshot.get('guarantee_health', '—')}",
        "",
        "Verdict:",
        f"  {verdict['reasoning']}",
    ]
    if verdict.get("audible_recommended"):
        lines.extend(
            [
                "",
                f"Recommended audible: {verdict['audible_recommended']}",
                "  Open strategy/funnel-audibles.md Part 3 → look up the audible key.",
                "  Pre-staged copy lives in Part 8. Swap, deploy, record what you "
                "fired and your",
                "  prediction in strategy/audibles-log.md.",
            ]
        )
    lines.extend(
        [
            "",
            "This call was fired manually via scripts/friday-audible-call.py.",
            "The cron at /api/cron/friday-audible-call fires every Friday 14:00 UTC.",
            "The discipline of the read is the discipline, not the cleverness of",
            "the audible. — strategy/funnel-audibles.md",
        ]
    )
    text = "\n".join(lines)

    def _escape(s: str) -> str:
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    html = (
        '<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;'
        "font-size:13px;line-height:1.5;white-space:pre-wrap;\">"
        f"{_escape(text)}</pre>"
    )
    return subject, text, html


def send_via_resend(
    env: dict[str, str], subject: str, text: str, html: str
) -> tuple[str | None, str | None]:
    api_key = env.get("RESEND_API_KEY")
    if not api_key:
        return None, "RESEND_API_KEY missing — skipping send"
    from_addr = env.get(
        "RESEND_FROM", "Maryan from UnlockSaaS <maryan@unlocksaas.com>"
    )

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        method="POST",
        headers={
            "authorization": f"Bearer {api_key}",
            "content-type": "application/json",
        },
        data=json.dumps(
            {
                "from": from_addr,
                "to": [FOUNDER_EMAIL],
                "reply_to": FOUNDER_EMAIL,
                "subject": subject,
                "text": text,
                "html": html,
            }
        ).encode("utf-8"),
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            body = json.loads(response.read().decode("utf-8"))
        return body.get("id"), None
    except urllib.error.HTTPError as exc:
        return None, f"resend_http_{exc.code}: {exc.read().decode('utf-8')}"
    except Exception as exc:  # noqa: BLE001
        return None, f"resend_exception: {exc}"


def insert_audit_row(
    env: dict[str, str],
    *,
    source: str,
    ran_at: datetime,
    snapshot: dict[str, Any],
    verdict: dict[str, Any],
    email_message_id: str | None,
    notes: str | None,
) -> tuple[str | None, str | None]:
    payload = {
        "ran_at": ran_at.isoformat(),
        "source": source,
        "snapshot": snapshot,
        "worst_metric_key": verdict.get("worst_metric_key"),
        "worst_metric_value": verdict.get("worst_metric_value"),
        "worst_metric_target": verdict.get("worst_metric_target"),
        "worst_metric_red_line": verdict.get("worst_metric_red_line"),
        "trigger_matrix_row": verdict.get("trigger_matrix_row"),
        "status": verdict["status"],
        "audible_recommended": verdict.get("audible_recommended"),
        "email_sent": email_message_id is not None,
        "email_message_id": email_message_id,
        "notes": notes,
    }
    status, body = supabase_request(env, AUDIT_TABLE, method="POST", body=payload)
    if status not in (200, 201):
        return None, f"insert_failed: status={status} body={body!r}"
    if isinstance(body, list) and body:
        return body[0].get("id"), None
    return None, None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Tag the audit row source as 'dry_run' (pre-launch readiness fire).",
    )
    parser.add_argument(
        "--no-email",
        action="store_true",
        help="Skip the Resend send. Audit row still written.",
    )
    parser.add_argument(
        "--notes",
        default=None,
        help="Free-form note attached to the audit row.",
    )
    args = parser.parse_args()

    env = load_env()
    ran_at = datetime.now(timezone.utc)

    print(f"[friday-call] ran_at={ran_at.isoformat()}")
    snapshot, view_error = read_view(env)
    if view_error:
        print(f"[friday-call] view_error={view_error}", file=sys.stderr)
        verdict = {
            "status": "cron_error",
            "worst_metric_key": None,
            "worst_metric_value": None,
            "worst_metric_target": None,
            "worst_metric_red_line": None,
            "trigger_matrix_row": None,
            "audible_recommended": None,
            "reasoning": view_error,
        }
        snapshot = empty_snapshot()
    else:
        snapshot = snapshot or empty_snapshot()
        verdict = compute_verdict(snapshot)

    subject, text, html = format_email(snapshot, verdict, ran_at)
    print(f"[friday-call] verdict={verdict['status']} subject={subject!r}")

    email_id: str | None = None
    if not args.no_email and verdict["status"] != "cron_error":
        email_id, send_error = send_via_resend(env, subject, text, html)
        if send_error:
            print(f"[friday-call] send_error={send_error}", file=sys.stderr)
        else:
            print(f"[friday-call] email_id={email_id}")

    source = "dry_run" if args.dry_run else "manual_cli"
    row_id, insert_error = insert_audit_row(
        env,
        source=source,
        ran_at=ran_at,
        snapshot=snapshot,
        verdict=verdict,
        email_message_id=email_id,
        notes=args.notes,
    )
    if insert_error:
        print(f"[friday-call] audit_insert_error={insert_error}", file=sys.stderr)
        return 1
    print(f"[friday-call] audit_row_id={row_id}")
    print("\n=== EMAIL BODY ===")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
