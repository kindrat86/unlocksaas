/**
 * SoftwareApplication JSON-LD builder.
 *
 * schema.org/SoftwareApplication is the canonical type for SaaS products.
 * It is distinct from Product (physical/generic goods) in that it explicitly
 * declares applicationCategory, operatingSystem, and featureList -- the
 * fields LLM retrieval pipelines use to answer "what SaaS tool does X."
 *
 * Honesty defaults:
 *   - aggregateRating is NOT supported on this builder. Fabricated ratings
 *     earn the highest demotion penalty from Google's structured-data system.
 *   - featureList is a ReadonlyArray<string>; each entry MUST correspond to
 *     a feature the rendered page actually names.
 *   - offers is a plain Offer sub-object, not a complex multi-offer array
 *     (the Product builder handles that shape). Pass a single-offer summary.
 */

import { omitEmpty } from "../honesty/omit-empty.js";

export interface SoftwareApplicationInput {
  /** @id anchor -- recommended: `${origin}/#app` */
  id?: string;
  /** Display name of the application. */
  name: string;
  /**
   * One clear sentence describing what the application does.
   * MUST match prose on the rendered page (Brunson Hard-Rule: schema =
   * visible text, no divergence).
   */
  description?: string;
  /** Canonical homepage URL. */
  url: string;
  /**
   * schema.org documented category values. Free-text; Google's guidance
   * for SaaS: "BusinessApplication", "EducationalApplication", etc.
   * See https://schema.org/applicationCategory
   */
  applicationCategory: string;
  /**
   * Operating system(s) the app runs on. For web-only SaaS: "Web".
   * Comma-separate for cross-platform: "Web, iOS, Android".
   */
  operatingSystem: string;
  /**
   * Single priced Offer. Pass price as a string or number; priceCurrency
   * as ISO 4217 (e.g. "USD"). Availability defaults to InStock.
   */
  offer?: {
    price: string | number;
    priceCurrency: string;
    url?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
  };
  /**
   * Array of concrete feature strings. MUST be verifiable against the
   * rendered page (Brunson Hard-Rule). 5-8 entries is the recommended
   * density for Google's SoftwareApplication Rich Result parsing.
   */
  featureList?: ReadonlyArray<string>;
  /**
   * Creator / author reference. Pass either a Person @id cross-ref
   * (`{ "@id": string }`) or a minimal inline name + url object.
   */
  creator?: { "@id": string } | { "@type": "Person"; name: string; url?: string };
  /**
   * Brand or publisher Organization @id or inline object.
   */
  publisher?: { "@id": string } | Record<string, unknown>;
  /** ISO 8601 date the application was first published. */
  datePublished?: string;
  /** inLanguage BCP 47 tag (e.g. "en-US"). */
  inLanguage?: string;
  /** areaServed free text (e.g. "Worldwide") */
  areaServed?: string;
}

export function buildSoftwareApplication(
  input: SoftwareApplicationInput,
): Record<string, unknown> {
  const offer = input.offer
    ? omitEmpty({
        "@type": "Offer",
        price:
          typeof input.offer.price === "number"
            ? input.offer.price.toFixed(2)
            : input.offer.price,
        priceCurrency: input.offer.priceCurrency,
        availability: input.offer.availability
          ? `https://schema.org/${input.offer.availability}`
          : "https://schema.org/InStock",
        url: input.offer.url,
      } as Record<string, unknown>)
    : undefined;

  return omitEmpty({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": input.id,
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem,
    offers: offer,
    featureList: input.featureList,
    creator: input.creator,
    publisher: input.publisher,
    datePublished: input.datePublished,
    inLanguage: input.inLanguage,
    areaServed: input.areaServed,
  } as Record<string, unknown>);
}
