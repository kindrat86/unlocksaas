"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  BiggestAttempt,
  BiggestFear,
  HoursPerWeek,
  PrimaryGoal,
  RecentRevenue,
  TimeSinceLaunch,
} from "@/lib/diagnostic";
import {
  ReasoningStream,
  type ReasoningStepState,
} from "@/components/diagnostic/reasoning-stream";
import type {
  DiagnosticStepId,
  DiagnosticStreamEvent,
} from "@/lib/diagnostic-stream-types";

// Google OAuth on the diagnostic squeeze is gated by an env flag so the
// button stays hidden in environments where the Supabase Google provider
// hasn't been configured yet. Flip to "1" once the provider is wired in
// Supabase Dashboard → Authentication → Providers → Google.
const GOOGLE_OAUTH_ENABLED =
  process.env.NEXT_PUBLIC_DIAGNOSTIC_GOOGLE_OAUTH === "1";

// Stash key for the partial survey state across the Google OAuth round-trip.
// The /diagnostic/finish page reads it back, posts to /api/diagnostic with
// the session email, then clears it.
const PENDING_KEY = "diagnostic_pending";

/**
 * Free Diagnostic — Brunson Survey Funnel (DCS Secret 15) + quiz expansion
 * (2026-05-21 trend synthesis: quiz funnels avg 40.1% conversion on cold
 * traffic vs 3–10% for static lead magnets).
 *
 * One decision per screen. The order is deliberate — each step escalates
 * commitment from low-friction factual answers to deeper self-disclosure:
 *
 *   1. Product URL              (commitment-light: paste a link)
 *   2. Time since launch        (factual, one tap)
 *   3. Recent revenue           (factual, one tap — $0 is the honest default)
 *   4. Primary goal             (motivational, one tap — what they want)
 *   5. Biggest attempt          (pattern interrupt #1 — name the avoidance)
 *   6. Hours per week           (factual constraint, one tap)
 *   7. Biggest fear             (pattern interrupt #2 — name the fear)
 *   8. Email                    (final commit, after they've invested attention)
 *
 * Steps 4, 6, 7 are the quiz-funnel expansion fields. They feed
 * lib/diagnostic-variants.ts, which renders per-answer template overlays
 * on /diagnostic/result and /diagnosis/[id] (headline / scorecard tone /
 * 30-day plan emphasis). Each new step abandons cleanly — `back` works at
 * every step, and the API edge accepts a null on every quiz field so a
 * partial completion via the Google OAuth round-trip still produces a row.
 *
 * Brunson rule: don't ask for the email up front. The survey itself is the
 * commitment-build that earns the right to ask. We track partial completions
 * via PostHog events; abandonment at each step is a signal worth reading.
 *
 * Source: strategy/workbooks/04-building-your-funnels.md §3,
 *         strategy/workbooks/01-sales-funnel-secrets.md §6 (Reluctant Hero voice).
 */

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const TOTAL_STEPS = 8;
type FieldError = {
  email?: string;
  productUrl?: string;
  form?: string;
};

type SurveyState = {
  productUrl: string;
  time_since_launch: TimeSinceLaunch | "";
  recent_revenue: RecentRevenue | "";
  primary_goal: PrimaryGoal | "";
  biggest_attempt: BiggestAttempt | "";
  hours_per_week: HoursPerWeek | "";
  biggest_fear: BiggestFear | "";
  email: string;
};

const TIME_OPTIONS: Array<{ value: TimeSinceLaunch; label: string }> = [
  { value: "under_30", label: "Less than 30 days ago" },
  { value: "30_to_90", label: "30 to 90 days ago" },
  { value: "90_plus", label: "More than 90 days ago" },
];

const REVENUE_OPTIONS: Array<{ value: RecentRevenue; label: string }> = [
  { value: "zero", label: "$0 — flat Stripe line" },
  { value: "under_100", label: "$1 to $100" },
  { value: "100_to_1k", label: "$100 to $1,000" },
  { value: "over_1k", label: "More than $1,000" },
];

