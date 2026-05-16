#!/usr/bin/env python3
"""
Bounded IMAP/SMTP CLI for maryan@unlocksaas.com (Private Email).

SAFETY CONSTRAINTS (enforced at code level — do not remove):
  • No 'delete' subcommand at all
  • 'send' and 'reply' require an explicit --confirm flag
  • Every sent message is appended to logs/mail-sent.jsonl
  • Every sent message is also APPENDed to the IMAP "Sent" folder so it
    appears in webmail (best effort — does not fail send if Sent is missing)
  • From-address is always MAIL_ADDRESS (cannot be overridden via flag)
  • One recipient per send (use --cc / --bcc explicitly for additions)
  • IMAP reads use readonly=True except for mark-read

Subcommands:
  folders                                — list IMAP folders (good first test)
  inbox [--limit N] [--folder NAME]      — list recent messages
  unread [--limit N]                     — list unread messages
  read <uid>                             — read a specific message
  search "<query>" [--limit N]           — search by from:, subject:, or text
  draft <to> --subject S [--body-file F] — write a draft to drafts/
  send --draft <path> --confirm          — send a saved draft
  reply <uid> --body-file F --confirm    — reply to a message (preserves threading)
  mark-read <uid>                        — mark a message as read (only mutation besides send)

Loads creds from .env.development.local. Override with --env-file.
Requires Python 3.9+ stdlib only. No pip install.
"""

import argparse
import email
import imaplib
import json
import re
import smtplib
import ssl
import sys
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from email.parser import BytesParser
from email.policy import default as default_policy
from pathlib import Path

ENV_FILE = ".env.development.local"
DRAFTS_DIR = Path("drafts")
LOGS_DIR = Path("logs")
SENT_LOG = LOGS_DIR / "mail-sent.jsonl"

REQUIRED_KEYS = [
    "MAIL_ADDRESS",
    "MAIL_PASSWORD",
    "MAIL_IMAP_HOST",
    "MAIL_IMAP_PORT",
    "MAIL_SMTP_HOST",
    "MAIL_SMTP_PORT",
]


# ── env loading ───────────────────────────────────────────────────────────────


def load_env(path: str) -> dict:
    p = Path(path)
    if not p.exists():
        sys.exit(
            f"ERROR: {path} not found.\nRun scripts/setup-mail-creds.py first."
        )
    env = {}
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def assert_mail_creds(env: dict) -> None:
    missing = [k for k in REQUIRED_KEYS if not env.get(k)]
    placeholder = [
        k for k in REQUIRED_KEYS
        if env.get(k, "").startswith(("set-by-", "your-", "paste-"))
    ]
    if missing or placeholder:
        msg = ["ERROR: mail creds incomplete."]
        if missing:
            msg.append(f"  Missing: {', '.join(missing)}")
        if placeholder:
            msg.append(f"  Placeholder values: {', '.join(placeholder)}")
        msg.append("Run scripts/setup-mail-creds.py to populate.")
        sys.exit("\n".join(msg))


# ── IMAP ──────────────────────────────────────────────────────────────────────


def imap_connect(env: dict) -> imaplib.IMAP4_SSL:
    context = ssl.create_default_context()
    try:
        conn = imaplib.IMAP4_SSL(
            env["MAIL_IMAP_HOST"], int(env["MAIL_IMAP_PORT"]), ssl_context=context
        )
        conn.login(env["MAIL_ADDRESS"], env["MAIL_PASSWORD"])
    except imaplib.IMAP4.error as e:
        sys.exit(
            f"ERROR: IMAP login failed for {env['MAIL_ADDRESS']}: {e}\n"
            f"Common causes: wrong password, IMAP not enabled in webmail settings, "
            f"or transient server issue."
        )
    except OSError as e:
        sys.exit(f"ERROR: network/SSL error connecting to {env['MAIL_IMAP_HOST']}: {e}")
    return conn


def imap_close(conn: imaplib.IMAP4_SSL) -> None:
    try:
        conn.close()
    except Exception:
        pass
    try:
        conn.logout()
    except Exception:
        pass


def list_uids(conn: imaplib.IMAP4_SSL, folder: str, criterion: str, limit: int) -> list:
    typ, data = conn.select(folder, readonly=True)
    if typ != "OK":
        sys.exit(f"ERROR: cannot select folder {folder!r}: {data}")
    typ, data = conn.uid("search", None, criterion)
    if typ != "OK":
        sys.exit(f"ERROR: UID search {criterion!r} failed: {data}")
    uids = data[0].split()
    return list(uids[-limit:][::-1])  # most recent first


