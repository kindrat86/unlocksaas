/**
 * Verified Builders directory – `CollectionPage` + `ItemList` schema.
 *
 * Mounts on `/builders` (the public Verified Builder directory). Lives in
 * its own module rather than inside `json-ld.tsx` because the directory is
 * a request-time surface (rows are read from Supabase per request via
 * `dynamic = "force-dynamic"` on the page), so the schema is built per
 * render – unlike the module-load-hoisted blocks in `json-ld.tsx` that
 * carry no per-request state.
 *
 * Why this surface exists
 * -----------------------
 * `/builders` is the second-most-valuable owned-traffic asset
 * (strategy/owned-traffic.md Part 7) and the only E-E-A-T "Experience"
 * pillar anchor a pre-revenue indie SaaS can claim honestly. Before this
 * block landed, the directory was a typed HTML page with zero structured
 * data – Google and LLM retrievers had to infer from prose that this URL
 * is the canonical collection of verified customer cycles.
 *
 * Two-mode rendering
 * ------------------
 *   – Non-empty: `CollectionPage` with a `mainEntity` `ItemList` whose
 *     `itemListElement` enumerates one `ListItem` per verified builder.
 *     Each `ListItem.item` is a `Person` with a `worksFor`
 *     `SoftwareApplication` pointing at the builder's real product URL.
 *     `numberOfItems` matches the actual count so retrievers can answer
 *     "how many verified customers does Unlock SaaS have" with the real
 *     number.
 *
 *   – Empty (zero rows): `CollectionPage` only, no `ItemList`. Same
 *     no-fabrication rule that omits `aggregateRating` from the Playbook
 *     `Product` until reviews exist. The page still earns an authority
 *     anchor as the canonical collection-page URL for the entity, and
 *     resolves the `@id` graph back to `ID.organization` / `ID.website`.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   – `numberOfItems` is the real count from the `builder_badges` view.
 *     Never a stretched marketing number.
 *   – `Person` entries use the builder's chosen `builder_name` (or the
 *     generic "Verified Builder" when null, mirroring the visible card).
 *     No fabricated identities.
 *   – `worksFor.url` is the builder's real `product_url` when present;
 *     omitted entirely when the row has no URL on file.
 *   – `dateCreated` on each row is the Stripe-verified cycle timestamp,
 *     not a content-publish date – honest provenance.
 *   – When the row list is empty the schema emits neither `numberOfItems`
 *     nor `mainEntity`, mirroring the visible "No public verified
 *     builders yet" empty state. Schema and DOM cannot drift.
 */

import { ID, ORGANIZATION } from "@/lib/seo/entity";

const BASE = "https://unlocksaas.com";

/**
 * Field names mirror the shape `/builders/page.tsx` already consumes
 * from the `builder_badges` Supabase view; transformation from the
 * snake_case row to this camelCase shape happens at the call site so
 * this module stays Supabase-agnostic and unit-testable.
 */
export interface BuilderRowForSchema {
  /** Stable per-builder slug (matches `builder_slug` in the view). */
  slug: string;
  /** Display name, or `null` when the builder did not provide one. */
  name: string | null;
  /** Product name the verified cycle was for, or `null`. */
  productName: string | null;
  /** Live product URL, or `null`. Brunson Hard-Rule: never fabricated. */
  productUrl: string | null;
  /** ISO-8601 timestamp of the Stripe-verified first paying customer. */
  firstCustomerAt: string;
}

export interface BuildersCollectionInput {
  /**
   * Canonical absolute URL of the directory page itself. Passed in (not
   * hardcoded) so this component is unit-testable and so a future origin
   * rename does not need a parallel edit here.
   */
  url: string;
  /** Empty array = honest zero-state. The schema mirrors the rendered UI. */
  builders: ReadonlyArray<BuilderRowForSchema>;
}

