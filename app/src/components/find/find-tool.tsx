"use client";

/**
 * /find — the Live Threads Finder (pivot phase 3).
 *
 * A founder describes their product and the customer's problem in their own
 * words. The tool calls POST /api/thread-finder and shows up to 20 LIVE
 * public threads (30-90 days preferred) where real people describe that
 * problem, each with why it matched (a quoted sentence), its link, age and
 * engagement, plus a value-first reply draft scaffold the founder edits and
 * posts THEMSELVES. The tool never posts anything anywhere.
 *
 * Honesty rules baked in:
 *  - Every source failure is shown verbatim in the source status table.
 *  - Reddit is 403-blocked from our server; we say so, we do not hide it.
 *  - No invented results, no fake counts.
 */

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

type SourceStatus = {
  source: string;
  ok: boolean;
  threads_fetched: number;
  detail: string;
};

type FoundThread = {
  source: string;
  source_label: string;
  title: string;
  url: string;
  created_at: string;
  age_days: number;
  engagement: number;
  engagement_label: string;
  score: number;
  score_explanation: string;
  matched_quote: string;
  matched_terms: string[];
  body_excerpt: string;
};

type FinderResult = {
  problem: string;
  product: string;
  generated_queries: string[];
  threads: FoundThread[];
  total_fetched: number;
  sources: SourceStatus[];
  cached: boolean;
  cache_age_seconds?: number;
  generated_at: string;
};

/** Mirrors src/lib/reply-draft.ts (client copy; the lib is server-tested). */
function trimQuote(quote: string, max = 220): string {
  const q = quote.replace(/\s+/g, " ").trim();
  if (q.length <= max) return q;
  return q.slice(0, max - 1).replace(/\s\S*$/, "") + "…";
}

function subredditName(thread: FoundThread): string | null {
  return thread.source_label.startsWith("r/") && thread.source_label.length > 2
    ? thread.source_label.slice(2)
    : null;
}

function rulesUrl(thread: FoundThread): { label: string; url: string } {
  if (thread.source === "reddit") {
    const sub = subredditName(thread);
    return {
      label: sub ? `r/${sub} rules` : "Reddit self-promotion rules",
      url: sub
        ? `https://www.reddit.com/r/${sub}/about/rules/`
        : "https://support.reddithelp.com/hc/en-us/articles/204047447",
    };
  }
  if (thread.source === "stackexchange") {
    return {
      label: "Stack Overflow promotion policy",
      url: "https://stackoverflow.com/help/promotion",
    };
  }
  return { label: "HN guidelines", url: "https://news.ycombinator.com/help" };
}

function openerFor(thread: FoundThread): string {
  if (thread.source === "stackexchange") {
    return "Direct answer first: [the concrete fix, in one or two sentences].";
  }
  if (thread.source === "hn") {
    return "One thing that is underrated here: [your concrete point, no pitch].";
  }
  return "Short answer to your question: [the actual answer, one sentence, no pitch].";
}

function buildReplyDraft(
  thread: FoundThread,
  problem: string,
  product?: string
): string {
  const productPhrase =
    product && product.trim().length > 0 ? product.trim() : "a product";
  const quote = trimQuote(thread.matched_quote || thread.title);
  const mirror = trimQuote(problem, 140);
  return [
    `${openerFor(thread)}`,
    "",
    `You wrote: "${quote}" — that is exactly the problem I had in mind (${mirror.toLowerCase()}), so here is what I have learned the hard way.`,
    "",
    "What I would do, in order:",
    "1. [concrete step that answers their exact question]",
    "2. [what you tried that did NOT work — specifics build trust]",
    "3. [the cheapest next action they can take today]",
    "",
    `Disclosure: I am building ${productPhrase} for exactly this problem — that is my bias. Not linking it here; ask and I will share.`,
    "",
    "[Optional: one specific follow-up question about their setup to keep the thread alive.]",
  ].join("\n");
}

const EXAMPLE_PROBLEM =
  "Small agency owners struggle to prove ROI on retainer work, so clients cancel after 3 months";
const EXAMPLE_PRODUCT =
  "RetainerProof — automated client ROI reports for agencies";

