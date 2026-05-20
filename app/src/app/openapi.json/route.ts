/**
 * /openapi.json — OpenAPI 3.1.0 specification for the UnlockSaaS
 * public API surface.
 *
 * Why this file exists
 * --------------------
 * Two consumers:
 *
 *   1. ChatGPT Custom GPT Actions. Builders paste this URL into the
 *      "Add Action" → "Import from URL" field and ChatGPT auto-wires
 *      every operation as a callable tool. The companion manifest at
 *      /.well-known/ai-plugin.json declares the api.url that points
 *      here.
 *
 *   2. Generic OpenAPI tooling. Swagger UI, Postman, Insomnia, Hoppscotch,
 *      Stainless, Speakeasy, and the LangChain / LlamaIndex OpenAPI
 *      tool loaders all ingest this exact path. Hosting the spec at
 *      the conventional `/openapi.json` location (not /api/openapi
 *      or /docs/openapi) maximises the chance an agent finds it
 *      without operator intervention.
 *
 * Design discipline
 * -----------------
 * Every operation has:
 *   - operationId (REQUIRED by ChatGPT Actions; becomes the tool name)
 *   - clear summary + description optimised for an LLM caller
 *   - explicit request / response schemas with examples
 *   - documented error responses
 *
 * Brunson Hard-Rule reconciliation: every claim in this spec is
 * implementable by the live route handler. The diagnostic POST body
 * shape, response shape, and error envelope match
 * `app/src/app/api/diagnostic/route.ts`. The dataset GET response
 * shape matches `app/src/lib/seo/dataset.ts`.
 *
 * What is intentionally NOT exposed
 * ---------------------------------
 *   - /api/diagnostic/[id]/share        — requires email-as-consent;
 *                                          off-funnel for a cold GPT user.
 *   - /api/checkout                     — Stripe handle, not for AI agents.
 *   - /api/webhooks/*                   — Stripe / Resend ingest only.
 *   - /api/cron/*                       — Vercel-cron-authenticated only.
 *   - /api/mcp                          — MCP transport, served separately
 *                                          via /.well-known/mcp.json.
 *   - /api/soap-opera/subscribe         — driven by the diagnostic flow,
 *                                          not a useful standalone action.
 *
 * Caching
 * -------
 * Module-scope constant. Long edge cache (24h max-age,
 * 7-day stale-while-revalidate). CORS open. Same discipline as
 * /.well-known/mcp.json and /.well-known/ai-plugin.json.
 *
 * Validation
 * ----------
 * The OpenAPI document below has been hand-checked against the
 * OpenAPI 3.1.0 schema. Common consumers tested mentally:
 *   - ChatGPT Actions Import: ✓ operationId on every op, server URL set.
 *   - Swagger UI: ✓ schemas resolve, examples render.
 *   - Postman: ✓ request bodies parse, security empty (no auth).
 *   - LangChain OpenAPIToolkit: ✓ no $ref cycles, no exotic types.
 */

import { NextResponse } from "next/server";

const BASE = "https://unlocksaas.com";
const VERSION = "1.0.0";

/**
 * The spec itself. Hand-authored (not generated from code) because the
 * route handlers under app/api are intentionally narrow surfaces, not
 * a sprawling REST API – generating a spec from them would over-fit.
 */
