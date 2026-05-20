#!/usr/bin/env python3
"""Operator dashboard builder for UnlockSaaS.

Reads `.env.development.local` from the repo root, pulls:
  - PostHog (eu.posthog.com)  visitors, sources, countries, daily, funnel, UTM
  - Supabase (REST)            soap_opera_subscribers, diagnostic_leads, profiles
  - Stripe                     Starter + Core subscriptions, MRR, statuses
  - Resend                     email engagement (delivered / opened / clicked)
  - Google Search Console      clicks / impressions / ctr / position (optional)

Then renders monitoring/dashboard.template.html with a JSON payload and writes
monitoring/dashboard.html. A one-line summary is appended to monitoring/refresh.log.

Every source degrades gracefully — missing credentials or upstream errors do not
abort the build; the affected card shows '-' or 'Awaiting feed' instead.

Run hourly via launchd job `com.unlocksaas.monitoring`.
"""

from __future__ import annotations

import base64
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ENV_FILE = os.path.join(PROJECT_DIR, ".env.development.local")
MONITORING_DIR = os.path.join(PROJECT_DIR, "monitoring")
TEMPLATE_FILE = os.path.join(MONITORING_DIR, "dashboard.template.html")
OUT_FILE = os.path.join(MONITORING_DIR, "dashboard.html")
LOG_FILE = os.path.join(MONITORING_DIR, "refresh.log")

RECENT_DAYS = 30
FORECAST_WEEKS = 16

# Founder exclusion mirror (see project_unlocksaas_founder_identifiers memory + PostHog "Internal users").
EXCLUDE_COUNTRY = "GR"
EXCLUDE_DISTINCT_IDS = {
    "c7c29d8d-8065-420a-8c82-27f50e0311fc",
}
# Self-test inboxes excluded from subscriber metrics.
EXCLUDED_EMAILS = {
    "sales@sipiteno.com",          # kept as a live QA inbox? — left in to keep parity with prior behavior
    "maryan@unlocksaas.com",
    "test@example.com",
}

# Brunson rule-of-thumb opt-in / paid conversion bands.
BENCHMARK_OPT_IN = 3.0
BENCHMARK_PAID_LO = 1.0
BENCHMARK_PAID_HI = 3.3
BENCHMARK_ROWS = [
    {"traffic": 100,    "subs": 3,    "paid_lo": 0,  "paid_hi": 0},
    {"traffic": 1000,   "subs": 30,   "paid_lo": 0,  "paid_hi": 1},
    {"traffic": 10000,  "subs": 300,  "paid_lo": 3,  "paid_hi": 10},
    {"traffic": 100000, "subs": 3000, "paid_lo": 30, "paid_hi": 100},
]

# Static channel inventory for UnlockSaaS. Update as accounts get created.
CHANNELS = {
    "social": [
        {"name": "Reddit", "stat": "Daily teardown-courtesy outreach", "status": "live"},
        {"name": "Twitter / X", "stat": "Sender identity: maryan@unlocksaas.com", "status": "not_created"},
        {"name": "LinkedIn", "stat": "Personal profile only", "status": "not_created"},
        {"name": "Product Hunt", "stat": "Launch pending", "status": "not_created"},
        {"name": "IndieHackers", "stat": "Profile pending", "status": "not_created"},
        {"name": "Hacker News", "stat": "Account pending", "status": "not_created"},
    ],
    "content": [
        {"name": "Blog (unlocksaas.com/glossary)", "activity": "16 Brunson terms live", "status": "live"},
        {"name": "Medium", "activity": "Cross-post pending", "status": "not_created"},
        {"name": "Substack", "activity": "Notes pending", "status": "not_created"},
        {"name": "dev.to", "activity": "Cross-post pending", "status": "not_created"},
    ],
    "directories": [
        {"name": "G2", "category": "Software", "status": "not_created", "as_of": ""},
        {"name": "SaaSHub", "category": "Software", "status": "not_created", "as_of": ""},
        {"name": "Crunchbase", "category": "Business", "status": "not_created", "as_of": ""},
        {"name": "AlternativeTo", "category": "Software", "status": "not_created", "as_of": ""},
        {"name": "IndieHackers Products", "category": "Startup", "status": "not_created", "as_of": ""},
    ],
    "dev": [
        {"name": "Google Search Console", "info": "Verified", "status": "live"},
        {"name": "Bing Webmaster / IndexNow", "info": "INDEXNOW_KEY configured", "status": "live"},
        {"name": "Resend (transactional)", "info": "API key wired", "status": "live"},
        {"name": "PostHog", "info": "Project 181784 (EU)", "status": "live"},
    ],
}

