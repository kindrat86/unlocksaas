#!/usr/bin/env python3
"""
One-shot interactive setup for the PostHog project API key + ingestion host.

Why this exists: the project's locked secret-entry convention says every
credential goes through a dedicated setup-*.py script. PostHog's project
API key (NEXT_PUBLIC_POSTHOG_KEY) is technically public — it ships in the
browser bundle — but routing it through the same pipeline keeps the
"there is one way to fill .env.development.local" rule intact, and the
*host* value (NEXT_PUBLIC_POSTHOG_HOST) is also captured in the same prompt.

Usage:
  python3 scripts/setup-posthog-key.py                    # both vars, local only
  python3 scripts/setup-posthog-key.py --only key         # just the project key
  python3 scripts/setup-posthog-key.py --only host        # just the host
  python3 scripts/setup-posthog-key.py --push-to-vercel   # local + push to all 3 Vercel envs

Writes/updates NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST in
.env.development.local. NEVER use `echo` or zsh `read -s -p`.

With --push-to-vercel the script also runs `vercel env add` for both vars
across production / preview / development (6 calls total), idempotently —
already-present vars are skipped with a `vercel env rm` hint. Values are
public (NEXT_PUBLIC_*) so no --sensitive flag.
"""

from __future__ import annotations

import argparse
import getpass
import subprocess
import sys
from pathlib import Path
from typing import Optional

ENV_FILE = Path(".env.development.local")
TEMPLATE = Path(".env.example")
KEY_NAME = "NEXT_PUBLIC_POSTHOG_KEY"
HOST_NAME = "NEXT_PUBLIC_POSTHOG_HOST"
EXPECTED_PREFIX = "phc_"
VALID_HOSTS = {
    "https://eu.i.posthog.com",
    "https://us.i.posthog.com",
    "https://app.posthog.com",  # legacy US ingestion
}


def clean_paste(value: str, *, expected_prefix: Optional[str] = None) -> str:
    v = value.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1].strip()
    if "=" in v and (
        not expected_prefix or not v.startswith(expected_prefix)
    ):
        v = v.split("=", 1)[1].strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
            v = v[1:-1].strip()
    for prefix in ("echo ", "export ", "set "):
        if v.startswith(prefix):
            v = v[len(prefix):].strip()
    if expected_prefix and not v.startswith(expected_prefix):
        sys.exit(
            f"ERROR: value should start with {expected_prefix!r} but got "
            f"{v[:8]!r}... (likely paste error or wrong field)"
        )
    if " " in v or "\n" in v or "\t" in v:
        sys.exit("ERROR: value contains whitespace — paste error.")
    return v


def normalize_host(value: str) -> str:
    v = clean_paste(value)
    # Accept the dashboard URL form (https://eu.posthog.com) and rewrite to
    # the ingestion form. People paste whatever's in their address bar.
    if v == "https://eu.posthog.com":
        return "https://eu.i.posthog.com"
    if v == "https://us.posthog.com":
        return "https://us.i.posthog.com"
    if v not in VALID_HOSTS:
        sys.exit(
            f"ERROR: host must be one of {sorted(VALID_HOSTS)} (got {v!r}). "
            "Use the *ingestion* host, not the dashboard URL."
        )
    return v


def upsert(env_lines: list[str], name: str, value: str) -> list[str]:
    found = False
    out: list[str] = []
    for line in env_lines:
        stripped = line.strip()
        if (
            stripped
            and not stripped.startswith("#")
            and "=" in stripped
            and stripped.split("=", 1)[0].strip() == name
        ):
            out.append(f"{name}={value}")
            found = True
            continue
        out.append(line)
    if not found:
        out.append("")
        out.append(f"# ── PostHog (managed by scripts/setup-posthog-key.py) ─────────────────────────")
        out.append(f"{name}={value}")
    return out


def read_env_value(name: str) -> Optional[str]:
    """Re-read the final value of `name` from .env.development.local after upsert."""
    if not ENV_FILE.exists():
        return None
    for line in ENV_FILE.read_text().splitlines():
        s = line.strip()
        if s and not s.startswith("#") and "=" in s:
            k, v = s.split("=", 1)
            if k.strip() == name:
                return v.strip()
    return None


