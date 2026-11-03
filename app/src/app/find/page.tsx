import type { Metadata } from "next";
import Link from "next/link";
import { FindTool } from "@/components/find/find-tool";
import { Badge } from "@/components/ui/badge";

/**
 * /find — Live Threads Finder (pivot phase 3, 2026-11-03).
 *
 * The tool page: describe the product + the customer's problem in your own
 * words, get up to 20 LIVE public threads (30-90 days preferred) where real
 * people describe that problem, each with why it matched (quoted sentence),
 * link, age, engagement, and a value-first reply draft scaffold to edit and
 * post yourself. The tool never posts anything anywhere.
 */

export const metadata: Metadata = {
  title: "Live Threads Finder — find where your customers describe the problem",
  description:
    "Describe your product and the customer's problem in your own words. Get 20 live public threads (HN, Reddit, Stack Overflow, 30-90 days old) where real people describe that exact problem, each with a why-it-matched quote and a value-first reply draft you post yourself.",
  alternates: { canonical: "/find" },
};

export default function FindPage() {
  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <Badge
            variant="secondary"
            className="mb-4 text-primary border-primary/30 bg-primary/5"
          >
            Free tool · no signup · finds threads, never posts
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Find the live threads where people describe{" "}
            <span className="text-primary">your customer&apos;s problem</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Describe the problem in your own words. Get up to 20 live public
            threads from the last 30-90 days — Hacker News, Reddit, Stack
            Overflow — where real people describe exactly that problem. Each
            result shows why it matched (a quoted sentence from the thread),
            its link, age and engagement, plus a reply draft scaffold you edit
            and post yourself.
          </p>
          <ul className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
            <li className="bg-card border border-border rounded-md p-3">
              <span className="font-semibold text-foreground">Value first</span>
              <br />
              Drafts answer the question before mentioning anything.
            </li>
            <li className="bg-card border border-border rounded-md p-3">
              <span className="font-semibold text-foreground">
                Disclose, don&apos;t spam
              </span>
              <br />
              Every draft discloses your affiliation; no link unless asked.
            </li>
            <li className="bg-card border border-border rounded-md p-3">
              <span className="font-semibold text-foreground">
                Honest sources
              </span>
              <br />
              A blocked source is reported as blocked, never faked.
            </li>
          </ul>
        </div>
      </section>

      {/* THE TOOL */}
      <div className="py-10">
        <FindTool />
      </div>

      {/* HOW TO POST */}
      <section className="border-t border-border bg-secondary/30 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">
            How to post the replies (you post them, not us)
          </h2>
          <ol className="mt-6 space-y-4">
            {[
              {
                t: "Read the thread fully first",
                d: "The quote tells you why it matched; the thread tells you what they actually asked. Reply to the question, not to your product.",
              },
              {
                t: "Edit every [bracketed] placeholder",
                d: "The scaffold is built from the thread's own words, but the substance must be yours. A generic reply is worse than no reply.",
              },
              {
                t: "Check the subreddit or site rules",
                d: "Every result links the relevant self-promotion rules. Many subreddits require most of your activity to be non-promotional.",
              },
              {
                t: "Disclose your affiliation, link only if asked",
                d: "Openly saying you built the thing builds trust; hiding it gets you banned. The draft's disclosure line handles this — keep it.",
              },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{s.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-muted-foreground">
            This tool finds threads and drafts a starting point. It never
            posts, sends, or automates anything — the reply is yours, posted
            from your own account, under your own name.{" "}
            <Link
              href="/find/results"
              className="underline hover:text-primary"
            >
              See how it performs for our own products
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