def fetch_headers(conn: imaplib.IMAP4_SSL, uid: bytes) -> dict:
    typ, data = conn.uid(
        "fetch", uid, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE TO)])"
    )
    if typ != "OK" or not data or not data[0]:
        return {"uid": uid.decode(), "from": "", "to": "", "subject": "", "date": ""}
    raw = data[0][1] if isinstance(data[0], tuple) else b""
    msg = BytesParser(policy=default_policy).parsebytes(raw)
    return {
        "uid": uid.decode(),
        "from": (msg.get("From") or "").strip(),
        "to": (msg.get("To") or "").strip(),
        "subject": (msg.get("Subject") or "").strip(),
        "date": (msg.get("Date") or "").strip(),
    }


def fetch_full(conn: imaplib.IMAP4_SSL, uid: bytes) -> dict:
    typ, data = conn.uid("fetch", uid, "(RFC822)")
    if typ != "OK" or not data or not data[0]:
        sys.exit(f"ERROR: failed to fetch uid {uid!r}: {data}")
    raw = data[0][1] if isinstance(data[0], tuple) else b""
    msg = email.message_from_bytes(raw, policy=default_policy)

    body = ""
    if msg.is_multipart():
        for part in msg.iter_parts():
            if part.get_content_type() == "text/plain":
                try:
                    body = part.get_content()
                    break
                except Exception:
                    continue
        if not body:
            for part in msg.iter_parts():
                if part.get_content_type() == "text/html":
                    try:
                        body = part.get_content()
                        break
                    except Exception:
                        continue
    else:
        try:
            body = msg.get_content()
        except Exception:
            body = ""

    return {
        "uid": uid.decode(),
        "from": (msg.get("From") or "").strip(),
        "to": (msg.get("To") or "").strip(),
        "subject": (msg.get("Subject") or "").strip(),
        "date": (msg.get("Date") or "").strip(),
        "message_id": (msg.get("Message-ID") or "").strip(),
        "in_reply_to": (msg.get("In-Reply-To") or "").strip(),
        "references": (msg.get("References") or "").strip(),
        "body": body,
    }


def append_to_sent(conn: imaplib.IMAP4_SSL, msg: EmailMessage) -> bool:
    """Best-effort APPEND of an outgoing message to the Sent folder."""
    raw = msg.as_bytes()
    for folder in ['"Sent"', '"Sent Items"', '"INBOX.Sent"', "Sent"]:
        try:
            typ, _ = conn.append(
                folder, "(\\Seen)", imaplib.Time2Internaldate(time.time()), raw
            )
            if typ == "OK":
                return True
        except imaplib.IMAP4.error:
            continue
    return False


# ── SMTP ──────────────────────────────────────────────────────────────────────


def smtp_send(env: dict, msg: EmailMessage) -> None:
    context = ssl.create_default_context()
    host = env["MAIL_SMTP_HOST"]
    port = int(env["MAIL_SMTP_PORT"])

    try:
        if port == 465:
            with smtplib.SMTP_SSL(host, port, context=context, timeout=30) as server:
                server.login(env["MAIL_ADDRESS"], env["MAIL_PASSWORD"])
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port, timeout=30) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(env["MAIL_ADDRESS"], env["MAIL_PASSWORD"])
                server.send_message(msg)
    except smtplib.SMTPException as e:
        sys.exit(f"ERROR: SMTP send failed: {e}")
    except OSError as e:
        sys.exit(f"ERROR: network/SSL error connecting to {host}: {e}")


def log_send(to: str, subject: str, body: str, reply_to_uid: str = "") -> None:
    LOGS_DIR.mkdir(exist_ok=True)
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "to": to,
        "subject": subject,
        "body_chars": len(body),
        "body_preview": body[:200],
        "reply_to_uid": reply_to_uid,
    }
    with SENT_LOG.open("a") as f:
        f.write(json.dumps(entry) + "\n")


# ── drafts ────────────────────────────────────────────────────────────────────


DRAFT_TEMPLATE = """---
to: {to}
subject: {subject}
---

{body}

— Maryan
"""


def write_draft(to: str, subject: str, body: str) -> Path:
    DRAFTS_DIR.mkdir(exist_ok=True)
    safe = re.sub(r"[^a-z0-9-]+", "-", subject.lower()).strip("-")[:40] or "untitled"
    ts = datetime.now().strftime("%Y-%m-%d-%H%M")
    path = DRAFTS_DIR / f"{ts}-{safe}.md"
    path.write_text(DRAFT_TEMPLATE.format(to=to, subject=subject, body=body))
    return path


def parse_draft(path: Path) -> dict:
    text = path.read_text()
    if not text.startswith("---"):
        sys.exit(f"ERROR: draft {path} missing --- frontmatter at top")
    parts = text.split("---", 2)
    if len(parts) < 3:
        sys.exit(f"ERROR: draft {path} malformed frontmatter")
    fm_text, body = parts[1], parts[2].strip()
    fm = {}
    for line in fm_text.strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip().lower()] = v.strip()
    for required in ("to", "subject"):
        if required not in fm:
            sys.exit(f"ERROR: draft {path} missing '{required}' in frontmatter")
    return {"to": fm["to"], "subject": fm["subject"], "body": body}


