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
    // Render unsigned PDF
    const pdfBuffer = await renderDiagnosticPdf({
      diagnosticId: diagnosticRow.id,
      productUrl: diagnosticRow.product_url,
      label: (diagnosticRow.label ?? "error") as any,
      explanation: diagnosticRow.explanation ?? "",
      evidence: diagnosticRow.evidence ?? "",
      createdAt: diagnosticRow.created_at,
      analysisDetail: diagnosticRow.analysis_detail,
      siteOrigin: origin,
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

    // Return the signed (or unsigned) PDF
    return new NextResponse(signResult.pdf, {
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
