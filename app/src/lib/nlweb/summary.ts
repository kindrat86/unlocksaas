/**
 * Deterministic NLWeb summary template.
 *
 * NLWeb's reference implementation can either pass top-k items through
 * an LLM for a natural-language one-shot summary or fall back to a
 * deterministic template. For UnlockSaaS v1 the template path is the
 * right call:
 *
 *   - No extra ANTHROPIC_API_KEY round-trip on the hot path. The /ask
 *     endpoint stays sub-millisecond after the BM25 step.
 *   - Deterministic output. Same query -> same summary, every time.
 *     A retriever caching the response by query gets cache-stable
 *     results.
 *   - No fabricated language. Every sentence is a projection of the
 *     ranked items' own `name` + `description` + `surface` fields.
 *     No hallucinated facts about products or guarantees.
 *
 * A later iteration can replace this with an LLM-grounded summariser
 * behind a feature flag without changing the route contract.
 */

import type { NlWebItem } from "@/lib/nlweb/corpus";

/**
 * Compose a deterministic one-paragraph summary from the ranked items.
 * The first sentence frames the result ("Top N results from UnlockSaaS
 * for X across surfaces A, B, C"); subsequent sentences quote the top
 * three items' descriptions verbatim with an attribution arrow.
 *
 * Brunson Hard-Rule: every phrase below is either taken verbatim from
 * a corpus item, derived programmatically from its surface label, or
 * an explicit transition ("Top results", "Related items"). No invented
 * claims.
 */
export function summarise(query: string, items: readonly NlWebItem[]): string {
  if (items.length === 0) {
    return `No results in the UnlockSaaS corpus match the query "${query}". Try a different keyword, or browse the catalog hubs at /alternatives-to, /funnel-teardown, /pricing-teardown, /vs, /category, /benchmarks, /answers, /glossary, or /faq.`;
  }

  const top = items.slice(0, 3);
  const surfaceCounts = new Map<string, number>();
  for (const it of items) {
    surfaceCounts.set(it.surface, (surfaceCounts.get(it.surface) ?? 0) + 1);
  }
  const surfacePhrase = formatSurfaceCounts(surfaceCounts);

  const lead = `Top ${items.length} result${items.length === 1 ? "" : "s"} from UnlockSaaS for "${query}" across ${surfacePhrase}.`;

  const quotes = top.map((it, i) => {
    const ordinal = ["First", "Second", "Third"][i] ?? `Result ${i + 1}`;
    // Trim the description to one sentence's worth (first 220 chars
    // ending at a sentence boundary if one exists, otherwise as-is).
    const desc = trimToSentence(it.description, 220);
    return `${ordinal}: ${it.name} – ${desc}`;
  });

  return [lead, ...quotes].join(" ");
}

/**
 * Format the surface-count distribution as a natural-language phrase
 * for the summary lead. Sorts surfaces by count descending, names the
 * top three, and abbreviates the long tail.
 */
function formatSurfaceCounts(counts: Map<string, number>): string {
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return "no surfaces";
  const labelled = sorted.map(([surface, n]) => {
    const human = humaniseSurface(surface);
    return n === 1 ? `1 ${human}` : `${n} ${human}s`;
  });
  if (labelled.length === 1) return labelled[0]!;
  if (labelled.length === 2) return `${labelled[0]} and ${labelled[1]}`;
  return `${labelled.slice(0, -1).join(", ")}, and ${labelled[labelled.length - 1]}`;
}

/** Human-readable label per surface. Matches the public hub vocabulary. */
function humaniseSurface(surface: string): string {
  switch (surface) {
    case "alternative":
      return "alternative comparison";
    case "funnel-teardown":
      return "funnel teardown";
    case "pricing-teardown":
      return "pricing teardown";
    case "comparison":
      return "head-to-head comparison";
    case "category":
      return "category roundup";
    case "playbook-step":
      return "Playbook step";
    case "glossary":
      return "glossary term";
    case "faq":
      return "FAQ entry";
    case "answer":
      return "direct answer";
    case "benchmark":
      return "benchmark";
    default:
      return surface;
  }
}

/**
 * Trim a string to a maximum length, preferring a sentence boundary
 * if one falls within the last 40 characters of the limit. Returns
 * the input unchanged if already short enough.
 */
function trimToSentence(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastPeriod = cut.lastIndexOf(".");
  if (lastPeriod >= max - 40 && lastPeriod > 0) return cut.slice(0, lastPeriod + 1);
  return cut.trimEnd() + "...";
}