COUNTRY_NAMES = {
    "US": "United States", "GB": "United Kingdom", "DE": "Germany",
    "FR": "France", "JP": "Japan", "IN": "India", "CN": "China",
    "KR": "South Korea", "IE": "Ireland", "TW": "Taiwan",
    "NL": "Netherlands", "SE": "Sweden", "CA": "Canada",
    "AU": "Australia", "BR": "Brazil", "ES": "Spain", "IT": "Italy",
    "SG": "Singapore", "IL": "Israel", "CH": "Switzerland",
    "AT": "Austria", "PL": "Poland", "BE": "Belgium", "PT": "Portugal",
    "DK": "Denmark", "FI": "Finland", "NO": "Norway", "RU": "Russia",
    "MX": "Mexico", "AR": "Argentina", "CZ": "Czechia", "RO": "Romania",
    "HU": "Hungary", "TR": "Turkey", "ZA": "South Africa",
    "TH": "Thailand", "VN": "Vietnam", "PH": "Philippines",
    "ID": "Indonesia", "MY": "Malaysia", "CL": "Chile", "CO": "Colombia",
    "EE": "Estonia", "LT": "Lithuania", "LV": "Latvia", "UA": "Ukraine",
    "HK": "Hong Kong", "AE": "UAE", "GR": "Greece",
}


# ---------------- env loading ----------------

def load_env(path: str) -> dict:
    env = {}
    if not os.path.exists(path):
        return env
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            v = v.strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in ('"', "'"):
                v = v[1:-1]
            env[k.strip()] = v
    return env


env = load_env(ENV_FILE)

PH_KEY = env.get("POSTHOG_PERSONAL_API_KEY", "")
PH_PROJECT = env.get("POSTHOG_PROJECT_ID", "")
PH_INGEST = env.get("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com").rstrip("/")
# ingest host (eu.i.posthog.com) != API host (eu.posthog.com); strip `.i.`
PH_API_HOST = env.get("POSTHOG_API_HOST") or PH_INGEST.replace(".i.", ".")

SB_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SB_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY", "")

STRIPE_KEY = env.get("STRIPE_SECRET_KEY", "")
STRIPE_STARTER = env.get("STRIPE_STARTER_PRICE_ID", "")
STRIPE_CORE = env.get("STRIPE_MACHINE_PRICE_ID", "")  # see feedback_rename_sweeps_exclude_env_vars

RESEND_KEY = env.get("RESEND_API_KEY", "")
# The Resend account is shared with GitDealFlow (a separate project). Filter
# `/emails` responses to UnlockSaaS sends only so the dashboard does not credit
# other projects' deliveries against UnlockSaaS subscribers.
RESEND_FROM_DOMAIN = "unlocksaas.com"

GSC_SITE = env.get("GSC_SITE_URL", "")
GSC_EMAIL = env.get("GSC_SERVICE_ACCOUNT_EMAIL", "")
GSC_PK = env.get("GSC_SERVICE_ACCOUNT_PRIVATE_KEY", "")


# ---------------- HTTP ----------------

