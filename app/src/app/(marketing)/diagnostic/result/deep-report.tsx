"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

/**
 * Deep Analysis v2 — Brunson "Best Bait" 10x overdeliver.
 *
 * Renders the full structured teardown returned by deepAnalyzeUrl():
 *   - Product snapshot (what they think they sell)
 *   - Three-axis scorecard (Wrong Person / Weak Offer / Weak Belief, 1-10)
 *   - Strengths (positive signals on the page)
 *   - Concrete rewrites (hero, primary CTA, value props — current vs. 3 alts)
 *   - 30-day action plan (4 weeks × 3-5 deliverables)
 *   - Competitor pulls (2 named competitors, what they do better / worse)
 *
 * Mirrors the JSONB shape persisted in diagnostic_leads.analysis_detail by the
 * /api/diagnostic route. The Reluctant-Hero voice + Brunson axes come from
 * the system prompt in lib/diagnostic.ts.
 */

// Shape mirrors DeepAnalysisExtras in lib/diagnostic.ts. Kept in a separate
// file because this is a client component and importing the engine module
// would pull anthropic-sdk into the client bundle.

type AxisScore = {
  score: number;
  diagnosis: string;
  evidence: string[];
};

type ProductSnapshot = {
  name: string;
  one_liner: string;
  audience_stated: string;
  pricing_visible: string | null;
};

type RewriteBlock = {
  current: string;
  alternates: string[];
  why_better: string;
};

type ValuePropRewrite = {
  current: string[];
  rewritten: string[];
  why_better: string;
};

type WeekPlan = {
  theme: string;
  deliverables: string[];
};

type CompetitorPull = {
  name: string;
  one_line: string;
  what_they_do_better: string[];
  what_you_do_better: string[];
};

export type DeepAnalysisDetail = {
  product_snapshot: ProductSnapshot;
  scores: {
    wrong_person: AxisScore;
    weak_offer: AxisScore;
    weak_belief: AxisScore;
  };
  rewrites: {
    hero_headline: RewriteBlock;
    primary_cta: RewriteBlock;
    value_props: ValuePropRewrite;
  };
  plan_30_day: {
    week1: WeekPlan;
    week2: WeekPlan;
    week3: WeekPlan;
    week4: WeekPlan;
  };
  competitors: CompetitorPull[];
  strengths: string[];
};

function scoreTone(score: number): {
  bg: string;
  text: string;
  badge: "destructive" | "secondary" | "default";
  label: string;
} {
  if (score <= 3)
    return {
      bg: "bg-destructive/10 border-destructive/40",
      text: "text-destructive",
      badge: "destructive",
      label: "Catastrophic",
    };
  if (score <= 5)
    return {
      bg: "bg-orange-500/10 border-orange-500/40",
      text: "text-orange-700 dark:text-orange-400",
      badge: "secondary",
      label: "Weak",
    };
  if (score <= 7)
    return {
      bg: "bg-amber-500/10 border-amber-500/40",
      text: "text-amber-700 dark:text-amber-400",
      badge: "secondary",
      label: "Workable",
    };
  if (score <= 9)
    return {
      bg: "bg-emerald-500/10 border-emerald-500/40",
      text: "text-emerald-700 dark:text-emerald-400",
      badge: "default",
      label: "Strong",
    };
  return {
    bg: "bg-emerald-600/15 border-emerald-600/40",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "default",
    label: "World-class",
  };
}