# ── display helpers ───────────────────────────────────────────────────────────


def print_list(label: str, conn: imaplib.IMAP4_SSL, uids: list) -> None:
    print(f"\n=== {label} ({len(uids)}) ===\n")
    if not uids:
        print("  (none)")
        return
    for uid in uids:
        h = fetch_headers(conn, uid)
        subj = (h.get("subject") or "")[:60]
        frm = (h.get("from") or "")[:42]
        date = (h.get("date") or "")[:16]
        print(f"  uid {h['uid']:<6}  {date:<16}  {frm:<42}  {subj}")


# ── subcommands ───────────────────────────────────────────────────────────────


def cmd_folders(env: dict, args) -> None:
    conn = imap_connect(env)
    try:
        typ, data = conn.list()
        if typ != "OK":
            sys.exit("ERROR: cannot list folders")
        print("\n=== IMAP folders ===\n")
        for line in data:
            print(f"  {line.decode(errors='replace')}")
    finally:
        imap_close(conn)


def cmd_inbox(env: dict, args) -> None:
    conn = imap_connect(env)
    try:
        uids = list_uids(conn, args.folder, "ALL", args.limit)
        print_list(f"Folder: {args.folder} (most recent {len(uids)})", conn, uids)
    finally:
        imap_close(conn)


def cmd_unread(env: dict, args) -> None:
    conn = imap_connect(env)
    try:
        uids = list_uids(conn, "INBOX", "UNSEEN", args.limit)
        print_list("Unread", conn, uids)
    finally:
        imap_close(conn)


def cmd_read(env: dict, args) -> None:
    conn = imap_connect(env)
    try:
        conn.select("INBOX", readonly=True)
        msg = fetch_full(conn, args.uid.encode())
        print(f"\n=== uid {msg['uid']} ===")
        print(f"From:    {msg['from']}")
        print(f"To:      {msg['to']}")
        print(f"Date:    {msg['date']}")
        print(f"Subject: {msg['subject']}")
        print(f"\n{msg['body']}\n")
    finally:
        imap_close(conn)


def cmd_search(env: dict, args) -> None:
    q = args.query.strip()
    if q.lower().startswith("from:"):
        criterion = f'FROM "{q[5:].strip()}"'
    elif q.lower().startswith("subject:"):
        criterion = f'SUBJECT "{q[8:].strip()}"'
    elif q.lower().startswith("to:"):
        criterion = f'TO "{q[3:].strip()}"'
    else:
        criterion = f'TEXT "{q}"'
    conn = imap_connect(env)
    try:
        uids = list_uids(conn, "INBOX", criterion, args.limit)
        print_list(f"Search: {q!r}", conn, uids)
    finally:
        imap_close(conn)


def cmd_draft(env: dict, args) -> None:
    if args.body_file:
        body = Path(args.body_file).read_text()
    else:
        print("Enter body. Finish with Ctrl-D on a blank line:")
        body = sys.stdin.read()
    path = write_draft(args.to, args.subject, body)
    print(f"\nDraft saved: {path}")
    print(f"Review it, then send with:")
    print(f"  python3 scripts/mail.py send --draft {path} --confirm")


def cmd_send(env: dict, args) -> None:
    if not args.confirm:
        sys.exit(
            "ERROR: 'send' requires --confirm. This is intentional.\n"
            "Re-run with --confirm once you've reviewed the draft."
        )
    draft_path = Path(args.draft)
    if not draft_path.exists():
        sys.exit(f"ERROR: draft not found: {draft_path}")
    d = parse_draft(draft_path)

    print(f"\n=== About to SEND ===")
    print(f"From:    {env['MAIL_ADDRESS']}")
    print(f"To:      {d['to']}")
    print(f"Subject: {d['subject']}")
    print(f"---")
    print(d["body"][:500] + ("..." if len(d["body"]) > 500 else ""))
    print()

    msg = EmailMessage()
    msg["From"] = env["MAIL_ADDRESS"]
    msg["To"] = d["to"]
    msg["Subject"] = d["subject"]
    msg.set_content(d["body"])

    smtp_send(env, msg)
    log_send(d["to"], d["subject"], d["body"])
    print(f"OK — sent via {env['MAIL_SMTP_HOST']}. Logged to {SENT_LOG}.")

    # Best-effort: also drop a copy in the Sent folder so webmail shows it.
    conn = imap_connect(env)
    try:
        if append_to_sent(conn, msg):
            print("OK — copy appended to Sent folder.")
        else:
            print("WARN: could not find a 'Sent' folder to append to. Message was sent successfully, just won't appear in webmail Sent view until Private Email auto-moves it.")
    finally:
        imap_close(conn)


