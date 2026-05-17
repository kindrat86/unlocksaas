"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";
import type {
  BiggestAttempt,
  RecentRevenue,
  TimeSinceLaunch,
} from "@/lib/diagnostic";

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

export function DiagnosticForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [state, setState] = useState<SurveyState>({
    productUrl: "",
    time_since_launch: "",
    recent_revenue: "",
    biggest_attempt: "",
    email: "",
  });

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
      router.push(`/diagnostic/result?id=${body.id}`);
    } catch {
      setErrors({
        form:
          "Could not reach the diagnostic engine. Try again in a minute, or email me directly at maryan@unlocksaas.com.",
      });
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground mt-2">
          Step {step} of 5 — about 60 seconds total.
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
              {submitting ? "Reading your page..." : "See why your launch is flat"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            I email the diagnosis. No spam. Reply STOP to unsubscribe.
          </p>
        </form>
      )}
    </div>
  );
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
