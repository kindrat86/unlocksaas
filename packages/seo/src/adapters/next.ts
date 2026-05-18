/**
 * Next.js adapter — opt-in helpers for App Router projects.
 *
 * Next is declared as an optional peer dependency. This module imports
 * only types from "next" so it works whether or not Next is installed
 * in the consumer's project. The functions here return plain JS objects
 * that are SHAPE-COMPATIBLE with Next.js's Metadata type.
 *
 * Usage:
 *
 *   import { pageAlternates, markdownAlternate, JsonLdScript } from
 *     "@unlocksaas/seo/next";
 */

import type { ReactElement } from "react";

export interface PageAlternatesInput {
  /** Site-relative canonical path, e.g. "/faq". */
  canonical: string;
  /** Absolute origin used to expand languages map (optional). */
  origin?: string;
  /**
   * Approved translation locales for this canonical path. The "en-US"
   * + "x-default" self-reference is always included.
   */
  approvedLocales?: ReadonlyArray<string>;
  /** Map a locale to a localized path. Defaults to "/{locale}{canonical}". */
  localizePath?: (canonical: string, locale: string) => string;
}

export function pageAlternates(
  input: PageAlternatesInput,
): Record<string, unknown> {
  const localize =
    input.localizePath ??
    ((canonical: string, locale: string) =>
      `/${locale}${canonical === "/" ? "" : canonical}`);
  const wrap = (p: string) => (input.origin ? `${input.origin}${p}` : p);

  const languages: Record<string, string> = {
    "en-US": wrap(input.canonical),
    "x-default": wrap(input.canonical),
  };
  for (const locale of input.approvedLocales ?? []) {
    languages[locale] = wrap(localize(input.canonical, locale));
  }
  return {
    canonical: input.canonical,
    languages,
  };
}

export interface MarkdownAlternateInput extends PageAlternatesInput {
  /** Site-relative path to the markdown mirror, e.g. "/faq.md". */
  mdPath: string;
  /** Absolute origin used to expand the markdown URL. Required for types map. */
  origin: string;
}

/**
 * Build an alternates fragment that declares the canonical, the
 * text/markdown mirror, AND self-referencing hreflang.
 */
export function markdownAlternate(
  input: MarkdownAlternateInput,
): Record<string, unknown> {
  const base = pageAlternates(input);
  return {
    ...base,
    types: {
      "text/markdown": `${input.origin}${input.mdPath}`,
    },
  };
}

/**
 * React component that renders one or more JSON-LD blocks as
 * `<script type="application/ld+json">` tags. Pass plain objects
 * produced by the builders in `@unlocksaas/seo/jsonld`.
 *
 * Server-renders by default in Next.js App Router because no client
 * hooks are used.
 *
 * Note: this is a TSX function but the package's tsconfig uses
 * jsx: "react-jsx", so we return ReactElement via createElement to
 * avoid forcing consumers to pull in @types/react when they only
 * use the framework-free builders.
 */
export function JsonLdScript(props: {
  data: Record<string, unknown> | ReadonlyArray<Record<string, unknown>>;
  /** Inline space for readability. Defaults to undefined (compact). */
  space?: string | number;
}): ReactElement | null {
  // Lazily import React only when this component is actually rendered.
  // Consumers who never import this module will not pay the React cost.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  const blocks = Array.isArray(props.data) ? props.data : [props.data];
  if (blocks.length === 0) return null;
  return React.createElement(
    React.Fragment,
    null,
    ...blocks.map((block, idx) =>
      React.createElement("script", {
        key: idx,
        type: "application/ld+json",
        // dangerouslySetInnerHTML is the documented Next.js pattern
        // for inline JSON-LD; the alternative (children) escapes the
        // angle brackets and breaks the JSON.
        dangerouslySetInnerHTML: {
          __html: JSON.stringify(block, null, props.space),
        },
      }),
    ),
  );
}
