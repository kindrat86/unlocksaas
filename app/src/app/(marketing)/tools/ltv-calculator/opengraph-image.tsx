import { ImageResponse } from "next/og";

import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { TOOL_BY_SLUG, TOOLS_HUB_LAST_REVIEWED_AT } from "@/lib/tools-catalog";

const tool = TOOL_BY_SLUG.get("ltv-calculator")!;

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateImageMetadata() {
  return [
    {
      id: "card",
      alt: `${tool.title} – ${tool.ogSubhead}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default function OgImage() {
  return new ImageResponse(
    buildOgCard({
      eyebrow: tool.eyebrow,
      headline: tool.title,
      subhead: tool.ogSubhead,
      dateline: `Last reviewed ${TOOLS_HUB_LAST_REVIEWED_AT} · unlocksaas.com`,
    }),
    { ...OG_SIZE },
  );
}