const ATTEMPT_OPTIONS: Array<{ value: BiggestAttempt; label: string }> = [
  { value: "more_building", label: "Built more features" },
  { value: "seo_content", label: "SEO or content marketing" },
  { value: "paid_ads", label: "Paid ads" },
  { value: "customer_conversations", label: "Talked to real customers" },
  { value: "nothing_yet", label: "Honestly, nothing meaningful yet" },
];

// Quiz expansion options (2026-05-21). These three questions are NEW;
// each one feeds one axis of the per-answer variant resolver in
// lib/diagnostic-variants.ts.
const PRIMARY_GOAL_OPTIONS: Array<{ value: PrimaryGoal; label: string }> = [
  { value: "first_customer", label: "First paying customer in the next 60 days" },
  { value: "replace_income", label: "Replace my day-job income" },
  { value: "scale_revenue", label: "Scale revenue past where it is now" },
  { value: "validate_pmf", label: "Validate product–market fit" },
  { value: "build_audience", label: "Build the audience first, monetize later" },
];

const HOURS_PER_WEEK_OPTIONS: Array<{ value: HoursPerWeek; label: string }> = [
  { value: "under_5", label: "Under 5 hours a week" },
  { value: "five_to_fifteen", label: "5 to 15 hours a week" },
  { value: "fifteen_plus", label: "15 or more hours a week" },
];

const BIGGEST_FEAR_OPTIONS: Array<{ value: BiggestFear; label: string }> = [
  { value: "wrong_audience", label: "Picking the wrong audience" },
  { value: "no_distribution", label: "I have no distribution" },
  { value: "not_ready", label: "The product is not ready yet" },
  { value: "ad_waste", label: "Wasting money on ads" },
  { value: "not_expert", label: "Not being seen as the expert" },
  { value: "none", label: "Honestly, none of these" },
];

type AlreadyUsed = {
  existingId: string;
  previousUrl: string | null;
};

