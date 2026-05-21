/**
 * C2PA signing wrapper — turns an unsigned PDF + manifest into a signed PDF.
 *
 * Three signing modes, picked at runtime:
 *
 *   1. ENV LOCAL SIGNER     — production. Reads a base64-PEM cert + private
 *                             key + algorithm from env vars. The operator
 *                             provisions these via scripts/setup-c2pa-keys.py
 *                             which generates a fresh self-signed cert chain
 *                             and pushes it to Vercel.
 *
 *   2. BUNDLED TEST SIGNER  — dev only. Uses c2pa-node's bundled test cert
 *                             when NODE_ENV !== 'production' and no env keys
 *                             are present. Verifiers will show a "test cert"
 *                             warning — that's intentional, so local PDFs
 *                             are clearly distinguishable from prod ones.
 *
 *   3. UNSIGNED FALLBACK    — no signer at all. The endpoint catches this
 *                             and returns the unsigned PDF with a header
 *                             that flags the missing signature. Keeps the
 *                             endpoint up even if signing infra is down.
 *
 * Env vars (operator-provisioned by scripts/setup-c2pa-keys.py):
 *
 *   C2PA_SIGNING_CERT       base64-encoded PEM cert chain (leaf first,
 *                           then intermediates). Required to sign.
 *   C2PA_SIGNING_KEY        base64-encoded PEM PKCS#8 private key. Required.
 *   C2PA_SIGNING_ALG        one of es256 (default) | es384 | es512 | ps256 |
 *                           ps384 | ps512 | ed25519. Must match the cert.
 *   C2PA_TSA_URL            optional RFC-3161 Time Stamp Authority URL.
 *                           Defaults to "https://timestamp.digicert.com".
 *
 * Why base64? Vercel env vars are plain strings; PEM contains newlines that
 * survive better as base64. The setup script does the encoding.
 */
import {
  createC2pa,
  createTestSigner,
  ManifestBuilder,
  SigningAlgorithm,
  type LocalSigner,
} from "c2pa-node";

const DEFAULT_TSA_URL = "https://timestamp.digicert.com";

export type SignResult = {
  /** The signed PDF bytes (or the input bytes if signing was skipped). */
  pdf: Buffer;
  /** Did we actually sign? false → caller should advertise this in headers. */
  signed: boolean;
  /** Whether the signature came from a real cert or the bundled test cert. */
  signerKind: "env" | "test" | "none";
  /** Optional error if signing was attempted but failed. */
  error?: string;
};

/**
 * Sign a PDF buffer with the configured signer. Never throws — failure
 * paths return `{ signed: false, signerKind: 'none' }` so the endpoint
 * can always serve something useful.
 */
export async function signPdf(
  pdfBytes: Buffer,
  manifest: ManifestBuilder,
): Promise<SignResult> {
  // Mode 1: env-based local signer.
  const envSigner = loadEnvSigner();
  if (envSigner) {
    try {
      const c2pa = createC2pa({ signer: envSigner });
      const out = await c2pa.sign({
        asset: { buffer: pdfBytes, mimeType: "application/pdf" },
        manifest,
      });
      return {
        pdf: Buffer.from(out.signedAsset.buffer),
        signed: true,
        signerKind: "env",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[c2pa/signer] env signer failed", message);
      return {
        pdf: pdfBytes,
        signed: false,
        signerKind: "none",
        error: message,
      };
    }
  }

  // Mode 2: bundled test signer (dev only — never in production).
  if (process.env.NODE_ENV !== "production") {
    try {
      const testSigner = await createTestSigner();
      const c2pa = createC2pa({ signer: testSigner });
      const out = await c2pa.sign({
        asset: { buffer: pdfBytes, mimeType: "application/pdf" },
        manifest,
      });
      return {
        pdf: Buffer.from(out.signedAsset.buffer),
        signed: true,
        signerKind: "test",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[c2pa/signer] test signer failed (dev)", message);
      return {
        pdf: pdfBytes,
        signed: false,
        signerKind: "none",
        error: message,
      };
    }
  }

  // Mode 3: nothing configured. Serve unsigned.
  return {
    pdf: pdfBytes,
    signed: false,
    signerKind: "none",
    error: "no signing keys configured",
  };
}

/**
 * Load the local signer from env vars. Returns null if either of the two
 * required vars is missing — caller falls through to test or unsigned.
 */
function loadEnvSigner(): LocalSigner | null {
  const certB64 = process.env.C2PA_SIGNING_CERT?.trim();
  const keyB64 = process.env.C2PA_SIGNING_KEY?.trim();
  if (!certB64 || !keyB64) return null;

  let certificate: Buffer;
  let privateKey: Buffer;
  try {
    certificate = Buffer.from(certB64, "base64");
    privateKey = Buffer.from(keyB64, "base64");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[c2pa/signer] failed to base64-decode signing material", message);
    return null;
  }

  // Validate the PEM looks like a PEM. If someone pasted the raw value into
  // Vercel without base64 encoding, this catches it.
  const certStr = certificate.toString("utf8");
  const keyStr = privateKey.toString("utf8");
  if (!certStr.includes("BEGIN CERTIFICATE")) {
    console.error("[c2pa/signer] C2PA_SIGNING_CERT does not look like a PEM cert");
    return null;
  }
  if (!keyStr.includes("BEGIN") || !keyStr.includes("PRIVATE KEY")) {
    console.error(
      "[c2pa/signer] C2PA_SIGNING_KEY does not look like a PEM private key",
    );
    return null;
  }

  const algorithm = parseAlgorithm(process.env.C2PA_SIGNING_ALG);
  const tsaUrl = process.env.C2PA_TSA_URL?.trim() || DEFAULT_TSA_URL;

  return {
    type: "local",
    certificate,
    privateKey,
    algorithm,
    tsaUrl,
  };
}

function parseAlgorithm(raw: string | undefined): SigningAlgorithm {
  const v = raw?.trim().toLowerCase();
  switch (v) {
    case "es384":
      return SigningAlgorithm.ES384;
    case "es512":
      return SigningAlgorithm.ES512;
    case "ps256":
      return SigningAlgorithm.PS256;
    case "ps384":
      return SigningAlgorithm.PS384;
    case "ps512":
      return SigningAlgorithm.PS512;
    case "ed25519":
      return SigningAlgorithm.Ed25519;
    case "es256":
    case undefined:
    case "":
      return SigningAlgorithm.ES256;
    default:
      console.warn(
        `[c2pa/signer] unknown C2PA_SIGNING_ALG=${raw}, defaulting to es256`,
      );
      return SigningAlgorithm.ES256;
  }
}
