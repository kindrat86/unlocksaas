import type { Metadata } from "next";
import Link from "next/link";

/**
 * /agent-readiness - productized Agent-Readiness audit ($29 basic / $49 full).
 *
 * Productized audit: we run the 12-point agent-readiness checklist against a
 * live site and deliver the report within 48 hours. No access to the
 * customer's codebase is needed: every check runs against the public site.
 *
 * Copy rules (house style): Hormozi value-tone, short lines, no invented
 * numbers (no fake customer counts, no fabricated score improvements). The
 * 12 checks listed here are EXACTLY the checks the delivery pipeline runs
 * (scripts/agent-readiness-check.py) - no invented capability claims.
 *
 * Machine-readable offer: the JSON-LD below carries both price points so an
 * agent (or our own checklist) can parse the offer. Pricing is ALSO declared
 * in /llms.txt and /.well-known/mcp/server-card.json (same numbers).
 */

export const metadata: Metadata = {
  title: "Agent-Readiness Report - Is Your SaaS Visible to AI Agents?",
  description:
    "One-time 12-point audit: llms.txt, MCP, OpenAPI, robots.txt AI rules, JSON-LD, sitemap freshness, x402 readiness, agent checkout. Report in 48 hours. $29 basic, $49 full.",
  alternates: { canonical: "/agent-readiness" },
};

const STRIPE_BASIC = "https://buy.stripe.com/8x23cucFdeZO34a8E00x20S";
const STRIPE_FULL = "https://buy.stripe.com/8x200i0Wv4laawC5rO0x20T";

const CHECKS: { title: string; detail: string }[] = [
  { title: "llms.txt", detail: "Present, non-empty, crawlable by LLM crawlers" },
  { title: "llms-full.txt", detail: "The expanded corpus agents prefer when it exists" },
  { title: "/.well-known/mcp.json", detail: "Valid JSON discovery manifest" },
  { title: "/.well-known/mcp/server-card.json", detail: "Valid server card for agent directories" },
  { title: "/.well-known/ai-plugin.json", detail: "Valid plugin manifest" },
  { title: "/openapi.json", detail: "Valid OpenAPI with declared paths" },
  { title: "robots.txt AI-crawler rules", detail: "GPTBot, ClaudeBot, PerplexityBot, Google-Extended and 10 more addressed" },
  { title: "JSON-LD schema coverage", detail: "Typed structured data on your homepage" },
  { title: "Sitemap freshness", detail: "sitemap.xml present with a recent lastmod" },
  { title: "MCP server presence", detail: "Declared MCP endpoint actually responds" },
  { title: "x402 readiness", detail: "Signals that an agent could PAY your API" },
  { title: "Agent checkout flow", detail: "A machine-readable offer an agent can parse. We never complete a purchase." },
];

function ProductJsonLd() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "UnlockSaaS Agent-Readiness Report",
    description:
      "One-time 12-point audit of how visible your SaaS is to AI agents: llms.txt, MCP, OpenAPI, robots.txt AI rules, JSON-LD, sitemap freshness, x402 readiness, agent checkout. Report delivered within 48 hours.",
    brand: { "@type": "Brand", name: "UnlockSaaS" },
    url: "https://unlocksaas.com/agent-readiness",
    offers: [
      {
        "@type": "Offer",
        name: "Basic",
        price: "29.00",
        priceCurrency: "USD",
        url: STRIPE_BASIC,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Full",
        price: "49.00",
        priceCurrency: "USD",
        url: STRIPE_FULL,
        availability: "https://schema.org/InStock",
      },
    ],
  };
  return (
    // Safe: JSON.stringify of a static literal defined above; no user or
    // request-time content is interpolated into this block.
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export default function AgentReadinessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <ProductJsonLd />

      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-600">
        One-time audit. No subscription.
      </p>
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        Your SaaS is invisible to AI agents.
        <br />
        <span className="text-neutral-500">Here is exactly why - in 48 hours.</span>
      </h1>
      <p className="mt-6 text-lg text-neutral-700">
        ChatGPT, Claude, and Perplexity only recommend products they can READ:
        llms.txt, MCP manifests, clean OpenAPI, AI-crawler rules, structured
        data, a machine-readable offer. Most SaaS sites fail most of these -
        and never find out.
      </p>
      <p className="mt-4 text-lg text-neutral-700">
        We run a 12-point agent-readiness audit against your live site and send
        you the report within 48 hours: pass/fail per check, the evidence, and
        the fix list ordered by impact. No access to your codebase. No call.
      </p>

      <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-xl font-bold">The 12 checks</h2>
        <p className="mt-1 text-sm text-neutral-600">
          This is the exact checklist the report runs. Nothing hidden.
        </p>
        <ol className="mt-4 space-y-2">
          {CHECKS.map((c, i) => (
            <li key={c.title} className="flex gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>
                <span className="font-semibold">{c.title}</span>
                <span className="text-neutral-600"> - {c.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold">Basic - $29</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Full 12-point audit of your live URL</li>
            <li>Pass/fail per check with evidence</li>
            <li>Fix list ordered by impact</li>
            <li>Delivered within 48 hours</li>
          </ul>
          <a
            href={STRIPE_BASIC}
            className="mt-6 block rounded-xl bg-neutral-900 px-4 py-3 text-center font-semibold text-white hover:bg-neutral-700"
          >
            Get the Basic report - $29
          </a>
        </div>
        <div className="rounded-2xl border-2 border-neutral-900 p-6">
          <h3 className="text-lg font-bold">
            Full - $49{" "}
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase text-amber-700">
              Most picked
            </span>
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Everything in Basic</li>
            <li>Ready-to-ship fix files: llms.txt pricing block, /.well-known/mcp/server-card.json, robots.txt AI rules</li>
            <li>Priority 24-hour delivery</li>
          </ul>
          <a
            href={STRIPE_FULL}
            className="mt-6 block rounded-xl bg-amber-500 px-4 py-3 text-center font-semibold text-white hover:bg-amber-400"
          >
            Get the Full report - $49
          </a>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-xl font-bold">How it works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700">
          <li>Pay and paste your URL in the Stripe checkout notes (or reply to the receipt email).</li>
          <li>We audit your live site. Public pages only. No codebase access, no purchase on your site.</li>
          <li>Report lands in your inbox within 48 hours (24h on Full).</li>
        </ol>
        <p className="mt-4 text-xs text-neutral-500">
          Audit only: we never complete a purchase on your site, we only check
          that an agent COULD. Questions first?{" "}
          <Link href="/contact" className="underline">
            Contact us
          </Link>
          .
        </p>
      </div>

      <p className="mt-10 text-center text-sm text-neutral-500">
        Run by the UnlockSaaS team. The audit is honest: if your site passes all
        12, the report says so and you paid $29 to sleep well.
      </p>
    </main>
  );
}
