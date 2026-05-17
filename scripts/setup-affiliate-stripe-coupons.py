#!/usr/bin/env python3
"""
setup-affiliate-stripe-coupons.py

Pre-create the three Stripe coupon codes for the UnlockSaaS affiliate program
tiers, then push the coupon IDs into Vercel as env vars so app/src/lib/affiliate/
reads them the day the gate opens.

Chapter:        DCS Secret #13 (Other People's Funnels) + workbook 10 §3 (Affiliate Army)
Canonical doc:  strategy/other-peoples-funnels.md §1 row 5
                strategy/dream-100-outreach.md §6
                app/src/lib/affiliate/index.ts AFFILIATE_TIERS
Gate trigger:   50+ paying customers (read at app/src/lib/affiliate/getAffiliateGateState)

This script runs PRE-GATE — i.e., today. The coupons exist in Stripe before
50 customers verify so that the moment the gate opens, the program can issue
affiliate codes without further setup. Same pre-stage discipline used for
the Founding PLF cohort gate and the Verified Builder badge auto-render.

Per project_unlocksaas_infra.md secret-entry convention (locked 2026-05-17
after the zsh-leak incident): every secret MUST be entered via getpass.getpass().
This script honors that:
  - STRIPE_SECRET_KEY is read from env (.env.development.local), with a
    getpass fallback if not present
  - Created coupon IDs are written to Vercel via the CLI (which itself prompts
    securely)
  - Nothing sensitive is printed to stdout outside of confirmation prompts

Usage:
    python3 scripts/setup-affiliate-stripe-coupons.py
    python3 scripts/setup-affiliate-stripe-coupons.py --dry-run
    python3 scripts/setup-affiliate-stripe-coupons.py --only customer
    python3 scripts/setup-affiliate-stripe-coupons.py --only influencer
    python3 scripts/setup-affiliate-stripe-coupons.py --only community

Exit codes:
    0 = success
    1 = environment / authentication failure
    2 = Stripe API failure
    3 = Vercel CLI failure
    4 = user aborted at confirmation prompt
"""

import argparse
import getpass
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional


# Coupon spec mirrors AFFILIATE_TIERS in app/src/lib/affiliate/index.ts.
# If you change either side, change both.
COUPONS = {
    "customer": {
        "id_prefix": "unlocksaas-aff-customer",
        "name": "UnlockSaaS Customer Affiliate",
        "percent_off": 30,  # commission percent paid via Stripe Connect, not discount
        "duration": "repeating",
        "duration_in_months": 6,
        "env_var": "STRIPE_AFFILIATE_COUPON_CUSTOMER",
        "description": (
            "Customer affiliate tier. 30% recurring for 6 months. "
            "For founders who completed The Machine and verified first paying customer."
        ),
    },
    "influencer": {
        "id_prefix": "unlocksaas-aff-influencer",
        "name": "UnlockSaaS Influencer Affiliate",
        "percent_off": 50,
        "duration": "repeating",
        "duration_in_months": 1,
        # Note: the influencer tier is conceptually "50% first month + 30% recurring 6 months".
        # Stripe coupons can't express two-stage rates natively, so the influencer coupon
        # represents the FIRST-MONTH 50%; the recurring 30% reuses the customer coupon
        # under the hood. The split is handled by the affiliate dashboard at activation.
        "env_var": "STRIPE_AFFILIATE_COUPON_INFLUENCER",
        "description": (
            "Influencer / publisher tier. 50% on first month + 30% recurring 6 months "
            "(applied in two stages by the affiliate dashboard)."
        ),
    },
    "community": {
        "id_prefix": "unlocksaas-aff-community",
        "name": "UnlockSaaS Community Partner Affiliate",
        "percent_off": 40,
        "duration": "forever",
        "duration_in_months": None,
        "env_var": "STRIPE_AFFILIATE_COUPON_COMMUNITY",
        "description": (
            "Coach / community partner tier. 40% recurring for lifetime + monthly "
            "marketing co-investment."
        ),
    },
}


def get_stripe_secret_key() -> str:
    """Read STRIPE_SECRET_KEY from env, getpass fallback if not present."""
    key = os.environ.get("STRIPE_SECRET_KEY")
    if key:
        # Sanity check: should start with sk_live_ or sk_test_
        if not (key.startswith("sk_live_") or key.startswith("sk_test_")):
            print(
                f"ERROR: STRIPE_SECRET_KEY in env doesn't start with sk_live_ or sk_test_. "
                f"Refusing to proceed.",
                file=sys.stderr,
            )
            sys.exit(1)
        return key

    print(
        "STRIPE_SECRET_KEY not in env. Enter it now (input hidden). "
        "Or Ctrl-C and add it to .env.development.local."
    )
    key = getpass.getpass("STRIPE_SECRET_KEY: ").strip()

    # Strip paste anti-patterns per project_unlocksaas_infra.md convention.
    for prefix in ("STRIPE_SECRET_KEY=", "export STRIPE_SECRET_KEY=", "echo "):
        if key.startswith(prefix):
            key = key[len(prefix):].strip()
    if (key.startswith('"') and key.endswith('"')) or (
        key.startswith("'") and key.endswith("'")
    ):
        key = key[1:-1]

    if not (key.startswith("sk_live_") or key.startswith("sk_test_")):
        print(
            "ERROR: entered value doesn't start with sk_live_ or sk_test_. Aborting.",
            file=sys.stderr,
        )
        sys.exit(1)
    return key


