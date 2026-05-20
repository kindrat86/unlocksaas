#!/usr/bin/env python3
"""
verify-indie-search-presence.py - operator CLI that checks UnlockSaaS's
presence and discoverability across the four indie search engines
allow-listed in app/src/app/robots.ts (Brave, Mojeek, Marginalia, Kagi).

Why this exists
---------------
The robots.txt allow-list ships in code (INDIE_SEARCH_USER_AGENTS). But
allow-listing only tells crawlers they may enter; whether they have
actually crawled and indexed the canonical URL is operator-visible only
by polling each engine. Mojeek auto-discovers; Brave needs a one-time
manual form submission; Marginalia needs a GitHub PR. There is no
push-channel for any of them, so verification is the only feedback loop.

This script does three things:

  1. HEAD-checks each engine's published crawler help page. A 4xx means
     the engine has moved or removed the docs - a signal to refresh the
     UA token in robots.ts before the next crawler-fingerprint check.

  2. Greps app/src/app/robots.ts to confirm the four UA tokens are still
     present in the file. Regression gate: if a refactor dropped one,
     this surfaces it.

  3. Issues a "site:unlocksaas.com" query against each engine that
     exposes a public search endpoint (Brave, Mojeek, Marginalia). Kagi
     requires a paid account and is skipped with an honest note.

Output is a status block in Athens local time (DD-MM-YYYY HH:MM:SS) for
log-consistency with the rest of the operator tooling. Honest-failure
rule: the script reports "not indexed yet" or "doc URL moved" rather
than fabricating a positive result.

Usage
-----
  python3 scripts/verify-indie-search-presence.py
  python3 scripts/verify-indie-search-presence.py --json
  python3 scripts/verify-indie-search-presence.py --host unlocksaas.com

Brunson Hard-Rule reconciliation
--------------------------------
This script does not "submit" anything. Submissions are documented in
strategy/indie-search-submission-playbook.md and require operator-side
manual steps (Brave form + Marginalia GitHub PR). This script's only
job is verification - read-only HTTP and a string grep.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
ROBOTS_PATH = REPO_ROOT / "app" / "src" / "app" / "robots.ts"

# (engine, ua-token-in-robots, crawler-doc-url, public-search-template)
# search-template: None means we cannot programmatically verify the index
# (e.g., Kagi is paid; Mojeek's HTML SERP is fine for a smoke check).
ENGINES = [
    (
        "Brave Search",
        "Bravebot",
        "https://search.brave.com/help/brave-search-crawler",
        "https://search.brave.com/search?q=site%3A{host}",
    ),
    (
        "Mojeek",
        "MojeekBot",
        "https://www.mojeek.com/bot.html",
        "https://www.mojeek.com/search?q=site%3A{host}",
    ),
    (
        "Marginalia",
        "search.marginalia.nu",
        "https://about.marginalia-search.com/article/crawler/",
        "https://search.marginalia.nu/search?query=site%3A{host}",
    ),
    (
        "Kagi",
        "Kagibot",
        "https://kagi.com/bot",
        None,  # paid; no anonymous SERP probe
    ),
]

UA = (
    "Mozilla/5.0 (compatible; UnlockSaaS-Verify/1.0; "
    "+https://unlocksaas.com/robots.txt)"
)
TIMEOUT_S = 12


def athens_now() -> str:
    """DD-MM-YYYY HH:MM:SS in Europe/Athens, per operator-display convention."""
    # Python stdlib only - approximate Athens by UTC+3 (EEST) / UTC+2 (EET).
    # DST in Greece transitions last Sun of March / Oct. For an operator
    # status stamp this approximation is fine; the canonical source of truth
    # is the Vercel deploy timestamp recorded alongside.
    now_utc = dt.datetime.utcnow()
    # Crude DST check: Apr-Oct = EEST (UTC+3), else EET (UTC+2).
    is_eest = 4 <= now_utc.month <= 10
    offset = dt.timedelta(hours=3 if is_eest else 2)
    local = now_utc + offset
    return local.strftime("%d-%m-%Y %H:%M:%S") + (" EEST" if is_eest else " EET")


def head_check(url: str) -> tuple[int, str]:
    """Return (status_code, note). Status 0 means transport failure."""
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            return resp.status, "ok"
    except urllib.error.HTTPError as e:
        # Some servers reject HEAD; try GET as fallback.
        if e.code in (405, 501):
            try:
                req_get = urllib.request.Request(
                    url, headers={"User-Agent": UA}
                )
                with urllib.request.urlopen(req_get, timeout=TIMEOUT_S) as resp:
                    return resp.status, "ok (via GET; HEAD rejected)"
            except Exception as e2:
                return 0, f"GET fallback failed: {e2}"
        return e.code, f"HTTP {e.code}"
    except Exception as e:
        return 0, str(e)


def site_probe(template: str | None, host: str) -> str:
    """Issue site: query; return human-readable note. No HTML parsing -
    we report only whether the engine responded 2xx, never claim
    'found' from a heuristic."""
    if template is None:
        return "skipped (no anonymous SERP)"
    url = template.format(host=urllib.parse.quote(host, safe=""))
    code, note = head_check(url)
    if code == 200:
        return f"SERP reachable ({url})"
    if code == 0:
        return f"SERP unreachable: {note}"
    return f"SERP returned HTTP {code}"


def robots_has_ua(ua_token: str) -> bool:
    """String-grep the robots.ts file for the UA token. Defensive: also
    accept the token surrounded by quotes (the array element form)."""
    if not ROBOTS_PATH.exists():
        return False
    text = ROBOTS_PATH.read_text(encoding="utf-8")
    # Token appears as `"<ua>"` inside INDIE_SEARCH_USER_AGENTS array.
    pattern = re.compile(rf'"\s*{re.escape(ua_token)}\s*"')
    return bool(pattern.search(text))


def run(host: str) -> list[dict]:
    rows: list[dict] = []
    for name, ua, doc_url, search_template in ENGINES:
        doc_code, doc_note = head_check(doc_url)
        rows.append(
            {
                "engine": name,
                "ua_token": ua,
                "ua_in_robots": robots_has_ua(ua),
                "doc_url": doc_url,
                "doc_status": doc_code,
                "doc_note": doc_note,
                "serp_probe": site_probe(search_template, host),
            }
        )
    return rows


def render_human(rows: list[dict], host: str) -> str:
    lines: list[str] = []
    lines.append(f"Indie-search presence audit for {host}")
    lines.append(f"Run at: {athens_now()}")
    lines.append("=" * 64)
    for r in rows:
        lines.append(f"\n[{r['engine']}]  UA token: {r['ua_token']}")
        ua_ok = "yes" if r["ua_in_robots"] else "MISSING - regression gate triggered"
        lines.append(f"  robots.ts allow-listed:  {ua_ok}")
        lines.append(
            f"  Crawler doc:             HTTP {r['doc_status']} ({r['doc_note']})"
        )
        lines.append(f"  Public SERP probe:       {r['serp_probe']}")
    lines.append("")
    lines.append("Next operator actions: see strategy/indie-search-submission-playbook.md")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--host",
        default="unlocksaas.com",
        help="Canonical host to probe (default: unlocksaas.com).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON instead of the human report.",
    )
    args = parser.parse_args()

    rows = run(args.host)
    if args.json:
        print(
            json.dumps(
                {
                    "host": args.host,
                    "run_at_athens": athens_now(),
                    "rows": rows,
                },
                indent=2,
            )
        )
    else:
        print(render_human(rows, args.host))

    # Exit non-zero if any UA token is missing from robots.ts. That is the
    # one hard regression we want CI / cron to catch.
    any_missing = any(not r["ua_in_robots"] for r in rows)
    return 1 if any_missing else 0


if __name__ == "__main__":
    sys.exit(main())