def http(url, method="GET", data=None, headers=None, timeout=30, raw=False):
    headers = dict(headers or {})
    headers.setdefault("User-Agent", "unlocksaas-dashboard/1.0")
    body = None
    if data is not None and not isinstance(data, (bytes, str)):
        body = json.dumps(data).encode()
        headers.setdefault("Content-Type", "application/json")
    elif isinstance(data, str):
        body = data.encode()
    elif isinstance(data, bytes):
        body = data
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = resp.read()
            if raw:
                return payload
            if not payload:
                return None
            return json.loads(payload.decode())
    except urllib.error.HTTPError as e:
        try:
            detail = e.read().decode()[:200]
        except Exception:
            detail = ""
        print(f"WARN HTTP {e.code} {url.split('?')[0]}: {detail}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"WARN {url.split('?')[0]}: {e}", file=sys.stderr)
        return None


# ---------------- PostHog ----------------

def exclude_clause(alias="properties") -> str:
    parts = [f"({alias}.$geoip_country_code IS NULL OR {alias}.$geoip_country_code != '{EXCLUDE_COUNTRY}')"]
    if EXCLUDE_DISTINCT_IDS:
        ids = ", ".join(f"'{i}'" for i in EXCLUDE_DISTINCT_IDS)
        parts.append(f"distinct_id NOT IN ({ids})")
    return " AND ".join(parts)


def ph_query(hogql: str):
    if not PH_KEY or not PH_PROJECT:
        return None
    body = {"query": {"kind": "HogQLQuery", "query": hogql}}
    return http(
        f"{PH_API_HOST}/api/projects/{PH_PROJECT}/query/",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {PH_KEY}"},
    )


def ph_rows(resp):
    if not resp or "results" not in resp:
        return []
    return resp["results"]


# ---------------- Supabase ----------------

def sb_select(table: str, params: dict | None = None, limit: int = 10000):
    if not SB_URL or not SB_KEY:
        return None
    params = dict(params or {})
    params.setdefault("select", "*")
    if "limit" not in params:
        params["limit"] = str(limit)
    qs = urllib.parse.urlencode(params, safe="*().,")
    return http(
        f"{SB_URL}/rest/v1/{table}?{qs}",
        headers={
            "apikey": SB_KEY,
            "Authorization": f"Bearer {SB_KEY}",
            "Accept": "application/json",
        },
    )


# ---------------- Stripe ----------------

def stripe_list(path: str, params: dict | None = None):
    if not STRIPE_KEY:
        return None
    params = dict(params or {})
    out, starting_after = [], None
    for _ in range(20):
        p = dict(params)
        p.setdefault("limit", "100")
        if starting_after:
            p["starting_after"] = starting_after
        qs = urllib.parse.urlencode(p, doseq=True)
        resp = http(
            f"https://api.stripe.com/v1/{path}?{qs}",
            headers={"Authorization": f"Bearer {STRIPE_KEY}"},
        )
        if not resp:
            break
        data = resp.get("data") or []
        out.extend(data)
        if not resp.get("has_more"):
            break
        starting_after = data[-1]["id"]
    return out


# ---------------- Resend ----------------

def resend_emails_log() -> list[dict]:
    if not RESEND_KEY:
        return []
    out, page_after = [], None
    for _ in range(20):
        url = "https://api.resend.com/emails?limit=100"
        if page_after:
            url += f"&after={page_after}"
        resp = http(url, headers={"Authorization": f"Bearer {RESEND_KEY}"})
        if not resp or "data" not in resp:
            break
        out.extend(resp.get("data") or [])
        if not resp.get("has_more"):
            break
        page_after = resp["data"][-1]["id"]
    return out


# ---------------- GSC (optional) ----------------

def gsc_pull():
    if not (GSC_SITE and GSC_EMAIL and GSC_PK):
        return None
    try:
        import jwt  # type: ignore
    except Exception:
        return {"error": "PyJWT not installed; pip install pyjwt cryptography"}
    now = int(time.time())
    claim = {
        "iss": GSC_EMAIL,
        "scope": "https://www.googleapis.com/auth/webmasters.readonly",
        "aud": "https://oauth2.googleapis.com/token",
        "exp": now + 3600,
        "iat": now,
    }
    try:
        assertion = jwt.encode(claim, GSC_PK.replace("\\n", "\n"), algorithm="RS256")
    except Exception as e:
        return {"error": f"jwt sign: {e}"}
    tok = http(
        "https://oauth2.googleapis.com/token",
        method="POST",
        data=urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        }),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if not tok or "access_token" not in tok:
        return {"error": "auth failed"}
    end = date.today()
    start = end - timedelta(days=30)
    site_enc = urllib.parse.quote(GSC_SITE, safe="")
    resp = http(
        f"https://www.googleapis.com/webmasters/v3/sites/{site_enc}/searchAnalytics/query",
        method="POST",
        data={"startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": []},
        headers={"Authorization": f"Bearer {tok['access_token']}"},
    )
    if not resp or "rows" not in resp:
        return {"error": "no data"}
    r = resp["rows"][0]
    return {
        "totals": {
            "clicks": r.get("clicks", 0),
            "impressions": r.get("impressions", 0),
            "ctr": r.get("ctr", 0) * 100,
            "position": r.get("position", 0),
        }
    }


# ---------------- categorisation ----------------

SOCIAL_HOSTS = {"reddit.com", "twitter.com", "x.com", "linkedin.com", "facebook.com", "threads.net", "mastodon.social"}
SEARCH_HOSTS = {"google.com", "bing.com", "duckduckgo.com", "yandex.ru", "yandex.com", "search.brave.com", "ecosia.org", "kagi.com"}
AI_HOSTS = {"perplexity.ai", "chat.openai.com", "chatgpt.com", "claude.ai", "you.com", "gemini.google.com", "copilot.microsoft.com"}
DEV_HOSTS = {"github.com", "news.ycombinator.com", "indiehackers.com", "dev.to", "hashnode.com", "lobste.rs"}
EMAIL_HOSTS = {"mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com"}


def channel_for(ref: str) -> str:
    if not ref or ref == "(direct)":
        return "Direct"
    host = ref.lower().split("/")[0].replace("www.", "")
    if any(host == h or host.endswith("." + h) for h in SEARCH_HOSTS):
        return "Search"
    if any(host == h or host.endswith("." + h) for h in AI_HOSTS):
        return "AI"
    if any(host == h or host.endswith("." + h) for h in SOCIAL_HOSTS):
        return "Social"
    if any(host == h or host.endswith("." + h) for h in DEV_HOSTS):
        return "Dev"
    if any(host == h or host.endswith("." + h) for h in EMAIL_HOSTS):
        return "Email"
    return "Other"


# ---------------- pull PostHog data ----------------

