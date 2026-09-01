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

When a run fails it drops ~/.unlocksaas/SYNC-BROKEN.md and clears it on the
next good run — stdout goes to ~/.unlocksaas/sync.log, which nobody reads.

Run manually:  ~/portfolio/.venv/bin/python ~/unlocksaas/scripts/sync-local-db.py
"""
import json
import re
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path.home() / "portfolio"))
from lib.vault import Vault  # noqa: E402

DB_DIR = Path.home() / ".unlocksaas"
DB_PATH = DB_DIR / "funnel.db"
ALERT_PATH = DB_DIR / "SYNC-BROKEN.md"
ENV_PATH = Path.home() / "email-engine/.env"
AUDIENCES = ["UnlockSaaS", "VoiceLogPro"]


class ResendFatalError(RuntimeError):
    """Resend rejected the request outright — retrying cannot help."""


_key_cache = {}


def resend_key():
    """The Resend key, vault-first.

    ~/email-engine/.env is a deployment artifact, not the source of truth — its
    own header says so ("source of truth: portfolio vault global:RESEND_API_KEY
    ... Re-sync from there if rotated"). The 2026-08-08 rotation updated the
    vault and left .env holding the revoked key, so every hourly run from
    2026-08-08T09:24Z on died on "API key is invalid". Reading the vault first
    makes a rotation self-heal; .env stays as the fallback.
    """
    if "key" not in _key_cache:
        key = (Vault().get_key("RESEND_API_KEY") or "").strip()
        if not key:
            m = re.search(r"^RESEND_API_KEY=(\S+)", ENV_PATH.read_text(), re.M)
            key = m.group(1) if m else ""
        if not key:
            raise ResendFatalError(
                f"no RESEND_API_KEY in the portfolio vault (global:) or {ENV_PATH}"
            )
        _key_cache["key"] = key
    return _key_cache["key"]


def resend(path):
    req = urllib.request.Request(
        f"https://api.resend.com{path}",
        # Cloudflare rejects urllib's default UA with 403/1010
        headers={
            "Authorization": f"Bearer {resend_key()}",
            "User-Agent": "unlocksaas-local-sync/1.0 (+curl-compatible)",
        },
    )
    for attempt in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except urllib.error.HTTPError as e:
            # str(HTTPError) is only "HTTP Error 400: Bad Request"; the body is
            # where Resend says *why*. Dropping it is what let four days of
            # "API key is invalid" read as a generic upstream blip.
            body = e.read().decode("utf-8", "replace").strip()[:200]
            if e.code in (400, 401, 403):
                raise ResendFatalError(f"HTTP {e.code} on {path}: {body}") from None
            if attempt == 2:
                raise RuntimeError(f"HTTP {e.code} on {path}: {body}") from None
            time.sleep(2 * (attempt + 1))
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


def raise_alarm(db, err, now, section_ok):
    """Leave a marker a human will actually trip over.

    The launchd job's stdout lands in ~/.unlocksaas/sync.log and 91 failed runs
    sat there unread for four days. This writes a standalone file next to the
    DB that identifies which section is stale, so a frozen table is never
    mistaken for a real absence of signups or revenue.
    """
    last_ok = db.execute("SELECT MAX(at) FROM sync_runs WHERE ok=1").fetchone()[0]
    fails = db.execute(
        "SELECT COUNT(*) FROM sync_runs WHERE ok=0 AND at > ?", (last_ok or "",)
    ).fetchone()[0]
    first = not ALERT_PATH.exists()
    resend_status = "OK" if section_ok["resend"] else "FAILED"
    stripe_status = "OK" if section_ok["stripe"] else "FAILED"
    ALERT_PATH.write_text(
        f"""# funnel.db sync is BROKEN

    last fully successful sync : {last_ok or "never"}
    failed runs since          : {fails}
    latest failure             : {now}
    Resend section             : {resend_status}
    Stripe section             : {stripe_status}
    error                      : {err}

**One or more sections of ~/.unlocksaas/funnel.db are stale.** `subscribers`
and `email_events` follow the Resend status above; `stripe_customers` and
`stripe_subs` follow the Stripe status. A successful section reflects this run;
a failed section may be stale or only partly refreshed and must not be read as
evidence about signups, sends, or revenue.

Inspect the named section error above and repair that upstream credential or
request path. Resend's key source of truth is the portfolio vault
(global:RESEND_API_KEY); Stripe uses global:STRIPE_SECRET_KEY from the same
vault.

This file is deleted automatically by the next fully successful run.
"""
    )
    if first:
        # Best effort — a launchd context without a GUI session just won't show it.
        try:
            subprocess.run(
                ["osascript", "-e",
                 'display notification "funnel.db sync failed - see '
                 '~/.unlocksaas/SYNC-BROKEN.md" with title "UnlockSaaS"'],
                timeout=10, check=False,
            )
        except Exception:
            pass


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
          customers INTEGER, subs INTEGER, error TEXT,
          resend_ok INTEGER, stripe_ok INTEGER);
        """
    )
    sync_run_columns = {
        row[1] for row in db.execute("PRAGMA table_info(sync_runs)").fetchall()
    }
    for column in ("resend_ok", "stripe_ok"):
        if column not in sync_run_columns:
            db.execute(f"ALTER TABLE sync_runs ADD COLUMN {column} INTEGER")
    now = datetime.now(timezone.utc).isoformat()
    counts = {"subscribers": 0, "emails": 0, "customers": 0, "subs": 0}
    section_ok = {"resend": False, "stripe": False}
    errors = []
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
    except Exception as e:  # keep Stripe independent from Resend failures
        errors.append(f"resend: {type(e).__name__}: {e}")
    else:
        section_ok["resend"] = True

    try:
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
    except Exception as e:  # record the failure, keep Resend data
        errors.append(f"stripe: {type(e).__name__}: {e}")
    else:
        section_ok["stripe"] = True

    err = "; ".join(errors) or None
    overall_ok = all(section_ok.values())
    db.execute(
        """INSERT INTO sync_runs
           (at, ok, subscribers, emails, customers, subs, error,
            resend_ok, stripe_ok)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (now, int(overall_ok), counts["subscribers"], counts["emails"],
         counts["customers"], counts["subs"], err,
         int(section_ok["resend"]), int(section_ok["stripe"])),
    )
    db.commit()

    if overall_ok:
        ALERT_PATH.unlink(missing_ok=True)
        status = "OK"
    else:
        raise_alarm(db, err, now, section_ok)
        status_word = "FAILED" if len(errors) == 2 else "PARTIAL"
        status = f"{status_word} ({err})"
    db.close()

    print(f"[{now}] {status} " + " ".join(f"{k}={v}" for k, v in counts.items()))
    if not overall_ok:
        # launchd merges both streams into sync.log, so don't repeat the line
        print(f"  -> one or more funnel.db sections are stale; see {ALERT_PATH}",
              file=sys.stderr)
    sys.exit(0 if overall_ok else 1)


if __name__ == "__main__":
    main()
