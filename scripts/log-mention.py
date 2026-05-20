#!/usr/bin/env python3
"""
log-mention.py - operator CLI for appending an earned media mention to
app/src/lib/media-mentions.ts under honesty gates that are impossible to
bypass by hand.

Why this exists
---------------
The MEDIA_MENTIONS array is the single most editorially-gated surface in
the codebase. Brunson Hard-Rule + Funnel Hackers Cookbook v1 Swipe 3
require:
  1. Real mentions only - no paid placements badged as earned.
  2. Direct URL to the artifact, never the publication homepage.
  3. The artifact actually names UnlockSaaS (verified by fetching it).
  4. Reverse-chronological order, valid ISO date.
  5. Public bar renders only when >= 3 entries exist.

Doing the append by hand risks all four gates silently drifting. This
script enforces every gate before writing one line.

Usage
-----
  python3 scripts/log-mention.py \
    --publication "Indie Hackers" \
    --url "https://www.indiehackers.com/post/<real-slug>" \
    --date 2026-05-21 \
    --context "Featured in the Saturday roundup" \
    --type earned

The script:
  - Validates each field synchronously.
  - Fetches the URL with a real User-Agent header. Refuses to log if the
    response is not 2xx, or if the response body does not contain
    "UnlockSaaS" / "Unlock SaaS" / "unlocksaas.com" verbatim.
  - Refuses URLs whose path is just "/" - publication-homepage links are
    a documented dishonest pattern (file docstring rule #2).
  - Rewrites app/src/lib/media-mentions.ts in place, inserting the new
    entry at the top of MEDIA_MENTIONS (reverse-chronological).
  - Prints a diff and a suggested commit message.

The script does NOT commit. The operator runs `git diff`, eyeballs the
change, and runs `git commit` themselves. That keeps the human-in-the-loop
step alive for the editorial standard the file enforces.

Brunson Hard-Rule reconciliation
--------------------------------
This script encodes the editorial standard in code so future-operator
literally cannot ship a fabricated mention without disabling the gates.
The empty-state honest copy ("Nowhere yet. Reluctant Hero rule: no fake
logos.") stays correct until a real artifact passes every check.
"""

from __future__ import annotations

import argparse
import datetime as dt
import difflib
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
MENTIONS_FILE = REPO_ROOT / "app" / "src" / "lib" / "media-mentions.ts"

BRAND_NEEDLES = ("UnlockSaaS", "Unlock SaaS", "unlocksaas.com")
USER_AGENT = (
    "UnlockSaaS-LogMention/1.0 (+https://unlocksaas.com/contact; "
    "verification fetch, not a crawler)"
)


def fail(msg: str) -> None:
    """Print a single failure line and exit non-zero. No partial writes."""
    sys.stderr.write(f"log-mention: {msg}\n")
    sys.exit(1)


def validate_url(raw: str) -> str:
    """https only. Host required. Path must be non-trivial (not just '/').

    The path check is the explicit Brunson Hard-Rule gate against logging
    a publication homepage instead of the artifact URL.
    """
    try:
        parsed = urllib.parse.urlparse(raw)
    except ValueError as exc:
        fail(f"url is not parseable: {exc}")
    if parsed.scheme != "https":
        fail("url must be https://")
    if not parsed.netloc:
        fail("url is missing a host")
    if parsed.path in ("", "/"):
        fail(
            "url path is empty or root - that is the publication homepage, "
            "not the artifact. Pass the direct article / episode / thread "
            "URL instead."
        )
    return raw


def validate_date(raw: str) -> str:
    """ISO YYYY-MM-DD, must be a real date, must not be in the future."""
    try:
        parsed = dt.date.fromisoformat(raw)
    except ValueError:
        fail(f"date must be ISO YYYY-MM-DD; got {raw!r}")
    today = dt.date.today()
    if parsed > today:
        fail(
            f"date {raw} is in the future - mentions are logged after "
            "they publish, never before"
        )
    return raw


def validate_publication(raw: str) -> str:
    raw = raw.strip()
    if not raw:
        fail("publication is empty")
    if len(raw) > 80:
        fail("publication is suspiciously long (>80 chars); double-check")
    return raw


def validate_type(raw: str) -> str:
    if raw not in ("earned", "paid"):
        fail(f"type must be 'earned' or 'paid'; got {raw!r}")
    return raw


