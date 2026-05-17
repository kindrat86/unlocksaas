#!/usr/bin/env python3
"""
One-shot setup for the four Webmaster verification tokens read by the
`verification` block in app/src/app/layout.tsx.

  GOOGLE_SITE_VERIFICATION   — Google Search Console → "HTML tag" method
  BING_SITE_VERIFICATION     — Bing Webmaster Tools → "Meta tag" method
  YANDEX_VERIFICATION        — Yandex Webmaster → "Meta tag" method
  PINTEREST_VERIFICATION     — Pinterest business → claim website → meta

The layout.tsx helper emits each <meta> tag ONLY when its env var is set,
so partial completion is safe — you can verify Google today and Bing next
week without breaking the page.

Why this script exists: the tokens are public (they appear in HTML head),
but the operator typically copies them from the console UI without a CLI
flow, and the locked secret-entry convention requires every env push to
go through a dedicated scripts/setup-*.py so the value never lands in
shell history.

Operator flow:

  1. Open Google Search Console → property settings → Verification
     → HTML tag → copy the content="..." value.
  2. Repeat for Bing / Yandex / Pinterest as desired.
  3. Run this script. It prompts for each, skipping the ones you leave
     blank, and pushes each as a non-sensitive env to production.
  4. Redeploy (or wait for the next deploy). The tags appear in <head>.
  5. Click "Verify" in each console.

Usage:
  python3 scripts/setup-webmaster-verification.py                 # production
  python3 scripts/setup-webmaster-verification.py --env all       # all envs
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VERCEL_PROJECT = "unlocksaas"
VERCEL_SCOPE = "sales-3429s-projects"

# (env-var name, human-readable label, console name)
TOKENS = [
    ("GOOGLE_SITE_VERIFICATION", "Google Search Console", "Google Search Console"),
    ("BING_SITE_VERIFICATION",   "Bing Webmaster Tools (msvalidate.01)", "Bing Webmaster Tools"),
    ("YANDEX_VERIFICATION",      "Yandex Webmaster",   "Yandex Webmaster"),
    ("PINTEREST_VERIFICATION",   "Pinterest (p:domain_verify)", "Pinterest business"),
]


def ensure_linked() -> None:
    project_json = REPO_ROOT / ".vercel" / "project.json"
    if project_json.exists():
        return
    print(f"[setup-webmaster-verification] linking worktree to {VERCEL_PROJECT}…")
    result = subprocess.run(
        ["vercel", "link", "--yes",
         "--project", VERCEL_PROJECT, "--scope", VERCEL_SCOPE],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit("ERROR: `vercel link` failed. Run `vercel login` and retry.")


def push_to_vercel(env_target: str, name: str, value: str) -> None:
    args = ["vercel", "env", "add", name, env_target, "--force", "--yes"]
    if env_target == "preview":
        args.insert(5, "")
    # All four tokens are PUBLIC by design (they appear in HTML head) —
    # do NOT pass --sensitive. Sensitive vars can't be retrieved via
    # `vercel env pull`, which makes confirming a deployment value harder
    # than it needs to be for a public meta-tag value.
    print(f"  pushing {name} to {env_target}…")
    result = subprocess.run(
        args, cwd=REPO_ROOT, input=value + "\n",
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        safe_err = result.stderr.replace(value, "<redacted>")
        safe_out = result.stdout.replace(value, "<redacted>")
        print(safe_out, file=sys.stderr)
        print(safe_err, file=sys.stderr)
        sys.exit(f"ERROR: vercel env add failed for {name} env={env_target}.")
    print(f"    ✓ Vercel {env_target} updated.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--env",
        choices=["production", "preview", "development", "all"],
        default="production",
    )
    args = parser.parse_args()

    ensure_linked()

    targets = (
        ["production", "preview", "development"]
        if args.env == "all"
        else [args.env]
    )

    pushed = 0
    skipped = 0
    for name, label, _console in TOKENS:
        print()
        print(f"  {label}")
        print(f"  env var: {name}")
        raw = input("  value (blank to skip): ").strip()
        if not raw:
            print("    skipped.")
            skipped += 1
            continue
        # Strip a copy-pasted full meta tag — operators sometimes paste
        # <meta name="..." content="ABC..."> instead of just "ABC...".
        if 'content="' in raw and raw.endswith('">'):
            start = raw.find('content="') + len('content="')
            end = raw.rfind('"', start)
            value = raw[start:end]
            print(f"    (extracted content value from pasted meta tag)")
        else:
            value = raw
        for env in targets:
            push_to_vercel(env, name, value)
        pushed += 1

    print()
    print(f"✓ Done. {pushed} token(s) pushed, {skipped} skipped.")
    if pushed:
        print()
        print("Next deploy will emit the meta tag(s) in <head>. After it's live:")
        print("  - Google: Search Console → Verify")
        print("  - Bing: Webmaster Tools → Verify")
        print("  - Yandex: Webmaster → Verify")
        print("  - Pinterest: business profile → Claim → Verify")


if __name__ == "__main__":
    main()
