#!/usr/bin/env python3
"""mint-zenodo-deposit.py - operator CLI for minting a persistent DOI on
the Indie SaaS Teardowns dataset by depositing it on Zenodo.

Why this exists
---------------
Zenodo mints persistent DOIs on deposit. DOIs are the strongest dataset
identifier class Google Dataset Search recognises, the canonical citation
form every academic reference manager (Zotero, Mendeley, EndNote) pivots
on, and propagate into the BibTeX, the citation string, the HF dataset
card, and the canonical Dataset JSON-LD the moment the DOI is set on
Vercel.

The canonical deposition metadata is built by app/src/lib/seo/dataset-zenodo.ts
and served at https://unlocksaas.com/dataset/zenodo/raw as a build-time
constant - identical to the way the Hugging Face dataset card README.md
is served at /dataset/huggingface/raw. This script fetches that payload,
POSTs it to Zenodo's Deposition API, uploads the dataset files to the
returned bucket URL, and publishes the deposit.

Brunson Hard-Rule reconciliation
--------------------------------
This script encodes the editorial standard in code so the operator
cannot accidentally:
  - publish a deposit that does not match the canonical site (the payload
    is fetched live from the canonical URL, never hand-edited)
  - skip the publish step and leave the deposit half-shipped (the script
    refuses to exit until publish succeeds or fails loudly)
  - mint a DOI without authentication (ZENODO_API_TOKEN must be present)
  - hit production without a dry-run (the default mode is dry-run; the
    --confirm flag must be passed explicitly to make real API calls)

Usage
-----
  # Dry-run against production (prints the planned API calls):
  python3 scripts/mint-zenodo-deposit.py

  # Real run against the sandbox (rehearse the flow with a non-resolvable
  # sandbox-scoped DOI):
  export ZENODO_API_TOKEN="<sandbox-token>"
  python3 scripts/mint-zenodo-deposit.py --sandbox --confirm

  # Real run against production:
  export ZENODO_API_TOKEN="<production-token>"
  python3 scripts/mint-zenodo-deposit.py --confirm

On success, prints the bare DOI and the Zenodo record URL. The operator
then pastes both into Vercel under
NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI and NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL
respectively.

Token scopes
------------
The personal access token must carry both:
  - deposit:write   (creates the deposit, uploads files)
  - deposit:actions (publishes the deposit, reserves DOI)

Both are listed under Account Settings -> Applications -> Personal access
tokens on https://zenodo.org (or https://sandbox.zenodo.org for sandbox).

Failure modes
-------------
The script aborts on the first verifiable failure and never partially
ships a deposit. If publish fails after files are uploaded, the deposit
remains as a draft on Zenodo - the operator can either retry publish
manually through the Zenodo UI or delete the draft and re-run the script.
The CLI never deletes deposits on its own.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

CANONICAL_BASE = "https://unlocksaas.com"
DEPOSITION_PAYLOAD_URL = f"{CANONICAL_BASE}/dataset/zenodo/raw"

PRODUCTION_API = "https://zenodo.org/api"
SANDBOX_API = "https://sandbox.zenodo.org/api"

USER_AGENT = (
    "UnlockSaaS-ZenodoMint/1.0 (+https://unlocksaas.com/contact; "
    "operator CLI, not a crawler)"
)


def fail(msg: str, exit_code: int = 1) -> None:
    """Print a single failure line to stderr and exit non-zero."""
    sys.stderr.write(f"mint-zenodo-deposit: {msg}\n")
    sys.exit(exit_code)


def info(msg: str) -> None:
    sys.stdout.write(f"mint-zenodo-deposit: {msg}\n")


# ---------------------------------------------------------------------------
# Step 1 - fetch the canonical deposition payload
# ---------------------------------------------------------------------------


def fetch_payload(url: str, timeout_s: float = 30.0) -> dict:
    """Fetch the deposition metadata payload from the canonical URL.

    The canonical surface is the single source of truth - this CLI never
    hand-builds the metadata. If the canonical surface is unreachable
    (the site is down, the route is broken), we refuse to proceed.
    """
    req = urllib.request.Request(
        url,
        headers={
            "user-agent": USER_AGENT,
            "accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            if resp.status < 200 or resp.status >= 300:
                fail(
                    f"canonical payload at {url} returned HTTP {resp.status}; "
                    "refusing to proceed"
                )
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        fail(f"canonical payload fetch failed with HTTP {exc.code}")
    except urllib.error.URLError as exc:
        fail(f"canonical payload fetch failed: {exc.reason}")
    except TimeoutError:
        fail(f"canonical payload fetch timed out after {timeout_s}s")
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as exc:
        fail(f"canonical payload is not valid JSON: {exc}")
    if not isinstance(parsed, dict) or "metadata" not in parsed:
        fail(
            "canonical payload missing the 'metadata' envelope; "
            "the canonical route may have shipped a malformed payload"
        )
    return parsed


# ---------------------------------------------------------------------------
# Step 2 - resolve the file list
# ---------------------------------------------------------------------------


def resolve_files_from_related(payload: dict) -> list[dict]:
    """Build the file upload list by reading related_identifiers from the
    payload.

    The canonical /dataset/zenodo page renders the same list; we
    re-derive it here so the CLI and the page stay in lock-step without
    a second source of truth. The shape matches ZENODO_DEPOSITION_FILES
    in app/src/lib/seo/dataset-zenodo.ts: every isAlternateIdentifier
    row whose URL points at /dataset/* CSV/JSON/markdown becomes a file
    upload.
    """
    metadata = payload.get("metadata", {})
    related = metadata.get("related_identifiers", [])
    version = metadata.get("version", "unknown")
    version_tag = f"v{version}"

    files: list[dict] = []
    seen: set[str] = set()

    for row in related:
        if row.get("relation") != "isAlternateIdentifier":
            continue
        url = row.get("identifier", "")
        if not url.startswith(CANONICAL_BASE):
            continue
        if url in seen:
            continue
        seen.add(url)

        # Derive filename from URL path. Append a version tag so a
        # future bump uploads under a different filename and Zenodo
        # mints a fresh DOI.
        path = urllib.parse.urlparse(url).path
        base = path.rsplit("/", 1)[-1] or "file"
        # The canonical bundles use slugs like indie-saas-teardowns.json /
        # indie-saas-teardowns.csv / dataset.md / <slug>.csv. Strip the
        # extension, append the version tag, restore the extension.
        if "." in base:
            stem, ext = base.rsplit(".", 1)
            filename = f"{stem}-{version_tag}.{ext}"
        else:
            filename = f"{base}-{version_tag}"
        # Special-case the markdown summary: rename to README-<version>.md
        # so it lands at the top of the Zenodo deposit's file listing.
        if base == "dataset.md":
            filename = f"README-{version_tag}.md"
        files.append(
            {
                "source_url": url,
                "filename": filename,
            }
        )

    if not files:
        fail(
            "no isAlternateIdentifier files derived from the canonical "
            "payload; the payload structure may have changed - re-check "
            "app/src/lib/seo/dataset-zenodo.ts"
        )
    return files


def fetch_file_bytes(url: str, timeout_s: float = 120.0) -> bytes:
    """Download a single dataset file from the canonical site."""
    req = urllib.request.Request(
        url,
        headers={"user-agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            if resp.status < 200 or resp.status >= 300:
                fail(f"file fetch {url} returned HTTP {resp.status}")
            return resp.read()
    except urllib.error.HTTPError as exc:
        fail(f"file fetch {url} failed with HTTP {exc.code}")
    except urllib.error.URLError as exc:
        fail(f"file fetch {url} failed: {exc.reason}")
    except TimeoutError:
        fail(f"file fetch {url} timed out after {timeout_s}s")
    raise SystemExit(1)  # unreachable; keeps type-checkers quiet


# ---------------------------------------------------------------------------
# Step 3 - Zenodo API helpers
# ---------------------------------------------------------------------------


def zenodo_request(
    method: str,
    url: str,
    *,
    token: str,
    json_body: dict | None = None,
    binary_body: bytes | None = None,
    content_type: str | None = None,
    timeout_s: float = 120.0,
) -> dict:
    """Single Zenodo API call. Returns parsed JSON on success; aborts on
    any non-2xx response.

    Zenodo's API uses Bearer token auth on every endpoint. The token is
    passed via env, never logged or printed.
    """
    headers: dict[str, str] = {
        "user-agent": USER_AGENT,
        "authorization": f"Bearer {token}",
    }
    data: bytes | None = None
    if json_body is not None:
        data = json.dumps(json_body).encode("utf-8")
        headers["content-type"] = "application/json"
    elif binary_body is not None:
        data = binary_body
        if content_type:
            headers["content-type"] = content_type

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            status = resp.status
            body = resp.read().decode("utf-8") if resp.length != 0 else ""
            if status < 200 or status >= 300:
                fail(
                    f"Zenodo API {method} {url} returned HTTP {status}: "
                    f"{body[:500]}"
                )
            if not body:
                return {}
            try:
                return json.loads(body)
            except json.JSONDecodeError:
                # PUT to the bucket returns an empty body or a minimal
                # JSON object; either case is success when status is 2xx.
                return {}
    except urllib.error.HTTPError as exc:
        try:
            err_body = exc.read().decode("utf-8")
        except Exception:
            err_body = "<unreadable body>"
        fail(
            f"Zenodo API {method} {url} failed: HTTP {exc.code} {err_body[:500]}"
        )
    except urllib.error.URLError as exc:
        fail(f"Zenodo API {method} {url} failed: {exc.reason}")
    except TimeoutError:
        fail(f"Zenodo API {method} {url} timed out after {timeout_s}s")
    raise SystemExit(1)


def create_deposition(api_base: str, token: str, payload: dict) -> dict:
    """POST /api/deposit/depositions with the metadata envelope."""
    return zenodo_request(
        "POST",
        f"{api_base}/deposit/depositions",
        token=token,
        json_body=payload,
    )


def upload_file_to_bucket(
    bucket_url: str,
    filename: str,
    body: bytes,
    token: str,
) -> dict:
    """PUT <bucket_url>/<filename> with the binary body.

    The Zenodo "new file API" uses the bucket URL returned by
    create_deposition under links.bucket. PUT semantics: the body is
    the file content; the URL path includes the filename.
    """
    target = f"{bucket_url}/{urllib.parse.quote(filename)}"
    # Best-guess content type based on extension. Zenodo accepts
    # arbitrary content; the type just informs the deposit UI.
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    content_type = {
        "json": "application/json",
        "csv": "text/csv",
        "md": "text/markdown",
    }.get(ext, "application/octet-stream")
    return zenodo_request(
        "PUT",
        target,
        token=token,
        binary_body=body,
        content_type=content_type,
    )


def publish_deposition(api_base: str, token: str, deposition_id: int) -> dict:
    """POST /api/deposit/depositions/<id>/actions/publish."""
    return zenodo_request(
        "POST",
        f"{api_base}/deposit/depositions/{deposition_id}/actions/publish",
        token=token,
    )


# ---------------------------------------------------------------------------
# Main flow
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="mint-zenodo-deposit",
        description=(
            "Mint a persistent DOI for the Indie SaaS Teardowns dataset "
            "by depositing it on Zenodo. The canonical metadata payload "
            "and the file list are fetched from the canonical site so "
            "the deposit cannot drift from /dataset."
        ),
    )
    parser.add_argument(
        "--sandbox",
        action="store_true",
        help=(
            "Target sandbox.zenodo.org instead of production. The "
            "sandbox accepts the same payload shape; DOIs minted on the "
            "sandbox are not resolvable. Use this to rehearse the flow."
        ),
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help=(
            "Required for real execution. Without this flag the script "
            "fetches the payload, resolves the file list, and prints the "
            "planned API calls without contacting Zenodo. This is the "
            "default to prevent an accidental real-DOI mint."
        ),
    )
    parser.add_argument(
        "--payload-url",
        default=DEPOSITION_PAYLOAD_URL,
        help=(
            "Override the canonical deposition payload URL. Default: "
            f"{DEPOSITION_PAYLOAD_URL}. Use this only when testing "
            "against a preview deploy."
        ),
    )
    args = parser.parse_args()

    api_base = SANDBOX_API if args.sandbox else PRODUCTION_API
    environment = "SANDBOX" if args.sandbox else "PRODUCTION"

    info(f"environment: {environment} ({api_base})")
    info(f"payload URL: {args.payload_url}")

    # Step 1: fetch canonical payload.
    payload = fetch_payload(args.payload_url)
    metadata = payload["metadata"]
    info(f"fetched deposition payload for: {metadata.get('title')}")
    info(f"  upload_type: {metadata.get('upload_type')}")
    info(f"  version: {metadata.get('version')}")
    info(f"  publication_date: {metadata.get('publication_date')}")
    info(f"  license: {metadata.get('license')}")
    info(f"  keywords: {len(metadata.get('keywords', []))} entries")
    info(
        f"  related_identifiers: {len(metadata.get('related_identifiers', []))} entries"
    )

    # Step 2: resolve file list.
    files = resolve_files_from_related(payload)
    info(f"resolved {len(files)} files to upload:")
    for f in files:
        info(f"  - {f['filename']}  <- {f['source_url']}")

    # Dry-run gate.
    if not args.confirm:
        info("")
        info("DRY-RUN. Re-run with --confirm to actually mint the DOI.")
        info(
            "Planned API calls: 1x POST /deposit/depositions, "
            f"{len(files)}x PUT <bucket>/<filename>, "
            "1x POST /deposit/depositions/<id>/actions/publish."
        )
        return

    # Real run requires token.
    token = os.environ.get("ZENODO_API_TOKEN", "").strip()
    if not token:
        fail(
            "ZENODO_API_TOKEN env var is unset. Generate a personal "
            "access token at https://zenodo.org/account/settings/applications/ "
            "(or https://sandbox.zenodo.org/account/settings/applications/ "
            "for sandbox) with scopes deposit:write + deposit:actions, "
            "then export it before re-running."
        )

    # Step 3: create deposition.
    info("creating deposition...")
    created = create_deposition(api_base, token, payload)
    deposition_id = created.get("id")
    bucket_url = created.get("links", {}).get("bucket")
    if not deposition_id or not bucket_url:
        fail(
            "create_deposition response missing id/links.bucket; "
            f"raw response: {json.dumps(created)[:500]}"
        )
    info(f"deposition created: id={deposition_id}")
    info(f"bucket URL: {bucket_url}")

    # Step 4: upload files.
    for index, file_spec in enumerate(files, start=1):
        info(
            f"  [{index}/{len(files)}] downloading {file_spec['source_url']}"
        )
        body = fetch_file_bytes(file_spec["source_url"])
        info(
            f"  [{index}/{len(files)}] uploading {file_spec['filename']} "
            f"({len(body)} bytes)"
        )
        upload_file_to_bucket(bucket_url, file_spec["filename"], body, token)

    # Step 5: publish.
    info("publishing deposition (mints the DOI)...")
    published = publish_deposition(api_base, token, deposition_id)
    bare_doi = published.get("doi") or published.get("metadata", {}).get("doi")
    record_url = (
        published.get("links", {}).get("record_html")
        or published.get("links", {}).get("html")
    )
    if not bare_doi or not record_url:
        fail(
            "publish response missing doi/record URL; deposit is published "
            "but the script could not extract the canonical identifiers - "
            "check the Zenodo UI manually for the record. "
            f"Raw response: {json.dumps(published)[:500]}"
        )

    info("")
    info("=" * 60)
    info("DOI minted successfully.")
    info("=" * 60)
    info(f"  DOI: {bare_doi}")
    info(f"  DOI URL: https://doi.org/{bare_doi}")
    info(f"  Record URL: {record_url}")
    info("")
    info("Next: set both env vars on Vercel and redeploy:")
    info(
        f"  vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI production"
    )
    info(f"    (paste {bare_doi})")
    info(
        f"  vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL production"
    )
    info(f"    (paste {record_url})")
    info("")
    info("Done.")


if __name__ == "__main__":
    main()
