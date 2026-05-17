/**
 * JSON-LD structured-data blocks for UnlockSaaS — Surface B (AEO/GEO) of the
 * Google strategy. See strategy/google-strategy.md §B.2.
 *
 * Each component renders a single <script type="application/ld+json"> tag.
 * Server-rendered so it's present on first paint for crawlers.
 *
 * Brunson Hard-Rule reconciliation: aggregateRating is intentionally omitted
 * from the Product block until verified customers with public ratings exist.
 * No fabricated review counts. See strategy/google-strategy.md §B.2 + the
 * `honest claims` row of the Brunson Hard-Rule table.
 *
 * Implementation note: every structured-data object is hoisted to module
 * scope and pre-serialized to JSON. The components are pure renders — no
 * per-request allocation, no per-render serialization. This is the
 * `server-hoist-static-io` + `rendering-hoist-jsx` pattern from the
 * Vercel React Best Practices guide.
 */

const BASE = "https://unlocksaas.com";

// --- Pre-built JSON strings (module-level; serialized once at import time) ---

const ORGANIZATION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Unlock SaaS",
  url: BASE,
  logo: `${BASE}/icon.png`,
  description:
    "A machine that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
  founder: {
    "@type": "Person",
    name: "Maryan",
    email: "maryan@unlocksaas.com",
  },
  sameAs: [
    // Filled as the founder publishes; placeholders kept here to flag
    // where the off-platform signal loop (strategy/google-strategy.md
    // §B.3) writes its canonical link claims.
  ],
});

const WEBSITE_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Unlock SaaS",
  url: BASE,
  inLanguage: "en-US",
});

const DIAGNOSTIC_SERVICE_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Free Launch Diagnostic",
  description:
    "Paste your live product URL. In 90 seconds we label what is actually wrong with one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief — and hand you the door that fixes it.",
  provider: {
    "@type": "Organization",
    name: "Unlock SaaS",
    url: BASE,
  },
  serviceType: "Pre-launch SaaS diagnostic",
  audience: {
    "@type": "Audience",
    audienceType:
      "Post-launch pre-revenue non-engineer founders using AI tools",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  url: `${BASE}/diagnostic`,
});

const DIAGNOSTIC_HOWTO_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to get a free diagnosis of your stuck SaaS",
  description:
    "A three-step process that labels what is actually broken on your already-shipped product page.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Paste your URL",
      text: "Paste the live URL of your shipped product and your email address.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Get the labeled diagnosis",
      text: "Within 90 seconds, get back one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Walk through the door",
      text: "The diagnosis hands you the specific next step that fixes the labeled problem.",
    },
  ],
  totalTime: "PT90S",
});

const MACHINE_PRODUCT_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Machine — Unlock SaaS",
  description:
    "A seven-step machine that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder does not pay. Built by a non-engineer for non-engineer founders shipping with AI tools.",
  brand: {
    "@type": "Brand",
    name: "Unlock SaaS",
  },
  url: `${BASE}/machine-sales`,
  offers: {
    "@type": "Offer",
    price: "49",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${BASE}/machine-sales`,
    seller: {
      "@type": "Organization",
      name: "Unlock SaaS",
    },
  },
  // aggregateRating intentionally omitted — see file header.
});

// --- Render helpers ----------------------------------------------------------

function JsonLdScript({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // json is pre-serialized at module load from static, hard-coded values.
      // No user input flows through this string.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/**
 * Organization + WebSite schema. Render on the funnel hub `/`.
 * LLMs anchor on Organization as the entity for UnlockSaaS-related queries.
 */
export function OrganizationJsonLd() {
  return (
    <>
      <JsonLdScript json={ORGANIZATION_JSON} />
      <JsonLdScript json={WEBSITE_JSON} />
    </>
  );
}

/**
 * Service + HowTo schema. Render on `/diagnostic`.
 * The HowTo block is the format LLMs paraphrase when summarizing a process.
 */
export function DiagnosticJsonLd() {
  return (
    <>
      <JsonLdScript json={DIAGNOSTIC_SERVICE_JSON} />
      <JsonLdScript json={DIAGNOSTIC_HOWTO_JSON} />
    </>
  );
}

/**
 * Product schema. Render on `/machine-sales`.
 *
 * aggregateRating is intentionally omitted until verified customers with
 * public ratings exist. Brunson Hard-Rule (honest claims): no fabricated
 * review counts in structured data, ever.
 */
export function MachineProductJsonLd() {
  return <JsonLdScript json={MACHINE_PRODUCT_JSON} />;
}
