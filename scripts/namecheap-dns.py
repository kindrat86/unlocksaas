#!/usr/bin/env python3
"""
Namecheap DNS automation for unlocksaas.com.

Usage:
  python scripts/namecheap-dns.py list
  python scripts/namecheap-dns.py add-email                       # preview (dry-run)
  python scripts/namecheap-dns.py add-email --apply               # actually push
  python scripts/namecheap-dns.py add-dkim "v=DKIM1; k=rsa; p=..."        # preview
  python scripts/namecheap-dns.py add-dkim "v=DKIM1; k=rsa; p=..." --apply
  python scripts/namecheap-dns.py set-vercel                      # preview Vercel switch
  python scripts/namecheap-dns.py set-vercel --apply              # actually switch DNS to Vercel

Loads credentials from .env.development.local by default. Override with --env-file.

WHY THIS EXISTS:
  Namecheap's setHosts API is a REPLACE operation — it overwrites ALL DNS
  records for the domain in a single call. Naively calling it with only your
  new records DELETES every existing record (including MX records that route
  your email). This script:
    1. fetches existing records via getHosts,
    2. merges in the requested additions (skipping duplicates),
    3. posts the full combined list back via setHosts,
    4. re-reads and verifies the new records are live.

  Dry-run by default. Pass --apply to actually push changes.

DEPENDENCIES:
  Python 3.9+ stdlib only. No pip install required.
"""

import argparse
import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import NamedTuple

API_URL = "https://api.namecheap.com/xml.response"
NS = {"nc": "http://api.namecheap.com/xml.response"}


class Record(NamedTuple):
    name: str          # HostName: "@", "_dmarc", "default._domainkey", ...
    type: str          # "TXT", "MX", "A", "CNAME", "ALIAS", ...
    address: str       # the value
    mx_pref: int = 10
    ttl: int = 1800

    def fingerprint(self) -> tuple:
        # Used to detect "already present" — match on Name + Type + Address.
        return (self.name.lower(), self.type.upper(), self.address.strip())


# ── env loading ───────────────────────────────────────────────────────────────

REQUIRED_KEYS = [
    "NAMECHEAP_API_USER",
    "NAMECHEAP_API_KEY",
    "NAMECHEAP_USERNAME",
    "NAMECHEAP_CLIENT_IP",
    "NAMECHEAP_DOMAIN",
]


def load_env(path: str) -> dict:
    p = Path(path)
    if not p.exists():
        sys.exit(
            f"ERROR: {path} not found.\n"
            f"Copy .env.example to {path} and fill in your Namecheap credentials."
        )
    env = {}
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def assert_creds(env: dict) -> None:
    missing = []
    placeholder = []
    for k in REQUIRED_KEYS:
        v = env.get(k, "")
        if not v:
            missing.append(k)
        elif v.startswith(("paste-", "your-")):
            placeholder.append(k)
    if missing or placeholder:
        msg = ["ERROR: env file is incomplete."]
        if missing:
            msg.append(f"  Missing keys: {', '.join(missing)}")
        if placeholder:
            msg.append(f"  Still placeholder: {', '.join(placeholder)}")
        sys.exit("\n".join(msg))


# ── Namecheap API ─────────────────────────────────────────────────────────────


def split_domain(domain: str) -> tuple:
    parts = domain.split(".", 1)
    if len(parts) != 2:
        sys.exit(f"ERROR: NAMECHEAP_DOMAIN '{domain}' must be like 'example.com'")
    return parts[0], parts[1]