def posthog_metrics() -> dict:
    out = {
        "visitors_total": 0,
        "daily": [],
        "sources": [],
        "pages": [],
        "countries": [],
        "sources_daily": {"days": [], "channels": ["Direct", "Search", "AI", "Social", "Dev", "Email", "Other"], "channel_totals": {}},
        "utm_daily": [],
        "diagnostic_total": 0,
        "diagnostic_daily": {},
    }
    if not (PH_KEY and PH_PROJECT):
        print("posthog: credentials missing, skipping", file=sys.stderr)
        return out

    excl = exclude_clause("properties")

    # All-time visitors (distinct persons) from $pageview.
    # `uniq` (HyperLogLog) instead of `count(DISTINCT …)` so the unbounded scan
    # doesn't 504 — PostHog kills count(DISTINCT) past a few seconds.
    r = ph_query(f"""
        SELECT uniq(person_id) FROM events
        WHERE event = '$pageview' AND {excl}
    """)
    rows = ph_rows(r)
    if rows:
        out["visitors_total"] = int(rows[0][0] or 0)

    # Daily uniques for last RECENT_DAYS
    r = ph_query(f"""
        SELECT toDate(timestamp) AS d, count(DISTINCT person_id) AS uv
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= now() - interval {RECENT_DAYS} day
          AND {excl}
        GROUP BY d ORDER BY d
    """)
    daily = []
    for row in ph_rows(r):
        d = str(row[0])
        daily.append({"d": d, "visitors": int(row[1] or 0), "diagnostic": 0})
    out["daily"] = daily

    # Diagnostic submissions total + daily
    r = ph_query(f"""
        SELECT toDate(timestamp) AS d, count() AS n
        FROM events
        WHERE event = 'diagnostic_form_submitted'
          AND timestamp >= now() - interval {RECENT_DAYS} day
          AND {excl}
        GROUP BY d ORDER BY d
    """)
    diag_by_day = {str(row[0]): int(row[1] or 0) for row in ph_rows(r)}
    for d in daily:
        d["diagnostic"] = diag_by_day.get(d["d"], 0)
    out["diagnostic_daily"] = diag_by_day

    r = ph_query(f"""
        SELECT count() FROM events
        WHERE event = 'diagnostic_form_submitted' AND {excl}
    """)
    rows = ph_rows(r)
    if rows:
        out["diagnostic_total"] = int(rows[0][0] or 0)

    # Top referrers (all time)
    r = ph_query(f"""
        SELECT coalesce(nullIf(properties.$referring_domain, ''), '(direct)') AS src, count() AS n
        FROM events
        WHERE event = '$pageview' AND {excl}
        GROUP BY src ORDER BY n DESC LIMIT 25
    """)
    out["sources"] = [{"src": str(row[0]), "n": int(row[1] or 0)} for row in ph_rows(r)]

    # Top pages (all time)
    r = ph_query(f"""
        SELECT properties.$pathname AS p, count() AS n
        FROM events
        WHERE event = '$pageview' AND {excl} AND properties.$pathname IS NOT NULL
        GROUP BY p ORDER BY n DESC LIMIT 25
    """)
    out["pages"] = [{"p": str(row[0]), "n": int(row[1] or 0)} for row in ph_rows(r)]

    # Countries (all time)
    r = ph_query(f"""
        SELECT properties.$geoip_country_code AS cc, count() AS n
        FROM events
        WHERE event = '$pageview' AND {excl} AND properties.$geoip_country_code IS NOT NULL
        GROUP BY cc ORDER BY n DESC LIMIT 50
    """)
    out["countries"] = [
        {"code": str(row[0]), "name": COUNTRY_NAMES.get(str(row[0]), str(row[0])), "n": int(row[1] or 0)}
        for row in ph_rows(r)
    ]

    # Per-day referrer breakdown (last RECENT_DAYS)
    r = ph_query(f"""
        SELECT toDate(timestamp) AS d,
               coalesce(nullIf(properties.$referring_domain, ''), '(direct)') AS src,
               count(DISTINCT person_id) AS uv
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= now() - interval {RECENT_DAYS} day
          AND {excl}
        GROUP BY d, src ORDER BY d, uv DESC
    """)
    per_day_refs = defaultdict(list)
    channel_totals_all = Counter()
    for row in ph_rows(r):
        d, src, uv = str(row[0]), str(row[1]), int(row[2] or 0)
        per_day_refs[d].append({"src": src, "uv": uv, "channel": channel_for(src)})

    # All-time channel totals (separate query for accuracy beyond RECENT_DAYS)
    r = ph_query(f"""
        SELECT coalesce(nullIf(properties.$referring_domain, ''), '(direct)') AS src,
               count(DISTINCT person_id) AS uv
        FROM events
        WHERE event = '$pageview' AND {excl}
        GROUP BY src
    """)
    for row in ph_rows(r):
        src, uv = str(row[0]), int(row[1] or 0)
        channel_totals_all[channel_for(src)] += uv
    out["sources_daily"]["channel_totals"] = dict(channel_totals_all)

    # Per-day landing pages
    r = ph_query(f"""
        SELECT toDate(timestamp) AS d, properties.$pathname AS p, count(DISTINCT person_id) AS uv
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= now() - interval {RECENT_DAYS} day
          AND {excl}
          AND properties.$pathname IS NOT NULL
        GROUP BY d, p ORDER BY d, uv DESC
    """)
    per_day_pages = defaultdict(list)
    for row in ph_rows(r):
        d, p, uv = str(row[0]), str(row[1]), int(row[2] or 0)
        per_day_pages[d].append({"p": p, "uv": uv})

    days_list = []
    today_iso = date.today().isoformat()
    for d in [r["d"] for r in daily] or [today_iso]:
        refs = per_day_refs.get(d, [])
        by_ch = Counter()
        for r0 in refs:
            by_ch[r0["channel"]] += r0["uv"]
        total = sum(by_ch.values())
        days_list.append({
            "d": d,
            "total": total,
            "by_channel": dict(by_ch),
            "top_sources": refs[:5],
            "top_pages": per_day_pages.get(d, [])[:5],
        })
    out["sources_daily"]["days"] = days_list

    # UTM
    r = ph_query(f"""
        SELECT toDate(timestamp) AS d,
               properties.utm_source AS s, properties.utm_medium AS m, properties.utm_campaign AS c,
               count(DISTINCT person_id) AS uv
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= now() - interval {RECENT_DAYS} day
          AND {excl}
          AND properties.utm_source IS NOT NULL
        GROUP BY d, s, m, c ORDER BY d DESC, uv DESC LIMIT 100
    """)
    out["utm_daily"] = [
        {"d": str(row[0]), "utm_src": row[1], "utm_med": row[2], "utm_cmp": row[3], "uv": int(row[4] or 0)}
        for row in ph_rows(r)
    ]

    return out


