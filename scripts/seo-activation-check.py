#!/usr/bin/env python3
"""
SEO / GEO / AIO activation audit.

Read-only audit of every env-driven or verified-default signal slot the
UnlockSaaS schema graph reads. Prints a matrix of:

  - Tier 1 Knowledge Graph anchors (Wikidata, Wikipedia, SameAs.org)
  - Tier 2 social sameAs slots (X, IH, LinkedIn, GitHub, YT, CB, PH, G2, Capterra, ad-hoc)
  - Dataset catalog / DOI anchors (Hugging Face, Kaggle, Zenodo, OSF)
  - Webmaster verification slots (Google, Bing, Yandex, Pinterest, FB, Naver)
  - IndexNow key state
  - MEDIA_MENTIONS row count vs the 3-entry minimum credible bar

The script NEVER prints the value of any env var. It only reports whether
each slot is `set / default / unset / malformed`. This is the same
identity-safety discipline used by setup-indexnow-key.py and setup-mail-creds.py.

Two read modes:
  1. Local mode (default) – reads .env.local + .env.development.local from
     the repo root. Useful during dev.
  2. Vercel mode (--remote) – shells out to `vercel env ls --json` and reads
     production scope. Requires `vercel login` and a linked project.

Exit code:
  0  – every slot in scope is populated OR the operator has documented
       why a slot is intentionally empty.
  1  – Tier 1 KG slot missing (the single highest-leverage gap).
  2  – Three or more Tier 2 social slots missing.
  3  – Webmaster verification slot missing for an active console.

Brunson Hard-Rule reconciliation:
  - This script flags missing signals; it does NOT fabricate values.
  - The script's output is the activation roadmap, not the activation itself.
  - Every flagged gap maps to an operator action documented in
    strategy/sameas-activation-playbook.md.

Usage:
  python3 scripts/seo-activation-check.py            # local-only audit
  python3 scripts/seo-activation-check.py --remote   # +Vercel production
  python3 scripts/seo-activation-check.py --json     # machine-readable
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parent.parent

LOCAL_ENV_FILES = (
    REPO_ROOT / ".env.development.local",
    REPO_ROOT / ".env.local",
)

# ---- ANSI helpers ---------------------------------------------------------

USE_COLOR = sys.stdout.isatty()


def color(text: str, code: str) -> str:
    if not USE_COLOR:
        return text
    return f"\033[{code}m{text}\033[0m"


def green(s: str) -> str:
    return color(s, "32")


def yellow(s: str) -> str:
    return color(s, "33")


def red(s: str) -> str:
    return color(s, "31")


def dim(s: str) -> str:
    return color(s, "2")


def bold(s: str) -> str:
    return color(s, "1")


# ---- Slot catalog ---------------------------------------------------------
# Single source of truth: every env var the schema graph reads.
# Keep in sync with app/src/lib/seo/entity.ts (buildSameAs)
# and app/src/lib/seo/verification.ts (buildVerification).


@dataclass(frozen=True)
class Slot:
    name: str
    tier: str  # "kg" | "social" | "dataset" | "webmaster" | "indexnow"
    label: str
    operator_action: str
    activation_doc_anchor: str = ""
    value_kind: str = "url"  # "url" | "doi" | "token"
    default_value: str = ""


SLOTS: tuple[Slot, ...] = (
    # ------ Tier 1: Knowledge Graph anchors ------
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL",
        tier="kg",
        label="Wikidata Q-URL",
        operator_action=(
            "Create a Wikidata entry at https://www.wikidata.org/wiki/Special:NewItem "
            "after a Wikipedia article (or three independent earned-media mentions) "
            "exist – Wikidata requires notability."
        ),
        activation_doc_anchor="#wikidata",
        default_value="https://www.wikidata.org/wiki/Q139863921",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL",
        tier="kg",
        label="Wikipedia article URL",
        operator_action=(
            "Submit a draft via Wikipedia AfC (Articles for Creation). "
            "Requires three independent secondary sources – do not attempt "
            "before MEDIA_MENTIONS has at least 3 earned entries."
        ),
        activation_doc_anchor="#wikipedia",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_SAMEAS_ORG_URL",
        tier="kg",
        label="SameAs.org registry",
        operator_action=(
            "Register the entity at sameas.org. Lower notability bar than "
            "Wikidata; mirrors sameAs claims into a public JSON-LD graph. "
            "Bidirectional: the sameas.org entry must link unlocksaas.com."
        ),
        activation_doc_anchor="#sameas-org",
    ),
    # ------ Tier 2: social sameAs ------
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_X_URL",
        tier="social",
        label="X / Twitter",
        operator_action=(
            "Create @unlocksaas on x.com. Bio MUST contain unlocksaas.com "
            "for the bidirectional Knowledge Graph claim."
        ),
        activation_doc_anchor="#x-twitter",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL",
        tier="social",
        label="Indie Hackers",
        operator_action=(
            "Claim indiehackers.com/maryan profile. Bio MUST link unlocksaas.com."
        ),
        activation_doc_anchor="#indie-hackers",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL",
        tier="social",
        label="LinkedIn",
        operator_action=(
            "LinkedIn personal profile with /about-us link to unlocksaas.com "
            "in the experience block."
        ),
        activation_doc_anchor="#linkedin",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL",
        tier="social",
        label="GitHub",
        operator_action=(
            "GitHub profile, website field set to https://unlocksaas.com. "
            "Bio mentions unlocksaas.com."
        ),
        activation_doc_anchor="#github",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL",
        tier="social",
        label="YouTube channel",
        operator_action=(
            "YouTube channel description must link unlocksaas.com on its "
            "first line. Adds video-result eligibility on AI Overviews."
        ),
        activation_doc_anchor="#youtube",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL",
        tier="social",
        label="Crunchbase company",
        operator_action=(
            "Submit company at crunchbase.com/add-new. Website field = "
            "https://unlocksaas.com. Counts as a Knowledge-Graph-grade anchor "
            "(Crunchbase is a primary KG feed)."
        ),
        activation_doc_anchor="#crunchbase",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL",
        tier="social",
        label="Product Hunt",
        operator_action=(
            "Maker profile + product page on producthunt.com. Both link back to "
            "unlocksaas.com. Gates the future PH launch surface."
        ),
        activation_doc_anchor="#product-hunt",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_OPENCORPORATES_URL",
        tier="social",
        label="OpenCorporates legal entity",
        operator_action=(
            "Find or claim the entity at opencorporates.com once UnlockSaaS is "
            "incorporated in a jurisdiction OpenCorporates indexes (most US "
            "states, UK, EU member states ingest within weeks of filing). "
            "OpenCorporates is a primary Knowledge-Graph feed for company "
            "entities – the lift is closer to Crunchbase than to a social. "
            "Do NOT set this slot before the entity is actually registered "
            "and OpenCorporates has the row visible at a stable URL."
        ),
        activation_doc_anchor="#opencorporates",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_WELLFOUND_URL",
        tier="social",
        label="Wellfound (formerly AngelList)",
        operator_action=(
            "Create the startup profile at wellfound.com/recruit (AngelList "
            "Talent rebranded to Wellfound in Feb 2022; legacy angel.co URLs "
            "now 301 to wellfound.com). Company About section MUST link "
            "unlocksaas.com. Bidirectional bar = the Wellfound About page "
            "shows the unlocksaas.com link before the env var is set."
        ),
        activation_doc_anchor="#wellfound",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_G2_URL",
        tier="social",
        label="G2 software listing",
        operator_action=(
            "Claim or submit the listing at g2.com/products/new. Indexed by "
            "Google's Knowledge Graph as an authoritative SoftwareApplication "
            "node. Even an unreviewed listing earns the entity-resolution lift; "
            "the lift compounds as real reviews accumulate."
        ),
        activation_doc_anchor="#g2",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL",
        tier="social",
        label="Capterra software listing",
        operator_action=(
            "Submit at capterra.com/vendors/sign-up. Same role as G2 – a "
            "review-platform sameAs anchor for SoftwareApplication entities. "
            "Bidirectional: vendor profile links unlocksaas.com."
        ),
        activation_doc_anchor="#capterra",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL",
        tier="social",
        label="Ad-hoc profile",
        operator_action=(
            "Any single additional public profile that does not have a "
            "dedicated slot. Same bidirectional bio rule applies."
        ),
        activation_doc_anchor="#other",
    ),
    # ------ Dataset catalog / DOI anchors ------
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL",
        tier="dataset",
        label="Hugging Face dataset mirror",
        operator_action=(
            "Public default is already committed. Override only if the "
            "canonical Hugging Face repo moves; otherwise leave blank."
        ),
        activation_doc_anchor="#hugging-face-datasets",
        default_value=(
            "https://huggingface.co/datasets/unlocksaas/indie-saas-teardowns"
        ),
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_KAGGLE_DATASET_URL",
        tier="dataset",
        label="Kaggle dataset mirror",
        operator_action=(
            "Create the Kaggle dataset listing and link it back to "
            "https://unlocksaas.com/dataset before setting the URL."
        ),
        activation_doc_anchor="#kaggle-datasets",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI",
        tier="dataset",
        label="Zenodo DOI",
        operator_action=(
            "Public default is already committed. Override only if a new "
            "canonical Zenodo DOI supersedes the current record."
        ),
        activation_doc_anchor="#zenodo",
        value_kind="doi",
        default_value="10.5281/zenodo.20315742",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL",
        tier="dataset",
        label="Zenodo record URL",
        operator_action=(
            "Public default is already committed. Override only if a new "
            "canonical Zenodo record supersedes the current record."
        ),
        activation_doc_anchor="#zenodo",
        default_value="https://zenodo.org/records/20315742",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_OSF_DOI",
        tier="dataset",
        label="OSF DOI",
        operator_action=(
            "Deposit the same dataset on OSF, request a DOI, then set this "
            "bare DOI together with NEXT_PUBLIC_UNLOCKSAAS_OSF_DATASET_URL."
        ),
        activation_doc_anchor="#osf-io",
        value_kind="doi",
    ),
    Slot(
        name="NEXT_PUBLIC_UNLOCKSAAS_OSF_DATASET_URL",
        tier="dataset",
        label="OSF dataset URL",
        operator_action=(
            "Deposit the same dataset on OSF and link the record back to "
            "https://unlocksaas.com/dataset before setting the URL."
        ),
        activation_doc_anchor="#osf-io",
    ),
    # ------ Webmaster verification ------
    # Slot names MUST match what app/src/lib/seo/verification.ts actually
    # reads (NEXT_PUBLIC_* prefix mandatory + exact suffix). Earlier versions
    # of this audit used bare names + BING_WEBMASTER / PINTEREST_DOMAIN
    # spellings that drifted from the verification module — every slot
    # reported "missing" forever, even after the operator pushed the codes,
    # because the audit was reading non-existent env vars. Fixed 2026-05-19.
    Slot(
        name="NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
        tier="webmaster",
        label="Google Search Console",
        operator_action=(
            "Run: python3 scripts/setup-seo-verification.py --only google. "
            "Claim at search.google.com/search-console, meta-tag method. "
            "GSC unlocks AI Overviews eligibility metrics."
        ),
        activation_doc_anchor="#google-search-console",
        value_kind="token",
    ),
    Slot(
        name="NEXT_PUBLIC_BING_SITE_VERIFICATION",
        tier="webmaster",
        label="Bing Webmaster",
        operator_action=(
            "Run: python3 scripts/setup-seo-verification.py --only bing. "
            "Claim at bing.com/webmasters. Bing AI Copilot answers are powered by this index."
        ),
        activation_doc_anchor="#bing-webmaster",
        value_kind="token",
    ),
    Slot(
        name="NEXT_PUBLIC_YANDEX_VERIFICATION",
        tier="webmaster",
        label="Yandex Webmaster",
        operator_action=(
            "Run: python3 scripts/setup-seo-verification.py --only yandex. "
            "Powers Yandex.AI + IndexNow retrieval on the Yandex side."
        ),
        activation_doc_anchor="#yandex-webmaster",
        value_kind="token",
    ),
    Slot(
        name="NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION",
        tier="webmaster",
        label="Pinterest",
        operator_action=(
            "Run: python3 scripts/setup-seo-verification.py --only pinterest. "
            "Skippable for pre-revenue unless a Pinterest content strategy ships."
        ),
        activation_doc_anchor="#pinterest",
        value_kind="token",
    ),
    Slot(
        name="NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION",
        tier="webmaster",
        label="Facebook (Meta) Business",
        operator_action=(
            "Run: python3 scripts/setup-seo-verification.py --only facebook. "
            "Only required if Meta ads or Instagram Shopping launch."
        ),
        activation_doc_anchor="#facebook",
        value_kind="token",
    ),
    Slot(
        name="NEXT_PUBLIC_NAVER_SITE_VERIFICATION",
        tier="webmaster",
        label="Naver Webmaster",
        operator_action=(
            "Run: python3 scripts/setup-seo-verification.py --only naver. "
            "Korean-market specific – defer unless KR distribution is in scope."
        ),
        activation_doc_anchor="#naver",
        value_kind="token",
    ),
    # ------ IndexNow ------
    Slot(
        name="INDEXNOW_KEY",
        tier="indexnow",
        label="IndexNow key (Bing/Yandex/Naver push)",
        operator_action="Run: python3 scripts/setup-indexnow-key.py",
        activation_doc_anchor="#indexnow",
        value_kind="token",
    ),
)


# ---- Env readers ---------------------------------------------------------

ENV_LINE_RE = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$")


def parse_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = ENV_LINE_RE.match(line)
        if not m:
            continue
        key, val = m.group(1), m.group(2)
        if (val.startswith('"') and val.endswith('"')) or (
            val.startswith("'") and val.endswith("'")
        ):
            val = val[1:-1]
        out[key] = val
    return out


def read_local_env() -> dict[str, str]:
    merged: dict[str, str] = {}
    for f in reversed(LOCAL_ENV_FILES):
        merged.update(parse_env_file(f))
    for slot in SLOTS:
        if os.environ.get(slot.name):
            merged[slot.name] = os.environ[slot.name]
    return merged


def read_vercel_env() -> dict[str, str | None] | None:
    try:
        result = subprocess.run(
            ["vercel", "env", "ls", "--json"],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=REPO_ROOT,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError:
        return None
    entries = payload.get("envs") if isinstance(payload, dict) else None
    if not isinstance(entries, list):
        return None
    out: dict[str, str | None] = {}
    for e in entries:
        if not isinstance(e, dict):
            continue
        key = e.get("key")
        targets = e.get("target")
        if not key or not isinstance(targets, list):
            continue
        if "production" in targets:
            out[key] = None
    return out


# ---- Validation ----------------------------------------------------------


def validate_url(val: str) -> tuple[bool, str]:
    if not val.strip():
        return False, "empty"
    if not val.startswith("https://"):
        return False, "must start with https://"
    if " " in val or "\n" in val:
        return False, "contains whitespace"
    if val.count(".") < 1:
        return False, "no domain"
    return True, "ok"


DOI_RE = re.compile(r"^10\.\d{4,}(?:\.\d+)*\/\S+$")


def validate_doi(val: str) -> tuple[bool, str]:
    candidate = val.strip().removeprefix("doi:").strip()
    if not candidate:
        return False, "empty"
    if DOI_RE.match(candidate):
        return True, "ok"
    return False, "must look like 10.<registrant>/<suffix>"


# ---- Reporting -----------------------------------------------------------


@dataclass
class SlotState:
    slot: Slot
    local_set: bool
    local_valid: bool
    local_reason: str
    local_source: str
    remote_set: bool | None
    fail_severity: str = field(default="")


def evaluate(slot: Slot, local: dict[str, str], remote: dict | None) -> SlotState:
    env_raw = (local.get(slot.name) or "").strip()
    raw = env_raw or slot.default_value
    is_set = bool(raw)
    source = "env" if env_raw else ("default" if slot.default_value else "")
    valid, reason = (False, "unset")
    if is_set:
        if slot.value_kind == "url":
            valid, reason = validate_url(raw)
        elif slot.value_kind == "doi":
            valid, reason = validate_doi(raw)
        else:
            valid, reason = True, "ok"
        if valid and source == "default":
            reason = "verified default"
    remote_set: bool | None = None
    if remote is not None:
        remote_set = slot.name in remote
    return SlotState(
        slot=slot,
        local_set=is_set,
        local_valid=valid,
        local_reason=reason,
        local_source=source,
        remote_set=remote_set,
    )


def format_status(s: SlotState) -> str:
    if s.local_set and s.local_valid:
        if s.local_source == "default":
            return green("default")
        return green("set    ")
    if s.local_set and not s.local_valid:
        return red("malformed")
    return dim("unset  ")


def format_remote(s: SlotState) -> str:
    if s.remote_set is None:
        return dim("--     ")
    return green("set   ") if s.remote_set else dim("unset ")


def print_section(title: str, states: list[SlotState], remote_checked: bool) -> None:
    print()
    print(bold(title))
    header_remote = "remote" if remote_checked else ""
    print(f"  {'slot':46}  local      {header_remote}")
    print(f"  {'-' * 46}  ---------  ------")
    for st in states:
        print(
            f"  {st.slot.name:46}  {format_status(st)}  {format_remote(st)}"
            f"  {dim(st.slot.label)}"
        )


def print_action_table(missing: Iterable[SlotState]) -> None:
    missing = list(missing)
    if not missing:
        return
    print()
    print(bold("Next operator actions:"))
    for i, st in enumerate(missing, start=1):
        print(f"  {i}. {bold(st.slot.label)}  ({st.slot.name})")
        print(f"     {st.slot.operator_action}")
        if st.slot.activation_doc_anchor:
            if st.slot.tier == "dataset":
                doc = "strategy/dataset-submission-playbook.md"
            elif st.slot.tier in ("webmaster", "indexnow"):
                doc = "strategy/seo-activation-checklist.md"
            else:
                doc = "strategy/sameas-activation-playbook.md"
            print(
                dim(
                    f"     → {doc}{st.slot.activation_doc_anchor}"
                )
            )


# ---- MEDIA_MENTIONS check ------------------------------------------------

MEDIA_MENTIONS_RE = re.compile(
    r"export\s+const\s+MEDIA_MENTIONS\s*:\s*MediaMention\[\]\s*=\s*\[(.*?)\];",
    re.DOTALL,
)


def count_media_mentions() -> int:
    path = REPO_ROOT / "app" / "src" / "lib" / "media-mentions.ts"
    if not path.exists():
        return 0
    body = path.read_text(encoding="utf-8")
    m = MEDIA_MENTIONS_RE.search(body)
    if not m:
        return 0
    arr = m.group(1)
    arr_no_comments = re.sub(r"//[^\n]*", "", arr)
    arr_no_comments = re.sub(r"/\*.*?\*/", "", arr_no_comments, flags=re.DOTALL)
    depth = 0
    entries = 0
    in_entry = False
    for ch in arr_no_comments:
        if ch == "{":
            if depth == 0:
                in_entry = True
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and in_entry:
                entries += 1
                in_entry = False
    return entries


# ---- Main ----------------------------------------------------------------


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="UnlockSaaS SEO/GEO/AIO activation audit")
    parser.add_argument(
        "--remote",
        action="store_true",
        help="Also probe Vercel production via `vercel env ls --json`.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON instead of the table.",
    )
    args = parser.parse_args(argv)

    local = read_local_env()
    remote = read_vercel_env() if args.remote else None
    remote_checked = remote is not None

    states = [evaluate(s, local, remote) for s in SLOTS]
    media_count = count_media_mentions()
    media_min = 3

    if args.json:
        out = {
            "slots": [
                {
                    "name": s.slot.name,
                    "tier": s.slot.tier,
                    "label": s.slot.label,
                    "local_set": s.local_set,
                    "local_valid": s.local_valid,
                    "local_reason": s.local_reason,
                    "local_source": s.local_source,
                    "remote_set": s.remote_set,
                }
                for s in states
            ],
            "media_mentions": {
                "count": media_count,
                "minimum": media_min,
                "renders_public_bar": media_count >= media_min,
            },
            "remote_checked": remote_checked,
        }
        print(json.dumps(out, indent=2))
        return 0

    print(bold("UnlockSaaS SEO / GEO / AIO activation audit"))
    print(dim(f"  repo: {REPO_ROOT}"))
    print(dim(f"  local files probed: " + ", ".join(p.name for p in LOCAL_ENV_FILES)))
    if args.remote:
        if remote_checked:
            print(dim("  remote: vercel env ls production – read"))
        else:
            print(yellow("  remote: skipped (vercel CLI missing, unlinked, or unauthenticated)"))

    print_section("Tier 1 – Knowledge Graph anchors", [s for s in states if s.slot.tier == "kg"], remote_checked)
    print_section("Tier 2 – Social sameAs", [s for s in states if s.slot.tier == "social"], remote_checked)
    print_section("Dataset catalog / DOI anchors", [s for s in states if s.slot.tier == "dataset"], remote_checked)
    print_section("Webmaster verification consoles", [s for s in states if s.slot.tier == "webmaster"], remote_checked)
    print_section("IndexNow (Bing / Yandex / Naver push)", [s for s in states if s.slot.tier == "indexnow"], remote_checked)

    print()
    print(bold("Earned media (Organization.subjectOf Article anchors)"))
    bar = green("renders") if media_count >= media_min else dim("hidden ")
    fill = green(str(media_count)) if media_count >= media_min else yellow(str(media_count))
    print(f"  MEDIA_MENTIONS rows: {fill} / {media_min} required for the public media bar  [{bar}]")
    if media_count < media_min:
        print(
            dim(
                "  Add real earned mentions to app/src/lib/media-mentions.ts. "
                "Brunson Hard-Rule: no paid placements badged as earned, no "
                "homepage links, no roundup mentions that do not name UnlockSaaS."
            )
        )

    print()
    missing = [s for s in states if not s.local_valid]
    missing.sort(
        key=lambda s: {
            "kg": 0,
            "social": 1,
            "dataset": 2,
            "indexnow": 3,
            "webmaster": 4,
        }.get(s.slot.tier, 9)
    )
    print_action_table(missing)

    kg_missing = any(not s.local_valid for s in states if s.slot.tier == "kg")
    social_missing = sum(
        1 for s in states if s.slot.tier == "social" and not s.local_valid
    )
    webmaster_missing = any(
        not s.local_valid
        for s in states
        if s.slot.tier == "webmaster" and s.slot.name == "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"
    )

    if kg_missing:
        return 1
    if social_missing >= 3:
        return 2
    if webmaster_missing:
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
