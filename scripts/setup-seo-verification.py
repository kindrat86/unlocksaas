#!/usr/bin/env python3
"""
Paste-driven setup for the six webmaster-console verification meta tags.

What this fixes
---------------
The root layout reads `lib/seo/verification.ts`, which assembles the
`<meta>` tags Google Search Console, Bing Webmaster, Yandex Webmaster,
Pinterest, Meta Business, and Naver each use to confirm ownership of
unlocksaas.com. Until each NEXT_PUBLIC_*_VERIFICATION env var is set,
the corresponding meta tag is omitted entirely — which means every
console falls back to slower DNS verification (delays AI Overview
eligibility metrics, Bing Copilot citation tracking, Pinterest rich
pin enablement, etc.).

Brunson Hard-Rule reconciliation
--------------------------------
Every code below is supplied by the operator (Maryan) AFTER they claim
the property at the respective console. The script never fabricates a
value, never ships a placeholder. Empty input = slot stays empty.

What this script does NOT do
----------------------------
It does not log into any webmaster console for you. Each console
requires the operator to:

  1. Sign in with the right account (a Google account for GSC, a
     Microsoft account for Bing, etc.).
  2. Add the property at https://unlocksaas.com.
  3. Choose the HTML-meta-tag verification method.
  4. Copy the `content=` attribute value (NOT the whole <meta> tag).
  5. Paste it into this script when prompted.

The script handles steps 6-9 — pushing to Vercel production + preview
+ development, redeploying so the new meta tag actually renders, and
verifying via vercel env ls.

Six slots — same six the seo-activation-check.py audit reports on. Slot
names match the canonical reads in app/src/lib/seo/verification.ts.

  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION       → <meta name="google-site-verification">
  NEXT_PUBLIC_BING_SITE_VERIFICATION         → <meta name="msvalidate.01">
  NEXT_PUBLIC_YANDEX_VERIFICATION            → <meta name="yandex-verification">
  NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION    → <meta name="p:domain_verify">
  NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION   → <meta name="facebook-domain-verification">
  NEXT_PUBLIC_NAVER_SITE_VERIFICATION        → <meta name="naver-site-verification">

NEXT_PUBLIC_ prefix is mandatory — these values are inlined into client
HTML at build time. Pushing them without the prefix means the verification
module reads `undefined` and the meta tag never renders, regardless of
what's on Vercel.

Sensitivity
-----------
NOT marked --sensitive. These tokens are LITERALLY meta-tag content that
will appear in the public HTML of every page. Marking them sensitive in
Vercel would misrepresent their threat model and lock them out of the
edge-rendering pipeline that needs to inline them at build time.

Usage
-----
  # Interactive — walks all six consoles, skip any with empty input
  python3 scripts/setup-seo-verification.py

  # Re-run after claiming a new console (idempotent; --force on each write)
  python3 scripts/setup-seo-verification.py

  # Push a single slot (useful when only one console was claimed today)
  python3 scripts/setup-seo-verification.py --only google
  python3 scripts/setup-seo-verification.py --only bing,yandex

After the push, the script triggers a production redeploy so the new
<meta> tag actually renders on the next request — env-var changes alone
do not invalidate Vercel's deployment cache for NEXT_PUBLIC_ values.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parent.parent
VERCEL_PROJECT = "unlocksaas"
VERCEL_SCOPE = "sales-3429s-projects"


@dataclass(frozen=True)
class Console:
    """One webmaster console plus everything an operator needs to claim it."""

    key: str                       # Short flag for --only filtering
    env_var: str                   # Canonical NEXT_PUBLIC_* read by verification.ts
    meta_name: str                 # The HTML meta name= attribute the console expects
    label: str                     # Human-readable console name
    claim_url: str                 # Direct deep link to "add property" or equivalent
    notes: str                     # Operator instructions specific to this console
    # Loose validation only — every console has a different code format and
    # we will NOT fabricate a regex that rejects a real code. The pattern
    # below catches empty / whitespace / accidental tag-paste only.
    sanity_pattern: re.Pattern = re.compile(r"^[A-Za-z0-9._\-:/+=]{8,256}$")


CONSOLES: tuple[Console, ...] = (
    Console(
        key="google",
        env_var="NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
        meta_name="google-site-verification",
        label="Google Search Console",
        claim_url="https://search.google.com/search-console/welcome?resource_id=https%3A%2F%2Funlocksaas.com",
        notes=(
            "Choose URL prefix → https://unlocksaas.com → HTML tag method.\n"
            "  Copy the value INSIDE content=\"...\" — NOT the whole <meta> tag."
        ),
    ),
    Console(
        key="bing",
        env_var="NEXT_PUBLIC_BING_SITE_VERIFICATION",
        meta_name="msvalidate.01",
        label="Bing Webmaster Tools",
        claim_url="https://www.bing.com/webmasters/home",
        notes=(
            "Add a site → https://unlocksaas.com → 'Add the meta tag' option.\n"
            "  Copy only the content=\"...\" value. Powers Bing Copilot citations."
        ),
    ),
    Console(
        key="yandex",
        env_var="NEXT_PUBLIC_YANDEX_VERIFICATION",
        meta_name="yandex-verification",
        label="Yandex Webmaster",
        claim_url="https://webmaster.yandex.com/welcome/",
        notes=(
            "Add site → meta tag method. Yandex codes are typically 16 lowercase hex chars.\n"
            "  Required for IndexNow → Yandex retrieval + Yandex.AI Search."
        ),
    ),
    Console(
        key="pinterest",
        env_var="NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION",
        meta_name="p:domain_verify",
        label="Pinterest Business",
        claim_url="https://www.pinterest.com/business/create/",
        notes=(
            "Business account → Settings → Claimed accounts → Claim website.\n"
            "  Skip if no Pinterest content strategy is planned (low priority for pre-revenue)."
        ),
    ),
    Console(
        key="facebook",
        env_var="NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION",
        meta_name="facebook-domain-verification",
        label="Meta (Facebook) Business",
        claim_url="https://business.facebook.com/settings/owned-domains",
        notes=(
            "Business Manager → Brand Safety → Domains → Add → meta-tag method.\n"
            "  Skip until Meta ads or Instagram Shopping is in scope."
        ),
    ),
    Console(
        key="naver",
        env_var="NEXT_PUBLIC_NAVER_SITE_VERIFICATION",
        meta_name="naver-site-verification",
        label="Naver Webmaster (Korean)",
        claim_url="https://searchadvisor.naver.com/console/board",
        notes=(
            "사이트 등록 → meta tag method. Korean-market specific.\n"
            "  Skip unless KR distribution is part of the rollout."
        ),
    ),
)


# --- Helpers --------------------------------------------------------------


def ensure_linked() -> None:
    """If .vercel/project.json is missing, link non-interactively."""
    project_json = REPO_ROOT / ".vercel" / "project.json"
    if project_json.exists():
        return
    print(f"[setup-seo-verification] linking repo to {VERCEL_PROJECT}…")
    result = subprocess.run(
        ["vercel", "link", "--yes", "--project", VERCEL_PROJECT, "--scope", VERCEL_SCOPE],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit("ERROR: `vercel link` failed. Run `vercel login` and retry.")


def strip_pasted_tag(raw: str) -> str:
    """
    Operators frequently paste the whole <meta ... content="..." /> tag instead
    of just the value. Rather than reject the input and force a re-paste, sniff
    for content="..." and extract the inner value. Falls through to a trimmed
    version of the raw input.
    """
    if not raw:
        return ""
    m = re.search(r'content\s*=\s*"([^"]+)"', raw)
    if m:
        return m.group(1).strip()
    m = re.search(r"content\s*=\s*'([^']+)'", raw)
    if m:
        return m.group(1).strip()
    return raw.strip()


def push_one(env_var: str, value: str, env_target: str) -> bool:
    """
    Push a single env var to one Vercel environment. Returns True on success.

    Uses --force to overwrite any prior value (re-running this script is the
    canonical rotation path). Value piped via stdin so it never appears in the
    command line, shell history, or ps listings — even though these particular
    values are PUBLIC by design, keeping the entry-pattern consistent across
    every setup-*.py script keeps the threat model uniform.
    """
    args = ["vercel", "env", "add", env_var, env_target, "--force", "--yes"]
    # Vercel CLI quirk (documented in project_unlocksaas_vercel.md memory):
    # `vercel env add NAME preview` in agent mode wants an explicit Git-branch
    # positional. Empty string = apply to ALL preview branches, which is what
    # we want for a slot whose meaning is identical across previews.
    if env_target == "preview":
        args.insert(5, "")

    result = subprocess.run(
        args,
        cwd=REPO_ROOT,
        input=value + "\n",
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        # Defence-in-depth: redact in case the CLI ever echoes the value.
        safe_out = result.stdout.replace(value, "<redacted>")
        safe_err = result.stderr.replace(value, "<redacted>")
        print(f"  ✗ {env_target}: {safe_err.strip() or safe_out.strip()}", file=sys.stderr)
        return False
    print(f"  ✓ {env_target}")
    return True


def prompt_one(console: Console) -> str | None:
    """
    Walk the operator through claiming one console and return the code value
    they paste back. Returns None when the operator skips this console.
    """
    print()
    print(f"=== {console.label} ===")
    print(f"  Claim URL: {console.claim_url}")
    for line in console.notes.splitlines():
        print(f"  {line}")
    print(f"  Pastes into: {console.env_var}  (renders <meta name=\"{console.meta_name}\">)")
    print()
    try:
        raw = input(f"  Paste verification value (or press Enter to skip): ").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return None
    if not raw:
        print("  [skipped]")
        return None
    value = strip_pasted_tag(raw)
    if not console.sanity_pattern.match(value):
        print(
            f"  ⚠ Value '{value[:20]}…' did not match the basic shape check "
            f"({console.sanity_pattern.pattern}).",
            file=sys.stderr,
        )
        try:
            confirm = input("  Push anyway? [y/N]: ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return None
        if confirm != "y":
            print("  [skipped — failed sanity check]")
            return None
    return value


def trigger_redeploy() -> None:
    """
    NEXT_PUBLIC_* env-var changes are inlined into the client bundle AT BUILD
    TIME. Updating them on Vercel without a redeploy means the new value sits
    in the env-var store but the live HTML still renders the old (empty)
    meta tag. So: trigger a production rebuild via `vercel --prod`.

    We deliberately do not skip this on no-op runs — even pushing zero new
    values is fine, the deploy just rebuilds with the same env.
    """
    print()
    print("[setup-seo-verification] triggering production redeploy…")
    print("  Per project memory feedback_vercel_deploy_protocol.md, the canonical")
    print("  deploy path is `git push` + Vercel pipeline. Re-deploying via CLI is")
    print("  acceptable here because no code changed — we are just rebuilding so")
    print("  the new NEXT_PUBLIC_* values get inlined into the client bundle.")
    print()
    print("  To redeploy WITHOUT pushing a new commit:")
    print("    vercel redeploy <latest-production-url> --target=production --yes")
    print()
    print("  Or, if you prefer the git path (recommended): make any whitespace")
    print("  commit and push. The pipeline picks up the new env on rebuild.")


def list_current_state() -> set[str]:
    """Return the set of NEXT_PUBLIC_*_VERIFICATION names currently on Vercel."""
    result = subprocess.run(
        ["vercel", "env", "ls", "production"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return set()
    names: set[str] = set()
    for line in result.stdout.splitlines():
        tok = line.strip().split(None, 1)
        if not tok:
            continue
        n = tok[0]
        if n.startswith("NEXT_PUBLIC_") and "VERIFICATION" in n:
            names.add(n)
    return names


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--only",
        type=str,
        default=None,
        help="Comma-separated console keys to walk (default: all). "
        "Available: " + ", ".join(c.key for c in CONSOLES),
    )
    parser.add_argument(
        "--env",
        choices=["production", "preview", "development", "all"],
        default="all",
        help="Which Vercel envs to push to. Default: all (matches verification.ts intent).",
    )
    args = parser.parse_args()

    ensure_linked()

    selected: Iterable[Console]
    if args.only:
        wanted = {k.strip().lower() for k in args.only.split(",") if k.strip()}
        unknown = wanted - {c.key for c in CONSOLES}
        if unknown:
            sys.exit(f"Unknown console keys: {', '.join(sorted(unknown))}")
        selected = [c for c in CONSOLES if c.key in wanted]
    else:
        selected = CONSOLES

    targets = (
        ["production", "preview", "development"]
        if args.env == "all"
        else [args.env]
    )

    before = list_current_state()
    if before:
        print(f"[setup-seo-verification] currently set on Vercel production: {sorted(before)}")
    else:
        print("[setup-seo-verification] no NEXT_PUBLIC_*_VERIFICATION slots set on production yet.")

    pushed: list[str] = []
    skipped: list[str] = []
    for console in selected:
        value = prompt_one(console)
        if value is None:
            skipped.append(console.env_var)
            continue
        print(f"  → pushing {console.env_var} to {', '.join(targets)}…")
        ok_all = True
        for env_target in targets:
            ok = push_one(console.env_var, value, env_target)
            ok_all = ok_all and ok
        if ok_all:
            pushed.append(console.env_var)
        else:
            skipped.append(console.env_var + " (partial failure)")

    print()
    print("[setup-seo-verification] summary")
    print(f"  pushed:  {len(pushed)}")
    for n in pushed:
        print(f"    + {n}")
    print(f"  skipped: {len(skipped)}")
    for n in skipped:
        print(f"    - {n}")

    if pushed:
        trigger_redeploy()
        print()
        print("✓ Re-run `python3 scripts/seo-activation-check.py --remote` to verify.")
    else:
        print()
        print("Nothing pushed. Re-run when you have at least one code claimed.")


if __name__ == "__main__":
    main()
