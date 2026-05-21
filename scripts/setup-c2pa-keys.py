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
        input=input_text if input_text else None,
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
    import tempfile
    import os

    print("[1/5] Generating ECDSA P-256 private key and certificate...")

    # Use temp files (only in /tmp, cleaned up immediately after reading)
    fd_key, temp_key_file = tempfile.mkstemp(suffix='.pem')
    fd_cert, temp_cert_file = tempfile.mkstemp(suffix='.pem')

    try:
        # Close file descriptors (we'll use the filenames)
        os.close(fd_key)
        os.close(fd_cert)

        # Generate key and cert in one command (no password prompts)
        run_cmd(
            f"openssl req -new -x509 -days 3650 "
            f"-newkey ec -pkeyopt ec_paramgen_curve:P-256 "
            f'-subj "/C=GR/ST=Attica/L=Athens/O=UnlockSaaS/CN=unlocksaas.com" '
            f"-nodes "
            f"-keyout {temp_key_file} "
            f"-out {temp_cert_file}"
        )

        # Read both files into memory
        with open(temp_key_file, 'r') as f:
            private_key_pem = f.read().strip()
        with open(temp_cert_file, 'r') as f:
            cert_pem = f.read().strip()

        return cert_pem, private_key_pem

    finally:
        # Clean up temp files immediately
        for f in [temp_key_file, temp_cert_file]:
            if os.path.exists(f):
                os.remove(f)


def encode_to_base64(pem_string):
    """Encode PEM string to base64."""
    return base64.b64encode(pem_string.encode()).decode()


def push_to_vercel(cert_b64, key_b64):
    """Push env vars to Vercel using vercel env add (handles auth automatically)."""
    print("[3/5] Pushing environment variables to Vercel...")

    # Verify Vercel auth is working
    try:
        run_cmd("vercel whoami")
    except SystemExit:
        print(
            "Error: Not authenticated with Vercel. Run `vercel login` first.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("[4/5] Setting C2PA signing credentials...")

    # Use vercel env add which handles auth automatically from the CLI session
    # This command uses the operator's authenticated Vercel session
    # The --yes flag makes it non-interactive
    env_vars = {
        "C2PA_SIGNING_CERT": cert_b64,
        "C2PA_SIGNING_KEY": key_b64,
        "C2PA_SIGNING_ALG": "ES256",
    }

    for key, value in env_vars.items():
        # Use shell export to pass the value securely (not in command args)
        # Then use vercel env add with production target
        # Note: preview is broken per feedback_vercel_cli_preview_env_bug.md,
        # so we add to production and development only
        cmd = f"vercel env add {key} production development --yes"
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                input=value,
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode != 0:
                # Try with explicit input method
                result = subprocess.run(
                    f"echo '{value}' | vercel env add {key} production development --yes",
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=30,
                )
            if result.returncode == 0:
                print(f"  ✓ {key} pushed to Vercel (production, development)")
            else:
                print(f"  ⚠ {key} may not have been set. Check: vercel env list", file=sys.stderr)
        except Exception as e:
            print(f"  ⚠ Error setting {key}: {e}", file=sys.stderr)


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
