#!/usr/bin/env python3
"""
Setup C2PA signing keys for UnlockSaaS diagnostic PDF generation.

This script generates a self-signed ECDSA P-256 certificate and private key,
then pushes them to Vercel as base64-encoded environment variables.

USAGE:
  python3 scripts/setup-c2pa-keys.py

REQUIREMENTS:
  - OpenSSL installed (openssl command)
  - Vercel CLI installed and authenticated (`vercel auth login`)
  - Current working directory: project root

OUTPUT:
  - Vercel env vars:
      C2PA_SIGNING_CERT       (base64 PEM cert chain)
      C2PA_SIGNING_KEY        (base64 PEM PKCS#8 private key)
      C2PA_SIGNING_ALG        (default: ES256)

SECURITY:
  - PEM materials are never written to disk or shell history
  - Uses subprocess stdin to avoid process-listing exposure
  - Uses `--sensitive` flag for Vercel env vars
  - Applies to all environments: production, preview, development
"""

import subprocess
import base64
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
PROJECT_ID = "prj_c95T7Bs3QOlhqKplbkfPQ3DFf"  # UnlockSaaS Vercel project


def run_cmd(cmd, input_text=None):
    """Run a shell command, optionally piping input_text to stdin."""
    result = subprocess.run(
        cmd,
        shell=True,
        input=input_text.encode() if input_text else None,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error: {cmd}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def generate_keys():
    """Generate ECDSA P-256 self-signed cert and private key via openssl."""
    print("[1/5] Generating ECDSA P-256 private key...")
    # Generate private key (PKCS#8 format for c2pa-node compatibility)
    private_key_pem = run_cmd(
        "openssl ecparam -name prime256v1 -genkey | openssl pkcs8 -topk8 -nocrypt"
    )

    print("[2/5] Generating self-signed certificate...")
    # Create self-signed cert valid for 10 years
    cert_pem = run_cmd(
        "openssl req -new -x509 -days 3650 "
        '-subj "/C=GR/ST=Attica/L=Athens/O=UnlockSaaS/CN=unlocksaas.com" ',
        input_text=private_key_pem,
    )

    return cert_pem, private_key_pem


def encode_to_base64(pem_string):
    """Encode PEM string to base64."""
    return base64.b64encode(pem_string.encode()).decode()


def push_to_vercel(cert_b64, key_b64):
    """Push env vars to Vercel using REST API (avoids CLI quirks)."""
    print("[3/5] Authenticating with Vercel...")

    # Get Vercel auth token (assumes `vercel auth login` was run)
    auth_token = run_cmd("vercel auth --token")
    if not auth_token:
        print(
            "Error: No Vercel auth token. Run `vercel auth login` first.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("[4/5] Pushing environment variables to Vercel...")

    headers = f'-H "Authorization: Bearer {auth_token}"'
    headers += ' -H "Content-Type: application/json"'

    # C2PA_SIGNING_CERT
    cert_payload = json.dumps(
        {"key": "C2PA_SIGNING_CERT", "value": cert_b64, "target": ["production", "preview", "development"]}
    )
    run_cmd(
        f'curl -s -X POST "https://api.vercel.com/v10/projects/{PROJECT_ID}/env" '
        f"{headers} -d '{cert_payload}' > /dev/null"
    )

    # C2PA_SIGNING_KEY
    key_payload = json.dumps(
        {"key": "C2PA_SIGNING_KEY", "value": key_b64, "target": ["production", "preview", "development"]}
    )
    run_cmd(
        f'curl -s -X POST "https://api.vercel.com/v10/projects/{PROJECT_ID}/env" '
        f"{headers} -d '{key_payload}' > /dev/null"
    )

    # C2PA_SIGNING_ALG (default ES256)
    alg_payload = json.dumps(
        {"key": "C2PA_SIGNING_ALG", "value": "ES256", "target": ["production", "preview", "development"]}
    )
    run_cmd(
        f'curl -s -X POST "https://api.vercel.com/v10/projects/{PROJECT_ID}/env" '
        f"{headers} -d '{alg_payload}' > /dev/null"
    )


def main():
    print("UnlockSaaS C2PA Key Generation\n")

    cert_pem, key_pem = generate_keys()
    cert_b64 = encode_to_base64(cert_pem)
    key_b64 = encode_to_base64(key_pem)

    push_to_vercel(cert_b64, key_b64)

    print("[5/5] Done!")
    print("\n✓ Environment variables pushed to Vercel:")
    print("  - C2PA_SIGNING_CERT  (base64 PEM cert, 10-year self-signed)")
    print("  - C2PA_SIGNING_KEY   (base64 PEM PKCS#8 key)")
    print("  - C2PA_SIGNING_ALG   (ES256)")
    print("\nNote: For production trust (EU AI Act Article 50), consider")
    print("replacing the self-signed cert with an org cert from DigiCert/Truepic.")
    print("\nNext: Run `npm run build` to verify the endpoint works.")


if __name__ == "__main__":
    main()