function ThreadCard({
  thread,
  problem,
  product,
  index,
}: {
  thread: FoundThread;
  problem: string;
  product: string;
  index: number;
}) {
  const draft = useMemo(
    () => buildReplyDraft(thread, problem, product),
    [thread, problem, product]
  );
  const rules = rulesUrl(thread);
  const fresh = thread.age_days <= 30;
  return (
    <li className="bg-card border border-border rounded-lg p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted-foreground">
          #{index + 1}
        </span>
        <Badge variant="secondary">{thread.source_label}</Badge>
        <Badge variant="outline">{thread.age_days}d old</Badge>
        <Badge variant="outline">{thread.engagement_label}</Badge>
        <Badge variant={fresh ? "default" : "secondary"}>
          match {thread.score}/100
        </Badge>
      </div>
      <a
        href={thread.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-lg font-semibold leading-snug text-foreground hover:text-primary"
      >
        {thread.title}
      </a>
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(thread.created_at).toISOString().slice(0, 10)} ·{" "}
        {thread.score_explanation}
      </p>

      <div className="mt-4 rounded-md bg-secondary/50 border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Why it matched
        </p>
        <blockquote className="mt-2 text-sm text-foreground leading-relaxed">
          &ldquo;{thread.matched_quote}&rdquo;
        </blockquote>
        <p className="mt-2 text-xs text-muted-foreground">
          matched words: {thread.matched_terms.join(", ")}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reply draft (edit the [brackets], post it yourself)
          </p>
          <CopyButton
            text={draft}
            label="Copy draft"
            onCopied={() =>
              track(Event.FindDraftCopied, {
                source: thread.source,
                age_days: thread.age_days,
                score: thread.score,
              })
            }
          />
        </div>
        <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground bg-secondary/30 border border-border rounded-md p-4 font-sans">
          {draft}
        </pre>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Before posting: read the{" "}
        <a
          href={rules.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          {rules.label}
        </a>{" "}
        and answer the question first — this tool never posts for you.
      </p>
    </li>
  );
}

export function FindTool() {
  const [problem, setProblem] = useState("");
  const [product, setProduct] = useState("");
  const [maxAge, setMaxAge] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinderResult | null>(null);

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    track(Event.FindRunSubmitted, {
      problem_length: problem.trim().length,
      has_product: product.trim().length > 0,
      max_age_days: maxAge,
    });
    try {
      const res = await fetch("/api/thread-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problem.trim(),
          product: product.trim() || undefined,
          maxAgeDays: maxAge,
          limit: 20,
        }),
      });
      const json = (await res.json()) as FinderResult & {
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        track(Event.FindRunFailed, {
          http_status: res.status,
          error: (json.detail || json.error || "unknown").slice(0, 120),
        });
        setError(
          json.detail || json.error || `Request failed (HTTP ${res.status}).`
        );
        return;
      }
      track(Event.FindResultsViewed, {
        threads: json.threads.length,
        total_fetched: json.total_fetched,
        sources_ok: json.sources.filter((s) => s.ok).length,
        cached: json.cached,
      });
      setResult(json);
    } catch (e) {
      track(Event.FindRunFailed, {
        http_status: 0,
        error: (e instanceof Error ? e.message : "network error").slice(0, 120),
      });
      setError(
        e instanceof Error ? e.message : "Network error. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }, [problem, product, maxAge]);

  return (
    <div>
      {/* INPUT */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <label
            htmlFor="problem"
            className="block text-sm font-semibold text-foreground"
          >
            The customer&apos;s problem, in your own words
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Describe it like you would to a friend. The words you use become
            the search terms.
          </p>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={EXAMPLE_PROBLEM}
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <label
            htmlFor="product"
            className="mt-5 block text-sm font-semibold text-foreground"
          >
            Your product (optional — used only in the disclosure line)
          </label>
          <input
            id="product"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            maxLength={200}
            placeholder={EXAMPLE_PRODUCT}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label
              htmlFor="maxage"
              className="text-sm text-muted-foreground"
            >
              Thread age limit:
            </label>
            <select
              id="maxage"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
            </select>
            <Button
              onClick={submit}
              disabled={loading || problem.trim().length < 10}
              className="ml-auto"
            >
              {loading ? "Finding threads…" : "Find live threads"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setProblem(EXAMPLE_PROBLEM);
              setProduct(EXAMPLE_PRODUCT);
            }}
            className="mt-3 text-xs text-muted-foreground underline hover:text-primary"
          >
            Fill in an example
          </button>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 text-sm text-foreground px-3 py-2"
            >
              {error}
            </p>
          )}
        </div>
      </section>

      {/* RESULTS */}
      {result && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
          <h2 className="text-2xl font-bold text-foreground">
            {result.threads.length} live thread
            {result.threads.length === 1 ? "" : "s"} found
            {result.cached ? " (cached)" : ""}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total_fetched} fetched · queries:{" "}
            {result.generated_queries.slice(0, 3).join("; ")} ·{" "}
            {new Date(result.generated_at).toISOString().replace("T", " ").slice(0, 16)}{" "}
            UTC
          </p>

          {/* HONEST SOURCE STATUS */}
          <div className="mt-5 rounded-md border border-border bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sources (honest status — failures shown, never hidden)
            </p>
            <ul className="mt-2 space-y-1.5">
              {result.sources.map((s) => (
                <li key={s.source} className="text-sm flex flex-wrap gap-2">
                  <span
                    className={
                      s.ok
                        ? "text-primary font-semibold"
                        : "text-destructive font-semibold"
                    }
                  >
                    {s.ok ? "OK" : "FAILED"}
                  </span>
                  <span className="text-foreground font-medium">{s.source}</span>
                  <span className="text-muted-foreground">
                    {s.threads_fetched} fetched — {s.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {result.threads.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No threads matched in the age window. Try describing the problem
              with different, more concrete words — the exact phrasing a
              frustrated customer would type.
            </p>
          ) : (
            <ol className="mt-6 space-y-5 list-none">
              {result.threads.map((t, i) => (
                <ThreadCard
                  key={t.url}
                  thread={t}
                  problem={result.problem}
                  product={result.product}
                  index={i}
                />
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
