import type { Metadata } from "next";

import { ToolDetailScaffold } from "@/components/tools/tool-detail-scaffold";
import { RevenueProjectorWidget } from "@/components/tools/revenue-projector-widget";
import { TOOL_BY_SLUG } from "@/lib/tools-catalog";

const tool = TOOL_BY_SLUG.get("revenue-projector")!;

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

export default function RevenueProjectorPage() {
  return (
    <ToolDetailScaffold
      slug="revenue-projector"
      widget={<RevenueProjectorWidget />}
    />
  );
}
