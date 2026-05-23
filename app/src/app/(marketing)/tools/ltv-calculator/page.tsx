import type { Metadata } from "next";

import { ToolDetailScaffold } from "@/components/tools/tool-detail-scaffold";
import { LtvWidget } from "@/components/tools/ltv-widget";
import { TOOL_BY_SLUG } from "@/lib/tools-catalog";

const tool = TOOL_BY_SLUG.get("ltv-calculator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.description,
  alternates: { canonical: tool.path },
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

export default function LtvCalculatorPage() {
  return <ToolDetailScaffold slug="ltv-calculator" widget={<LtvWidget />} />;
}
