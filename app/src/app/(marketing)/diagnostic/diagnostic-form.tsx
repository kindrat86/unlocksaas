"use client";

import { useEffect, useMemo, useState } from "react";
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
  RecentRevenue,
  TimeSinceLaunch,
} from "@/lib/diagnostic";

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
 * Free Diagnostic — Brunson Survey Funnel (DCS Secret 15).
 *
 * One decision per screen. The order is deliberate:
 *
 *   1. Product URL (commitment-light: paste a link)
 *   2. Time since launch (one tap)
 *   3. Recent revenue (one tap — easy because $0 is the most common honest answer)
 *   4. Biggest attempt (one tap — pattern interrupt: name the avoidance)
 *   5. Email (last, after they've invested attention)
 *
 * Brunson rule: don't ask for the email up front. The survey itself is the
 * commitment-build that earns the right to ask. We track partial completions
 * via PostHog events; abandonment at each step is a signal worth reading.
 *
 * Source: strategy/workbooks/04-building-your-funnels.md §3,
 *         strategy/workbooks/01-sales-funnel-secrets.md §6 (Reluctant Hero voice).
 */

type Step = 1 | 2 | 3 | 4 | 5;
type FieldError = {
  email?: string;
  productUrl?: string;
  form?: string;
};

type SurveyState = {
  productUrl: string;
  time_since_launch: TimeSinceLaunch | "";
  recent_revenue: RecentRevenue | "";
  biggest_attempt: BiggestAttempt | "";
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
  const [submitElapsed, setSubmitElapsed] = useState(0);
  const [errors, setErrors] = useState<FieldError>({});
  const [alreadyUsed, setAlreadyUsed] = useState<AlreadyUsed | null>(null);

  // Cycle a stage-of-work hint while the engine reads + analyzes. The deep
  // analysis call runs ~30-45 s and a silent button is worse UX than a stale
  // counter — the user wants to know something is happening.
  useEffect(() => {
    if (!submitting) {
      setSubmitElapsed(0);
      return;
    }
    setSubmitElapsed(0);
    const start = Date.now();
    const t = setInterval(() => {
      setSubmitElapsed(Math.round((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [submitting]);

  const submitStage = (() => {
    if (submitElapsed < 5) return "Fetching your page...";
    if (submitElapsed < 15) return "Reading the hero, offer, and copy...";
    if (submitElapsed < 30) return "Scoring three failure modes...";
    if (submitElapsed < 45) return "Drafting rewrites + 30-day plan...";
    if (submitElapsed < 60) return "Naming competitors...";
    return "Almost there. Finalizing the teardown...";
  })();
  const [state, setState] = useState<SurveyState>({
    productUrl: "",
    time_since_launch: "",
    recent_revenue: "",
    biggest_attempt: "",
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
      window.localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          productUrl: state.productUrl,
          survey: {
            time_since_launch: state.time_since_launch,
            recent_revenue: state.recent_revenue,
            biggest_attempt: state.biggest_attempt,
          },
          referrer:
            typeof document !== "undefined" ? document.referrer : null,
          ts: Date.now(),
        }),
      );
      track(Event.DiagnosticFormSubmitted, {
        step_completed: 5,
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

  const progress = useMemo(() => (step - 1) * 25, [step]);

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

  // -- Step 5: Email + final submit ----------------------------------------
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
      // Should never happen; the steps gate this. Defensive guard.
      setErrors({
        form: "Some survey answers are missing. Refresh and start again.",
      });
      return;
    }

    setSubmitting(true);
    track(Event.DiagnosticFormSubmitted, {
      step_completed: 5,
      email_domain: state.email.trim().split("@")[1] ?? null,
      product_url: state.productUrl,
      time_since_launch: state.time_since_launch,
      recent_revenue: state.recent_revenue,
      biggest_attempt: state.biggest_attempt,
    });
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email.trim(),
          productUrl: state.productUrl,
          survey: {
            time_since_launch: state.time_since_launch,
            recent_revenue: state.recent_revenue,
            biggest_attempt: state.biggest_attempt,
          },
          referrer:
            typeof document !== "undefined" ? document.referrer : undefined,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
        already_used?: boolean;
        previous_url?: string | null;
      };
      if (!res.ok || !body.id) {
        setErrors({
          form:
            body.error ||
            "Something went sideways. Try once more, then email me at maryan@unlocksaas.com.",
        });
        setSubmitting(false);
        return;
      }
      if (body.already_used) {
        track(Event.DiagnosticFormSubmitted, {
          step_completed: 5,
          already_used: true,
          email_domain: state.email.trim().split("@")[1] ?? null,
        });
        setAlreadyUsed({
          existingId: body.id,
          previousUrl: body.previous_url ?? null,
        });
        setSubmitting(false);
        return;
      }
      router.push(`/diagnostic/result?id=${body.id}`);
    } catch {
      setErrors({
        form:
          "Could not reach the diagnostic engine. Try again in a minute, or email me directly at maryan@unlocksaas.com.",
      });
      setSubmitting(false);
    }
  }

  if (alreadyUsed) {
    return <AlreadyUsedPanel data={alreadyUsed} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground mt-2">
          Step {step} of 5 — about 90 seconds total. The engine reads your
          page, scores three failure modes, drafts rewrites, and writes you
          a 30-day plan.
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

      {step === 5 && (
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
              {submitting ? submitStage : ctaLabel}
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
