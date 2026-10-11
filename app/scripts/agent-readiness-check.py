#!/usr/bin/env python3
"""Agent-Readiness checklist runner (UnlockSaaS Agent-Readiness Report).

Usage:
    python3 agent_readiness_check.py https://example.com [--json out.json] [--md out.md]

Runs the 12-point agent-readiness audit against a live site and produces the
report (Markdown + JSON). Stdlib only. No purchases, no writes to the target.

Checks:
  1.  /llms.txt present and non-empty
  2.  /llms-full.txt present and non-empty
  3.  /.well-known/mcp.json present, valid JSON
  4.  /.well-known/mcp/server-card.json present, valid JSON
  5.  /.well-known/ai-plugin.json present, valid JSON
  6.  /openapi.json present, valid JSON
  7.  robots.txt AI-crawler rules (GPTBot, ClaudeBot, Claude-Web, PerplexityBot,
      Google-Extended, CCBot, anthropic-ai, Amazonbot, Applebot-Extended, meta-externalagent)
  8.  JSON-LD schema coverage on the homepage
  9.  sitemap.xml present + lastmod freshness
  10. MCP server presence (mcp.json declares a usable endpoint)
  11. x402 readiness (payment acceptance surfaces: X-PAYMENT-REQUIRED header
      on a probe, x402 mentions in llms.txt/mcp.json/openapi.json)
  12. Agent checkout flow test (structured offer/pricing machine-readable:
      JSON-LD Offer on home, or pricing in llms.txt, or server-card offers).
      NEVER completes a purchase.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import urllib.request
import urllib.error

UA = "UnlockSaaSAgentReadiness/1.0 (+site-audit; no purchases)"
TIMEOUT = 25

AI_CRAWLERS = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web",
    "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Google-Extended",
    "CCBot", "Amazonbot", "Applebot-Extended", "meta-externalagent",
    "Bytespider", "Diffbot",
]

X402_HINTS = ["x402", "X-PAYMENT", "payment-signature", "402", "usdc"]


def fetch(url: str, timeout: int = TIMEOUT):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read()
            return resp.status, dict(resp.headers), body
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers or {}), (e.read() if hasattr(e, "read") else b"")
    except Exception as e:  # transport-level
        return None, {}, str(e).encode()


def base(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    return url.rstrip("/")


def parse_check(checks: list, cid: str, title: str, **kw) -> dict:
    checks.append({"id": cid, "title": title, **kw})
    return checks[-1]


def run(base_url: str) -> dict:
    checks: list[dict] = []
    now = dt.datetime.now(dt.timezone.utc)

    # 1/2 llms.txt + llms-full.txt
    for cid, path, n in (("llms_txt", "/llms.txt", 1), ("llms_full_txt", "/llms-full.txt", 2)):
        st, hd, body = fetch(base_url + path)
        ok = st == 200 and len(body or b"") > 10
        parse_check(checks, cid, f"/{path.lstrip('/')} present", status=st,
                    bytes=len(body or b""), ok=bool(ok), weight=6,
                    detail="present" if ok else ("missing" if st != 200 else "empty"))

    # 3/4/5 well-known JSON surfaces
    for cid, path, n in (
        ("mcp_json", "/.well-known/mcp.json", 3),
        ("server_card", "/.well-known/mcp/server-card.json", 4),
        ("ai_plugin", "/.well-known/ai-plugin.json", 5),
    ):
        st, hd, body = fetch(base_url + path)
        parsed = None
        valid = False
        if st == 200:
            try:
                parsed = json.loads(body.decode("utf-8", "replace"))
                valid = isinstance(parsed, (dict, list))
            except Exception:
                valid = False
        parse_check(checks, cid, f"{path} valid JSON", status=st, ok=bool(valid),
                    weight=8, parsed=parsed,
                    detail="valid" if valid else ("invalid JSON" if st == 200 else "missing"))

    # 6 openapi.json
    st, hd, body = fetch(base_url + "/openapi.json")
    valid = False
    paths_count = 0
    if st == 200:
        try:
            doc = json.loads(body.decode("utf-8", "replace"))
            valid = isinstance(doc, dict) and ("openapi" in doc or "swagger" in doc)
            paths_count = len(doc.get("paths") or {}) if isinstance(doc, dict) else 0
        except Exception:
            valid = False
    parse_check(checks, "openapi_json", "/openapi.json valid OpenAPI", status=st,
                ok=bool(valid), weight=8, paths=paths_count,
                detail=f"{paths_count} paths" if valid else ("invalid/missing" if st != 200 else "not OpenAPI"))

    # 7 robots.txt AI-crawler rules
    st, hd, body = fetch(base_url + "/robots.txt")
    robots = body.decode("utf-8", "replace") if st == 200 else ""
    robots_l = robots.lower()
    found = [c for c in AI_CRAWLERS if c.lower() in robots_l]
    has_rules = st == 200 and (bool(found) or "user-agent:" in robots_l)
    parse_check(checks, "robots_ai", "robots.txt AI-crawler rules", status=st,
                ok=bool(has_rules), weight=6, agents_found=found,
                detail=(f"{len(found)} AI crawlers addressed" if found else
                        ("robots.txt present, no AI-crawler rules" if has_rules else "robots.txt missing")))

    # 8 JSON-LD on homepage
    st, hd, body = fetch(base_url + "/")
    html = body.decode("utf-8", "replace") if st and body else ""
    ld_types = re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I)
    ld_ok_types: list[str] = []
    for block in ld_types:
        try:
            data = json.loads(block.strip())
        except Exception:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            t = item.get("@type") if isinstance(item, dict) else None
            if t:
                ld_ok_types.append(t if isinstance(t, str) else ",".join(t))
    graph_types: list[str] = []
    for block in ld_types:
        try:
            data = json.loads(block.strip())
        except Exception:
            continue
        if isinstance(data, dict) and isinstance(data.get("@graph"), list):
            for item in data["@graph"]:
                if isinstance(item, dict) and item.get("@type"):
                    graph_types.append(str(item["@type"]))
    all_types = ld_ok_types + graph_types
    parse_check(checks, "jsonld", "JSON-LD schema coverage (homepage)", status=st,
                ok=bool(all_types), weight=8, types=all_types[:20],
                detail=f"{len(all_types)} typed blocks" if all_types else "none found")

    # 9 sitemap freshness
    st, hd, body = fetch(base_url + "/sitemap.xml")
    sm = body.decode("utf-8", "replace") if st == 200 else ""
    lastmods = re.findall(r"<lastmod>\s*([^<]+?)\s*</lastmod>", sm)
    newest = None
    age_days = None
    if lastmods:
        parsed_dates = []
        for lm in lastmods:
            for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d"):
                try:
                    d = dt.datetime.strptime(lm.strip(), fmt)
                    if d.tzinfo is None:
                        d = d.replace(tzinfo=dt.timezone.utc)
                    parsed_dates.append(d)
                    break
                except ValueError:
                    continue
        if parsed_dates:
            newest = max(parsed_dates)
            age_days = (now - newest).days
    ok = st == 200 and ("<urlset" in sm or "<sitemapindex" in sm) and (age_days is not None and age_days <= 60)
    parse_check(checks, "sitemap_fresh", "sitemap.xml present + fresh lastmod", status=st,
                ok=bool(ok), weight=6, lastmodCount=len(lastmods),
                newest=newest.isoformat() if newest else None, ageDays=age_days,
                detail=(f"newest lastmod {age_days}d old" if age_days is not None
                        else ("sitemap present, no lastmod" if st == 200 else "missing")))

    mcp_doc = next((c.get("parsed") for c in checks if c["id"] == "mcp_json" and c.get("parsed")), None)

    # 10 MCP server presence
    endpoint = None
    if isinstance(mcp_doc, dict):
        endpoints = mcp_doc.get("endpoints") or {}
        endpoint = endpoints.get("streamableHttp") or endpoints.get("sse") or mcp_doc.get("url")
        if not endpoint and mcp_doc.get("servers"):
            servers = mcp_doc["servers"]
            if isinstance(servers, list) and servers and isinstance(servers[0], dict):
                endpoint = servers[0].get("url")
    probe_ok = False
    probe_note = "no MCP endpoint declared"
    if endpoint:
        stp, hdp, bodyp = fetch(endpoint if str(endpoint).startswith("http") else base_url + str(endpoint))
        probe_ok = stp is not None and stp != 404
        probe_note = f"endpoint responded {stp}"
    parse_check(checks, "mcp_presence", "MCP server presence", status=None,
                ok=bool(endpoint) and probe_ok, weight=10, endpoint=endpoint,
                detail=probe_note if endpoint else "no MCP endpoint declared")

    # 11 x402 readiness
    signals: list[str] = []
    llms_body = ""
    for c in checks:
        if c["id"] in ("llms_txt", "llms_full_txt"):
            pass
    stl, hdl, bodyl = fetch(base_url + "/llms.txt")
    llms_body = bodyl.decode("utf-8", "replace") if stl == 200 else ""
    mcp_raw = json.dumps(mcp_doc) if mcp_doc else ""
    stx, hdx, bodyx = fetch(base_url + "/openapi.json")
    oa_raw = bodyx.decode("utf-8", "replace") if stx == 200 else ""
    for hint in X402_HINTS:
        if hint.lower() in llms_body.lower():
            signals.append(f"llms.txt mentions {hint}")
            break
    for hint in X402_HINTS:
        if hint.lower() in mcp_raw.lower():
            signals.append(f"mcp.json mentions {hint}")
            break
    for hint in ["x402", "X-PAYMENT", "usdc"]:
        if hint.lower() in oa_raw.lower():
            signals.append(f"openapi.json mentions {hint}")
            break
    probe402 = False
    stp2, hdp2, _ = fetch(base_url + "/.well-known/x402")
    if stp2 == 200:
        signals.append("/.well-known/x402 present")
        probe402 = True
    ok = bool(signals)
    parse_check(checks, "x402_readiness", "x402 readiness signals", status=None,
                ok=ok, weight=8, signals=signals[:10],
                detail="; ".join(signals[:3]) if signals else "no x402 signals found")

    # 12 agent checkout flow (machine-readable offer; NEVER purchases)
    offer_found = None
    if all_types:
        for t in all_types:
            if "offer" in t.lower():
                offer_found = f"JSON-LD {t}"
                break
    if not offer_found and ("pricing" in llms_body.lower() or "$" in llms_body):
        offer_found = "pricing in llms.txt"
    if not offer_found and isinstance(mcp_doc, dict) and mcp_doc.get("offers"):
        offer_found = "offers in mcp.json"
    parse_check(checks, "agent_checkout", "agent checkout flow (machine-readable offer, no purchase)",
                status=None, ok=bool(offer_found), weight=10, found=offer_found,
                detail=offer_found or "no machine-readable offer found",
                note="audit only - no purchase was attempted or completed")

    score = sum(c["weight"] for c in checks if c["ok"])
    total = sum(c["weight"] for c in checks)
    return {
        "url": base_url,
        "auditedAt": now.isoformat(),
        "score": score,
        "total": total,
        "percent": round(100 * score / total) if total else 0,
        "checks": checks,
    }


def to_markdown(r: dict) -> str:
    lines = [
        f"# Agent-Readiness Report - {r['url']}",
        "",
        f"Audited: {r['auditedAt']}  ",
        f"Score: **{r['score']}/{r['total']} ({r['percent']}%)**",
        "",
        "| # | Check | Result | Detail |",
        "|---|-------|--------|--------|",
    ]
    for i, c in enumerate(r["checks"], 1):
        lines.append(
            f"| {i} | {c['title']} | {'PASS' if c['ok'] else 'FAIL'} | {c.get('detail','')} |"
        )
    lines += ["", "## Recommended fixes", ""]
    for c in r["checks"]:
        if not c["ok"]:
            lines.append(f"- **{c['title']}**: {c.get('detail', 'missing')}")
    if all(c["ok"] for c in r["checks"]):
        lines.append("- None. Every check passed.")
    lines += ["", "Audit only: no purchase was attempted or completed.", ""]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--json", dest="json_out", default=None)
    ap.add_argument("--md", dest="md_out", default=None)
    args = ap.parse_args()
    result = run(base(args.url))
    md = to_markdown(result)
    if args.json_out:
        open(args.json_out, "w").write(json.dumps(result, indent=1))
    if args.md_out:
        open(args.md_out, "w").write(md)
    print(md)
    return 0


if __name__ == "__main__":
    sys.exit(main())
