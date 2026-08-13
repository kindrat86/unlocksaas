#!/usr/bin/env python3
"""
unlocksaas alternatives pSEO generator.

Drips pre-authored, quality-gated "alternatives to X" entries from the
machine's content queue (~/.growth-engine/pseo-machine/queues/unlocksaas-alternatives.json)
into src/lib/alternatives.ts (appended to ALTERNATIVES_LIST). Each entry renders
as /alternatives-to/{slug} at build time; sitemap.ts picks it up next deploy.

Hard rules (enforced by gate_lib + the alternatives.ts header):
  - No slagging: every entry respects the competitor's real value prop.
  - No fabricated prices: pricing is approximate and dated via lastVerified.
  - Honest verdict on every entry (name when Unlock SaaS is NOT right).

Usage:
  python3 _gen_alternatives.py [--limit N] [--dry-run]

Prints the slug of each entry it added (one per line). Idempotent: skips slugs
already present in alternatives.ts.
"""
import sys
import json
import re
from pathlib import Path

PSEO = Path.home() / ".growth-engine" / "pseo-machine"
sys.path.insert(0, str(PSEO))
from gate_lib import validate_entry  # noqa: E402

APP = Path(__file__).resolve().parent  # unlocksaas/app
ALTERNATIVES_FILE = APP / "src" / "lib" / "alternatives.ts"
QUEUE = PSEO / "queues" / "unlocksaas-alternatives.json"
CLOSE_MARKER = "\nconst ALTERNATIVES_BY_SLUG"


def ts(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def existing_slugs() -> set:
    slugs = set()
    pat = re.compile(r"slug:\s*['\"]([a-z0-9-]+)['\"]")
    if ALTERNATIVES_FILE.exists():
        slugs.update(pat.findall(ALTERNATIVES_FILE.read_text(encoding="utf-8")))
    return slugs


def fmt_entry(e: dict) -> str:
    caps = e["capabilities"]
    faqs = ",\n      ".join(
        "{\n        q: " + ts(f["q"]) + ",\n        a: " + ts(f["a"]) + ",\n      }"
        for f in e["faqs"]
    )
    what_is = ",\n      ".join(ts(x) for x in e["whatItIs"])
    what_not = ",\n      ".join(ts(x) for x in e["whatItIsNot"])
    tags = ", ".join(ts(x) for x in e["tags"])
    b = lambda k: "true" if caps[k] else "false"
    return (
        "  {\n"
        f"    slug: {ts(e['slug'])},\n"
        f"    displayName: {ts(e['displayName'])},\n"
        f"    creator: {ts(e['creator'])},\n"
        f"    category: {ts(e['category'])},\n"
        f"    oneLine: {ts(e['oneLine'])},\n"
        f"    pricingNote: {ts(e['pricingNote'])},\n"
        f"    whatItIs: [\n      {what_is},\n    ],\n"
        f"    whatItIsNot: [\n      {what_not},\n    ],\n"
        f"    whoForIt: {ts(e['whoForIt'])},\n"
        f"    whoNotForIt: {ts(e['whoNotForIt'])},\n"
        f"    honestVerdict: {ts(e['honestVerdict'])},\n"
        f"    faqs: [\n      {faqs},\n    ],\n"
        "    capabilities: {\n"
        f"      tellsYouWhatToDo: {b('tellsYouWhatToDo')},\n"
        f"      pushesBackOnVagueAnswers: {b('pushesBackOnVagueAnswers')},\n"
        f"      sendsOutreachInsideTool: {b('sendsOutreachInsideTool')},\n"
        f"      verifiesPayingCustomerViaStripe: {b('verifiesPayingCustomerViaStripe')},\n"
        f"      refundsInCode: {b('refundsInCode')},\n"
        f"      stopsYouFromSkipping: {b('stopsYouFromSkipping')},\n"
        f"      costsLessThan98ToFindOut: {b('costsLessThan98ToFindOut')},\n"
        "    },\n"
        f"    homepageUrl: {ts(e['homepageUrl'])},\n"
        f"    tags: [{tags}],\n"
        f"    lastVerified: {ts(e['lastVerified'])},\n"
        "  },"
    )


def main():
    args = sys.argv[1:]
    limit = None
    if "--limit" in args:
        limit = int(args[args.index("--limit") + 1])
    dry = "--dry-run" in args

    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    have = existing_slugs()

    new_entries = []
    for e in queue["entries"]:
        if e["slug"] in have:
            continue
        reasons = validate_entry(e, "alternatives")
        if reasons:
            print(f"[gate] REJECT {e['slug']}: {'; '.join(reasons)}", file=sys.stderr)
            continue
        new_entries.append(e)
        if limit and len(new_entries) >= limit:
            break

    if not new_entries:
        print("[gen] no unsent alternatives in queue (all slugs already shipped)", file=sys.stderr)
        return

    block = "\n".join(fmt_entry(e) for e in new_entries) + "\n"

    if dry:
        print(f"[dry-run] would append {len(new_entries)} entries to alternatives.ts")
        for e in new_entries:
            print(e["slug"])
        return

    content = ALTERNATIVES_FILE.read_text(encoding="utf-8")
    if CLOSE_MARKER not in content:
        print("[gen] could not find ALTERNATIVES_LIST close marker", file=sys.stderr)
        sys.exit(1)
    midx = content.index(CLOSE_MARKER)
    close_idx = content.rfind("];", 0, midx)
    if close_idx == -1:
        print("[gen] could not find ALTERNATIVES_LIST array close", file=sys.stderr)
        sys.exit(1)
    ALTERNATIVES_FILE.write_text(content[:close_idx] + block + content[close_idx:], encoding="utf-8")

    for e in new_entries:
        print(e["slug"])
    print(f"[gen] appended {len(new_entries)} alternative(s) -> alternatives.ts", file=sys.stderr)


if __name__ == "__main__":
    main()
