/**
 * Dynamic OG image for /builder/[slug].
 *
 * Renders the Verified Builder card as a 1200x630 social preview using
 * Next.js's built-in ImageResponse (Satori under the hood). Picked up
 * automatically by Next when colocated next to page.tsx.
 *
 * Kept deliberately type-light and font-stack-light so it works in any
 * runtime without bundling additional font files.
 */
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge } from "@/lib/builder-badge";

// Static alt is intentional even though the page is force-dynamic: per-
// slug alt would force a third loadPublicBadge call per OG fetch (the
// page already calls it in generateMetadata + the page render). The card's
// builder name + product line are the per-slug signal; og:title and
// og:description on the page already carry both, so screen-reader and
// preview-card users get the name from those.
// Follow-up: wrap loadPublicBadge in React.cache() for request-scoped
// memoization, then promote this to generateImageMetadata.
export const alt =
  "Verified Builder badge – Stripe-verified first paying customer, not self-reported";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const badge = await loadPublicBadge(createAdminClient(), slug);

  const headline = badge
    ? `${badge.builderName} shipped and got paid.`
    : "Verified Builder";
  const product = badge?.productName ?? "";
  const dateStr = badge
    ? badge.firstCustomerAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "72px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#a3a3a3",
            fontSize: "22px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            ✓ Verified Builder
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          <div
            style={{
              fontSize: badge ? "76px" : "96px",
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {headline}
          </div>
          {product && (
            <div
              style={{
                fontSize: "36px",
                color: "#a3a3a3",
                display: "flex",
              }}
            >
              {product}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#a3a3a3",
            fontSize: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {dateStr && (
              <span style={{ color: "#fafafa", fontSize: "22px" }}>
                Verified by Stripe · {dateStr}
              </span>
            )}
            <span style={{ fontSize: "20px" }}>
              Not self-reported. A paying customer on a connected Stripe account.
            </span>
          </div>
          <div style={{ display: "flex", fontSize: "22px" }}>unlocksaas.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
