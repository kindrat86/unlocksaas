/**
 * /.well-known/entity.jsonld – canonical self-published entity manifest.
 *
 * Why this surface exists
 * -----------------------
 * The SEO/GEO/AIO audit identified the Knowledge Graph cluster as the
 * single highest-leverage missing signal: empty `sameAs`, no Wikidata,
 * no Wikipedia. Every Tier 1 / Tier 2 anchor is operator-gated:
 *
 *   - Wikidata        requires earned notability + a Q-ID submission.
 *   - Wikipedia       requires 3 independent secondary sources.
 *   - SameAs.org      requires an operator account creation.
 *   - X/IH/LI/CB/G2…  requires the linked profile to exist with a
 *                     bidirectional bio that names unlocksaas.com.
 *
 * Brunson Hard-Rule bars fabricating any of those. The autonomous
 * complement – the move the codebase CAN make without operator action –
 * is to publish a canonical, dereferenceable, machine-readable
 * description of the entity at a stable `.well-known/*` URL.
 *
 * This is the modern Linked-Open-Data convention. It is structurally
 * analogous to a Wikidata Q-URL: a stable, content-negotiated URL whose
 * sole purpose is to return the machine-readable canonical description
 * of one entity. Knowledge-Graph and LLM-retrieval pipelines that walk
 * `subjectOf` Dataset references on the homepage Organization JSON-LD
 * dereference this URL to confirm and enrich their entity card.
 *
 * What this DOES
 * --------------
 *   - Serves the full Organization + Person + WebSite `@graph` as one
 *     JSON-LD document, content-negotiated with `application/ld+json`.
 *   - Resolves every cross-reference (`@id`) inside the same file so
 *     any consumer that walks one node finds the rest without a
 *     second request.
 *   - Lives at the `.well-known/` discovery directory alongside
 *     `llms.txt`, `mcp.json`, and `security.txt` – every machine-
 *     readable surface this site exposes is under one canonical
 *     directory.
 *
 * What this DOES NOT do
 * ---------------------
 *   - It is NOT a replacement for a real Wikidata Q-ID. KG awards
 *     full confidence weight to off-platform, bidirectionally-claimed
 *     anchors. A self-published manifest is a corroborating signal,
 *     not the off-platform anchor itself.
 *   - It is NOT a `sameAs` row. `sameAs` requires off-platform URLs.
 *     This route is referenced as a `subjectOf` Dataset entry on the
 *     main Organization JSON-LD instead (the same pattern the
 *     existing /llms.txt and /llms-full.txt corpus entries use).
 *
 * Brunson Hard-Rule reconciliation: every field below is sourced from
 * `@/lib/seo/entity` – the single source of truth that already governs
 * the homepage Organization JSON-LD. No claim in this file is absent
 * from the rendered HTML / homepage schema. No fabricated signals.
 */

import { NextResponse } from "next/server";
import {
  ALTERNATE_NAMES,
  BASE_URL,
  FOUNDER,
  ID,
  KNOWS_ABOUT,
  MENTIONED_ENTITIES,
  ORGANIZATION,
  ORGANIZATION_IDENTIFIERS,
  ORGANIZATION_MAIN_ENTITY_OF_PAGE,
  ORGANIZATION_SAME_AS,
  PRIMARY_AUDIENCE_TYPE,
  PUBLISHING_PRINCIPLES_URL,
  WORLDWIDE_AREA_SERVED,
} from "@/lib/seo/entity";
import { FOUNDER_SAME_AS, FOUNDER_WIKIDATA_QID } from "@/lib/seo/founder";

/**
 * The canonical @graph. One @context at the root, every node carries
 * its own @id. Cross-references (founder ↔ worksFor, publisher) resolve
 * inside the same document so a single fetch returns the full local
 * entity neighbourhood.
 *
 * Frozen at module load. Re-evaluated only on cold start when the
 * env-driven `sameAs` array might change (Vercel env updates are
 * picked up at deploy time, not at request time).
 */
