#!/usr/bin/env python3
"""
One-shot interactive setup for the four Sentry env vars that activate the
already-wired @sentry/nextjs instrumentation in app/.

The four vars (see project_unlocksaas_infra.md and project_unlocksaas_vercel.md):
  NEXT_PUBLIC_SENTRY_DSN  – client-facing, NOT sensitive (ships in browser)
  SENTRY_AUTH_TOKEN       – sensitive (build-time source-map upload only)
  SENTRY_ORG              – org slug, lowercase, not sensitive
  SENTRY_PROJECT          – project slug, lowercase, not sensitive

Why this exists: the locked secret-entry convention (see
project_unlocksaas_infra.md) requires every credential entry to flow through a
dedicated setup-*.py script using getpass — never `echo "K=v" >> .env` and
never zsh `read -s -p` (silently fails with "no coprocess" and the && chain
leaks the value via echo). This script matches setup-posthog-key.py exactly.

Usage:
  python3 scripts/setup-sentry.py                          # all four vars, local only
  python3 scripts/setup-sentry.py --only dsn               # just the DSN
  python3 scripts/setup-sentry.py --only auth_token        # just the auth token
  python3 scripts/setup-sentry.py --only org               # just the org slug
  python3 scripts/setup-sentry.py --only project           # just the project slug
  python3 scripts/setup-sentry.py --push-to-vercel         # local + push all 4 to all 3 Vercel envs

With --push-to-vercel the script runs `vercel env add` idempotently across
production / preview / development for whichever vars were touched in this
run. AUTH_TOKEN is pushed with --sensitive on production + preview only (the
Vercel CLI rejects --sensitive on development, per documented quirk). The
other three vars are pushed without --sensitive.

Pre-flight: this script does NOT create the Sentry org/project. Operator
must first sign up at https://sentry.io, create a Next.js project named
'unlocksaas', and generate an auth token at
  https://sentry.io/orgs/<org>/auth-tokens/
with scopes `project:releases` + `project:read`.
"""

from __future__ import annotations

import argparse
import getpass
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / ".env.development.local"
TEMPLATE = REPO_ROOT / ".env.example"

DSN_NAME = "NEXT_PUBLIC_SENTRY_DSN"
AUTH_TOKEN_NAME = "SENTRY_AUTH_TOKEN"
ORG_NAME = "SENTRY_ORG"
PROJECT_NAME = "SENTRY_PROJECT"

# Sensitivity (matches Vercel push semantics).
SENSITIVE = {AUTH_TOKEN_NAME}

# DSN prefix check: Sentry DSNs always start with https://<32-hex-or-longer-key>@
DSN_PREFIX = "https://"
DSN_HOST_MARKERS = (".ingest.sentry.io", ".ingest.us.sentry.io", ".ingest.de.sentry.io")
# Auth tokens: Sentry currently issues `sntrys_` (org auth tokens) or `sntryu_`
# (user auth tokens). Older opaque hex tokens still exist; accept anything
# ≥32 chars to be safe.
TOKEN_PREFIXES_KNOWN = ("sntrys_", "sntryu_")


def clean_paste(value: str, *, expected_prefix: Optional[str] = None) -> str:
    """Strip the usual paste-poison patterns. Mirrors setup-posthog-key.py."""
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


def validate_dsn(v: str) -> str:
    if not v.startswith(DSN_PREFIX):
        sys.exit(f"ERROR: DSN must start with {DSN_PREFIX!r}; got {v[:16]!r}…")
    if "@" not in v:
        sys.exit("ERROR: DSN missing '@' — looks malformed.")
    if not any(marker in v for marker in DSN_HOST_MARKERS):
        sys.exit(
            f"ERROR: DSN host should contain one of {DSN_HOST_MARKERS}; "
            f"got {v!r}. Copy the DSN from Sentry project settings, not a custom URL."
        )
    return v


def validate_auth_token(v: str) -> str:
    if len(v) < 32:
        sys.exit(f"ERROR: auth token suspiciously short ({len(v)} chars).")
    # Soft-warn if it doesn't match known prefixes — Sentry still mints older
    # opaque tokens, so don't hard-fail.
    if not any(v.startswith(p) for p in TOKEN_PREFIXES_KNOWN):
        print(
            f"  ⚠  token does not start with {TOKEN_PREFIXES_KNOWN}. "
            f"Accepting anyway (older opaque format). Verify scopes are "
            f"project:releases + project:read."
        )
    return v


