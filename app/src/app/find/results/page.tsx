import type { Metadata } from "next";

/**
 * /find/results — HONEST results page for the Live Threads Finder.
 *
 * Brief (2026-11-03): "Publish an honest results page ONLY with real
 * outcomes from our own use (if there are none yet, say 'we are testing it
 * on our own products, results here as they come')."
 *
 * So: no invented outcomes, no fake screenshots, no vanity counts. The page
 * states plainly what we have done so far (built it, used it on our own
 * MVPs) and commits to posting outcomes as they arrive. When the first real
 * outcome exists, it gets appended here with a date and a link.
 */

export const metadata: Metadata = {
  title: "Live Threads Finder — results",
  description:
    "Honest results from using the Live Threads Finder on our own products. No invented outcomes: what worked, what did not, updated as it happens.",
  robots: { index: false, follow: true },
};

export default function FindResultsPage() {
  return (
    <div className="bg-background">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Results from using the Live Threads Finder
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          We are testing it on our own products, results here as they come.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          The tool is live since 3 November 2026. So far we have run it on
          three of our own MVPs to find threads where their customers describe
          the problem (16 threads found for one, 20 for another, 4 for the
          third). We have not yet posted the reply drafts, so there are no
          replies, upvotes, clicks or customers attributable to the tool to
          report. When the first real reply goes out from our own accounts and
          something measurable happens, the outcome appears on this page with
          a date.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          No screenshots of other people&apos;s threads presented as ours, no
          growth claims we cannot source, no &ldquo;as seen on&rdquo; bars. If
          this page stays thin, the tool is not working, and we would rather
          you see that than a fabricated case study.
        </p>
        <a
          href="/find"
          className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Use the finder
        </a>
      </section>
    </div>
  );
}