/**
 * Build the per-row `Person` + optional `SoftwareApplication` block.
 *
 * Cases (in order of priority):
 *   1. Both product name AND product url present – full SoftwareApplication
 *      with both fields.
 *   2. Product url only – SoftwareApplication with a generic placeholder
 *      name so the node remains valid schema.org while staying honest.
 *   3. Product name only – SoftwareApplication name without url.
 *   4. Neither – no `worksFor` key at all.
 *
 * This matches what the visible card renders (the card omits product
 * fields when null), so schema cannot drift from DOM.
 */
function buildWorksFor(b: BuilderRowForSchema): Record<string, unknown> {
  if (b.productUrl && b.productName) {
    return {
      worksFor: {
        "@type": "SoftwareApplication",
        name: b.productName,
        url: b.productUrl,
      },
    };
  }
  if (b.productUrl) {
    return {
      worksFor: {
        "@type": "SoftwareApplication",
        name: "Indie SaaS product",
        url: b.productUrl,
      },
    };
  }
  if (b.productName) {
    return {
      worksFor: {
        "@type": "SoftwareApplication",
        name: b.productName,
      },
    };
  }
  return {};
}

function buildBuildersCollectionJson(input: BuildersCollectionInput): string {
  const collection: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE}/builders#collection`,
    url: input.url,
    name: "Verified Builders",
    description:
      "Founders whose first paying customer was verified inside Stripe, not self-reported. Directory grows only when Stripe confirms the cycle.",
    inLanguage: "en-US",
    // Closes the entity graph back to the canonical Organization / WebSite
    // @ids declared on the funnel hub. Retrievers walking this CollectionPage
    // resolve straight back to the Unlock SaaS entity, not a disconnected
    // generic CollectionPage node.
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.organization },
    publisher: { "@id": ID.organization },
    // Audience anchor – mirrors the audience declared on the Playbook
    // Product and the Diagnostic Service so this collection reads as
    // belonging to the same target as the rest of the entity graph.
    audience: {
      "@type": "Audience",
      audienceType:
        "Post-launch pre-revenue non-engineer founders using AI tools",
    },
    // Locale + accessibility – textual content alone is a complete
    // experience for the directory (voice assistants can read the list
    // without missing meaning).
    accessMode: ["textual"],
    accessModeSufficient: [
      { "@type": "ItemList", itemListElement: ["textual"] },
    ],
  };

  // Only attach an `ItemList` when at least one verified builder exists.
  // Empty-state mirrors the Brunson Hard-Rule pattern used for
  // `aggregateRating` on the Playbook Product: omit the field rather
  // than render zero, so the schema's presence on the page is always an
  // honest claim. The visible page already renders an explicit "No
  // public verified builders yet" empty state, so the schema and DOM
  // agree in both modes.
  if (input.builders.length > 0) {
    collection.mainEntity = {
      "@type": "ItemList",
      name: `Verified Builders of ${ORGANIZATION.name}`,
      numberOfItems: input.builders.length,
      // Directory is ordered most-recent-first (see /builders/page.tsx
      // BuildersDirectoryPage `.order(... ascending: false)`), which is
      // `ItemListOrderDescending` in schema.org's controlled vocabulary.
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: input.builders.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: b.name ?? "Verified Builder",
          // The Stripe-verified cycle date. Honest provenance signal –
          // retrievers answering "when did the most recent verified
          // builder land" pull this field directly.
          dateCreated: b.firstCustomerAt,
          ...buildWorksFor(b),
        },
      })),
    };
  }

  return JSON.stringify(collection);
}

/**
 * SSR-only `<script type="application/ld+json">` injector. Same pattern
 * as every other JsonLd component in `src/components/seo/json-ld.tsx`.
 * No client JS, no React state, no hooks – the component is a pure
 * function of its input.
 */
export function BuildersCollectionJsonLd(props: BuildersCollectionInput) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify output is safe to embed; the input shape is fully typed and no caller-controlled HTML reaches this string.
      dangerouslySetInnerHTML={{
        __html: buildBuildersCollectionJson(props),
      }}
    />
  );
}