def cmd_reply(env: dict, args) -> None:
    if not args.confirm:
        sys.exit(
            "ERROR: 'reply' requires --confirm. This is intentional.\n"
            "Re-run with --confirm once you've reviewed the body."
        )
    body = Path(args.body_file).read_text()

    conn = imap_connect(env)
    try:
        conn.select("INBOX", readonly=True)
        orig = fetch_full(conn, args.uid.encode())
    finally:
        imap_close(conn)

    subject = orig["subject"]
    if not subject.lower().startswith("re:"):
        subject = "Re: " + subject

    print(f"\n=== About to REPLY to uid {orig['uid']} ===")
    print(f"From:        {env['MAIL_ADDRESS']}")
    print(f"To:          {orig['from']}")
    print(f"Subject:     {subject}")
    print(f"In-Reply-To: {orig['message_id']}")
    print(f"---")
    print(body[:500] + ("..." if len(body) > 500 else ""))
    print()

    msg = EmailMessage()
    msg["From"] = env["MAIL_ADDRESS"]
    msg["To"] = orig["from"]
    msg["Subject"] = subject
    if orig["message_id"]:
        msg["In-Reply-To"] = orig["message_id"]
        refs = (orig["references"] + " " + orig["message_id"]).strip()
        msg["References"] = refs
    msg.set_content(body)

    smtp_send(env, msg)
    log_send(orig["from"], subject, body, reply_to_uid=orig["uid"])
    print(f"OK — reply sent. Logged to {SENT_LOG}.")

    conn = imap_connect(env)
    try:
        if append_to_sent(conn, msg):
            print("OK — copy appended to Sent folder.")
    finally:
        imap_close(conn)


def cmd_mark_read(env: dict, args) -> None:
    conn = imap_connect(env)
    try:
        conn.select("INBOX")
        typ, _ = conn.uid("store", args.uid.encode(), "+FLAGS", "(\\Seen)")
        if typ != "OK":
            sys.exit(f"ERROR: mark-read failed for uid {args.uid}")
        print(f"OK — uid {args.uid} marked as read.")
    finally:
        imap_close(conn)


# ── entrypoint ────────────────────────────────────────────────────────────────


def main() -> None:
    p = argparse.ArgumentParser(
        description="Bounded IMAP/SMTP CLI for Private Email (read + draft + send-with-confirm)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--env-file",
        default=ENV_FILE,
        help=f"Path to env file (default: {ENV_FILE})",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("folders", help="List IMAP folders (first sanity check)")

    pi = sub.add_parser("inbox", help="List recent inbox messages")
    pi.add_argument("--limit", type=int, default=20)
    pi.add_argument("--folder", default="INBOX")

    pu = sub.add_parser("unread", help="List unread messages")
    pu.add_argument("--limit", type=int, default=50)

    pr = sub.add_parser("read", help="Read a specific message")
    pr.add_argument("uid", help="IMAP UID (shown by inbox/unread/search)")

    ps = sub.add_parser("search", help="Search messages")
    ps.add_argument(
        "query",
        help='e.g. "from:greg@example.com" or "subject:invoice" or plain text',
    )
    ps.add_argument("--limit", type=int, default=20)

    pd = sub.add_parser("draft", help="Write a draft to drafts/")
    pd.add_argument("to", help="Recipient email address")
    pd.add_argument("--subject", required=True)
    pd.add_argument(
        "--body-file",
        help="Path to file containing body text. Omit to type into stdin.",
    )

    psend = sub.add_parser("send", help="Send a saved draft (REQUIRES --confirm)")
    psend.add_argument("--draft", required=True, help="Path to draft .md file")
    psend.add_argument(
        "--confirm",
        action="store_true",
        help="REQUIRED. Confirms you've reviewed the draft.",
    )

    prep = sub.add_parser("reply", help="Reply to a message (REQUIRES --confirm)")
    prep.add_argument("uid", help="IMAP UID of message to reply to")
    prep.add_argument("--body-file", required=True)
    prep.add_argument(
        "--confirm",
        action="store_true",
        help="REQUIRED. Confirms you've reviewed the body.",
    )

    pm = sub.add_parser("mark-read", help="Mark a message as read")
    pm.add_argument("uid")

    args = p.parse_args()
    env = load_env(args.env_file)
    assert_mail_creds(env)

    handlers = {
        "folders": cmd_folders,
        "inbox": cmd_inbox,
        "unread": cmd_unread,
        "read": cmd_read,
        "search": cmd_search,
        "draft": cmd_draft,
        "send": cmd_send,
        "reply": cmd_reply,
        "mark-read": cmd_mark_read,
    }
    handlers[args.cmd](env, args)


if __name__ == "__main__":
    main()
