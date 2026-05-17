#!/usr/bin/env python3
"""
One-shot interactive setup for Mux API credentials (MUX_TOKEN_ID +
MUX_TOKEN_SECRET) used by `scripts/upload-shoot.py` to upload the VSL and
the three Founding PLV recordings.

Why this exists (locked secret-entry convention, memory file
project_unlocksaas_infra.md): every secret in the repo flows through a
dedicated setup-*.py script. zsh's `read -s -p` silently fails on some
configurations and leaks the secret to ~/.zsh_history; getpass() avoids
both pitfalls.

Mux differs from every OTHER secret in this repo in one important way:
it is NOT a runtime secret. The site itself does not read MUX_TOKEN_ID at
request time — only the upload script does. So this script writes to
.env.development.local locally and does NOT push to Vercel.

Get the credentials:
  1) Sign up / sign in at https://mux.com  (free tier covers ~100 GB delivery)
  2) Settings → Access Tokens → "Generate new token"
  3) Permissions: tick "Mux Video" → "Write" (no other scopes needed)
  4) Name: "UnlockSaaS shoot upload" (anything; for your reference only)
  5) Copy BOTH the Token ID (public-looking string) and the Token Secret
     (long base64-looking string). Mux only shows the Secret once.

Usage:
  python3 scripts/setup-mux-credentials.py

After this, the upload script reads both from .env.development.local.

Rotation: re-run any time. If a token leaks, revoke it at the Mux
dashboard BEFORE re-running this — the script does not interact with the
Mux API, it only stores credentials locally.
"""

from __future__ import annotations

import getpass
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / ".env.development.local"
TEMPLATE = REPO_ROOT / ".env.example"

# Mux Token IDs are typed identifiers that look UUID-ish; Token Secrets are
# long base64-encoded strings. We sanity-check shape (no whitespace, plausible
# length) but cannot validate format definitively without an API call —
# upload-shoot.py will surface a 401 if either is wrong.
MIN_ID_LEN = 20
MIN_SECRET_LEN = 40


def clean_paste(raw: str, label: str) -> str:
    v = raw.strip()
    if not v:
        sys.exit(f"ERROR: {label} cannot be empty.")
    # Strip surrounding quotes (user pastes wrapped value)
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1].strip()
    # Strip env-var assignment if user pasted `MUX_TOKEN_ID=abc...`
    if "=" in v and v.split("=", 1)[0].strip() in ("MUX_TOKEN_ID", "MUX_TOKEN_SECRET"):
        v = v.split("=", 1)[1].strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
            v = v[1:-1].strip()
    # Strip shell prefixes if user pasted `export MUX_TOKEN_ID=...`
    for prefix in ("export ", "set ", "echo "):
        if v.startswith(prefix):
            v = v[len(prefix):].strip()
            if "=" in v:
                v = v.split("=", 1)[1].strip()
                if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
                    v = v[1:-1].strip()
    if " " in v or "\n" in v or "\t" in v:
        sys.exit(f"ERROR: {label} contains whitespace — paste error.")
    return v


def upsert(lines: list[str], key: str, value: str) -> list[str]:
    found = False
    out: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            k = stripped.split("=", 1)[0].strip()
            if k == key:
                out.append(f"{key}={value}")
                found = True
                continue
        out.append(line)
    if not found:
        if out and out[-1].strip() != "":
            out.append("")
        out.append(f"{key}={value}")
    return out


def main() -> None:
    if not ENV_FILE.exists():
        if TEMPLATE.exists():
            ENV_FILE.write_text(TEMPLATE.read_text())
        else:
            ENV_FILE.touch()

    print("Mux credentials setup. Get both values from:")
    print("  https://dashboard.mux.com/settings/access-tokens")
    print()
    print("Permissions required: Mux Video → Write")
    print()

    raw_id = getpass.getpass("MUX_TOKEN_ID (typing is hidden): ")
    token_id = clean_paste(raw_id, "MUX_TOKEN_ID")
    if len(token_id) < MIN_ID_LEN:
        sys.exit(f"ERROR: MUX_TOKEN_ID is suspiciously short ({len(token_id)} chars).")

    raw_secret = getpass.getpass("MUX_TOKEN_SECRET (typing is hidden): ")
    token_secret = clean_paste(raw_secret, "MUX_TOKEN_SECRET")
    if len(token_secret) < MIN_SECRET_LEN:
        sys.exit(
            f"ERROR: MUX_TOKEN_SECRET is suspiciously short "
            f"({len(token_secret)} chars). The Mux Token Secret is typically "
            f"64+ characters."
        )

    lines = ENV_FILE.read_text().splitlines()
    # Tag a section header before the first upsert so future readers see
    # which script owns these vars.
    header = "# ── Mux (managed by scripts/setup-mux-credentials.py) ──────────────────────────"
    if header not in lines:
        if lines and lines[-1].strip() != "":
            lines.append("")
        lines.append(header)

    lines = upsert(lines, "MUX_TOKEN_ID", token_id)
    lines = upsert(lines, "MUX_TOKEN_SECRET", token_secret)

    ENV_FILE.write_text("\n".join(lines) + "\n")
    # Tighten file perms — secrets in here even at the project level should
    # not be world-readable.
    try:
        ENV_FILE.chmod(0o600)
    except OSError:
        pass

    print()
    print(f"OK — MUX_TOKEN_ID + MUX_TOKEN_SECRET written to {ENV_FILE}.")
    print("  Both values hidden from terminal output.")
    print()
    print("These credentials are upload-time only. They are NOT pushed to")
    print("Vercel and the production site never reads them.")
    print()
    print("Next step: record the shoot per strategy/OPERATOR-SHOOT-DAY.md, then run")
    print("  python3 scripts/upload-shoot.py <path-to-mp4> <ENV_VAR_NAME>")
    print()
    print("Rotation: revoke at https://dashboard.mux.com/settings/access-tokens")
    print("FIRST, then re-run this script. The old token works until revoked.")


if __name__ == "__main__":
    main()