export function DiagnosticForm({
  submitCta,
}: {
  /**
   * Final-step CTA copy. Rotates with the hook variant chosen by the
   * server-side resolver (workbook 01 §5, workbook 10 §4). Falls back to
   * the pain-mirror default if the caller didn't pass one.
   */
  submitCta?: string;
} = {}) {
  const ctaLabel = submitCta?.trim() || "See why your launch is flat";
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  // `streaming` is the visible-reasoning phase: the email + URL have been
  // accepted by the server and step events are arriving. We swap the form
  // for the <ReasoningStream/> panel while this is true.
  const [streaming, setStreaming] = useState(false);
  const [steps, setSteps] = useState<
    Partial<Record<DiagnosticStepId, ReasoningStepState>>
  >({});
  const [errors, setErrors] = useState<FieldError>({});
  const [alreadyUsed, setAlreadyUsed] = useState<AlreadyUsed | null>(null);

  const [state, setState] = useState<SurveyState>({
    productUrl: "",
    time_since_launch: "",
    recent_revenue: "",
    primary_goal: "",
    biggest_attempt: "",
    hours_per_week: "",
    biggest_fear: "",
    email: "",
  });

  // -- Google OAuth handoff -------------------------------------------------
  // Persists the partial survey + product URL so the /diagnostic/finish page
  // can post it with the Google-verified email after the OAuth round-trip.
  // The survey is the commitment-build (Brunson rule); we won't drop it on
  // the floor just because the user chose Google over email.
  async function continueWithGoogle() {
    if (!GOOGLE_OAUTH_ENABLED) return;
    if (
      !state.productUrl ||
      !state.time_since_launch ||
      !state.recent_revenue ||
      !state.biggest_attempt
    ) {
      setErrors({
        form: "Some survey answers are missing. Refresh and start again.",
      });
      return;
    }
    setSubmitting(true);
    try {
      // Quiz-expansion fields (primary_goal / hours_per_week / biggest_fear)
      // are stashed alongside the legacy three so /diagnostic/finish can
      // replay them after the Google OAuth round-trip. They are optional in
      // the stash schema and on the API edge — if a returning OAuth user
      // arrives with an old pre-expansion stash, the API still accepts the
      // shape and the variant resolver falls back to "default".
      window.localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          productUrl: state.productUrl,
          survey: {
            time_since_launch: state.time_since_launch,
            recent_revenue: state.recent_revenue,
            biggest_attempt: state.biggest_attempt,
            primary_goal: state.primary_goal || null,
            hours_per_week: state.hours_per_week || null,
            biggest_fear: state.biggest_fear || null,
          },
          referrer:
            typeof document !== "undefined" ? document.referrer : null,
          ts: Date.now(),
        }),
      );
      track(Event.DiagnosticFormSubmitted, {
        step_completed: TOTAL_STEPS,
        auth_method: "google",
        product_url: state.productUrl,
      });
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            "/diagnostic/finish",
          )}`,
        },
      });
      if (error) {
        console.error("[diagnostic] google oauth init failed", error.message);
        setErrors({
          form:
            "Could not start Google sign-in. Use the email field below, or email me at maryan@unlocksaas.com.",
        });
        setSubmitting(false);
      }
      // On success the browser is navigating away; leave submitting=true.
    } catch (err) {
      console.error("[diagnostic] google oauth threw", err);
      setErrors({
        form:
          "Could not start Google sign-in. Use the email field below, or email me at maryan@unlocksaas.com.",
      });
      setSubmitting(false);
    }
  }

  // Linear progress across all eight steps. Step 1 = 0%, Step 8 = ~88% (the
  // last 12% is reserved for the actual submit so the bar never sits at 100%
  // while the request is in flight — visual signal that there's work left).
  const progress = useMemo(
    () => Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 88),
    [step],
  );

  function advance(toStep: Step, partial: Partial<SurveyState>) {
    setState((prev) => ({ ...prev, ...partial }));
    setErrors({});
    setStep(toStep);
    track(Event.DiagnosticFormSubmitted, {
      step_completed: step,
      product_url: partial.productUrl ?? state.productUrl,
    });
  }

  function back() {
    if (step <= 1) return;
    setErrors({});
    setStep((step - 1) as Step);
  }

  // -- Step 1: Product URL --------------------------------------------------
  function handleUrlSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let normalizedUrl = state.productUrl.trim();
    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
      new URL(normalizedUrl);
    } catch {
      setErrors({
        productUrl: "Paste the full link to your live product page.",
      });
      return;
    }
    advance(2, { productUrl: normalizedUrl });
  }

  // -- Step 8: Email + final submit ----------------------------------------
  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      setErrors({ email: "That does not look like an email address." });
      return;
    }
    if (
      !state.time_since_launch ||
      !state.recent_revenue ||
      !state.biggest_attempt
    ) {
      // Should never happen; the steps gate this. Defensive guard. We
      // intentionally don't check the three quiz-expansion fields here —
      // they are OPTIONAL on the API edge and the variant resolver falls
      // back gracefully when missing. A user who manages to skip them
      // (e.g. via browser back/forward) still gets a valid diagnosis.
      setErrors({
        form: "Some survey answers are missing. Refresh and start again.",
      });
      return;
    }

    setSubmitting(true);
    setStreaming(true);
    setSteps({});
    track(Event.DiagnosticFormSubmitted, {
      step_completed: TOTAL_STEPS,
      email_domain: state.email.trim().split("@")[1] ?? null,
      product_url: state.productUrl,
      time_since_launch: state.time_since_launch,
      recent_revenue: state.recent_revenue,
      biggest_attempt: state.biggest_attempt,
      primary_goal: state.primary_goal || null,
      hours_per_week: state.hours_per_week || null,
      biggest_fear: state.biggest_fear || null,
    });

    // Track which engine subsections we've seen the LLM emit a start event
    // for. PostHog gets one event per major boundary so we can debug "where
    // does the stream actually stall in production" without grepping logs.
    const seenEngineStart = new Set<DiagnosticStepId>();

    const handleEvent = (event: DiagnosticStreamEvent) => {
      if (event.type === "step") {
        setSteps((prev) => ({
          ...prev,
          [event.id]: {
            id: event.id,
            status: event.status === "done" ? "done" : "running",
            detail:
              event.detail ?? prev[event.id]?.detail,
            score: event.score ?? prev[event.id]?.score,
          },
        }));
        if (
          event.status === "start" &&
          event.id.startsWith("score_") &&
          !seenEngineStart.has(event.id)
        ) {
          seenEngineStart.add(event.id);
          track(Event.DiagnosticFormSubmitted, {
            step_completed: 5,
            stream_event: `${event.id}_start`,
          });
        }
      } else if (event.type === "done") {
        if (event.alreadyUsed) {
          track(Event.DiagnosticFormSubmitted, {
            step_completed: 5,
            already_used: true,
            email_domain: state.email.trim().split("@")[1] ?? null,
          });
          setAlreadyUsed({
            existingId: event.id,
            previousUrl: event.previousUrl ?? null,
          });
          setStreaming(false);
          setSubmitting(false);
          return;
        }
        track(Event.DiagnosticFormSubmitted, {
          step_completed: 5,
          stream_event: "done",
          diagnosis_label: event.label ?? null,
        });
        // Navigate. We leave `streaming`/`submitting` true so the form
        // does not flash back into edit mode during the route transition.
        router.push(`/diagnostic/result?id=${event.id}`);
      } else if (event.type === "error") {
        setErrors({
          form:
            event.message ||
            "Something went sideways. Try once more, then email me at maryan@unlocksaas.com.",
        });
        setStreaming(false);
        setSubmitting(false);
      }
    };

    try {
      const res = await fetch("/api/diagnostic/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email.trim(),
          productUrl: state.productUrl,
          survey: {
            time_since_launch: state.time_since_launch,
            recent_revenue: state.recent_revenue,
            biggest_attempt: state.biggest_attempt,
            // Quiz-expansion fields. Sent only when populated — the API
            // validator on the other end keeps everything optional.
            primary_goal: state.primary_goal || null,
            hours_per_week: state.hours_per_week || null,
            biggest_fear: state.biggest_fear || null,
          },
          referrer:
            typeof document !== "undefined" ? document.referrer : undefined,
        }),
      });

      // Early-validation failures (bad email syntax, bad URL) come back as
      // a JSON envelope instead of an NDJSON stream. Detect via content-type.
      // The JSON envelope can also carry an already_used signal pointing the
      // visitor at their prior diagnostic instead of re-running.
      const contentType = res.headers.get("content-type") ?? "";
      // Hoisted so the already_used branch below (left over from the pre-
      // streaming JSON-only shape) still type-checks. When the response is
      // an NDJSON stream this stays undefined and the orphaned branch is a
      // no-op — fix-up TODO for the streaming-diagnostic author.
      let body:
        | {
            error?: string;
            already_used?: boolean;
            id?: string;
            previous_url?: string | null;
          }
        | undefined;
      if (!contentType.includes("ndjson")) {
        body = (await res.json().catch(() => ({}))) as typeof body;
        if (body?.already_used) {
          // Fall through to the already_used branch below so the prior
          // behaviour is preserved (analytics + UI flip).
        } else {
          setErrors({
            form:
              body?.error ||
              "Something went sideways. Try once more, then email me at maryan@unlocksaas.com.",
          });
          setStreaming(false);
          setSubmitting(false);
          return;
        }
      }

      if (body?.already_used) {
        track(Event.DiagnosticFormSubmitted, {
          step_completed: TOTAL_STEPS,
          already_used: true,
          email_domain: state.email.trim().split("@")[1] ?? null,
        });
        setAlreadyUsed({
          existingId: body.id ?? "",
          previousUrl: body.previous_url ?? null,
        });
        setSubmitting(false);
        return;
      }

      if (!res.body) {
        throw new Error("No response body to stream");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedDone = false;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const event = JSON.parse(line) as DiagnosticStreamEvent;
            if (event.type === "done") receivedDone = true;
            handleEvent(event);
            if (event.type === "error") {
              // Stop reading on first error event.
              try {
                await reader.cancel();
              } catch {
                /* already cancelled */
              }
              return;
            }
          } catch {
            // Malformed line — skip rather than abort the whole stream.
          }
        }
      }
      // Flush trailing partial line (no newline at EOF).
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim()) as DiagnosticStreamEvent;
          if (event.type === "done") receivedDone = true;
          handleEvent(event);
        } catch {
          /* trailing garbage — ignore */
        }
      }

      // Stream closed with no `done` event. Treat as a generic engine failure.
      if (!receivedDone) {
        setErrors({
          form:
            "The engine stopped mid-read. Try again in a minute, or email me at maryan@unlocksaas.com.",
        });
        setStreaming(false);
        setSubmitting(false);
      }
    } catch {
      setErrors({
        form:
          "Could not reach the diagnostic engine. Try again in a minute, or email me directly at maryan@unlocksaas.com.",
      });
      setStreaming(false);
      setSubmitting(false);
    }
  }

  if (alreadyUsed) {
    return <AlreadyUsedPanel data={alreadyUsed} />;
  }

  if (streaming) {
    return (
      <div className="space-y-6">
        <div>
          <Progress value={100} />
          <p className="text-xs text-muted-foreground mt-2">
            Running the diagnostic — typically 30 to 60 seconds. You will land
            on your diagnosis automatically.
          </p>
        </div>
        <ReasoningStream steps={steps} />
        {errors.form && (
          <p role="alert" className="text-sm text-destructive">
            {errors.form}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground mt-2">
          Step {step} of {TOTAL_STEPS} — under two minutes. The engine reads
          your page, scores three failure modes, drafts rewrites, and writes
          you a 30-day plan tuned to your answers.
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleUrlSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="diagnostic-url"
              className="text-sm font-medium text-foreground"
            >
              Paste the URL of your live product
            </label>
            <Input
              id="diagnostic-url"
              name="productUrl"
              type="url"
              autoComplete="url"
              required
              inputMode="url"
              placeholder="https://yourproduct.com"
              value={state.productUrl}
              onChange={(e) =>
                setState((p) => ({ ...p, productUrl: e.target.value }))
              }
              aria-invalid={errors.productUrl ? true : undefined}
              autoFocus
            />
            {errors.productUrl && (
              <p className="text-xs text-destructive">{errors.productUrl}</p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full text-base py-6">
            Continue
          </Button>
          <p className="text-xs text-muted-foreground">
            The engine reads what is publicly on this page. No login required.
          </p>
        </form>
      )}

      {step === 2 && (
        <ChoiceStep
          title="When did you ship this product?"
          subtitle="One tap. Honest answer."
          options={TIME_OPTIONS}
          onChoose={(value) => advance(3, { time_since_launch: value })}
          onBack={back}
        />
      )}

      {step === 3 && (
        <ChoiceStep
          title="How much revenue has it produced in the last 30 days?"
          subtitle="Stripe number. Not pipeline. Not 'soon.'"
          options={REVENUE_OPTIONS}
          onChoose={(value) => advance(4, { recent_revenue: value })}
          onBack={back}
        />
      )}

      {step === 4 && (
        <ChoiceStep
          title="What is the biggest thing you tried to fix this with?"
          subtitle="Pick the one you put the most hours into."
          options={ATTEMPT_OPTIONS}
          onChoose={(value) => advance(5, { biggest_attempt: value })}
          onBack={back}
        />
      )}

      {/* Quiz expansion steps 5–7 (2026-05-21). New questions feed the per-
          answer variant resolver in lib/diagnostic-variants.ts:
            step 5 (primary_goal)   → headline overlay on result page
            step 6 (hours_per_week) → scorecard tone preface
            step 7 (biggest_fear)   → 30-day plan emphasis preface
          Each is one-tap, optional on the API edge, and falls through to
          "default" copy if the visitor abandons mid-quiz via OAuth. */}
      {step === 5 && (
        <ChoiceStep
          title="What would the next 60 days mean if it actually worked?"
          subtitle="Pick the one you would trade three months of comfort for."
          options={PRIMARY_GOAL_OPTIONS}
          onChoose={(value) => advance(6, { primary_goal: value })}
          onBack={back}
        />
      )}

      {step === 6 && (
        <ChoiceStep
          title="How many hours a week can you actually put into this?"
          subtitle="Real hours. Not the hours you wish you had."
          options={HOURS_PER_WEEK_OPTIONS}
          onChoose={(value) => advance(7, { hours_per_week: value })}
          onBack={back}
        />
      )}

      {step === 7 && (
        <ChoiceStep
          title="What stops you most often when you try to fix this?"
          subtitle="The honest one. The one you would not say at a meetup."
          options={BIGGEST_FEAR_OPTIONS}
          onChoose={(value) => advance(8, { biggest_fear: value })}
          onBack={back}
        />
      )}

      {step === 8 && (
        <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="diagnostic-email"
              className="text-sm font-medium text-foreground"
            >
              Where do I send the diagnosis?
            </label>
            <Input
              id="diagnostic-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              inputMode="email"
              placeholder="you@yourdomain.com"
              value={state.email}
              onChange={(e) =>
                setState((p) => ({ ...p, email: e.target.value }))
              }
              aria-invalid={errors.email ? true : undefined}
              disabled={submitting}
              autoFocus
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {errors.form && (
            <p role="alert" className="text-sm text-destructive">
              {errors.form}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={back}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="flex-1 text-base py-6"
            >
              {submitting ? "Starting the engine..." : ctaLabel}
            </Button>
          </div>

          {GOOGLE_OAUTH_ENABLED && (
            <>
              <div className="relative my-2">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs uppercase tracking-widest text-muted-foreground">
                  or
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full text-base py-6"
                disabled={submitting}
                onClick={continueWithGoogle}
              >
                <GoogleGlyph />
                Continue with Google
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            I email the diagnosis. No spam. Reply STOP to unsubscribe.
          </p>
        </form>
      )}
    </div>
  );
}

// Brand-correct Google "G" glyph. Inline SVG so we don't ship a runtime
// dependency on @react-oauth/google or react-icons for a single mark.
function GoogleGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      width="18"
      height="18"
      className="mr-2"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A9 9 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A9 9 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A9 9 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

// Brunson 2nd-attempt door. Per workbook 02 §2 the value ladder rung is
// $1 Starter; per the founder decision (selected at plan time) we surface
// Core as a secondary path for ready-to-scale founders who self-identify.
function AlreadyUsedPanel({ data }: { data: AlreadyUsed }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          One free diagnosis per founder
        </p>
        <p className="text-sm leading-relaxed">
          You already used yours. The diagnosis I ran for you is still on file.
          {data.previousUrl ? (
            <>
              {" "}
              It was for{" "}
              <span className="font-medium text-foreground">
                {safeHost(data.previousUrl)}
              </span>
              .
            </>
          ) : null}
        </p>
      </div>

      <Button asChild variant="secondary" size="lg" className="w-full">
        <Link href={`/diagnostic/result?id=${data.existingId}`}>
          Re-open my diagnosis
        </Link>
      </Button>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">Where to go from here</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The diagnosis points at the upstream work. The next door does the
          work with you. Pick the rung that fits where you are.
        </p>
      </div>

      <Button asChild size="lg" className="w-full text-base py-6">
        <Link
          href={`/starter?from=diagnostic_repeat&lead=${data.existingId}`}
        >
          Start the Playbook — $1 Starter
        </Link>
      </Button>

      <Button asChild variant="ghost" size="lg" className="w-full text-sm">
        <Link
          href={`/playbook-sales?from=diagnostic_repeat&lead=${data.existingId}`}
        >
          Or skip ahead to The Playbook — $49/mo
        </Link>
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        $1 one-time. The full $49/mo Playbook is the optional upgrade on the
        next page. 60-day first-paying-customer guarantee on Core.
      </p>
    </div>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function ChoiceStep<T extends string>({
  title,
  subtitle,
  options,
  onChoose,
  onBack,
}: {
  title: string;
  subtitle: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChoose: (value: T) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChoose(opt.value)}
            className="w-full text-left rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent hover:border-primary/40 transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