def api_call(env: dict, command: str, extra: dict = None) -> ET.Element:
    sld, tld = split_domain(env["NAMECHEAP_DOMAIN"])
    params = {
        "ApiUser": env["NAMECHEAP_API_USER"],
        "ApiKey": env["NAMECHEAP_API_KEY"],
        "UserName": env["NAMECHEAP_USERNAME"],
        "ClientIp": env["NAMECHEAP_CLIENT_IP"],
        "Command": command,
        "SLD": sld,
        "TLD": tld,
    }
    if extra:
        params.update(extra)
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(API_URL, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode()
    except Exception as e:
        sys.exit(f"ERROR: HTTP call to Namecheap failed: {e}")

    try:
        root = ET.fromstring(body)
    except ET.ParseError as e:
        sys.exit(f"ERROR: could not parse Namecheap XML response: {e}\nBody:\n{body[:1000]}")

    status = root.get("Status")
    if status != "OK":
        errors = root.find("nc:Errors", NS)
        details = ""
        if errors is not None:
            for e in errors:
                details += f"\n  - {(e.text or '').strip()} (Number: {e.get('Number')})"
        # Most common issues: IP not whitelisted, API not enabled, wrong username.
        sys.exit(
            f"ERROR: Namecheap API returned Status={status}{details}\n"
            f"Common causes:\n"
            f"  • IP {env['NAMECHEAP_CLIENT_IP']} is not in your Namecheap whitelist\n"
            f"  • API Access is toggled OFF on your account\n"
            f"  • NAMECHEAP_API_KEY is wrong or rotated"
        )
    return root


def get_hosts(env: dict) -> list:
    records, _ = get_dns_state(env)
    return records


def get_dns_state(env: dict) -> tuple:
    """Returns (records, email_type). EmailType controls Mail Settings dropdown:
    'OX' = Namecheap Private Email, 'MX' = Custom MX, 'FWD' = Forwarding,
    'NONE' = no email service. Must be preserved on setHosts or email breaks.
    """
    root = api_call(env, "namecheap.domains.dns.getHosts")
    result = root.find(".//nc:DomainDNSGetHostsResult", NS)
    if result is None:
        sys.exit("ERROR: getHosts response missing DomainDNSGetHostsResult element")
    email_type = result.get("EmailType", "NONE")
    hosts = result.findall("nc:host", NS) or result.findall("nc:Host", NS)
    records = []
    for h in hosts:
        records.append(
            Record(
                name=h.get("Name", "@"),
                type=h.get("Type", "TXT"),
                address=h.get("Address", ""),
                mx_pref=int(h.get("MXPref", "10") or "10"),
                ttl=int(h.get("TTL", "1800") or "1800"),
            )
        )
    return records, email_type


def set_hosts(env: dict, records: list, email_type: str = None) -> None:
    extra = {}
    has_mx = False
    for i, r in enumerate(records, start=1):
        extra[f"HostName{i}"] = r.name
        extra[f"RecordType{i}"] = r.type
        extra[f"Address{i}"] = r.address
        extra[f"TTL{i}"] = str(r.ttl)
        if r.type.upper() == "MX":
            extra[f"MXPref{i}"] = str(r.mx_pref)
            has_mx = True
    # EmailType controls Namecheap Mail Settings. ALWAYS pass it through —
    # omitting it can silently switch Mail Settings to NONE and break email.
    if email_type:
        extra["EmailType"] = email_type
    elif has_mx:
        extra["EmailType"] = "MX"
    api_call(env, "namecheap.domains.dns.setHosts", extra)


# ── display helpers ───────────────────────────────────────────────────────────


def print_records(label: str, records: list) -> None:
    print(f"\n=== {label} ({len(records)}) ===")
    if not records:
        print("  (none)")
        return
    name_w = max(len(r.name) for r in records)
    type_w = max(len(r.type) for r in records)
    for r in records:
        suffix = f"  [MX pref {r.mx_pref}]" if r.type.upper() == "MX" else ""
        addr = r.address if len(r.address) <= 100 else r.address[:97] + "..."
        print(f"  {r.name:<{name_w}}  {r.type:<{type_w}}  {addr}{suffix}")


# ── subcommands ───────────────────────────────────────────────────────────────


def cmd_list(env: dict, args) -> None:
    records = get_hosts(env)
    print_records(f"Current DNS for {env['NAMECHEAP_DOMAIN']}", records)


def cmd_add_email(env: dict, args) -> None:
    # SPF + DMARC for Private Email. Tied to the locked maryan@unlocksaas.com
    # Attractive Character identity.
    additions = [
        Record(
            name="@",
            type="TXT",
            address="v=spf1 include:spf.privateemail.com ~all",
        ),
        Record(
            name="_dmarc",
            type="TXT",
            address="v=DMARC1; p=none; rua=mailto:maryan@unlocksaas.com; pct=100; adkim=r; aspf=r",
        ),
    ]
    merge_and_maybe_apply(env, additions, apply=args.apply)


def cmd_add_dkim(env: dict, args) -> None:
    value = args.value.strip()
    if not value:
        sys.exit("ERROR: DKIM value is empty")
    # Private Email DKIM panel sometimes shows the value pre-chunked with
    # quote marks ("v=DKIM1...part1" "part2"). Strip those for the API.
    value = value.replace('"', "").replace("\n", "").replace("\r", "")
    additions = [
        Record(name="default._domainkey", type="TXT", address=value),
    ]
    merge_and_maybe_apply(env, additions, apply=args.apply)


def merge_and_maybe_apply(env: dict, additions: list, apply: bool) -> None:
    current, email_type = get_dns_state(env)
    print_records("Current records", current)
    print(f"  EmailType (Mail Settings): {email_type}  ← will be preserved")

    existing_fp = {r.fingerprint() for r in current}
    to_add = [r for r in additions if r.fingerprint() not in existing_fp]
    skipped = [r for r in additions if r.fingerprint() in existing_fp]

    print_records("Will ADD", to_add)
    if skipped:
        print_records("Already present (skipped)", skipped)

    if not to_add:
        print("\nNothing to do. Exiting.")
        return

    final = current + to_add
    print_records("Final record set (what would be written)", final)

    if not apply:
        print("\n[dry-run] No changes made. Re-run with --apply to push to Namecheap.")
        return

    print("\nApplying via setHosts ...")
    set_hosts(env, final, email_type=email_type)

    print("Verifying ...")
    after = get_hosts(env)
    new_fps = {r.fingerprint() for r in to_add}
    confirmed = [r for r in after if r.fingerprint() in new_fps]
    print_records("Confirmed live", confirmed)

    if len(confirmed) != len(to_add):
        sys.exit(
            f"WARN: expected {len(to_add)} new records but found {len(confirmed)} after write.\n"
            f"Inspect Namecheap Advanced DNS UI manually."
        )

    print("\nDone. DNS propagation usually completes in 5-30 minutes.")
    print("Verify externally:  dig +short TXT unlocksaas.com  (or use https://mxtoolbox.com/)")


# ── Vercel switch ─────────────────────────────────────────────────────────────


VERCEL_APEX_IP = "76.76.21.21"  # Vercel anycast IP for apex A records
VERCEL_CNAME = "cname.vercel-dns.com."  # for www / subdomain CNAME


def _is_parking_record(r: Record) -> bool:
    """Identify the default Namecheap parking records that conflict with Vercel.
    These are auto-added when a fresh domain is registered:
      • URL Redirect at @ pointing at http(s)://www.<domain>/
      • CNAME at www pointing at parkingpage.namecheap.com
    """
    if r.name == "@" and r.type.upper() in ("URL", "URL301", "FRAME"):
        return True
    if r.name == "www" and r.type.upper() == "CNAME" and "parkingpage.namecheap.com" in r.address.lower():
        return True
    return False


def cmd_set_vercel(env: dict, args) -> None:
    """Switch DNS routing for unlocksaas.com to Vercel.
    Removes parking records, adds A @ -> 76.76.21.21 and CNAME www -> cname.vercel-dns.com.
    PRESERVES all email records (SPF/DKIM/DMARC) and EmailType (Mail Settings = Private Email).
    """
    current, email_type = get_dns_state(env)
    print_records("Current records", current)
    print(f"  EmailType (Mail Settings): {email_type}  ← will be preserved")

    parking = [r for r in current if _is_parking_record(r)]
    kept = [r for r in current if not _is_parking_record(r)]

    additions = [
        Record(name="@", type="A", address=VERCEL_APEX_IP),
        Record(name="www", type="CNAME", address=VERCEL_CNAME),
    ]
    existing_fp = {r.fingerprint() for r in kept}
    to_add = [r for r in additions if r.fingerprint() not in existing_fp]
    already_vercel = [r for r in additions if r.fingerprint() in existing_fp]

    # Conflict check: refuse to silently overwrite non-parking A/CNAME at @ or www.
    conflicts = []
    for r in kept:
        if r.name == "@" and r.type.upper() in ("A", "AAAA", "CNAME", "ALIAS") and r.address != VERCEL_APEX_IP:
            conflicts.append(r)
        if r.name == "www" and r.type.upper() in ("A", "AAAA", "CNAME", "ALIAS") and r.address.rstrip(".") != VERCEL_CNAME.rstrip("."):
            conflicts.append(r)
    if conflicts:
        print_records("CONFLICT: non-parking records would block Vercel switch", conflicts)
        sys.exit("ERROR: remove conflicting records manually before running set-vercel.")

    print_records("Will REMOVE (parking)", parking)
    print_records("Will ADD (Vercel)", to_add)
    if already_vercel:
        print_records("Already Vercel-pointed (skipped)", already_vercel)

    if not parking and not to_add:
        print("\nNothing to do. DNS already points to Vercel.")
        return

    final = kept + to_add
    print_records("Final record set (what would be written)", final)

    if not args.apply:
        print("\n[dry-run] No changes made. Re-run with --apply to push to Namecheap.")
        return

    print("\nApplying via setHosts ...")
    set_hosts(env, final, email_type=email_type)

    print("Verifying ...")
    after, after_email_type = get_dns_state(env)
    apex_a = [r for r in after if r.name == "@" and r.type.upper() == "A" and r.address == VERCEL_APEX_IP]
    www_cname = [r for r in after if r.name == "www" and r.type.upper() == "CNAME" and VERCEL_CNAME.rstrip(".") in r.address.rstrip(".")]
    remaining_parking = [r for r in after if _is_parking_record(r)]

    print_records("Vercel apex A record (live)", apex_a)
    print_records("Vercel www CNAME (live)", www_cname)
    if remaining_parking:
        print_records("WARN: parking records still present", remaining_parking)
    if after_email_type != email_type:
        print(f"WARN: EmailType changed from {email_type} to {after_email_type} — email may be affected.")
    else:
        print(f"\nEmailType preserved: {after_email_type}")

    print("\nDone. Vercel DNS propagation usually completes in 5-30 minutes.")
    print("Verify externally:  dig +short A unlocksaas.com  &&  dig +short CNAME www.unlocksaas.com")


# ── entrypoint ────────────────────────────────────────────────────────────────


def main() -> None:
    p = argparse.ArgumentParser(
        description="Namecheap DNS automation for unlocksaas.com",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--env-file",
        default=".env.development.local",
        help="Path to env file (default: .env.development.local)",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="Print current DNS records for the domain")

    pe = sub.add_parser(
        "add-email", help="Add SPF + DMARC records for Private Email (dry-run by default)"
    )
    pe.add_argument("--apply", action="store_true", help="Actually push to Namecheap")

    pd = sub.add_parser(
        "add-dkim", help="Add DKIM TXT record (dry-run by default)"
    )
    pd.add_argument(
        "value",
        help='The TXT value from Private Email DKIM panel, e.g. "v=DKIM1; k=rsa; p=MIGfMA0..."',
    )
    pd.add_argument("--apply", action="store_true", help="Actually push to Namecheap")

    pv = sub.add_parser(
        "set-vercel",
        help="Switch DNS to Vercel: remove parking records, add A @ -> 76.76.21.21 and CNAME www -> cname.vercel-dns.com. Preserves SPF/DKIM/DMARC and Private Email Mail Settings.",
    )
    pv.add_argument("--apply", action="store_true", help="Actually push to Namecheap")

    args = p.parse_args()
    env = load_env(args.env_file)
    assert_creds(env)

    if args.cmd == "list":
        cmd_list(env, args)
    elif args.cmd == "add-email":
        cmd_add_email(env, args)
    elif args.cmd == "add-dkim":
        cmd_add_dkim(env, args)
    elif args.cmd == "set-vercel":
        cmd_set_vercel(env, args)


if __name__ == "__main__":
    main()