const ENTITY_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ID.organization,
      name: ORGANIZATION.name,
      legalName: ORGANIZATION.legalName,
      alternateName: ALTERNATE_NAMES,
      url: ORGANIZATION.url,
      logo: `${BASE_URL}/icon.svg`,
      email: ORGANIZATION.email,
      slogan: ORGANIZATION.slogan,
      foundingDate: ORGANIZATION.foundingDate,
      description: ORGANIZATION.description,
      inLanguage: "en-US",
      areaServed: WORLDWIDE_AREA_SERVED,
      knowsAbout: KNOWS_ABOUT,
      publishingPrinciples: PUBLISHING_PRINCIPLES_URL,
      // Machine-readable internal identifiers. PropertyValue rows are the
      // schema.org pattern for stable IDs that are not URLs. Knowledge
      // Graph and LLM retrieval pipelines walk `identifier[]` to confirm
      // an entity card is keyed to the same domain / founding date /
      // canonical manifest / Wikidata Q-ID the body content names.
      //
      // Source-of-truth is `ORGANIZATION_IDENTIFIERS` in
      // `src/lib/seo/entity.ts` – the same constant feeds the in-page
      // Organization JSON-LD on every route via `src/components/seo/json-ld.tsx`,
      // so this manifest and the embedded schema declare byte-identical
      // identifier rows (a crawler that diffs them sees no drift). The
      // wikidata PropertyValue appears conditionally when the operator
      // has activated NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL with a valid
      // Q-URL.
      identifier: ORGANIZATION_IDENTIFIERS,
      // Drop mainEntityOfPage if no Wikipedia URL is set – undefined
      // serializes cleanly because JSON.stringify omits undefined fields.
      ...(ORGANIZATION_MAIN_ENTITY_OF_PAGE
        ? { mainEntityOfPage: ORGANIZATION_MAIN_ENTITY_OF_PAGE }
        : {}),
      mentions: MENTIONED_ENTITIES.map((m) => ({
        "@type": m.type,
        name: m.name,
        url: m.url,
      })),
      founder: { "@id": ID.person },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: ORGANIZATION.email,
        url: `${BASE_URL}/contact`,
        availableLanguage: ["en-US"],
      },
      audience: {
        "@type": "Audience",
        audienceType: PRIMARY_AUDIENCE_TYPE,
      },
      sameAs: ORGANIZATION_SAME_AS,
    },
    {
      "@type": "Person",
      "@id": ID.person,
      name: FOUNDER.name,
      givenName: FOUNDER.givenName,
      jobTitle: FOUNDER.jobTitle,
      email: FOUNDER.email,
      url: `${BASE_URL}/about`,
      description: FOUNDER.description,
      worksFor: { "@id": ID.organization },
      knowsAbout: KNOWS_ABOUT,
      // Person.sameAs MUST resolve to founder-specific profile URLs, NOT
      // the Organization sameAs array. Maryan-the-Person and Unlock-SaaS-
      // the-Organization are SEPARATE entities in the Knowledge Graph:
      // LinkedIn-the-Person ≠ LinkedIn-the-Company, Wikidata Q139863921
      // (Unlock SaaS) ≠ Maryan's eventual Person Q-item. Declaring the
      // org's anchors on the Person fabricates founder-level identity
      // claims (KG reads Person.sameAs as "this human's off-platform
      // profiles" – mixing entities corrupts the signal).
      //
      // FOUNDER_SAME_AS reads founder-specific env vars (the
      // NEXT_PUBLIC_FOUNDER_SAMEAS_* family + NEXT_PUBLIC_FOUNDER_WIKIDATA_URL
      // + NEXT_PUBLIC_FOUNDER_WIKIPEDIA_URL) and stays empty until each
      // profile actually exists. Per the doc-block at the head of
      // src/lib/seo/founder.ts: consumers MUST omit the sameAs key
      // entirely when the array is empty – an empty array is a
      // fabrication tell to KG validators. The conditional spread below
      // mirrors the gating already used by the on-page Person block in
      // src/components/seo/json-ld.tsx so the two surfaces never drift.
      ...(FOUNDER_SAME_AS.length > 0 ? { sameAs: FOUNDER_SAME_AS } : {}),
      // Person.identifier[] – machine-readable cross-references. Built
      // inline because Person identifiers don't share the four-row
      // baseline Organization uses (domain / foundingDate / canonical-
      // manifest are entity-level, not person-level). Conditional on
      // FOUNDER_WIKIDATA_QID; omitted entirely when the founder has no
      // Q-item yet. Brunson Hard-Rule: no fabricated Person identifiers.
      ...(FOUNDER_WIKIDATA_QID
        ? {
            identifier: [
              {
                "@type": "PropertyValue",
                propertyID: "wikidata",
                value: FOUNDER_WIKIDATA_QID,
              },
            ],
          }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": ID.website,
      name: ORGANIZATION.name,
      url: BASE_URL,
      inLanguage: "en-US",
      publisher: { "@id": ID.organization },
      about: { "@id": ID.organization },
    },
  ],
} as const;

const ENTITY_JSON = JSON.stringify(ENTITY_GRAPH);

// Static route – no per-request inputs, identical body on every call.
// HTTP-level edge caching (24h s-maxage, 7d stale-while-revalidate) is
// sufficient; no `'use cache'` directive needed. Mirrors the discipline
// in /.well-known/llms.txt/route.ts (the sibling discovery surface).
export function GET() {
  return new NextResponse(ENTITY_JSON, {
    status: 200,
    headers: {
      // application/ld+json is the IANA-registered content type for
      // JSON-LD. Crawlers that content-negotiate (RDF/LOD-aware) prefer
      // this over generic application/json.
      "content-type": "application/ld+json; charset=utf-8",
      // Long edge cache: manifest only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Cross-origin: any agent or registry can fetch this. The manifest
      // is intentionally public – it is the canonical entity description.
      "access-control-allow-origin": "*",
    },
  });
}
