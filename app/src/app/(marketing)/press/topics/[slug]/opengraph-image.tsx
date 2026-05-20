import { ImageResponse } from "next/og";
import {
  PRESS_TOPIC_SLUGS,
  getPressTopicBySlug,
} from "@/lib/press-topics";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /press/topics/[slug].
 *
 * Why this surface exists
 * ----------------------
 * Press topic URLs are shared in Slack DMs to journalists, in email
 * pitches to podcast hosts, and in social-media replies pointing
 * writers at a pre-built angle. Generic fallback OG previews cap
 * inbound share-CTR around 1%; named-topic preview cards run 3-6x
 * higher on the surfaces where the URLs spread (founder Twitter,
 * Slack press channels, LinkedIn DMs).
 *
 * Visual contract matches the four other pSEO OG routes (alternatives-to,
 * funnel-teardown, pricing-teardown, compare). All visual logic lives in
 * src/lib/seo/og-card.tsx so the press-topic card reads as part of the
 * same fleet on any social surface.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Every field on the card is a string from the same PressTopic manifest
 * the HTML page renders. Drift between page, schema, markdown, and OG
 * card is impossible by construction.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return PRESS_TOPIC_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

/**
 * Per-slug og:image:alt. The named topic is what makes Slack/Discord/X
 * previews convert journalists mid-pitch, AND what screen-reader users
 * actually hear when the preview lands in their feed.
 */
export function generateImageMetadata({ params }: { params: Params }) {
  const t = getPressTopicBySlug(params.slug);
  const name = t?.displayName ?? "Press topic";
  return [
    {
      id: "card",
      alt: `${name} – pre-assembled story package for journalists, Unlock SaaS press kit`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const t = getPressTopicBySlug(slug);

  // Defensive fallback: dynamicParams=false should make this unreachable,
  // but a stale slug list during a future refactor must still render a
  // sane card rather than crash the build.
  return new ImageResponse(
    buildOgCard({
      eyebrow: "Press topic",
      headline: t ? t.displayName : "Unlock SaaS press topics",
      subhead:
        t?.thesis ??
        "Pre-assembled story packages for journalists, podcasters, and AI summarisers.",
      dateline: t ? `Last verified ${t.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
