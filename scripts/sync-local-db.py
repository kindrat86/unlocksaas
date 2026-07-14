#!/usr/bin/env python3
"""Local funnel database sync — the Mac mini is the system of record.

Pulls into ~/.unlocksaas/funnel.db (SQLite):
  - subscribers        <- Resend audiences (UnlockSaaS, VoiceLogPro)
  - email_events       <- Resend sends (sequence state per contact)
  - stripe_customers   <- Stripe customers (shared live account)
  - stripe_subs        <- Stripe subscriptions (id, status, price, amount)
  - sync_runs          <- run log

No cloud DB anywhere: Resend + Stripe are upstream operational stores,
this file is the durable local copy. Idempotent upserts; safe to run any
time. Scheduled hourly via launchd `com.unlocksaas.funnel-db-sync`.

Run manually:  ~/portfolio/.venv/bin/python ~/unlocksaas/scripts/sync-local-db.py
"""
import json
import re
import sqlite3
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path.home() / "portfolio"))
from lib.vault import Vault  # noqa: E402

DB_DIR = Path.home() / ".unlocksaas"
DB_PATH = DB_DIR / "funnel.db"
RESEND_KEY = re.search(
    r"RESEND_API_KEY=(\S+)", (Path.home() / "email-engine/.env").read_text()
).group(1)
AUDIENCES = ["UnlockSaaS", "VoiceLogPro"]


def resend(path):
    req = urllib.request.Request(
        f"https://api.resend.com{path}",
        # Cloudflare rejects urllib's default UA with 403/1010
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "User-Agent": "unlocksaas-local-sync/1.0 (+curl-compatible)",
        },
    )
    for attempt in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))  # free-tier rate limit is 2 rps


def stripe(path, key):
    req = urllib.request.Request(
        f"https://api.stripe.com/v1/{path}",
        headers={
            "Authorization": f"Bearer {key}",
            "User-Agent": "unlocksaas-local-sync/1.0",
        },
    )
    return json.load(urllib.request.urlopen(req, timeout=30))


def stripe_paged(resource, key, params=""):
    items, starting_after = [], None
    while True:
        qs = f"?limit=100{params}" + (f"&starting_after={starting_after}" if starting_after else "")
        page = stripe(f"{resource}{qs}", key)
        items.extend(page["data"])
        if not page.get("has_more"):
            return items
        starting_after = page["data"][-1]["id"]


def main():
    DB_DIR.mkdir(exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS subscribers (
          email TEXT NOT NULL, audience TEXT NOT NULL,
          unsubscribed INTEGER, resend_created_at TEXT,
          first_seen_locally TEXT, last_synced TEXT,
          PRIMARY KEY (email, audience));
        CREATE TABLE IF NOT EXISTS email_events (
          resend_id TEXT PRIMARY KEY, to_email TEXT, from_email TEXT,
          subject TEXT, last_event TEXT, created_at TEXT, scheduled_at TEXT,
          last_synced TEXT);
        CREATE TABLE IF NOT EXISTS stripe_customers (
          id TEXT PRIMARY KEY, email TEXT, name TEXT, created INTEGER,
          last_synced TEXT);
        CREATE TABLE IF NOT EXISTS stripe_subs (
          id TEXT PRIMARY KEY, customer TEXT, status TEXT, price_id TEXT,
          amount INTEGER, currency TEXT, interval TEXT, created INTEGER,
          last_synced TEXT);
        CREATE TABLE IF NOT EXISTS sync_runs (
          at TEXT, ok INTEGER, subscribers INTEGER, emails INTEGER,
          customers INTEGER, subs INTEGER, error TEXT);
        """
    )
    now = datetime.now(timezone.utc).isoformat()
    counts = {"subscribers": 0, "emails": 0, "customers": 0, "subs": 0}
    err = None
    try:
        # --- Resend audiences -> subscribers
        audiences = resend("/audiences")["data"]
        for name in AUDIENCES:
            match = [a for a in audiences if a["name"] == name]
            if not match:
                continue
            contacts = resend(f"/audiences/{match[0]['id']}/contacts")["data"]
            for c in contacts:
                db.execute(
                    """INSERT INTO subscribers (email, audience, unsubscribed,
                       resend_created_at, first_seen_locally, last_synced)
                       VALUES (?,?,?,?,?,?)
                       ON CONFLICT(email, audience) DO UPDATE SET
                       unsubscribed=excluded.unsubscribed,
                       last_synced=excluded.last_synced""",
                    (c["email"], name, int(c.get("unsubscribed", False)),
                     c.get("created_at"), now, now),
                )
                counts["subscribers"] += 1
            time.sleep(1)

        # --- Resend sends -> email_events (most recent 100; the table
        # accumulates history across runs, so hourly syncs never miss)
        for e in resend("/emails?limit=100")["data"]:
            db.execute(
                """INSERT INTO email_events VALUES (?,?,?,?,?,?,?,?)
                   ON CONFLICT(resend_id) DO UPDATE SET
                   last_event=excluded.last_event,
                   last_synced=excluded.last_synced""",
                (e["id"], (e.get("to") or [""])[0], e.get("from"),
                 e.get("subject"), e.get("last_event"), e.get("created_at"),
                 e.get("scheduled_at"), now),
            )
            counts["emails"] += 1

        # --- Stripe -> customers + subscriptions (shared live account)
        skey = Vault().get_key("STRIPE_SECRET_KEY").strip()
        for c in stripe_paged("customers", skey):
            db.execute(
                """INSERT INTO stripe_customers VALUES (?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET email=excluded.email,
                   name=excluded.name, last_synced=excluded.last_synced""",
                (c["id"], c.get("email"), c.get("name"), c.get("created"), now),
            )
            counts["customers"] += 1
        for s in stripe_paged("subscriptions", skey, "&status=all"):
            item = (s.get("items", {}).get("data") or [{}])[0]
            price = item.get("price") or {}
            db.execute(
                """INSERT INTO stripe_subs VALUES (?,?,?,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET status=excluded.status,
                   last_synced=excluded.last_synced""",
                (s["id"], s.get("customer"), s.get("status"), price.get("id"),
                 price.get("unit_amount"), price.get("currency"),
                 (price.get("recurring") or {}).get("interval"),
                 s.get("created"), now),
            )
            counts["subs"] += 1
    except Exception as e:  # record the failure, keep partial data
        err = f"{type(e).__name__}: {e}"

    db.execute(
        "INSERT INTO sync_runs VALUES (?,?,?,?,?,?,?)",
        (now, int(err is None), counts["subscribers"], counts["emails"],
         counts["customers"], counts["subs"], err),
    )
    db.commit()
    db.close()
    status = "OK" if err is None else f"PARTIAL ({err})"
    print(f"[{now}] {status} " + " ".join(f"{k}={v}" for k, v in counts.items()))
    sys.exit(0 if err is None else 1)


if __name__ == "__main__":
    main()
