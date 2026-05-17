/**
 * Shared OG-card visual for the four pSEO Open Graph routes.
 *
 * Surface A of strategy/google-strategy.md, closing the per-slug OG gap
 * flagged in the 2026-05-17 SEO audit. Centralising the JSX here means the
 * fleet of 56 pSEO share previews (alternatives + funnel teardowns +
 * pricing teardowns + head-to-head comparisons) reads as one product on
 * any social surface, and a future visual change lands in one file
 * instead of four.
 *
 * Per-slug callers stay thin route handlers under
 * src/app/(marketing)/<surface>/[slug]/opengraph-image.tsx — each reads
 * its manifest entry, hands the four caption strings to buildOgCard, and
 * wraps the returned element in `new ImageResponse(..., OG_SIZE)`.
 *
 * Visual contract matches the root /opengraph-image.tsx fallback (dark
 * Geist palette + "U" brand mark + Unlock SaaS wordmark) so an unrouted
 * URL inheriting the root card and a per-slug URL rendering this card
 * sit in the same visual family.
 *
 * next/og + satori constraints honoured here:
 *   - display: flex on every container with > 1 child
 *   - no shorthand `background:` props beyond a flat colour
 *   - no CSS gradients, no filters, no shadow shorthands
 *   - fontFamily resolves to a system-installed stack (Geist isn't
 *     bundled into the satori runtime; the system stack is the visually-
 *     closest readily-available match)
 *
 * Brunson Hard-Rule reconciliation: every caption string is supplied by
 * a caller reading a live manifest the HTML page also renders. No
 * fabricated copy lives in this module; only structure does.
 */

/** Fixed 1.91:1 ratio (1200x630) — the only ratio Twitter/X, LinkedIn,
 * Slack, iMessage, Facebook, and Discord all render at the large-card
 * preview width. Twitter caps file size around 5 MB; satori PNGs under
 * `next/og` ship well under that for cards of this shape. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** PNG over JPEG: satori only emits PNG, transparency support is not
 * needed here but PNG keeps text edges crisp at the bottom of social-card
 * scaling pipelines. */
export const OG_CONTENT_TYPE = "image/png" as const;

/** Caption inputs every per-slug card supplies. */
export interface OgCardInput {
  /** Top-right pill label, e.g. "Funnel Teardown", "Head-to-head",
   *  "Pricing Teardown", "Alternative to". Title Case, < 32 chars. */
  eyebrow: string;
  /** Primary heading rendered at ~84px. The display name + lens for
   *  teardowns, or the literal "A vs B" string for comparisons. < 64 chars
   *  is the safe column for a two-line render at 1040px max-width. */
  headline: string;
  /** Secondary line rendered at ~32px. The manifest `oneLine`. */
  subhead: string;
  /** Bottom-left line, e.g. "Last verified 2026-05-17" or
   *  "unlocksaas.com" as a defensive fallback when the manifest entry
   *  isn't available. */
  dateline: string;
}

// Module-level palette — `server-hoist-static-io` pattern from the
// Vercel React Best Practices guide. Pre-bound primitives are cheaper
// to reference than string literals re-evaluated per render.
const BG = "#0a0a0b";
const FG = "#fafafa";
const MUTED = "#a1a1aa";
const SUBTLE = "#71717a";
const BORDER = "#27272a";

/**
 * Build the OG-card JSX. Returns a React element the caller hands to
 * `new ImageResponse(...)`. Keeping this a pure render (no ImageResponse
 * wrapper here) lets the caller add per-route options (e.g. custom
 * fonts in future) without re-implementing the visual.
 */
export function buildOgCard(input: OgCardInput) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: BG,
        color: FG,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        padding: "64px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top row: brand mark + wordmark on the left, eyebrow chip on the right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: MUTED,
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: FG,
              color: BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              borderRadius: 8,
              letterSpacing: "-0.04em",
            }}
          >
            U
          </div>
          <span style={{ fontWeight: 600, color: FG }}>Unlock SaaS</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            border: `1px solid ${BORDER}`,
            padding: "10px 18px",
            borderRadius: 999,
          }}
        >
          {input.eyebrow}
        </div>
      </div>

      {/* Middle: per-slug headline + subhead */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: FG,
            maxWidth: 1040,
          }}
        >
          {input.headline}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: MUTED,
            maxWidth: 1040,
          }}
        >
          {input.subhead}
        </div>
      </div>

      {/* Bottom row: dateline on the left (audit trail), canonical anchor on the right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 24,
          color: SUBTLE,
        }}
      >
        <span style={{ display: "flex" }}>{input.dateline}</span>
        <span style={{ color: FG, fontWeight: 600 }}>unlocksaas.com</span>
      </div>
    </div>
  );
}
