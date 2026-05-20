/**
 * /cite/[id]/[format] – format-specific text exports.
 *
 * Maps each supported CitationFormat to the right MIME type and
 * Content-Disposition header. Crawlers, reference managers, and
 * shell-based citers (curl, wget, BibDesk import dialog) all consume
 * this surface; the response is the citation string in the requested
 * format, nothing else.
 *
 * Examples:
 *   /cite/glossary-hook/apa       → text/plain (APA 7th)
 *   /cite/glossary-hook/bibtex    → application/x-bibtex
 *   /cite/glossary-hook/ris       → application/x-research-info-systems
 *   /cite/glossary-hook/csl-json  → application/vnd.citationstyles.csl+json
 *
 * Discoverability
 * ---------------
 * The format URLs are linked from the CitationBlock component and
 * surfaced in sitemap.ts (only the permalink, not the format
 * variants – Google Sitemap protocol limits per-URL siblings to
 * canonical variants only, and the format URLs are alternates).
 *
 * Caching
 * -------
 * Build-time-deterministic output. Cache for a day at the edge,
 * stale-while-revalidate for a week. The string only changes when
 * the source artifact's `lastVerified` field changes – a deploy is
 * the natural cache-busting event.
 */

import { NextResponse } from "next/server";
import {
  allCitationIds,
  citationDownloadFilename,
  CITATION_FORMATS,
  FORMAT_DESCRIPTORS,
  getCitationById,
  isCitationFormat,
  type CitationFormat,
} from "@/lib/citations";

export const dynamicParams = false;

export function generateStaticParams() {
  // Cross-product of every registered ID and every format. Each entry
  // becomes a prerendered route at build time, so a curl against
  // /cite/<id>/<format> hits a static file – no per-request cost.
  return allCitationIds().flatMap((id) =>
    CITATION_FORMATS.map((format) => ({ id, format })),
  );
}

type RouteContext = { params: Promise<{ id: string; format: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  const { id, format } = await ctx.params;

  // Validate the format slug first – guards the static-params cross
  // product against accidental drift if a future ID encodes a slash.
  if (!isCitationFormat(format)) {
    return new NextResponse(
      `Unsupported citation format "${format}". Supported: ${CITATION_FORMATS.join(", ")}.`,
      {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      },
    );
  }

  const citation = getCitationById(id);
  if (!citation) {
    return new NextResponse(`Citation "${id}" not found.`, {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const descriptor = FORMAT_DESCRIPTORS[format as CitationFormat];
  const body = descriptor.render(citation);
  const filename = citationDownloadFilename(citation, format as CitationFormat);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": descriptor.contentType,
      // inline + filename hint lets a browser display the text while
      // still suggesting a sensible default if the user picks "Save
      // page as." Reference managers (Zotero, Mendeley, BibDesk) read
      // the filename hint to pre-populate their import dialogs.
      "content-disposition": `inline; filename="${filename}"`,
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Tell every retrieval pipeline this artifact is part of the
      // permalink page. Avoids LLMs citing the bare format URL when
      // the human-readable permalink is the better landing target.
      link: `<https://unlocksaas.com/cite/${id}>; rel="canonical"`,
      "x-robots-tag": "noindex, follow",
    },
  });
}
