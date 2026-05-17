import Link from "next/link";

/**
 * FounderPs — Brunson 23 Building Blocks #13 (PS / closing block).
 *
 * Brunson's classic sales-letter discipline: the PS is the second-most-read
 * piece of copy on any long-form page, after the headline. The Funnel Hub
 * had a footer-paragraph signed by Maryan, but it functioned as "about
 * the founder" — not as a Brunson PS. A real PS re-anchors the offer
 * one last time, in the reader's own voice, with a single CTA.
 *
 * Single short paragraph. Signed. One inline link. Sits above the existing
 * footer-bio paragraph (which keeps its "about" role unchanged).
 *
 * Source:
 * - Workbook 01 §5 Hook #3 (the pain mirror — restated here as the PS hook)
 * - Workbook 01 §6 Beat 2 (Reluctant Hero voice — used for the signature)
 * - Workbook 04 §4 "Two CTAs" block (the inline /diagnostic link)
 *
 * Pure server component. Zero kB to client.
 */
export function FounderPs() {
  return (
    <section
      aria-labelledby="founder-ps-heading"
      className="py-10 sm:py-14 px-4 sm:px-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50/50 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-xs uppercase tracking-widest font-bold text-orange-700 mb-3">
            PS — from Maryan
          </p>
          <h2 id="founder-ps-heading" className="sr-only">
            A closing note from the founder
          </h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            If you read this far and you&apos;re still wondering whether your
            launch is fixable — that&apos;s the diagnostic&apos;s only job.
            Paste the URL. Ninety seconds. Get one of three labels:{" "}
            <em>Wrong Person</em>, <em>Weak Offer</em>, <em>Weak Belief</em>.
            Then you decide what to do with that. The diagnosis is free
            either way.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <Link
              href="/diagnostic"
              className="font-bold text-orange-700 underline underline-offset-4 decoration-2 hover:text-orange-900"
            >
              Get the free diagnosis →
            </Link>
            {" "}— no card, no upsell on the result page, signed —{" "}
            <span className="font-semibold text-foreground">Maryan</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