# ---------------- Supabase data ----------------

def supabase_data() -> dict:
    out = {
        "subscribers": [],
        "diagnostic_count": 0,
        "profiles": [],
    }
    subs = sb_select("soap_opera_subscribers", {"select": "email,source,status,subscribed_at,last_sent_at"}) or []
    diag = sb_select("diagnostic_leads", {"select": "id", "limit": "5000"}) or []
    profiles = sb_select("profiles", {"select": "email,tier,subscription_status,stripe_subscription_id"}) or []
    out["subscribers"] = [s for s in subs if (s.get("email") or "").lower() not in EXCLUDED_EMAILS]
    out["diagnostic_count"] = len(diag)
    out["profiles"] = profiles
    return out


# ---------------- Stripe data ----------------

def stripe_data() -> dict:
    out = {
        "tiers": [
            {"name": "Starter ($1, 7-day trial)", "active": 0, "mrr": 0},
            {"name": "Core ($49/mo)", "active": 0, "mrr": 0},
        ],
        "statuses": [],
        "starter_price_id": STRIPE_STARTER,
        "core_price_id": STRIPE_CORE,
        "paid_count": 0,
    }
    subs = stripe_list("subscriptions", {"status": "all", "expand[]": "data.items"})
    if subs is None:
        return out

    starter_active = core_active = core_mrr = 0
    status_counter = Counter()
    paid_count = 0
    for s in subs:
        status = s.get("status", "unknown")
        status_counter[status] += 1
        items = (s.get("items") or {}).get("data") or []
        price_ids = {(it.get("price") or {}).get("id") for it in items}
        is_starter = STRIPE_STARTER and STRIPE_STARTER in price_ids
        is_core = STRIPE_CORE and STRIPE_CORE in price_ids
        if not (is_starter or is_core):
            continue
        if status in ("active", "trialing"):
            if is_core:
                core_active += 1
                for it in items:
                    price = it.get("price") or {}
                    if price.get("id") == STRIPE_CORE:
                        amount = (price.get("unit_amount") or 0) / 100.0
                        qty = it.get("quantity") or 1
                        core_mrr += amount * qty
            if is_starter:
                starter_active += 1
            paid_count += 1

    out["tiers"][0]["active"] = starter_active
    out["tiers"][1]["active"] = core_active
    out["tiers"][1]["mrr"] = int(round(core_mrr))
    out["statuses"] = [{"k": k, "n": v} for k, v in status_counter.most_common()]
    out["paid_count"] = paid_count
    return out


# ---------------- Resend engagement ----------------

