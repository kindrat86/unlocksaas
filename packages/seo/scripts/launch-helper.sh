#!/usr/bin/env bash
# launch-helper.sh — paste-ready launch sequencer for @unlocksaas/seo.
#
# Each subcommand:
#   1. Prints the optimal launch window (informational, not enforced).
#   2. Opens the platform's submission URL in the default browser.
#   3. Copies the post TITLE to the clipboard (pbcopy on macOS).
#   4. Points you at the marketing/*.md file for body + first-comment paste.
#   5. Reminds you of the platform-specific rules (e.g. /r/SaaS auto-removes
#      links from the body, so the link goes in the first comment).
#
# Usage:
#   ./launch-helper.sh hn                  # Show HN
#   ./launch-helper.sh ih                  # Indie Hackers
#   ./launch-helper.sh reddit-saas         # /r/SaaS
#   ./launch-helper.sh reddit-programming  # /r/programming
#   ./launch-helper.sh twitter             # X/Twitter thread
#   ./launch-helper.sh verify-twitter      # Re-audit tweet character counts
#   ./launch-helper.sh help                # This banner
#
# Portable across bash 3.2 (macOS default) and bash 4+ and zsh.
# No associative arrays — every per-platform datum is resolved via case.
#
# This script does NOT submit anything. It only primes your workspace.
# Submission is always a deliberate manual click.

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
MARKETING="$HERE/../marketing"

# ANSI color helpers (turned off if stdout is not a TTY or NO_COLOR is set).
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m' ; DIM=$'\033[2m' ; CYAN=$'\033[36m' ; YELLOW=$'\033[33m' ; GREEN=$'\033[32m' ; RESET=$'\033[0m'
else
  BOLD="" ; DIM="" ; CYAN="" ; YELLOW="" ; GREEN="" ; RESET=""
fi

clipboard_copy() {
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy
  elif command -v xclip >/dev/null 2>&1; then
    xclip -selection clipboard
  elif command -v wl-copy >/dev/null 2>&1; then
    wl-copy
  else
    cat >/dev/null
    return 1
  fi
}

open_url() {
  if command -v open >/dev/null 2>&1; then
    open "$1"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$1" >/dev/null 2>&1 &
  else
    echo "${YELLOW}WARN${RESET} No URL-open command found. Open this manually: $1"
  fi
}

# -----------------------------------------------------------------------
# Per-platform data — case statements for bash 3.2 compatibility.
# Edit here if you change titles or windows in the marketing/*.md files.
# -----------------------------------------------------------------------

submit_url_for() {
  case "$1" in
    hn) echo "https://news.ycombinator.com/submit" ;;
    ih) echo "https://www.indiehackers.com/post/new" ;;
    reddit-saas) echo "https://www.reddit.com/r/SaaS/submit" ;;
    reddit-programming) echo "https://www.reddit.com/r/programming/submit" ;;
    twitter) echo "https://x.com/compose/post" ;;
    *) return 1 ;;
  esac
}

window_for() {
  case "$1" in
    hn) echo "Tuesday or Wednesday 08:00 to 10:00 PT (18:00 to 20:00 Athens)" ;;
    ih) echo "Tuesday to Thursday morning, after HN has settled (~4h later)" ;;
    reddit-saas) echo "Wednesday or Thursday 09:00 to 11:00 US Eastern (16:00 to 18:00 Athens)" ;;
    reddit-programming) echo "Tuesday or Wednesday 09:00 to 11:00 US Eastern. Wait 72h after r/SaaS post." ;;
    twitter) echo "Same day as Show HN, ~30 minutes BEFORE the HN submission" ;;
    *) return 1 ;;
  esac
}

title_for() {
  case "$1" in
    hn) echo "Show HN: An SEO library that refuses to ship fabricated aggregateRating" ;;
    ih) echo "I extracted my SEO library from my SaaS – it refuses to emit fabricated review counts" ;;
    reddit-saas) echo "The 3 JSON-LD mistakes that silently demote your SaaS from AI Overviews" ;;
    reddit-programming) echo "A CLI that diffs JSON-LD claims against rendered HTML" ;;
    twitter) echo "" ;;
    *) return 1 ;;
  esac
}

draft_file_for() {
  case "$1" in
    hn) echo "show-hn.md" ;;
    ih) echo "indiehackers.md" ;;
    reddit-saas) echo "reddit-saas.md" ;;
    reddit-programming) echo "reddit-programming.md" ;;
    twitter) echo "twitter-thread.md" ;;
    *) return 1 ;;
  esac
}