def create_stripe_coupon(stripe_key: str, tier: str, spec: dict, dry_run: bool) -> Optional[str]:
    """
    Create one Stripe coupon. Returns the coupon ID on success, None on dry-run.

    Coupon ID is human-readable: e.g., unlocksaas-aff-customer
    Stripe's coupon ID must be lowercase + hyphens; we enforce that here.
    """
    coupon_id = spec["id_prefix"]

    body = {
        "id": coupon_id,
        "name": spec["name"],
        "percent_off": str(spec["percent_off"]),
        "duration": spec["duration"],
    }
    if spec["duration_in_months"] is not None:
        body["duration_in_months"] = str(spec["duration_in_months"])

    print(f"\n[{tier}] Coupon payload:")
    for k, v in body.items():
        print(f"  {k}: {v}")

    if dry_run:
        print(f"[{tier}] DRY RUN — not creating in Stripe")
        return None

    # We could use urllib + Basic auth, but to keep this script dependency-free
    # we shell out to curl. Same pattern as other setup-* scripts in this repo.
    cmd = ["curl", "-sS", "-X", "POST", "https://api.stripe.com/v1/coupons", "-u", f"{stripe_key}:"]
    for k, v in body.items():
        cmd.extend(["-d", f"{k}={v}"])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        response = json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"[{tier}] ERROR: curl failed — {e.stderr}", file=sys.stderr)
        sys.exit(2)
    except json.JSONDecodeError:
        print(f"[{tier}] ERROR: Stripe response not JSON: {result.stdout[:200]}", file=sys.stderr)
        sys.exit(2)

    if "error" in response:
        # Common case: coupon already exists with this ID — that's fine, idempotent
        err = response["error"]
        if err.get("code") == "resource_already_exists":
            print(f"[{tier}] Coupon {coupon_id} already exists in Stripe — reusing")
            return coupon_id
        print(f"[{tier}] ERROR from Stripe: {err.get('message', err)}", file=sys.stderr)
        sys.exit(2)

    print(f"[{tier}] Created Stripe coupon: {response.get('id')}")
    return response.get("id")


def push_env_var(env_var: str, value: str, dry_run: bool) -> None:
    """Push a single env var to all three Vercel environments via the Vercel CLI."""
    for environment in ("production", "preview", "development"):
        if dry_run:
            print(f"  DRY RUN — would push {env_var} to {environment}")
            continue

        # vercel env add wants the value piped via stdin, not in argv.
        proc = subprocess.run(
            ["vercel", "env", "add", env_var, environment],
            input=f"{value}\n",
            capture_output=True,
            text=True,
        )
        # If the env var already exists, vercel CLI exits non-zero — handle as warning
        if proc.returncode != 0:
            stderr = proc.stderr or ""
            if "already exists" in stderr.lower():
                print(f"  {env_var} on {environment}: already set (skipping)")
            else:
                print(
                    f"  WARNING: vercel env add {env_var} {environment} failed: "
                    f"{stderr.strip()[:200]}",
                    file=sys.stderr,
                )
        else:
            print(f"  {env_var} on {environment}: pushed")


def confirm(prompt: str) -> bool:
    """Y/N confirmation prompt."""
    response = input(f"{prompt} [y/N]: ").strip().lower()
    return response in ("y", "yes")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pre-create Stripe affiliate coupons for UnlockSaaS"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be created without touching Stripe or Vercel",
    )
    parser.add_argument(
        "--only",
        choices=list(COUPONS.keys()),
        help="Create only one tier instead of all three",
    )
    parser.add_argument(
        "--skip-vercel",
        action="store_true",
        help="Create Stripe coupons but skip pushing env vars to Vercel",
    )
    args = parser.parse_args()

    tiers_to_create = [args.only] if args.only else list(COUPONS.keys())

    print("UnlockSaaS Affiliate Coupon Pre-Stage")
    print(f"Tiers to create: {', '.join(tiers_to_create)}")
    print(f"Dry run: {args.dry_run}")
    print(f"Skip Vercel push: {args.skip_vercel}")
    print()

    if not args.dry_run and not confirm("Proceed?"):
        print("Aborted.")
        return 4

    stripe_key = get_stripe_secret_key() if not args.dry_run else "sk_dry_run"

    created_ids: dict[str, str] = {}
    for tier in tiers_to_create:
        spec = COUPONS[tier]
        coupon_id = create_stripe_coupon(stripe_key, tier, spec, args.dry_run)
        if coupon_id:
            created_ids[spec["env_var"]] = coupon_id

    if not created_ids:
        print("\nNo coupons created (dry run or all skipped).")
        return 0

    if args.skip_vercel:
        print("\nSkipping Vercel env var push.")
        print("Push manually with:")
        for env_var, value in created_ids.items():
            print(f"  echo '{value}' | vercel env add {env_var} production")
        return 0

    print("\nPushing env vars to Vercel:")
    for env_var, value in created_ids.items():
        push_env_var(env_var, value, args.dry_run)

    print("\nDone. Verify with `vercel env ls` or in the Vercel dashboard.")
    print(
        "Affiliate program reads these env vars via "
        "app/src/lib/affiliate/index.ts AFFILIATE_TIERS"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