def resend_engagement() -> dict:
    """
    Map email -> {sent, opened, clicked} for UnlockSaaS deliveries only.

    Two corrections relative to the previous implementation:

    1. Filter by sender domain. The Resend account is shared with GitDealFlow,
       so the raw `/emails` list mixes both projects. We only count rows where
       `from` is on `RESEND_FROM_DOMAIN`. Without this filter a recipient that
       happens to overlap (e.g. a contact that GitDealFlow also emails) gets
       credited with sends they never received from UnlockSaaS.

    2. Derive engagement from `last_event`. The Resend list endpoint does NOT
       expose `opened_at` / `clicked_at` keys; only `last_event` (the most
       recent state in the delivery state machine). The previous code read
       the missing keys, so open and click rates were stuck at 0.

    `last_event` semantics (Resend state machine):
      - delivered → reached the recipient mailbox (counts as sent).
      - opened    → recipient opened (implies delivered).
      - clicked   → recipient clicked a link (implies opened + delivered).
      - scheduled / sent (pre-delivery) / bounced / complained / failed
        → not counted as a delivery to the inbox.

    De-dupes by Resend `id` so a paginated overlap can't double-count a
    message.
    """
    out: dict[str, dict[str, int]] = {}
    seen_ids: set[str] = set()
    for m in resend_emails_log():
        mid = m.get("id")
        if not mid or mid in seen_ids:
            continue
        seen_ids.add(mid)

        from_raw = (m.get("from") or "").lower()
        if f"@{RESEND_FROM_DOMAIN}" not in from_raw:
            continue

        last = (m.get("last_event") or "").lower()
        if last not in {"delivered", "opened", "clicked"}:
            continue

        to_list = m.get("to") or []
        if isinstance(to_list, str):
            to_list = [to_list]
        for addr in to_list:
            e = (addr or "").strip().lower()
            if not e:
                continue
            rec = out.setdefault(e, {"sent": 0, "opened": 0, "clicked": 0})
            rec["sent"] += 1
            if last in {"opened", "clicked"}:
                rec["opened"] += 1
            if last == "clicked":
                rec["clicked"] += 1
    return out


# ---------------- forecast ----------------

FORECAST_CHANNELS = ["SEO", "Social", "AI_AEO", "Email", "Direct"]
FORECAST_MIX_W16 = {"SEO": 0.45, "Social": 0.25, "AI_AEO": 0.15, "Email": 0.10, "Direct": 0.05}


def forecast(baseline_weekly: int) -> dict:
    if baseline_weekly <= 0:
        return {
            "baseline_weekly": 0, "w4_mid": 0, "w12_mid": 0,
            "w16_low": 0, "w16_high": 0,
            "rows": [], "mix_w16": [], "channels": FORECAST_CHANNELS,
            "daily_mid": {},
            "assumptions": [
                "Baseline anchored on current PostHog 30-day rate (visitors / 30 × 7).",
                "Mid scenario: linear ramp from baseline to 1.5× baseline by week 16.",
                "Low band = 50% of mid (publishing cadence slips). High band = 170% of mid (one breakout post lands).",
                "Recalibrate when actuals diverge ≥30% from mid for 2 consecutive weeks.",
            ],
        }
    rows = []
    cum = 0
    today = date.today()
    daily_mid = {}
    for w in range(1, FORECAST_WEEKS + 1):
        mid = int(round(baseline_weekly * (1 + 0.5 * w / FORECAST_WEEKS)))
        low = int(round(mid * 0.5))
        high = int(round(mid * 1.7))
        cum += mid
        starts = (today + timedelta(days=(w - 1) * 7)).isoformat()
        by_ch = {ch: int(round(mid * share)) for ch, share in FORECAST_MIX_W16.items()}
        rows.append({"w": w, "starts": starts, "low": low, "mid": mid, "high": high, "cum": cum, "by_channel": by_ch})
        for i in range(7):
            ds = (today + timedelta(days=(w - 1) * 7 + i)).isoformat()
            daily_mid[ds] = int(round(mid / 7))

    w16_mid = rows[-1]["mid"] if rows else 0
    mix = [{"channel": ch.replace("_", " / "), "per_week": int(round(w16_mid * share)), "share": share * 100}
           for ch, share in FORECAST_MIX_W16.items()]
    return {
        "baseline_weekly": baseline_weekly,
        "w4_mid": rows[3]["mid"] if len(rows) >= 4 else 0,
        "w12_mid": rows[11]["mid"] if len(rows) >= 12 else 0,
        "w16_low": rows[-1]["low"] if rows else 0,
        "w16_high": rows[-1]["high"] if rows else 0,
        "rows": rows,
        "mix_w16": mix,
        "channels": FORECAST_CHANNELS,
        "daily_mid": daily_mid,
        "assumptions": [
            "Baseline anchored on current PostHog 30-day rate (visitors / 30 × 7).",
            "Mid scenario: linear ramp from baseline to 1.5× baseline by week 16.",
            "Low band = 50% of mid (publishing cadence slips). High band = 170% of mid (one breakout post lands).",
            "Recalibrate when actuals diverge ≥30% from mid for 2 consecutive weeks.",
        ],
    }


# ---------------- verdict + benchmark ----------------

