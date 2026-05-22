import { ImageResponse } from "next/og";

import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import {
  TOOLS_HUB_LAST_REVIEWED_AT,
} from "@/lib/tools-catalog";

/**
 * Open Graph card for /tools – the free SaaS calculator hub.
 *
 * Visual contract matches the rest of the editorial fleet via
 * buildOgCard, so a hub-card share and a slug-card share read as
 * one product on any social surface.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateImageMetadata() {
  return [
    {
      id: "card",
      alt: "Free SaaS calculators – LTV, churn, CAC payback, pricing power, revenue projection – Unlock SaaS",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default function OgImage() {
  return new ImageResponse(
    buildOgCard({
      eyebrow: "Free tools",
      headline: "Five free SaaS calculators. No email gate.",
      subhead:
        "LTV, churn cost, post-launch revenue, CAC payback, pricing power. The same math the $49 Playbook walks you through.",
      dateline: `Last reviewed ${TOOLS_HUB_LAST_REVIEWED_AT} · unlocksaas.com`,
    }),
    { ...OG_SIZE },
  );
}
