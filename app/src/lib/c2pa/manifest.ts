/**
 * C2PA manifest builder for the diagnostic PDF artifact.
 *
 * The manifest is what gets cryptographically signed and embedded in the PDF.
 * It declares:
 *
 *   1. Who produced it             — claim_generator + Organization assertion
 *   2. What the asset is           — title + format
 *   3. What actions created it     — c2pa.actions (c2pa.created + ai_generated)
 *   4. AI-training preferences     — c2pa.training-mining (opt out)
 *   5. Schema.org provenance       — stds.schema-org.CreativeWork
 *   6. Diagnostic ID + source URL  — com.unlocksaas.diagnostic (custom)
 *
 * Spec references:
 *   - C2PA 1.4 §17 (Standard Assertions): c2pa.actions, c2pa.training-mining
 *   - C2PA 1.4 §17.13 (AI/ML assertions): softwareAgent on each action
 *   - EU AI Act Article 50 — machine-readable disclosure of AI-generated
 *     or AI-manipulated content, in force August 2026
 *
 * The manifest format (JSON serialized to the ManifestBuilder) deliberately
 * uses string literal assertion labels that match what verifiers like
 * contentcredentials.org and the C2PA test suite expect to find.
 */
import { ManifestBuilder } from "c2pa-node";

import { version as packageVersion } from "../../../package.json";

export type ManifestInput = {
  /** Diagnostic UUID — included in the manifest for traceability. */
  diagnosticId: string;
  /** The product URL that was analyzed. */
  productUrl: string;
  /** Created-at timestamp from the diagnostic_leads row. */
  createdAt: string;
  /** ISO timestamp of signing (defaults to now). */
  signedAt?: string;
  /** The model that performed the AI analysis. */
  aiModel?: string;
  /** Canonical site origin — used for back-links and the CreativeWork URL. */
  siteOrigin: string;
};

const DEFAULT_AI_MODEL = "Claude (Anthropic)";
const CLAIM_GENERATOR = `UnlockSaaS/${packageVersion ?? "0.1.0"} c2pa-node/0.5.26`;
const PRODUCER_NAME = "UnlockSaaS";
const AUTHOR_NAME = "Maryan";
const AUTHOR_URL = "https://unlocksaas.com/about";

export function buildDiagnosticManifest(input: ManifestInput): ManifestBuilder {
  const signedAt = input.signedAt ?? new Date().toISOString();
  const aiModel = input.aiModel ?? DEFAULT_AI_MODEL;
  const diagnosticUrl = `${input.siteOrigin}/diagnosis/${input.diagnosticId}`;
  const hostname = hostnameOf(input.productUrl);
  const title = `UnlockSaaS Diagnostic — ${hostname}`;

  return new ManifestBuilder(
    {
      claim_generator: CLAIM_GENERATOR,
      format: "application/pdf",
      title,
      assertions: [
        // -------------------------------------------------------------------
        // c2pa.actions — the chain of provenance actions.
        //
        // c2pa.created       : the moment this artifact was originated by us
        // c2pa.ai_generated  : declares the analysis sections were authored
        //                      with significant AI involvement; softwareAgent
        //                      names the model + vendor
        //
        // Per the C2PA spec, the softwareAgent on an ai_generated action is
        // how verifiers attribute the AI contribution — it is the field that
        // EU AI Act Article 50 verifiers expect to see.
        // -------------------------------------------------------------------
        {
          label: "c2pa.actions",
          data: {
            actions: [
              {
                action: "c2pa.created",
                when: signedAt,
                softwareAgent: {
                  name: "UnlockSaaS Diagnostic Engine",
                  version: packageVersion ?? "0.1.0",
                },
                digitalSourceType:
                  "http://cv.iptc.org/newscodes/digitalsourcetype/algorithmicMedia",
              },
              {
                action: "c2pa.ai_generated",
                when: signedAt,
                softwareAgent: {
                  name: aiModel,
                  vendor: "Anthropic",
                },
                digitalSourceType:
                  "http://cv.iptc.org/newscodes/digitalsourcetype/compositeSynthetic",
                parameters: {
                  description:
                    "Reluctant-Hero diagnostic teardown of the founder's live page. The three-axis scorecard, rewrites, 30-day plan, and competitor pulls are AI-generated; the framing (Brunson Bridge Script + Soap Opera structure) is human-authored.",
                },
              },
            ],
          },
        },
        // -------------------------------------------------------------------
        // c2pa.training-mining — explicit opt-out across all categories.
        //
        // Per C2PA 1.4 §17.14, this assertion controls whether the asset may
        // be used for AI training, inference, or generative-model training.
        // Notallowed across the board for diagnostic artifacts — the page
        // belongs to the founder, not to a training corpus.
        // -------------------------------------------------------------------
        {
          label: "c2pa.training-mining",
          data: {
            entries: {
              "c2pa.ai_generative_training": { use: "notAllowed" },
              "c2pa.ai_inference": { use: "notAllowed" },
              "c2pa.ai_training": { use: "notAllowed" },
              "c2pa.data_mining": { use: "notAllowed" },
            },
          },
        },
        // -------------------------------------------------------------------
        // Schema.org CreativeWork — published producer, author, and source URL.
        // Verifiers surface this as the human-readable "About" panel.
        // -------------------------------------------------------------------
        {
          label: "stds.schema-org.CreativeWork",
          data: {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            url: diagnosticUrl,
            headline: title,
            author: {
              "@type": "Person",
              name: AUTHOR_NAME,
              url: AUTHOR_URL,
            },
            producer: {
              "@type": "Organization",
              name: PRODUCER_NAME,
              url: input.siteOrigin,
            },
            dateCreated: input.createdAt,
            datePublished: signedAt,
            isAccessibleForFree: true,
            license: "https://unlocksaas.com/editorial-policy",
          },
        },
        // -------------------------------------------------------------------
        // Custom UnlockSaaS assertion — diagnostic_id + product_url so a
        // verifier can walk back to the source row. Reverse-domain label
        // per C2PA naming convention.
        // -------------------------------------------------------------------
        {
          label: "com.unlocksaas.diagnostic.v1",
          data: {
            diagnostic_id: input.diagnosticId,
            product_url: input.productUrl,
            permalink: diagnosticUrl,
            corrections_log: `${input.siteOrigin}/editorial-policy#corrections`,
            engine_version: packageVersion ?? "0.1.0",
            review_status: "pre-publication-AI-only",
          },
        },
      ],
    },
    { vendor: "unlocksaas" },
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