def vercel_env_exists(name: str, env: str) -> bool:
    """Return True if `name` is already set on Vercel for `env`."""
    proc = subprocess.run(
        ["vercel", "env", "ls", env],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        # Surface the CLI error rather than guessing — likely "not linked".
        sys.exit(
            f"ERROR: `vercel env ls {env}` failed:\n{proc.stderr.strip()}\n"
            "Run `vercel link` first."
        )
    # The CLI prints one row per env-var with the name in the first column.
    for line in proc.stdout.splitlines():
        cols = line.split()
        if cols and cols[0] == name:
            return True
    return False


def push_to_vercel(name: str, value: str, envs: tuple[str, ...]) -> None:
    """Push `name=value` to each Vercel env, skipping pre-existing entries idempotently."""
    for env in envs:
        if vercel_env_exists(name, env):
            print(
                f"  [{env}] {name} already exists — skipping. "
                f"To replace: `vercel env rm {name} {env}` then re-run."
            )
            continue
        proc = subprocess.run(
            ["vercel", "env", "add", name, env],
            input=value + "\n",
            capture_output=True,
            text=True,
        )
        if proc.returncode == 0:
            print(f"  [{env}] {name} pushed.")
        else:
            # Print stderr verbatim; don't mask CLI failure modes.
            print(
                f"  [{env}] FAILED to push {name}: "
                f"{proc.stderr.strip() or proc.stdout.strip()}"
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only",
        choices=["key", "host"],
        help="Only set one of the two vars (useful for re-running after a rotation).",
    )
    parser.add_argument(
        "--push-to-vercel",
        action="store_true",
        help="After writing locally, push both vars to production/preview/development on Vercel.",
    )
    args = parser.parse_args()

    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            ENV_FILE.write_text(TEMPLATE.read_text())
        else:
            ENV_FILE.touch()

    lines = ENV_FILE.read_text().splitlines()

    if args.only in (None, "key"):
        raw = getpass.getpass(
            "PostHog project API key (phc_..., typing is hidden): "
        )
        if not raw.strip():
            sys.exit("ERROR: key cannot be empty.")
        cleaned = clean_paste(raw, expected_prefix=EXPECTED_PREFIX)
        if len(cleaned) < 20:
            sys.exit(f"ERROR: key suspiciously short ({len(cleaned)} chars).")
        lines = upsert(lines, KEY_NAME, cleaned)
        print(f"OK — {KEY_NAME} set ({len(cleaned)} chars).")

    if args.only in (None, "host"):
        raw = input(
            "PostHog host (default https://eu.i.posthog.com — press Enter to accept): "
        )
        raw = raw.strip() or "https://eu.i.posthog.com"
        cleaned = normalize_host(raw)
        lines = upsert(lines, HOST_NAME, cleaned)
        print(f"OK — {HOST_NAME} set to {cleaned}.")

    ENV_FILE.write_text("\n".join(lines) + "\n")

    print()
    print(f"Wrote to {ENV_FILE}.")

    if args.push_to_vercel:
        envs = ("production", "preview", "development")
        print()
        print(f"Pushing to Vercel ({', '.join(envs)})…")
        # Only push the vars we actually touched in this run.
        if args.only in (None, "key"):
            key_val = read_env_value(KEY_NAME)
            if not key_val:
                sys.exit(f"ERROR: cannot push — {KEY_NAME} missing from env file.")
            push_to_vercel(KEY_NAME, key_val, envs)
        if args.only in (None, "host"):
            host_val = read_env_value(HOST_NAME)
            if not host_val:
                sys.exit(f"ERROR: cannot push — {HOST_NAME} missing from env file.")
            push_to_vercel(HOST_NAME, host_val, envs)
        print()
        print("Pushed. Trigger a redeploy so the new envs ship to prod:")
        print("  vercel --prod")
    else:
        print()
        print("Next steps:")
        print("  1. Restart `next dev` (env file is read at process start).")
        print("  2. Push to Vercel (the values are public, no --sensitive flag):")
        print(f"       vercel env add {KEY_NAME} production")
        print(f"       vercel env add {HOST_NAME} production")
        print("     Repeat for preview + development envs so previews emit events too.")
        print("     Or re-run with --push-to-vercel to do all 6 calls in one shot.")

    print()
    print("Reminder: if you're rotating after a leak, REVOKE the old key first")
    print("at https://posthog.com → Settings → Project API Keys.")


if __name__ == "__main__":
    main()