function AxisCard({
  title,
  axis,
}: {
  title: string;
  axis: AxisScore;
}) {
  const tone = scoreTone(axis.score);
  return (
    <Card className={tone.bg}>
      <CardContent className="pt-6">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${tone.text}`}>
              {axis.score}
            </span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
        </div>
        <Badge variant={tone.badge} className="mb-3 text-[10px] uppercase tracking-wider">
          {tone.label}
        </Badge>
        <p className="text-sm leading-relaxed text-foreground mb-3">
          {axis.diagnosis}
        </p>
        {axis.evidence.length > 0 && (
          <ul className="space-y-1.5">
            {axis.evidence.map((e, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed italic text-muted-foreground border-l-2 border-current/30 pl-3"
              >
                &ldquo;{e}&rdquo;
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RewriteBlockView({
  title,
  block,
}: {
  title: string;
  block: RewriteBlock;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Current
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground line-through decoration-destructive/40 decoration-2">
            {block.current}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Stronger alternates
          </p>
          <ul className="space-y-2">
            {block.alternates.map((alt, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed border-l-2 border-primary/40 pl-3"
              >
                {alt}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs italic text-muted-foreground pt-1">
          {block.why_better}
        </p>
      </div>
    </div>
  );
}

function PrintButton({ diagnosticId }: { diagnosticId: string }) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Signed PDF download — C2PA Content Credentials embedded */}
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = `/api/diagnostic/${diagnosticId}/pdf`;
          }
        }}
      >
        Download Signed PDF
      </Button>
      {/* Browser-native print fallback */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined") window.print();
        }}
      >
        Print Page
      </Button>
    </div>
  );
}

/**
 * Optional preface block (label + 2-sentence preamble) injected above the
 * scorecard grid and the 30-day plan grid. Produced by the variant resolver
 * in lib/diagnostic-variants.ts; passed in as plain strings so this client
 * component never pulls the engine module into the bundle.
 */
type VariantPreface = {
  label: string;
  preface: string;
};

export function DeepReport({
  detail,
  hostname,
  scorecardPreface,
  planPreface,
  diagnosticId,
}: {
  detail: DeepAnalysisDetail;
  hostname: string;
  scorecardPreface?: VariantPreface;
  planPreface?: VariantPreface;
  diagnosticId: string;
}) {
  const { product_snapshot, scores, rewrites, plan_30_day, competitors, strengths } =
    detail;

  return (
    <section className="space-y-10 mb-10" aria-label="Deep analysis report">
      {/* Header strip + download CTA */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          The full teardown
        </p>
        <PrintButton diagnosticId={diagnosticId} />
      </div>

      {/* PRODUCT SNAPSHOT */}
      <div>
        <h2 className="text-xl font-bold mb-3">What I see on the page</h2>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Product
              </p>
              <p className="text-sm font-medium">{product_snapshot.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Pricing visible
              </p>
              <p className="text-sm font-medium">
                {product_snapshot.pricing_visible || (
                  <span className="text-muted-foreground italic">
                    Not surfaced on this page
                  </span>
                )}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                One-liner as written
              </p>
              <p className="text-sm leading-relaxed italic">
                &ldquo;{product_snapshot.one_liner}&rdquo;
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Who it says it&apos;s for
              </p>
              <p className="text-sm leading-relaxed">
                {product_snapshot.audience_stated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* THREE-AXIS SCORECARD */}
      <div>
        <h2 className="text-xl font-bold mb-1">The three-axis scorecard</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          One = catastrophic. Ten = world-class. The lowest score is the
          upstream gap — fix that one first and the others get easier.
        </p>
        {/* Quiz-funnel variant preface — chosen by hours_per_week ×
            time_since_launch. Renders only when the founder completed the
            new quiz steps; legacy rows skip it. */}
        {scorecardPreface && (
          <div className="mb-4 rounded-md border border-border bg-muted/50 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              {scorecardPreface.label}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {scorecardPreface.preface}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AxisCard title="Wrong Person" axis={scores.wrong_person} />
          <AxisCard title="Weak Offer" axis={scores.weak_offer} />
          <AxisCard title="Weak Belief" axis={scores.weak_belief} />
        </div>
      </div>

      {/* STRENGTHS */}
      {strengths.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-1">What is working</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Honest positives. Not flattery — these are the parts I would not
            touch if I rewrote the page.
          </p>
          <Card className="bg-emerald-500/5 border-emerald-500/30">
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-emerald-600 before:font-bold"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* REWRITES */}
      <div>
        <h2 className="text-xl font-bold mb-1">Copy you could ship today</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Three concrete rewrites for your hero, your CTA, and your value
          props. Each alternate moves you up the scorecard by at least two
          points. Pick one. Ship it.
        </p>
        <Card>
          <CardContent className="pt-6 space-y-8">
            <RewriteBlockView title="Hero headline" block={rewrites.hero_headline} />
            <Separator />
            <RewriteBlockView title="Primary CTA" block={rewrites.primary_cta} />
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2">Value props</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                    Current
                  </p>
                  <ul className="space-y-1.5">
                    {rewrites.value_props.current.map((b, i) => (
                      <li
                        key={i}
                        className="text-sm leading-relaxed text-muted-foreground line-through decoration-destructive/40 decoration-2"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                    Rewritten
                  </p>
                  <ul className="space-y-1.5">
                    {rewrites.value_props.rewritten.map((b, i) => (
                      <li
                        key={i}
                        className="text-sm leading-relaxed border-l-2 border-primary/40 pl-3"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs italic text-muted-foreground pt-1">
                  {rewrites.value_props.why_better}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-DAY PLAN */}
      <div>
        <h2 className="text-xl font-bold mb-1">Your 30-day plan</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Four weeks. Each deliverable fits one work session. No &ldquo;think
          about&rdquo; or &ldquo;explore&rdquo; — every line starts with a
          verb you can finish today.
        </p>
        {/* Quiz-funnel variant preface — chosen by biggest_fear. The plan
            deliverables themselves are also tuned via the founder-context
            block we pass to the LLM in lib/diagnostic.ts, so this preface
            and the LLM output rhyme. Legacy rows skip the preface. */}
        {planPreface && (
          <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              {planPreface.label}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {planPreface.preface}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeekCard idx={1} plan={plan_30_day.week1} />
          <WeekCard idx={2} plan={plan_30_day.week2} />
          <WeekCard idx={3} plan={plan_30_day.week3} />
          <WeekCard idx={4} plan={plan_30_day.week4} />
        </div>
      </div>

      {/* COMPETITORS */}
      <div>
        <h2 className="text-xl font-bold mb-1">How {hostname} stacks up</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Two competitors in your space — what they nail, what you already
          beat them on.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((c, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <h3 className="text-base font-semibold mb-1">{c.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {c.one_line}
                </p>

                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                    What they do better
                  </p>
                  <ul className="space-y-1.5">
                    {c.what_they_do_better.map((b, j) => (
                      <li
                        key={j}
                        className="text-xs leading-relaxed pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-muted-foreground"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {c.what_you_do_better.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                      What you do better
                    </p>
                    <ul className="space-y-1.5">
                      {c.what_you_do_better.map((b, j) => (
                        <li
                          key={j}
                          className="text-xs leading-relaxed pl-4 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeekCard({ idx, plan }: { idx: number; plan: WeekPlan }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Week {idx}
          </p>
          <Badge variant="outline" className="text-[10px]">
            {plan.deliverables.length} task{plan.deliverables.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <h3 className="text-base font-semibold mb-3 leading-tight">{plan.theme}</h3>
        <ul className="space-y-2">
          {plan.deliverables.map((d, i) => (
            <li
              key={i}
              className="text-sm leading-relaxed pl-6 relative before:content-['□'] before:absolute before:left-0 before:text-muted-foreground before:font-bold"
            >
              {d}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
