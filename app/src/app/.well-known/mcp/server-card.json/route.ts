import { NextResponse } from "next/server";
import { cacheLife } from "next/cache";

/**
 * /.well-known/mcp/server-card.json - agent-commerce server card.
 *
 * Emerging convention (alongside /.well-known/mcp.json): a single-card JSON
 * that agent directories and MCP registries can ingest without scraping.
 * This card carries BOTH the technical surface (endpoints, capabilities)
 * AND the commercial surface (offers), so an agent can go from discovery
 * to a purchasable offer without a human.
 *
 * Brunson Hard-Rule reconciliation: every field describes an existing,
 * deployed surface. The offers match the /agent-readiness landing page and
 * the live Stripe payment links exactly ($29 basic, $49 full). No invented
 * numbers, no invented capabilities.
 */

const BASE = "https://unlocksaas.com";

const SERVER_CARD = {
  schemaVersion: "0.1",
  name: "unlocksaas",
  displayName: "UnlockSaaS",
  version: "1.0.0",
  description:
    "UnlockSaaS audits how visible SaaS products are to AI agents. Core paid offer: the Agent-Readiness Report, a one-time 12-point audit (llms.txt, llms-full.txt, MCP manifests, ai-plugin.json, OpenAPI, robots.txt AI-crawler rules, JSON-LD coverage, sitemap freshness, MCP server presence, x402 readiness, machine-readable agent checkout). Report delivered within 48 hours (24h on Full). Free surfaces: 33 funnel teardowns, 31 pricing teardowns, 55 head-to-head comparisons via the MCP server.",
  homepageUrl: BASE,
  serverUrl: `${BASE}/api/mcp`,
  discoveryManifest: `${BASE}/.well-known/mcp.json`,
  contactEmail: "maryan@unlocksaas.com",
  publisher: {
    name: "UnlockSaaS",
    url: BASE,
  },
  capabilities: {
    tools: true,
    prompts: false,
    resources: false,
  },
  commerce: {
    paymentScheme: "card",
    checkoutProvider: "stripe",
    offers: [
      {
        sku: "agent-readiness-basic",
        name: "Agent-Readiness Report (Basic)",
        description:
          "Full 12-point agent-readiness audit of one live URL: pass/fail per check with evidence, fix list ordered by impact. Delivered within 48 hours.",
        price: 29,
        priceCurrency: "USD",
        purchaseUrl: "https://buy.stripe.com/8x23cucFdeZO34a8E00x20S",
        offerPage: `${BASE}/agent-readiness`,
      },
      {
        sku: "agent-readiness-full",
        name: "Agent-Readiness Report (Full)",
        description:
          "Everything in Basic plus ready-to-ship fix files (llms.txt pricing block, /.well-known/mcp/server-card.json, robots.txt AI rules) and priority 24-hour delivery.",
        price: 49,
        priceCurrency: "USD",
        purchaseUrl: "https://buy.stripe.com/8x200i0Wv4laawC5rO0x20T",
        offerPage: `${BASE}/agent-readiness`,
      },
    ],
  },
};

/**
 * Cached card payload. 'use cache' requires a serializable return value,
 * so we cache the plain object and let GET wrap it fresh in NextResponse.json
 * (same proven shape as .well-known/mcp.json/route.ts).
 */
async function getServerCard(): Promise<typeof SERVER_CARD> {
  "use cache";
  cacheLife("max");
  return SERVER_CARD;
}

export async function GET() {
  const card = await getServerCard();
  return NextResponse.json(card, {
    headers: {
      // Long edge cache: the card only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Open to any agent or registry.
      "access-control-allow-origin": "*",
    },
  });
}
