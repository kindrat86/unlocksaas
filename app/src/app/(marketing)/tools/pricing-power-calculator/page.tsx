import type { Metadata } from "next";

import { ToolDetailScaffold } from "@/components/tools/tool-detail-scaffold";
import { PricingPowerWidget } from "@/components/tools/pricing-power-widget";
import { TOOL_BY_SLUG } from "@/lib/tools-catalog";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

const tool = TOOL_BY_SLUG.get("pricing-power-calculator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: {
    ...pageAlternates(tool.path),
    types: {
      "application/json+oembed": `https://unlocksaas.com/embed/tools/${tool.slug}/oembed.json`,
    },
  },
  openGraph: {
    type: "article",
    title: tool.title,
    description: tool.description,
    url: tool.path,
  },
  twitter: {
    card: "summary_large_image",
    title: tool.title,
    description: tool.description,
  },
  robots: { index: true, follow: true },
};

export default function PricingPowerPage() {
  return (
    <ToolDetailScaffold
      slug="pricing-power-calculator"
      widget={<PricingPowerWidget />}
    />
  );
}