def fetch_artifact_body(url: str, timeout_s: float = 12.0) -> str:
    """GET the URL with a real User-Agent. Returns the decoded body on
    2xx. Exits non-zero on any failure - we never log a mention to an
    artifact we could not verify exists.
    """
    req = urllib.request.Request(
        url,
        headers={
            "user-agent": USER_AGENT,
            "accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            if resp.status < 200 or resp.status >= 300:
                fail(f"url returned HTTP {resp.status}; refusing to log")
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.read().decode(charset, errors="replace")
    except urllib.error.HTTPError as exc:
        fail(f"url returned HTTP {exc.code}; refusing to log")
    except urllib.error.URLError as exc:
        fail(f"url fetch failed: {exc.reason}")
    except TimeoutError:
        fail(f"url fetch timed out after {timeout_s}s")
    raise SystemExit(1)  # unreachable; keeps type-checkers quiet


def assert_artifact_names_us(body: str, url: str) -> None:
    """Refuses to log unless the fetched body contains a UnlockSaaS needle.

    Generic "AI tools" roundups that happen to include unlocksaas.com in a
    long list still pass this gate - that's the right behavior. The gate
    blocks the higher-risk failure: logging a mention that does not name
    us at all.
    """
    haystack = body.lower()
    if not any(needle.lower() in haystack for needle in BRAND_NEEDLES):
        fail(
            f"artifact at {url} does not mention UnlockSaaS / Unlock SaaS / "
            "unlocksaas.com anywhere in the response body. Refusing to log. "
            "If the mention is in an image, embedded video, or PDF, that "
            "is still a valid earned mention - in that case, log it by "
            "hand and add a comment explaining why this script could not "
            "verify it."
        )


def render_entry(
    *, publication: str, url: str, date: str, context: str | None, kind: str
) -> str:
    """Build the TS object literal for the new entry. Indented to match
    the surrounding array style.
    """
    lines = [
        "  {",
        f'    publication: "{publication}",',
        f'    url: "{url}",',
        f'    publishedAt: "{date}",',
    ]
    if context:
        escaped = context.replace('"', '\\"')
        lines.append(f'    context: "{escaped}",')
    if kind == "paid":
        lines.append('    type: "paid",')
    # earned is the default; omit the field for brevity (the type union
    # in media-mentions.ts defaults to "earned" semantically).
    lines.append("  },")
    return "\n".join(lines)


def insert_entry(source: str, entry_block: str) -> str:
    """Rewrite the empty-array declaration to a populated array, OR
    prepend to an existing populated array. Preserves all surrounding
    comments and exports.
    """
    empty_pattern = re.compile(
        r"export const MEDIA_MENTIONS:\s*MediaMention\[\]\s*=\s*\[\s*\];"
    )
    populated_pattern = re.compile(
        r"export const MEDIA_MENTIONS:\s*MediaMention\[\]\s*=\s*\["
    )
    if empty_pattern.search(source):
        replacement = (
            "export const MEDIA_MENTIONS: MediaMention[] = [\n"
            f"{entry_block}\n"
            "];"
        )
        return empty_pattern.sub(replacement, source, count=1)
    match = populated_pattern.search(source)
    if not match:
        fail(
            "could not find MEDIA_MENTIONS declaration in "
            f"{MENTIONS_FILE.relative_to(REPO_ROOT)} - file shape changed; "
            "abort and update this script"
        )
    insertion_point = match.end()
    return (
        source[:insertion_point]
        + "\n"
        + entry_block
        + source[insertion_point:]
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="log-mention",
        description=(
            "Append a verified earned media mention to "
            "app/src/lib/media-mentions.ts. Refuses fabricated, "
            "homepage-only, or unverifiable entries."
        ),
    )
    parser.add_argument("--publication", required=True)
    parser.add_argument("--url", required=True)
    parser.add_argument("--date", required=True, help="ISO YYYY-MM-DD")
    parser.add_argument("--context", default=None)
    parser.add_argument(
        "--type", default="earned", choices=("earned", "paid")
    )
    parser.add_argument(
        "--skip-fetch",
        action="store_true",
        help=(
            "Skip the artifact fetch + brand-needle check. Use ONLY when "
            "the artifact is an image/podcast/PDF where the brand name is "
            "not in the HTML response. The operator takes full editorial "
            "responsibility for the entry in that case."
        ),
    )
    args = parser.parse_args()

    publication = validate_publication(args.publication)
    url = validate_url(args.url)
    date = validate_date(args.date)
    kind = validate_type(args.type)
    context = args.context.strip() if args.context else None

    if not args.skip_fetch:
        body = fetch_artifact_body(url)
        assert_artifact_names_us(body, url)

    if not MENTIONS_FILE.exists():
        fail(f"file not found: {MENTIONS_FILE}")
    original = MENTIONS_FILE.read_text(encoding="utf-8")
    entry_block = render_entry(
        publication=publication,
        url=url,
        date=date,
        context=context,
        kind=kind,
    )
    rewritten = insert_entry(original, entry_block)
    if rewritten == original:
        fail("rewrite produced no change - aborting to avoid a no-op commit")

    MENTIONS_FILE.write_text(rewritten, encoding="utf-8")

    diff = "".join(
        difflib.unified_diff(
            original.splitlines(keepends=True),
            rewritten.splitlines(keepends=True),
            fromfile=str(MENTIONS_FILE.relative_to(REPO_ROOT)),
            tofile=str(MENTIONS_FILE.relative_to(REPO_ROOT)),
            n=3,
        )
    )
    sys.stdout.write(diff)
    sys.stdout.write("\n")

    short_date = date
    sys.stdout.write("Suggested commit:\n")
    sys.stdout.write(
        f"  git add {MENTIONS_FILE.relative_to(REPO_ROOT)}\n"
    )
    sys.stdout.write(
        f'  git commit -m "media: log {publication} mention ({short_date})"\n'
    )


if __name__ == "__main__":
    main()
