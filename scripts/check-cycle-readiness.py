#!/usr/bin/env python3
"""
Verified Builder cycle readiness check.

Read-only audit of every env var the First Verified Builder cycle
depends on. The cycle activates when:

  1. A founder signs up to the Playbook (Supabase profile row).
  2. They connect their own Stripe in Playbook Step 7
     (stripe_connections row with stripe_account_id + project_id).
  3. A real paying customer charges that connected Stripe account.
  4. `charge.succeeded` Connect event fires to /api/webhooks/stripe.
  5. handleConnectChargeSucceeded inserts verified_conversions,
     trigger updates profiles.first_customer_at, celebration email
     fires, slug allocator runs.
  6. Founder flips share_visibility='public' on their dashboard.
  7. /builder/<slug> goes live, badge.svg / embed.html / oembed.json
     activate, Review JSON-LD chain begins.

For step 4 - step 5 to fire correctly, this env matrix must be set
on Vercel (production scope):

  STRIPE_SECRET_KEY           – platform-mode Stripe SDK
  STRIPE_WEBHOOK_SECRET       – signature verification at the route
  NEXT_PUBLIC_SUPABASE_URL    – admin client connection
  SUPABASE_SERVICE_ROLE_KEY   – admin writes (verified_conversions, profiles)
  RESEND_API_KEY              – celebration email transport
  NEXT_PUBLIC_APP_URL         – absolute badge URL resolution

Optional (cycle still works without it, but indexing latency drops):

  INDEXNOW_KEY                – submits the new /builder/<slug> URL to
                                Bing + Yandex within minutes, vs days
                                on natural Bingbot discovery cadence.

Brunson Hard-Rule reconciliation:
  - This script reports state; it never prints env values.
  - This script never writes anywhere. Pre-flight only.
  - This script never claims a builder is verified. That gate is a
    real-world Stripe-Connect charge, and only the webhook handler
    can promote a profile.

Exit codes:
  0  – cycle is ready. All required slots populated. Optional slots
       reported but not blocking.
  1  – one or more REQUIRED env slots missing. Webhook will reject
       events or DB writes will fail.

Usage:
  python3 scripts/check-cycle-readiness.py            # local .env audit
  python3 scripts/check-cycle-readiness.py --remote   # +Vercel production
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


REPO_ROOT = Path(__file__).resolve().parent.parent

# --- env slots ---------------------------------------------------------------

# Slots whose absence will break the cycle outright. Each one is
# specifically referenced by app/src/app/api/webhooks/stripe/route.ts or
# the handlers it calls.
REQUIRED_SLOTS: tuple[str, ...] = (
    # Stripe SDK construction (lib/stripe.ts).
    "STRIPE_SECRET_KEY",
    # Stripe.webhooks.constructEvent throws without this; the route
    # returns 400 and the cycle never fires.
    "STRIPE_WEBHOOK_SECRET",
    # createAdminClient (lib/supabase/server.ts) reads both. Without
    # either, the verified_conversions insert and the profiles update
    # both throw.
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    # absoluteBadgeUrl (lib/builder-badge.ts) prefers NEXT_PUBLIC_APP_URL
    # and falls back to VERCEL_URL. Both unset = http://localhost:3000
    # in the celebration email, which is broken in production.
    "NEXT_PUBLIC_APP_URL",
    # sendFirstCustomerCelebrationEmail (lib/celebration-email.ts) needs
    # Resend. Without the key, the email throws (non-fatal per the
    # webhook catch, but the founder sees no signal that the badge
    # fired).
    "RESEND_API_KEY",
)

# Slots that lift the cycle but don't block it. Reported but never
# fail the script.
OPTIONAL_SLOTS: tuple[str, ...] = (
    # IndexNow: faster Bing + Yandex + Naver indexing of the new
    # /builder/<slug> URL. Without it, the badge page sits in the
    # default crawl queue for days before Copilot citations can
    # reference it.
    "INDEXNOW_KEY",
)


@dataclass(frozen=True)
class SlotState:
    name: str
    set_in: tuple[str, ...] = field(default_factory=tuple)

    @property
    def is_set(self) -> bool:
        return bool(self.set_in)


# --- env readers -------------------------------------------------------------


def _parse_dotenv(path: Path) -> dict[str, str]:
    """Minimal .env parser. Does NOT capture values – returns the key set
    only, mapped to the literal string 'present'. Identity-safety: this
    script must never know the value of a secret."""
    if not path.exists():
        return {}
    out: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, _ = line.partition("=")
        key = key.strip()
        # Skip lines that look like 'export FOO=...'.
        if key.startswith("export "):
            key = key[len("export ") :].strip()
        if not key:
            continue
        # Strip a trailing comment from key (rare).
        out[key] = "present"
    return out


def read_local_env() -> dict[str, set[str]]:
    """Read every key present in the repo's .env files. Returns
    {KEY: {source-file-name, ...}} so the operator can see which file
    declares each slot."""
    sources = {
        ".env.local": REPO_ROOT / "app" / ".env.local",
        ".env.development.local": REPO_ROOT / "app" / ".env.development.local",
        ".env": REPO_ROOT / "app" / ".env",
    }
    keys: dict[str, set[str]] = {}
    for label, path in sources.items():
        parsed = _parse_dotenv(path)
        for key in parsed:
            keys.setdefault(key, set()).add(label)
    # Also check os.environ – useful when the operator exports vars
    # manually before running.
    for env_key in os.environ:
        keys.setdefault(env_key, set()).add("os.environ")
    return keys


def read_vercel_env() -> dict[str, set[str]]:
    """Shell out to `vercel env ls --environment=production` and parse
    the JSON. Requires `vercel login` and a linked project. Returns
    {KEY: {'vercel:production'}}. Never reads values."""
    try:
        result = subprocess.run(
            [
                "vercel",
                "env",
                "ls",
                "production",
                "--json",
            ],
            cwd=REPO_ROOT / "app",
            capture_output=True,
            text=True,
            timeout=30,
        )
    except FileNotFoundError:
        print(
            "warning: `vercel` CLI not on PATH; skipping --remote check",
            file=sys.stderr,
        )
        return {}
    except subprocess.TimeoutExpired:
        print("warning: `vercel env ls` timed out; skipping", file=sys.stderr)
        return {}
    if result.returncode != 0:
        print(
            "warning: `vercel env ls production` failed:\n"
            + result.stderr.strip(),
            file=sys.stderr,
        )
        return {}
    keys: dict[str, set[str]] = {}
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError:
        print(
            "warning: `vercel env ls --json` returned unparseable output",
            file=sys.stderr,
        )
        return {}
    # The CLI returns either a list of {key: ...} objects or a wrapped
    # {envs: [...]} shape depending on version. Handle both.
    envs: Iterable[dict[str, object]]
    if isinstance(payload, list):
        envs = payload
    elif isinstance(payload, dict) and isinstance(payload.get("envs"), list):
        envs = payload["envs"]  # type: ignore[assignment]
    else:
        envs = []
    for entry in envs:
        key = entry.get("key")
        if isinstance(key, str) and key:
            keys.setdefault(key, set()).add("vercel:production")
    return keys


# --- report ------------------------------------------------------------------


def evaluate(env_keys: dict[str, set[str]]) -> tuple[list[SlotState], list[SlotState]]:
    required = [
        SlotState(name=k, set_in=tuple(sorted(env_keys.get(k, set()))))
        for k in REQUIRED_SLOTS
    ]
    optional = [
        SlotState(name=k, set_in=tuple(sorted(env_keys.get(k, set()))))
        for k in OPTIONAL_SLOTS
    ]
    return required, optional


def render_human(
    required: list[SlotState],
    optional: list[SlotState],
    remote_consulted: bool,
) -> str:
    lines: list[str] = []
    lines.append("Verified Builder cycle readiness")
    lines.append("=" * 36)
    lines.append("")
    lines.append("Sources consulted: .env.local, .env.development.local, .env, os.environ"
                 + (", vercel:production" if remote_consulted else ""))
    lines.append("")
    lines.append("Required (cycle blocks without these):")
    blocked = 0
    for slot in required:
        if slot.is_set:
            sources = ", ".join(slot.set_in)
            lines.append(f"  [ok]   {slot.name:<28} – set in {sources}")
        else:
            blocked += 1
            lines.append(f"  [MISS] {slot.name:<28} – not set anywhere")
    lines.append("")
    lines.append("Optional (cycle works without, but lift compounds):")
    for slot in optional:
        if slot.is_set:
            sources = ", ".join(slot.set_in)
            lines.append(f"  [ok]   {slot.name:<28} – set in {sources}")
        else:
            lines.append(f"  [skip] {slot.name:<28} – not set (cycle still works)")
    lines.append("")
    if blocked == 0:
        lines.append("Result: READY. The cycle will fire when a real Stripe-Connect")
        lines.append("        charge.succeeded event arrives. Operator action: none.")
    else:
        plural = "s" if blocked > 1 else ""
        lines.append(f"Result: NOT READY. {blocked} required slot{plural} missing.")
        lines.append("        Set the missing slot(s) on Vercel production scope")
        lines.append("        before driving the first cycle. See the comment header")
        lines.append("        of this script for what each slot powers.")
    lines.append("")
    lines.append("Reminder: this script does NOT verify Stripe webhook signing,")
    lines.append("does NOT check the DB schema, does NOT touch any builder rows.")
    lines.append("It only reports env-slot presence. Brunson Hard-Rule applies.")
    return "\n".join(lines)


# --- entrypoint --------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--remote",
        action="store_true",
        help="Also consult `vercel env ls production` (requires vercel login).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Machine-readable output instead of human-readable.",
    )
    args = parser.parse_args()

    env_keys = read_local_env()
    if args.remote:
        for k, srcs in read_vercel_env().items():
            env_keys.setdefault(k, set()).update(srcs)

    required, optional = evaluate(env_keys)

    if args.json:
        payload = {
            "required": [
                {"name": s.name, "set_in": list(s.set_in), "is_set": s.is_set}
                for s in required
            ],
            "optional": [
                {"name": s.name, "set_in": list(s.set_in), "is_set": s.is_set}
                for s in optional
            ],
            "ready": all(s.is_set for s in required),
            "remote_consulted": args.remote,
        }
        print(json.dumps(payload, indent=2))
    else:
        print(render_human(required, optional, args.remote))

    return 0 if all(s.is_set for s in required) else 1


if __name__ == "__main__":
    raise SystemExit(main())