def benchmark_block(visitors_total: int, subs_fresh: int, paid_subs: int) -> dict:
    active_idx = 0
    for i, row in enumerate(BENCHMARK_ROWS):
        if visitors_total >= row["traffic"]:
            active_idx = i

    optin_pct = (subs_fresh / visitors_total * 100) if visitors_total else None
    paid_rate_pct = (paid_subs / subs_fresh * 100) if subs_fresh else None
    expected_subs = int(round(visitors_total * BENCHMARK_OPT_IN / 100)) if visitors_total else 0
    expected_paid_lo = int(round(subs_fresh * BENCHMARK_PAID_LO / 100)) if subs_fresh else 0
    expected_paid_hi = int(round(subs_fresh * BENCHMARK_PAID_HI / 100)) if subs_fresh else 0
    expected_paid_range = f"{expected_paid_lo}–{expected_paid_hi}" if subs_fresh else "—"

    def status_for(actual, target):
        if actual is None:
            return "none"
        if actual >= target:
            return "above"
        if actual >= target * 0.7:
            return "on-track"
        return "below"

    optin_status = status_for(optin_pct, BENCHMARK_OPT_IN)
    paid_status = status_for(paid_rate_pct, BENCHMARK_PAID_LO)

    return {
        "rows": [
            {"traffic": r["traffic"], "subs": r["subs"], "paid": r["paid_lo"]} for r in BENCHMARK_ROWS
        ],
        "active_idx": active_idx,
        "stage": stage_label(visitors_total),
        "actual_opt_in_pct": optin_pct,
        "expected_subs": expected_subs,
        "actual_paid_rate_pct": paid_rate_pct,
        "expected_paid_range": expected_paid_range,
        "opt_in_status": optin_status,
        "opt_in_pill": pill_label(optin_status, "opt-in"),
        "paid_status": paid_status,
        "paid_pill": pill_label(paid_status, "paid"),
    }


def stage_label(visitors: int) -> str:
    if visitors >= 100000:
        return "Scaling (100k+/mo)"
    if visitors >= 10000:
        return "Growing (10k+/mo)"
    if visitors >= 1000:
        return "Validating (1k+/mo)"
    return "Pre-traffic (<1k/mo)"


def pill_label(status: str, kind: str) -> str:
    return {
        "above": f"Above {kind} target",
        "on-track": "On track",
        "below": f"Below {kind} target",
        "none": "No data",
    }[status]


def verdict_block(kpis: dict, bench: dict) -> dict:
    v = kpis["visitors"]
    if v == 0:
        return {
            "headline": "Awaiting first real visitors.",
            "detail": "PostHog is wired and the founder is excluded from analytics, so this card stays at zero until external traffic arrives. Ship a Reddit teardown-courtesy reply or a Twitter post to seed the first row.",
            "tone": "warn",
        }
    if kpis["paid_subs"] > 0:
        return {
            "headline": f"{kpis['paid_subs']} paid subscriber{'s' if kpis['paid_subs'] != 1 else ''} — funnel converting.",
            "detail": "Continue current channels and double-down on whichever referrer drove the conversion. Recalibrate the forecast once you have 7 days of attributable data.",
            "tone": "green",
        }
    if kpis["diagnostic_submissions"] > 0:
        return {
            "headline": f"{kpis['diagnostic_submissions']} diagnostic submission{'s' if kpis['diagnostic_submissions'] != 1 else ''} — top-of-funnel works.",
            "detail": "Traffic reaches the squeeze and a fraction submits. Next bottleneck is the squeeze→Starter handoff. Inspect the Stripe page conversion rate or the OTO drop-off.",
            "tone": "green",
        }
    return {
        "headline": f"{v} visitor{'s' if v != 1 else ''}, 0 diagnostic submissions.",
        "detail": "Traffic arriving but bouncing before the squeeze. Test the diagnostic-page hook copy or move the form above the fold.",
        "tone": "warn",
    }


# ---------------- funnel ----------------

def funnel_steps(ph: dict, sb: dict, paid_count: int) -> list[dict]:
    return [
        {"label": "Visitors (all time)", "value": ph.get("visitors_total", 0)},
        {"label": "Diagnostic submissions", "value": ph.get("diagnostic_total", 0)},
        {"label": "Email subscribers (active)", "value": sum(1 for s in sb["subscribers"] if s.get("status") == "active")},
        {"label": "Paid (Starter + Core)", "value": paid_count},
    ]


# ---------------- subscribers list ----------------

def subscribers_list(sb: dict, resend_eng: dict) -> list[dict]:
    out = []
    for s in sb["subscribers"]:
        email = (s.get("email") or "").lower()
        eng = resend_eng.get(email, {"sent": 0, "opened": 0, "clicked": 0})
        sent = eng["sent"]
        open_rate = (eng["opened"] / sent * 100) if sent else 0
        click_rate = (eng["clicked"] / sent * 100) if sent else 0
        sub_at = s.get("subscribed_at") or ""
        if sub_at:
            sub_at = sub_at.split(".")[0].replace("T", " ")
        out.append({
            "email": s.get("email"),
            "source": s.get("source") or "—",
            "subscribed_at": sub_at,
            "status": s.get("status"),
            "emails_sent": sent,
            "open_rate": open_rate,
            "click_rate": click_rate,
        })
    out.sort(key=lambda r: r.get("subscribed_at") or "", reverse=True)
    return out


