import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isValidLeadId } from "@/lib/diagnostic-share";
import { renderDiagnosticPdf } from "@/lib/c2pa/render-pdf";
import { buildDiagnosticManifest } from "@/lib/c2pa/manifest";
import { signPdf } from "@/lib/c2pa/signer";
import type { DeepAnalysisDetail } from "@/app/(marketing)/diagnostic/result/deep-report";

/**
 * Diagnostic PDF export endpoint with embedded C2PA Content Credentials.
 *
 *   GET /api/diagnostic/[id]/pdf
 *   200:  PDF (application/pdf)
 *   404:  id not a UUID, or no such row
 *   500:  PDF rendering error
 *
 * The endpoint:
 *   1. Reads the diagnostic_leads row by UUID
 *   2. Renders a signed PDF with C2PA manifest (cover + diagnosis + deep report)
 *   3. Returns the signed artifact with cache headers
 *
 * Per EU AI Act Article 50, the C2PA manifest declares:
 *   - Human-readable AI-generated disclosure on the cover page
 *   - Machine-readable c2pa.actions (created + ai_generated)
 *   - Machine-readable c2pa.training-mining (opt-out)
 *   - Schema.org CreativeWork (author + producer + dates)
 *   - Custom com.unlocksaas.diagnostic.v1 assertion (diagnostic ID + source URL)
 *
 * Signing modes (determined by environment):
 *   - Production: signed with env-var PEM cert (C2PA_SIGNING_CERT + C2PA_SIGNING_KEY)
 *   - Dev: signed with bundled test cert (shows "test signature" warning in verifiers)
 *   - Fallback: unsigned PDF if signing fails (graceful degradation)
 *
 * Cache strategy: private, max-age=3600 (1 hour). The PDF is deterministic
 * per diagnostic row; cache in the user's browser but not on proxies.
 */

function siteOrigin(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");
  const host = req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return "https://unlocksaas.com";
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  // Validate UUID format
  if (!isValidLeadId(id)) {
    return NextResponse.json(
      { error: "Invalid diagnostic id." },
      { status: 404 },
    );
  }

  const supabase = createAdminClient();

  // Read diagnostic row
  const { data: row, error: readErr } = await supabase
    .from("diagnostic_leads")
    .select(
      "id, product_url, label, explanation, evidence, created_at, analysis_detail",
    )
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    console.error("[diagnostic/pdf] read failed", readErr);
    return NextResponse.json(
      { error: "Could not load the diagnosis. Try again in a minute." },
      { status: 500 },
    );
  }

  if (!row) {
    return NextResponse.json(
      { error: "Diagnosis not found." },
      { status: 404 },
    );
  }

  const diagnosticRow = row as unknown as {
    id: string;
    product_url: string;
    label: string | null;
    explanation: string | null;
    evidence: string | null;
    created_at: string;
    analysis_detail: DeepAnalysisDetail | null;
  };

  const origin = siteOrigin(req);

  try {
    // Render unsigned PDF.
    //
    // Field-name contract: renderDiagnosticPdf accepts the snake_case shape
    // declared by `DiagnosticPdfInput` (src/lib/c2pa/render-pdf.ts), which
    // mirrors the diagnostic_leads row shape so the renderer can be passed
    // a DB row almost verbatim. The earlier camelCase call site was a
    // refactor regression from PR #122 (C2PA Content Credentials);
    // explanation/evidence types are `string | null`, not coerced to "".
    // `siteOrigin` is consumed by `buildDiagnosticManifest` below, not by
    // the renderer. `bucket` is optional on the type; the consumer's row
    // projection above omits it (the diagnostic_leads.bucket column is
    // present but not queried here), so pass null.
    const pdfBuffer = await renderDiagnosticPdf({
      id: diagnosticRow.id,
      product_url: diagnosticRow.product_url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label: (diagnosticRow.label ?? "error") as any,
      explanation: diagnosticRow.explanation,
      evidence: diagnosticRow.evidence,
      bucket: null,
      created_at: diagnosticRow.created_at,
      analysis_detail: diagnosticRow.analysis_detail,
    });

    // Build manifest for C2PA signing
    const manifest = buildDiagnosticManifest({
      diagnosticId: diagnosticRow.id,
      productUrl: diagnosticRow.product_url,
      createdAt: diagnosticRow.created_at,
      siteOrigin: origin,
    });

    // Sign the PDF (graceful fallback if signing is not configured)
    const signResult = await signPdf(pdfBuffer, manifest);

    // Return the signed (or unsigned) PDF.
    //
    // Buffer<ArrayBufferLike> is a structural Uint8Array at runtime and is
    // a valid Web BodyInit, but Next 16's strict union types reject both
    // Buffer and Uint8Array directly. Cast through `unknown as BodyInit`
    // to satisfy the typecheck; the runtime accepts the binary view.
    return new NextResponse(signResult.pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="diagnostic-${diagnosticRow.id}.pdf"`,
        "Cache-Control": "private, max-age=3600",
        // Flag in headers if unsigned (helps operators debug)
        ...(signResult.signed
          ? {}
          : { "X-C2PA-Unsigned": "true" }),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[diagnostic/pdf] render failed", message);
    return NextResponse.json(
      { error: "Could not generate the PDF. Try again in a minute." },
      { status: 500 },
    );
  }
}