def validate_slug(v: str, label: str) -> str:
    if not v:
        sys.exit(f"ERROR: {label} cannot be empty.")
    if v != v.lower():
        sys.exit(f"ERROR: {label} must be lowercase (got {v!r}).")
    if not all(c.isalnum() or c in ("-", "_") for c in v):
        sys.exit(
            f"ERROR: {label} should be a Sentry slug (alphanumerics, '-', '_'); "
            f"got {v!r}."
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
        out.append(
            f"# ── Sentry (managed by scripts/setup-sentry.py) ─────────────────────────"
        )
        out.append(f"{name}={value}")
    return out


def read_env_value(name: str) -> Optional[str]:
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
    proc = subprocess.run(
        ["vercel", "env", "ls", env],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        sys.exit(
            f"ERROR: `vercel env ls {env}` failed:\n{proc.stderr.strip()}\n"
            "Run `vercel link` first from the repo root."
        )
    for line in proc.stdout.splitlines():
        cols = line.split()
        if cols and cols[0] == name:
            return True
    return False


def push_to_vercel(name: str, value: str, envs: tuple[str, ...]) -> None:
    sensitive = name in SENSITIVE
    for env in envs:
        if vercel_env_exists(name, env):
            print(
                f"  [{env}] {name} already exists — skipping. "
                f"To replace: `vercel env rm {name} {env}` then re-run."
            )
            continue
        args = ["vercel", "env", "add", name, env, "--yes"]
        # Documented agent-mode CLI quirk: preview requires an explicit branch
        # positional. Empty string applies to all preview branches.
        if env == "preview":
            args.insert(5, "")
        # --sensitive is rejected server-side on development.
        if sensitive and env != "development":
            args.append("--sensitive")
        proc = subprocess.run(
            args,
            cwd=REPO_ROOT,
            input=value + "\n",
            capture_output=True,
            text=True,
        )
        if proc.returncode == 0:
            print(f"  [{env}] {name} pushed{' (sensitive)' if sensitive and env != 'development' else ''}.")
        else:
            safe_err = proc.stderr.replace(value, "<redacted>")
            safe_out = proc.stdout.replace(value, "<redacted>")
            print(f"  [{env}] FAILED to push {name}: {safe_err.strip() or safe_out.strip()}")


def write_local_atomic(lines: list[str]) -> None:
    """Write env file with 0600 perms so other users on the same Mac can't read."""
    ENV_FILE.write_text("\n".join(lines) + "\n")
    os.chmod(ENV_FILE, 0o600)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only",
        choices=["dsn", "auth_token", "org", "project"],
        help="Only set one of the four vars (useful for rotation).",
    )
    parser.add_argument(
        "--push-to-vercel",
        action="store_true",
        help="After writing locally, push touched vars to production/preview/development.",
    )
    args = parser.parse_args()

    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            ENV_FILE.write_text(TEMPLATE.read_text())
        else:
            ENV_FILE.touch()

    lines = ENV_FILE.read_text().splitlines()
    touched: list[str] = []

    if args.only in (None, "dsn"):
        raw = getpass.getpass(
            "Sentry DSN (https://<key>@<org>.ingest.sentry.io/<proj>, hidden): "
        )
        if not raw.strip():
            sys.exit("ERROR: DSN cannot be empty.")
        cleaned = clean_paste(raw, expected_prefix=DSN_PREFIX)
        cleaned = validate_dsn(cleaned)
        lines = upsert(lines, DSN_NAME, cleaned)
        touched.append(DSN_NAME)
        print(f"OK — {DSN_NAME} set ({len(cleaned)} chars).")

    if args.only in (None, "auth_token"):
        raw = getpass.getpass("Sentry auth token (sntrys_… or opaque, hidden): ")
        if not raw.strip():
            sys.exit("ERROR: auth token cannot be empty.")
        cleaned = clean_paste(raw)
        cleaned = validate_auth_token(cleaned)
        lines = upsert(lines, AUTH_TOKEN_NAME, cleaned)
        touched.append(AUTH_TOKEN_NAME)
        print(f"OK — {AUTH_TOKEN_NAME} set ({len(cleaned)} chars).")

    if args.only in (None, "org"):
        raw = input("Sentry org slug (lowercase, e.g. 'unlocksaas'): ")
        cleaned = clean_paste(raw)
        cleaned = validate_slug(cleaned, "org slug")
        lines = upsert(lines, ORG_NAME, cleaned)
        touched.append(ORG_NAME)
        print(f"OK — {ORG_NAME} set to {cleaned}.")

    if args.only in (None, "project"):
        raw = input("Sentry project slug (lowercase, e.g. 'unlocksaas'): ")
        cleaned = clean_paste(raw)
        cleaned = validate_slug(cleaned, "project slug")
        lines = upsert(lines, PROJECT_NAME, cleaned)
        touched.append(PROJECT_NAME)
        print(f"OK — {PROJECT_NAME} set to {cleaned}.")

    write_local_atomic(lines)

    print()
    print(f"Wrote to {ENV_FILE.name} (mode 0600).")

    if args.push_to_vercel:
        envs = ("production", "preview", "development")
        print()
        print(f"Pushing to Vercel ({', '.join(envs)})…")
        for name in touched:
            val = read_env_value(name)
            if not val:
                sys.exit(f"ERROR: cannot push — {name} missing from env file.")
            push_to_vercel(name, val, envs)
        print()
        print("Pushed. Trigger a redeploy so the new envs ship to prod:")
        print("  cd /Users/sipi/unlocksaas && vercel --prod --yes")
        print()
        print("Then watch the build log for: 'Sentry CLI: uploaded sourcemaps for release …'")
        print("If you see 'Skipping Sentry sourcemap upload (SENTRY_ORG missing)', one")
        print("of the four vars did not land — re-check with `vercel env ls production`.")
    else:
        print()
        print("Next steps:")
        print("  1. Re-run with --push-to-vercel to push to all 3 Vercel envs in one shot.")
        print("  2. Or push manually (the CLI hidden-prompt also respects no-echo):")
        for name in touched:
            sens = " --sensitive" if name in SENSITIVE else ""
            print(f"       vercel env add {name} production{sens}")

    print()
    print("Reminder: if rotating after a leak, REVOKE the old auth token first at")
    print("  https://sentry.io/orgs/<org>/auth-tokens/")


if __name__ == "__main__":
    main()