const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "UnlockSaaS Diagnostic API",
    version: VERSION,
    summary:
      "Deep AI-powered diagnosis of live SaaS landing pages, plus the open dataset of indie-SaaS funnel and pricing teardowns.",
    description: [
      "UnlockSaaS is the Brunson-framework post-launch pre-revenue diagnostic",
      "for indie SaaS founders. This API exposes two public surfaces:",
      "",
      "  1. POST /api/diagnostic – submit a live product URL plus the",
      "     user's email and receive a Brunson-labeled diagnosis (Wrong",
      "     Person, Weak Offer, or Weak Belief) plus a structured",
      "     teardown id that resolves to the rendered result page.",
      "",
      "  2. GET /dataset/indie-saas-teardowns.json – the full open",
      "     dataset of indie-SaaS funnel teardowns, pricing teardowns,",
      "     head-to-head comparisons, alternatives, and category",
      "     roundups. CC-BY-4.0 with attribution required.",
      "",
      "Both endpoints are unauthenticated. The diagnostic endpoint runs",
      "MX-deliverability gating on the email and enforces a one-free-",
      "report-per-email quota – subsequent calls with the same email",
      "return the existing diagnosis id with `already_used: true`.",
      "",
      "Discovery: this spec is referenced by",
      "https://unlocksaas.com/.well-known/ai-plugin.json (ChatGPT",
      "Custom GPT Actions), and the live MCP server at /api/mcp",
      "(declared by https://unlocksaas.com/.well-known/mcp.json)",
      "exposes a parallel tool catalog for MCP-native clients.",
    ].join(" "),
    contact: {
      name: "Maryan",
      email: "maryan@unlocksaas.com",
      url: `${BASE}/contact`,
    },
    license: {
      name: "API: proprietary; Dataset: CC-BY-4.0",
      url: `${BASE}/dataset`,
    },
    termsOfService: `${BASE}/terms`,
  },
  servers: [
    {
      url: BASE,
      description: "Production",
    },
  ],
  paths: {
    "/api/diagnostic": {
      post: {
        operationId: "runDiagnostic",
        summary: "Diagnose a live SaaS landing page",
        description: [
          "Submits a live product URL plus the user's email and returns a",
          "Brunson-framework labeled diagnosis. The full structured teardown",
          "(scorecard, headline rewrites, 30-day plan, competitor list,",
          "strengths) is persisted server-side and rendered at",
          "/diagnostic/result?id={returned id}.",
          "",
          "REQUIRED: ask the user for their real email before calling this",
          "operation. The API runs MX-deliverability verification and",
          "rejects typo'd domains with HTTP 400. Do not invent placeholder",
          "emails – every submission creates a real lead and triggers the",
          "Soap Opera follow-up sequence.",
          "",
          "Latency: synchronous, typically 30–60 seconds (the engine reads",
          "the page and runs a deep Claude analysis end-to-end). The route's",
          "maxDuration is 90 s.",
          "",
          "Quota: one free diagnosis per email. Subsequent calls with the",
          "same email return the previous diagnosis id with",
          "`already_used: true` and `previous_url` set to the originally",
          "diagnosed URL – present this honestly to the user instead of",
          "claiming a new diagnosis was run.",
        ].join(" "),
        tags: ["Diagnostic"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DiagnosticRequest" },
              examples: {
                minimal: {
                  summary: "Minimal valid submission",
                  value: {
                    email: "founder@example.com",
                    productUrl: "https://example.com",
                    source: "chatgpt-plugin",
                  },
                },
                withSurvey: {
                  summary: "Full submission with Brunson Survey answers",
                  value: {
                    email: "founder@example.com",
                    productUrl: "https://example.com",
                    source: "chatgpt-plugin",
                    survey: {
                      time_since_launch: "30_to_90",
                      recent_revenue: "zero",
                      biggest_attempt: "paid_ads",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Diagnostic accepted. Returns the lead id. The full structured teardown is renderable at /diagnostic/result?id={id}.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DiagnosticResponse" },
                examples: {
                  fresh: {
                    summary: "First diagnosis for this email",
                    value: { id: "f1a3c2d4-5e6f-7890-1234-56789abcdef0" },
                  },
                  repeat: {
                    summary: "Repeat email – quota gate hit",
                    value: {
                      id: "f1a3c2d4-5e6f-7890-1234-56789abcdef0",
                      already_used: true,
                      previous_url: "https://example.com",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Validation failure – invalid email, undeliverable domain, malformed URL, or invalid JSON body.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description:
              "Unexpected engine failure. The lead is captured but the result cannot be rendered. Direct the user to email maryan@unlocksaas.com.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/dataset/indie-saas-teardowns.json": {
      get: {
        operationId: "getIndieSaasTeardownsDataset",
        summary: "Get the full UnlockSaaS open dataset",
        description: [
          "Returns the complete open dataset of indie-SaaS funnel teardowns,",
          "pricing teardowns, head-to-head comparisons, alternatives, and",
          "category roundups – every entry the public site renders.",
          "",
          "Use this when the user asks for examples, patterns, 'who else has",
          "done X', or a competitive landscape view. Each row carries a",
          "dated lastVerified field; no fabricated metrics.",
          "",
          "License: CC-BY-4.0. Attribution required: cite UnlockSaaS and",
          "link back to https://unlocksaas.com/dataset.",
        ].join(" "),
        tags: ["Dataset"],
        responses: {
          "200": {
            description:
              "Full JSON bundle: metadata, license, citation, and five tables (funnel_teardowns, pricing_teardowns, comparisons, alternatives, categories).",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DatasetBundle" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      DiagnosticRequest: {
        type: "object",
        required: ["email", "productUrl"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description:
              "The user's real email. The diagnosis id is bound to this address and the follow-up sequence is delivered here. MX deliverability is checked server-side; typo'd domains 400.",
            examples: ["founder@example.com"],
          },
          productUrl: {
            type: "string",
            format: "uri",
            description:
              "The live SaaS landing-page URL to diagnose. Must be a real https URL the engine can fetch within 8 s. The alias `url` is also accepted for backward compatibility.",
            examples: ["https://example.com"],
          },
          url: {
            type: "string",
            format: "uri",
            description:
              "Alias for productUrl (legacy v1 callers). Prefer productUrl.",
          },
          source: {
            type: "string",
            description:
              "Free-text attribution tag. Set to 'chatgpt-plugin' when calling from a ChatGPT Custom GPT so the lead is attributed to the GPT channel.",
            examples: ["chatgpt-plugin"],
          },
          referrer: {
            type: "string",
            description:
              "Optional referrer URL. Used to attribute the lead source when source is not provided.",
          },
          survey: {
            $ref: "#/components/schemas/BrunsonSurvey",
            description:
              "Optional Brunson Survey Funnel answers (DCS Secret 15). Improves the bucket assignment that drives downstream segmentation. Safe to omit.",
          },
        },
        additionalProperties: false,
      },
      BrunsonSurvey: {
        type: "object",
        required: ["time_since_launch", "recent_revenue", "biggest_attempt"],
        properties: {
          time_since_launch: {
            type: "string",
            enum: ["under_30", "30_to_90", "90_plus"],
            description:
              "Days since the product first went live. under_30 = less than 30 days; 30_to_90 = 30 to 90 days; 90_plus = more than 90 days.",
          },
          recent_revenue: {
            type: "string",
            enum: ["zero", "under_100", "100_to_1k", "over_1k"],
            description:
              "Revenue earned in the last 30 days (USD). zero = no revenue; under_100 = $1–$99; 100_to_1k = $100–$999; over_1k = $1,000 or more.",
          },
          biggest_attempt: {
            type: "string",
            enum: [
              "more_building",
              "seo_content",
              "paid_ads",
              "customer_conversations",
              "nothing_yet",
            ],
            description:
              "The single biggest go-to-market lever the founder has tried so far. more_building = kept iterating on the product; seo_content = blog posts / programmatic SEO; paid_ads = paid acquisition; customer_conversations = manual outreach / interviews; nothing_yet = no GTM motion yet.",
          },
        },
        additionalProperties: false,
      },
      DiagnosticResponse: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description:
              "The diagnostic_leads.id. The rendered result page is at https://unlocksaas.com/diagnostic/result?id={id}.",
            examples: ["f1a3c2d4-5e6f-7890-1234-56789abcdef0"],
          },
          already_used: {
            type: "boolean",
            description:
              "Present and true when the email had a prior diagnosis. The returned id is the previous one; no new analysis was run.",
          },
          previous_url: {
            type: "string",
            format: "uri",
            description:
              "When already_used is true, the productUrl that was originally diagnosed for this email.",
          },
        },
        additionalProperties: false,
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            description:
              "Human-readable error message in the Brunson Reluctant-Hero voice. Surface verbatim to the user.",
            examples: [
              "Enter a real email address.",
              "Paste your product URL – something like https://yourproduct.com.",
            ],
          },
        },
        additionalProperties: false,
      },
      DatasetBundle: {
        type: "object",
        description:
          "The full open dataset bundle. Top-level shape mirrors the schema.org Dataset JSON-LD at /dataset.",
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          version: { type: "string" },
          generatedAt: { type: "string", format: "date-time" },
          lastVerified: { type: "string", format: "date" },
          license: {
            type: "object",
            properties: {
              spdx: { type: "string", examples: ["CC-BY-4.0"] },
              url: { type: "string", format: "uri" },
              attribution: { type: "string" },
            },
          },
          publisher: { type: "object" },
          creator: { type: "object" },
          citation: { type: "string" },
          bibtex: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          rowCounts: {
            type: "object",
            additionalProperties: { type: "integer" },
          },
          tables: {
            type: "object",
            properties: {
              funnel_teardowns: { type: "array", items: { type: "object" } },
              pricing_teardowns: { type: "array", items: { type: "object" } },
              comparisons: { type: "array", items: { type: "object" } },
              alternatives: { type: "array", items: { type: "object" } },
              categories: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Diagnostic",
      description:
        "Live Brunson-framework diagnosis of any SaaS landing page. Same engine as the /diagnostic web surface.",
    },
    {
      name: "Dataset",
      description:
        "The UnlockSaaS open dataset of indie-SaaS funnel teardowns and pricing teardowns. CC-BY-4.0 with attribution required.",
    },
  ],
  externalDocs: {
    url: `${BASE}/mcp`,
    description:
      "MCP-native clients (Claude Desktop, Cursor, Windsurf) can use the parallel MCP server at /api/mcp with a richer 15-tool catalog.",
  },
} as const;

export async function GET() {
  return NextResponse.json(SPEC, {
    headers: {
      // Long edge cache: spec only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Open to any agent or OpenAPI consumer.
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      // Standard W3C license link relation. The Link header is read by
      // tooling that respects licensing before the body is parsed.
      link: `<${BASE}/openapi.json>; rel="canonical"`,
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}