# ---------------- render ----------------

def render(payload: dict) -> str:
    with open(TEMPLATE_FILE) as f:
        template = f.read()
    return template.replace("{{__DATA__}}", json.dumps(payload, default=str))


def log_line(visitors, diag, fresh, carry, paid):
    ts = datetime.now(timezone.utc).astimezone(tz=timezone(timedelta(hours=3))).strftime("[%d-%m-%Y %H:%M:%S]")
    try:
        size = os.path.getsize(OUT_FILE)
    except OSError:
        size = -1
    line = (
        f"{ts} wrote dashboard.html ({size} bytes) "
        f"visitors={visitors} diag={diag} fresh={fresh} carry={carry} paid={paid}\n"
    )
    with open(LOG_FILE, "a") as f:
        f.write(line)


# ---------------- main ----------------

def main():
    print("posthog: fetching…", file=sys.stderr)
    ph = posthog_metrics()
    print(f"  visitors_total={ph['visitors_total']} diag_total={ph['diagnostic_total']}", file=sys.stderr)

    print("supabase: fetching…", file=sys.stderr)
    sb = supabase_data()
    print(f"  subs={len(sb['subscribers'])} diag_leads={sb['diagnostic_count']}", file=sys.stderr)

    print("stripe: fetching…", file=sys.stderr)
    st = stripe_data()
    print(f"  paid={st['paid_count']} starter_active={st['tiers'][0]['active']} core_active={st['tiers'][1]['active']}", file=sys.stderr)

    print("resend: fetching engagement…", file=sys.stderr)
    resend_eng = resend_engagement()
    print(f"  emails_logged={sum(v['sent'] for v in resend_eng.values())}", file=sys.stderr)

    print("gsc: fetching…", file=sys.stderr)
    gsc = gsc_pull()

    # fresh vs carryover
    paused_carry = sum(
        1 for s in sb["subscribers"]
        if s.get("status") == "paused" and (s.get("source") or "").startswith("funnelfixer")
    )
    fresh = sum(
        1 for s in sb["subscribers"]
        if s.get("status") in ("active", "completed") and not (s.get("source") or "").startswith("funnelfixer")
    )

    # Fallback: if the all-time query failed (504/timeout, returns 0) but the
    # bounded daily query has visitors, use sum-of-daily as a lower bound so the
    # KPI doesn't silently flip to zero on a transient PostHog hiccup.
    visitors_total = ph.get("visitors_total", 0)
    daily_sum = sum(d.get("visitors", 0) for d in ph.get("daily", []))
    if visitors_total < daily_sum:
        print(
            f"  visitors_total fallback: all-time={visitors_total} < daily_sum={daily_sum}, using daily_sum",
            file=sys.stderr,
        )
        visitors_total = daily_sum

    kpis = {
        "visitors": visitors_total,
        "diagnostic_submissions": ph.get("diagnostic_total", 0),
        "subs_fresh": fresh,
        "carryover": paused_carry,
        "paid_subs": st["paid_count"],
    }
    bench = benchmark_block(kpis["visitors"], kpis["subs_fresh"], kpis["paid_subs"])

    baseline_weekly = int(round(sum(d["visitors"] for d in ph["daily"]) / max(RECENT_DAYS, 1) * 7))
    fc = forecast(baseline_weekly)

    payload = {
        "generated_display": datetime.now(timezone(timedelta(hours=3))).strftime("%d-%m-%Y %H:%M:%S Athens"),
        "kpis": kpis,
        "verdict": verdict_block(kpis, bench),
        "benchmark": bench,
        "funnel": funnel_steps(ph, sb, st["paid_count"]),
        "daily": ph["daily"],
        "ph_sources": ph["sources"],
        "ph_pages": ph["pages"],
        "ph_countries": ph["countries"],
        "sources_daily": ph["sources_daily"],
        "utm_daily": ph["utm_daily"],
        "stripe": st,
        "gsc": gsc.get("totals") if (gsc and not gsc.get("error")) else None,
        "recent": subscribers_list(sb, resend_eng),
        "channels": CHANNELS,
        "forecast": fc,
    }

    html = render(payload)
    with open(OUT_FILE, "w") as f:
        f.write(html)
    log_line(kpis["visitors"], kpis["diagnostic_submissions"], kpis["subs_fresh"], kpis["carryover"], kpis["paid_subs"])
    print(f"wrote {OUT_FILE}", file=sys.stderr)


if __name__ == "__main__":
    main()
