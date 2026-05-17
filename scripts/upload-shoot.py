#!/usr/bin/env python3
"""
Upload one or more shoot files (VSL + 3 Founding PLVs) to Mux, capture the
playback ID, and push the resulting env var to Vercel for production +
preview + development environments.

This is the "drop 5 env vars" step from the Russell audit's Fix #2,
mechanized so the founder's only work post-shoot is one command per file.

Usage (one file at a time, run 4 times — once per video):

  # The full VSL — emits the full Mux MP4 URL to NEXT_PUBLIC_VSL_URL
  python3 scripts/upload-shoot.py path/to/vsl.mp4 NEXT_PUBLIC_VSL_URL

  # The three PLVs — emit raw playback IDs (PlvBlock composes the URL)
  python3 scripts/upload-shoot.py path/to/plv1.mp4 FOUNDING_PLV1_PLAYBACK
  python3 scripts/upload-shoot.py path/to/plv2.mp4 FOUNDING_PLV2_PLAYBACK
  python3 scripts/upload-shoot.py path/to/plv3.mp4 FOUNDING_PLV3_PLAYBACK

Or upload all four in one invocation:

  python3 scripts/upload-shoot.py \\
    path/to/vsl.mp4=NEXT_PUBLIC_VSL_URL \\
    path/to/plv1.mp4=FOUNDING_PLV1_PLAYBACK \\
    path/to/plv2.mp4=FOUNDING_PLV2_PLAYBACK \\
    path/to/plv3.mp4=FOUNDING_PLV3_PLAYBACK

Pre-conditions:
  - python3 scripts/setup-mux-credentials.py has been run (writes
    MUX_TOKEN_ID + MUX_TOKEN_SECRET to .env.development.local)
  - The Vercel CLI is installed and `vercel link` has been run for this
    worktree (the link is shared across all worktrees of this repo)
  - The file argument is an MP4 (Mux accepts other formats but MP4 has the
    shortest processing time and is what every phone records natively)

What this does, per file:
  1) Create a Mux Direct Upload (asks Mux for a one-time PUT URL)
  2) PUT the local MP4 to that URL (Mux ingests as you upload)
  3) Poll the upload until Mux assigns an `asset_id`
  4) Poll the asset until `status == 'ready'` AND `static_renditions` is
     ready (the MP4 rendition we link to from PlvBlock + the VSL player)
  5) Extract the playback ID
  6) Compose the env var value (full URL for VSL, raw ID for PLV)
  7) Push to Vercel via `vercel env add <NAME> production preview development`
     using subprocess stdin so the value never lands in shell history

If a step fails partway, re-run with the same args — Mux uploads are
keyed on the local file's content, not idempotent at the API level, but
a re-run produces a NEW asset (the previous one stays in your library and
can be deleted at the dashboard). The Vercel env push is idempotent
(re-running replaces the value).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

# Use the standard library — no external deps. urllib handles JSON+HTTP and
# PUT-with-progress fine; the only optional acceleration is `requests`, which
# we will try and fall back gracefully.
try:
    import requests  # type: ignore
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    import urllib.request
    import urllib.error

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / ".env.development.local"
MUX_API = "https://api.mux.com"
POLL_INTERVAL_SECONDS = 5
MAX_POLL_SECONDS = 60 * 60  # 1 hour max wait per asset (huge PLVs)

# Env var contract:
#   - NEXT_PUBLIC_VSL_URL holds the FULL Mux MP4 URL (the VSL player
#     wires <video src> to whatever's in env, regardless of host)
#   - FOUNDING_PLV{1,2,3}_PLAYBACK hold the RAW Mux playback ID (the
#     PlvBlock composes `https://stream.mux.com/<id>/medium.mp4` server-side)
URL_STYLE_VARS = {"NEXT_PUBLIC_VSL_URL"}
PLAYBACK_ID_STYLE_VARS = {
    "FOUNDING_PLV1_PLAYBACK",
    "FOUNDING_PLV2_PLAYBACK",
    "FOUNDING_PLV3_PLAYBACK",
}
KNOWN_VARS = URL_STYLE_VARS | PLAYBACK_ID_STYLE_VARS


# ----------------------------------------------------------------------------
# Mux REST helpers
# ----------------------------------------------------------------------------


def _http_request(method: str, url: str, *, auth: tuple[str, str] | None = None,
                  headers: dict | None = None, json_body: dict | None = None,
                  data: bytes | None = None, timeout: int = 60) -> tuple[int, dict | bytes]:
    """Minimal HTTP wrapper that works with or without `requests` installed."""
    if HAS_REQUESTS:
        kwargs: dict = {"timeout": timeout, "headers": headers or {}}
        if auth:
            kwargs["auth"] = auth
        if json_body is not None:
            kwargs["json"] = json_body
        if data is not None:
            kwargs["data"] = data
        resp = requests.request(method, url, **kwargs)
        body: dict | bytes
        try:
            body = resp.json()
        except Exception:
            body = resp.content
        return resp.status_code, body

    # urllib fallback
    req_headers = dict(headers or {})
    if auth:
        import base64
        token = base64.b64encode(f"{auth[0]}:{auth[1]}".encode()).decode()
        req_headers["Authorization"] = f"Basic {token}"
    body_bytes: bytes | None
    if json_body is not None:
        req_headers.setdefault("Content-Type", "application/json")
        body_bytes = json.dumps(json_body).encode()
    else:
        body_bytes = data
    req = urllib.request.Request(url, data=body_bytes, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            try:
                return resp.status, json.loads(raw.decode())
            except Exception:
                return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw.decode())
        except Exception:
            return e.code, raw


def load_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        out[key.strip()] = value.strip().strip("'\"")
    return out


def read_mux_credentials() -> tuple[str, str]:
    env = load_env_file(ENV_FILE)
    token_id = env.get("MUX_TOKEN_ID") or os.environ.get("MUX_TOKEN_ID")
    token_secret = env.get("MUX_TOKEN_SECRET") or os.environ.get("MUX_TOKEN_SECRET")
    if not token_id or token_id == "set-by-setup-mux-credentials.py":
        sys.exit(
            "ERROR: MUX_TOKEN_ID not configured. Run:\n"
            "  python3 scripts/setup-mux-credentials.py"
        )
    if not token_secret or token_secret == "set-by-setup-mux-credentials.py":
        sys.exit(
            "ERROR: MUX_TOKEN_SECRET not configured. Run:\n"
            "  python3 scripts/setup-mux-credentials.py"
        )
    return token_id, token_secret


def mux_create_direct_upload(token_id: str, token_secret: str) -> dict:
    """Create a Mux Direct Upload — returns {id, url} for the PUT step."""
    payload = {
        "new_asset_settings": {
            "playback_policy": ["public"],
            # `mp4_support: standard` produces the static MP4 rendition that
            # PlvBlock + the VSL <video> tag link to. Required for the URL
            # patterns we use in the codebase.
            "mp4_support": "standard",
            # `passthrough` lets us tag the asset for our records — shows
            # up in the Mux dashboard's asset list.
            "passthrough": "unlocksaas-shoot",
        },
        # `*` is fine for one-time uploads from a local file via PUT — the
        # browser CORS preflight constraint does not apply to scripts.
        "cors_origin": "*",
    }
    status, body = _http_request(
        "POST",
        f"{MUX_API}/video/v1/uploads",
        auth=(token_id, token_secret),
        json_body=payload,
    )
    if status >= 300:
        sys.exit(f"ERROR: Mux upload-create failed ({status}): {body}")
    if not isinstance(body, dict) or "data" not in body:
        sys.exit(f"ERROR: unexpected Mux response: {body}")
    return body["data"]


def mux_upload_file(upload_url: str, file_path: Path) -> None:
    """PUT the local MP4 to the one-time Mux upload URL."""
    size = file_path.stat().st_size
    print(f"  Uploading {size / (1024*1024):.1f} MB to Mux…")
    with file_path.open("rb") as f:
        data = f.read()
    # `Content-Type: video/mp4` is the conservative choice Mux ingests for
    # any common phone/editor output (MP4 H.264 / HEVC).
    status, body = _http_request(
        "PUT",
        upload_url,
        headers={"Content-Type": "video/mp4"},
        data=data,
        timeout=60 * 30,  # 30-min upload window for the longest PLV
    )
    if status >= 300:
        sys.exit(f"ERROR: PUT to Mux upload URL failed ({status}): {body!r}")
    print("  Upload bytes complete. Mux is now ingesting.")


def mux_poll_for_asset(upload_id: str, token_id: str, token_secret: str) -> str:
    """Wait until the upload has an asset_id, return the asset_id."""
    deadline = time.time() + MAX_POLL_SECONDS
    while time.time() < deadline:
        status, body = _http_request(
            "GET",
            f"{MUX_API}/video/v1/uploads/{upload_id}",
            auth=(token_id, token_secret),
        )
        if status >= 300:
            sys.exit(f"ERROR: poll upload {upload_id} failed ({status}): {body}")
        data = body["data"] if isinstance(body, dict) and "data" in body else {}
        asset_id = data.get("asset_id")
        if asset_id:
            print(f"  Mux asset created: {asset_id}")
            return asset_id
        upload_status = data.get("status", "?")
        print(f"  Waiting for asset_id — upload status: {upload_status}")
        time.sleep(POLL_INTERVAL_SECONDS)
    sys.exit(f"ERROR: timed out waiting for asset_id on upload {upload_id}")


def mux_poll_asset_ready(asset_id: str, token_id: str, token_secret: str) -> dict:
    """Wait until the asset is `ready` AND its static MP4 rendition is ready.

    Mux processes in passes: first an HLS rendition (asset goes `ready`),
    then the static MP4. We need the MP4 for PlvBlock — so we wait for
    both signals before declaring done.
    """
    deadline = time.time() + MAX_POLL_SECONDS
    while time.time() < deadline:
        status, body = _http_request(
            "GET",
            f"{MUX_API}/video/v1/assets/{asset_id}",
            auth=(token_id, token_secret),
        )
        if status >= 300:
            sys.exit(f"ERROR: poll asset {asset_id} failed ({status}): {body}")
        data = body["data"] if isinstance(body, dict) and "data" in body else {}
        asset_status = data.get("status", "?")
        # static_renditions can be None until Mux finishes the first pass
        static_renditions = data.get("static_renditions") or {}
        static_status = static_renditions.get("status", "preparing")
        print(f"  asset.status={asset_status}  mp4.status={static_status}")

        if asset_status == "errored":
            errors = data.get("errors") or {}
            sys.exit(f"ERROR: Mux asset errored: {errors}")
        if asset_status == "ready" and static_status == "ready":
            return data

        time.sleep(POLL_INTERVAL_SECONDS)
    sys.exit(f"ERROR: timed out waiting for asset {asset_id} to be ready.")


def extract_playback_id(asset: dict) -> str:
    playback_ids = asset.get("playback_ids") or []
    public_ids = [p for p in playback_ids if p.get("policy") == "public"]
    if not public_ids:
        sys.exit(f"ERROR: no public playback ID on asset: {asset.get('id')}")
    return public_ids[0]["id"]


# ----------------------------------------------------------------------------
# Vercel CLI push
# ----------------------------------------------------------------------------


VALID_NAME = re.compile(r"^[A-Z][A-Z0-9_]*$")


def push_to_vercel(env_var_name: str, value: str) -> None:
    """Push the env var to production, preview, and development on Vercel."""
    if not VALID_NAME.match(env_var_name):
        sys.exit(f"ERROR: invalid env var name {env_var_name!r}")
    print(f"  Pushing {env_var_name} to Vercel (production, preview, development)…")
    for env in ("production", "preview", "development"):
        # Remove the existing value first (idempotency — `vercel env add`
        # errors on existing keys). `vercel env rm --yes` is a no-op when
        # the key doesn't exist.
        rm = subprocess.run(
            ["vercel", "env", "rm", env_var_name, env, "--yes"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        # Don't fail on rm — it errors when the key doesn't exist, which
        # is the normal case on first run.

        add_args = ["vercel", "env", "add", env_var_name, env]
        # --sensitive is supported on production + preview but Vercel CLI
        # rejects it server-side on the development environment. Mirror the
        # pattern from setup-cron-secret.py.
        if env in ("production", "preview"):
            add_args.append("--sensitive")
        add = subprocess.run(
            add_args,
            cwd=REPO_ROOT,
            input=value,
            capture_output=True,
            text=True,
        )
        if add.returncode != 0:
            sys.exit(
                f"ERROR: `vercel env add {env_var_name} {env}` failed:\n"
                f"  stderr: {add.stderr.strip()}\n"
                f"  stdout: {add.stdout.strip()}"
            )
        print(f"    {env}: ok")


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------


def parse_pair(arg: str) -> tuple[Path, str]:
    if "=" not in arg:
        sys.exit(
            f"ERROR: argument {arg!r} should be either two positional args "
            f"(<file> <ENV_VAR>) or one combined `<file>=<ENV_VAR>` arg."
        )
    file_str, var = arg.split("=", 1)
    return Path(file_str.strip()), var.strip()


def validate_args(pairs: list[tuple[Path, str]]) -> None:
    if not pairs:
        sys.exit("ERROR: at least one (file, env-var) pair required.")
    for path, var in pairs:
        if not path.exists():
            sys.exit(f"ERROR: file not found: {path}")
        if not path.is_file():
            sys.exit(f"ERROR: not a regular file: {path}")
        if var not in KNOWN_VARS:
            sys.exit(
                f"ERROR: unknown env var {var!r}. Expected one of: "
                f"{', '.join(sorted(KNOWN_VARS))}"
            )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Upload shoot files to Mux and push the env vars to Vercel.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "args",
        nargs="+",
        help=(
            "Either two positional args `<file.mp4> <ENV_VAR>` for a single "
            "upload, or one or more `<file.mp4>=<ENV_VAR>` pairs for batch."
        ),
    )
    parser.add_argument(
        "--skip-vercel",
        action="store_true",
        help="Upload to Mux but don't push to Vercel — useful for first runs / debugging.",
    )
    args = parser.parse_args()

    # Parse args — support both `<file> <var>` and `<file>=<var>` forms
    pairs: list[tuple[Path, str]] = []
    if len(args.args) == 2 and "=" not in args.args[0] and "=" not in args.args[1]:
        pairs = [(Path(args.args[0]), args.args[1])]
    else:
        pairs = [parse_pair(a) for a in args.args]
    validate_args(pairs)

    token_id, token_secret = read_mux_credentials()

    print(f"Pre-flight OK. {len(pairs)} file(s) to upload.")
    print()

    results: list[tuple[str, str]] = []
    for file_path, env_var_name in pairs:
        print(f"=== {file_path.name} → {env_var_name} ===")
        upload = mux_create_direct_upload(token_id, token_secret)
        upload_id = upload["id"]
        upload_url = upload["url"]
        print(f"  Direct upload id: {upload_id}")
        mux_upload_file(upload_url, file_path)
        asset_id = mux_poll_for_asset(upload_id, token_id, token_secret)
        asset = mux_poll_asset_ready(asset_id, token_id, token_secret)
        playback_id = extract_playback_id(asset)
        print(f"  Playback ID: {playback_id}")

        # Compose the env var value per the contract documented in
        # .env.example: NEXT_PUBLIC_VSL_URL wants the full MP4 URL,
        # FOUNDING_PLV*_PLAYBACK wants the raw playback ID.
        if env_var_name in URL_STYLE_VARS:
            value = f"https://stream.mux.com/{playback_id}/medium.mp4"
        else:
            value = playback_id

        if args.skip_vercel:
            print(f"  --skip-vercel: would push {env_var_name}={value}")
        else:
            push_to_vercel(env_var_name, value)

        results.append((env_var_name, value))
        print()

    print("Done. Summary:")
    for env_var_name, value in results:
        # Print full values — playback IDs and Mux URLs are NOT secrets
        # (they're served publicly by the Mux CDN; anyone with the URL can
        # watch). Token IDs / secrets are different — those never log.
        print(f"  {env_var_name}={value}")
    print()
    print("Vercel envs updated. The next deployment picks them up automatically.")
    print("To trigger a redeploy without a code change:")
    print("  vercel --prod   # or push any commit to main")


if __name__ == "__main__":
    main()