print_reminders() {
  case "$1" in
    hn)
      echo "${YELLOW}Reminders:${RESET}"
      echo "  • Use the URL field only — do NOT paste the body in 'text'"
      echo "  • Within 60 seconds, paste the TOP COMMENT as a reply"
      echo "  • Reply to every comment within 15 minutes for the first 4h"
      ;;
    reddit-saas)
      echo "${YELLOW}Reminders:${RESET}"
      echo "  • Pick TEXT post (not Link) — link in body auto-removes"
      echo "  • Link goes in the FIRST COMMENT only"
      echo "  • No product name in the title — auto-removes"
      ;;
    reddit-programming)
      echo "${YELLOW}Reminders:${RESET}"
      echo "  • Pick LINK post — the GitHub repo IS the link"
      echo "  • First comment must be the technical-decisions seed, not pitch"
      echo "  • Wait 72h+ after r/SaaS to avoid double-dip detection"
      ;;
    twitter)
      echo "${YELLOW}Reminders:${RESET}"
      echo "  • Paste tweet-by-tweet, hit 'Add' between each (7 tweets total)"
      echo "  • Pin tweet 1 to your profile for 48h after posting"
      echo "  • Run \`./launch-helper.sh verify-twitter\` if you edited anything"
      ;;
    ih)
      echo "${YELLOW}Reminders:${RESET}"
      echo "  • Category: Building (NOT Marketing)"
      echo "  • Within 5 minutes, post the FIRST-COMMENT seed as a reply"
      echo "  • Reference Show HN only if HN hit front page; otherwise omit"
      ;;
  esac
}

# -----------------------------------------------------------------------
# Per-platform launcher
# -----------------------------------------------------------------------

launch_platform() {
  local platform="$1"
  local url window title draft

  if ! url="$(submit_url_for "$platform")"; then
    echo "${YELLOW}Unknown platform:${RESET} $platform"
    print_help
    exit 2
  fi
  window="$(window_for "$platform")"
  title="$(title_for "$platform")"
  draft="$(draft_file_for "$platform")"

  echo ""
  echo "${BOLD}$platform launch — @unlocksaas/seo${RESET}"
  echo "${DIM}Optimal window: $window${RESET}"
  echo ""

  if [ -n "$title" ]; then
    echo "${BOLD}Title:${RESET}"
    echo "  $title"
    echo ""
    if printf '%s' "$title" | clipboard_copy; then
      echo "${GREEN}✓${RESET} Title copied to clipboard."
    else
      echo "${YELLOW}WARN${RESET} No clipboard tool available. Copy the title manually."
    fi
    echo ""
  fi

  echo "${BOLD}Opening submission page:${RESET} $url"
  open_url "$url"
  echo ""

  if [ -n "$draft" ] && [ -f "$MARKETING/$draft" ]; then
    echo "${BOLD}Body + first-comment are in:${RESET}"
    echo "  $MARKETING/$draft"
    echo ""
    echo "${DIM}Open the ⚡ PASTE-READY block at the top of that file.${RESET}"
    echo ""
  fi

  print_reminders "$platform"
  echo ""
}

# -----------------------------------------------------------------------
# Twitter character-count audit
# -----------------------------------------------------------------------

verify_twitter() {
  local file="$MARKETING/twitter-thread.md"
  if [ ! -f "$file" ]; then
    echo "${YELLOW}Missing:${RESET} $file"
    exit 2
  fi
  echo "${BOLD}Verifying tweet character counts in $file${RESET}"
  echo ""
  python3 - "$file" <<'PY'
import re, sys
with open(sys.argv[1]) as f:
    text = f.read()
blocks = re.findall(r"\*\*Tweet (\d/7).*?\n```\n(.*?)\n```", text, re.DOTALL)
TWITTER_URL_LEN = 23
print(f"{'Tweet':<8}{'Chars':>8}{'Limit':>8}{'Margin':>10}  Status")
print("-" * 50)
all_ok = True
for label, body in blocks:
    norm = re.sub(r"https?://\S+", "X" * TWITTER_URL_LEN, body)
    chars = len(norm)
    margin = 280 - chars
    status = "OK" if chars <= 280 else "OVER"
    if chars > 280: all_ok = False
    print(f"{label:<8}{chars:>8}{280:>8}{margin:>10}  {status}")
sys.exit(0 if all_ok else 1)
PY
}

print_help() {
  cat <<EOF
${BOLD}launch-helper.sh${RESET} — paste-ready launch sequencer for @unlocksaas/seo.

${BOLD}Subcommands:${RESET}
  ${CYAN}hn${RESET}                   Show HN (Tue/Wed 08:00-10:00 PT)
  ${CYAN}ih${RESET}                   Indie Hackers (after HN has settled)
  ${CYAN}reddit-saas${RESET}          /r/SaaS (Wed/Thu 09:00-11:00 ET)
  ${CYAN}reddit-programming${RESET}   /r/programming (72h+ after r/SaaS)
  ${CYAN}twitter${RESET}              X/Twitter thread (30 min before HN)
  ${CYAN}verify-twitter${RESET}       Re-audit tweet character counts
  ${CYAN}help${RESET}                 This banner

Each platform subcommand:
  1. Prints the optimal submission window
  2. Opens the submission URL in your default browser
  3. Copies the post title to your clipboard
  4. Points you at the marketing/*.md file for body + first-comment paste
  5. Reminds you of the platform-specific rules

This script does NOT submit anything for you. It only primes your workspace.

${DIM}https://unlocksaas.com${RESET}
EOF
}

# -----------------------------------------------------------------------
# Dispatch
# -----------------------------------------------------------------------

cmd="${1:-help}"
case "$cmd" in
  hn|ih|reddit-saas|reddit-programming|twitter)
    launch_platform "$cmd"
    ;;
  verify-twitter)
    verify_twitter
    ;;
  help|-h|--help)
    print_help
    ;;
  *)
    echo "${YELLOW}Unknown subcommand:${RESET} $cmd"
    print_help
    exit 2
    ;;
esac
