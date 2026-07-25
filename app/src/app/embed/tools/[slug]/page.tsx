import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TOOL_BY_SLUG } from "@/lib/tools-catalog";
import { BASE_URL } from "@/lib/seo/entity";

// Widget imports — each calculator renders the exact same component
// the main tool page uses. No reimplementation, no props drift.
import { LtvWidget } from "@/components/tools/ltv-widget";
import { PricingPowerWidget } from "@/components/tools/pricing-power-widget";
import { ChurnCostWidget } from "@/components/tools/churn-cost-widget";
import { CacPaybackWidget } from "@/components/tools/cac-payback-widget";

const WIDGETS: Record<string, React.ReactNode> = {
  "ltv-calculator": <LtvWidget />,
  "pricing-power-calculator": <PricingPowerWidget />,
  "churn-cost-calculator": <ChurnCostWidget />,
  "cac-payback-calculator": <CacPaybackWidget />,
};

export function generateStaticParams() {
  return Object.keys(WIDGETS).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Metadata {
  // Next.js resolves params for generateMetadata synchronously in practice,
  // but the type demands Promise. Use a sync cast since params is already
  // resolved when metadata runs during SSG.
  const resolved = params as unknown as { slug: string };
  const tool = TOOL_BY_SLUG.get(resolved.slug);
  return {
    title: tool ? `${tool.title} (embed)` : "Calculator embed",
    robots: { index: false, follow: true },
    alternates: {
      types: {
        "application/json+oembed": `${BASE_URL}/embed/tools/${resolved.slug}/oembed.json`,
      },
    },
  };
}

export default async function EmbedToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const widget = WIDGETS[slug];
  const tool = TOOL_BY_SLUG.get(slug);
  if (!widget || !tool) notFound();

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${BASE_URL}${tool.path}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "UnlockSaaS", url: BASE_URL },
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      {widget}
      <p
        style={{
          fontSize: 12,
          textAlign: "center",
          marginTop: 12,
          opacity: 0.8,
        }}
      >
        <Link href={`${BASE_URL}${tool.path}`} rel="dofollow">
          {tool.title} — powered by UnlockSaaS
        </Link>
      </p>
    </div>
  );
}
