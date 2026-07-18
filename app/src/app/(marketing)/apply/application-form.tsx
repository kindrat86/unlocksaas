"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MrrBand =
  | "pre_revenue"
  | "under_1k"
  | "1k_to_5k"
  | "5k_to_20k"
  | "over_20k";

type PreferredTier = "" | "sprint_997" | "sprint_1997";
type CalendarPreference = "" | "this_week" | "next_week" | "flexible";

/**
 * Done-With-You Sprint application form.
 *
 * Six required answers, two optional. Posts to /api/apply which qualifies +
 * persists + fires the operator alert and the applicant auto-reply. On
 * success the API returns a `redirect` field pointing to /apply/qualified or
 * /apply/not-yet; we router.push() to it.
 *
 * Brunson rule: the application is the disqualifier. We do not "sell" anything
 * on this form — we ask six honest questions and route accordingly.
 */
export function ApplicationForm({ source }: { source: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [mrrBand, setMrrBand] = useState<"" | MrrBand>("");
  const [biggestBlocker, setBiggestBlocker] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [budgetChoice, setBudgetChoice] = useState<"" | "yes" | "no">("");
  const [preferredTier, setPreferredTier] = useState<PreferredTier>("");
  const [calendar, setCalendar] = useState<CalendarPreference>("");
  // Honeypot — humans never see or fill it; bots that do get a fake success.
  const [gotcha, setGotcha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !firstName.trim()) {
      setError("Email and first name are both required.");
      return;
    }
    if (!mrrBand) {
      setError("Pick the band that best describes your current revenue.");
      return;
    }
    if (biggestBlocker.trim().length < 10) {
      setError("Tell me the biggest blocker (at least 10 characters).");
      return;
    }
    if (whyNow.trim().length < 10) {
      setError("Tell me why now (at least 10 characters).");
      return;
    }
    if (!budgetChoice) {
      setError("Confirm whether you have the budget for this.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          product_url: productUrl.trim() || null,
          mrr_band: mrrBand,
          biggest_blocker: biggestBlocker.trim(),
          why_now: whyNow.trim(),
          has_budget: budgetChoice === "yes",
          preferred_tier: preferredTier || null,
          calendar_preference: calendar || null,
          source,
          _gotcha: gotcha,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        redirect?: string;
        error?: string;
      };

      if (res.ok && body.ok && body.redirect) {
        router.push(body.redirect);
        return;
      }

      const code = body.error ?? "unknown";
      setError(humanizeError(code));
    } catch {
      setError(
        "Network error. Try again in a moment, or email maryan@unlocksaas.com directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot — display:none keeps it out of human reach. */}
      <input
        type="text"
        name="_gotcha"
        value={gotcha}
        onChange={(e) => setGotcha(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <Field label="Your first name" htmlFor="first_name" required>
        <Input
          id="first_name"
          type="text"
          autoComplete="given-name"
          required
          maxLength={60}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Your name"
          disabled={submitting}
        />
      </Field>

      <Field label="Your email" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourstartup.com"
          disabled={submitting}
        />
      </Field>

      <Field
        label="Your product URL"
        htmlFor="product_url"
        hint="Optional. Skip if you do not have one yet."
      >
        <Input
          id="product_url"
          type="url"
          inputMode="url"
          maxLength={2048}
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://yourapp.com"
          disabled={submitting}
        />
      </Field>

      <Field
        label="Question 1 of 6 – Where are you on revenue today?"
        htmlFor="mrr_band"
        required
      >
        <select
          id="mrr_band"
          required
          value={mrrBand}
          onChange={(e) => setMrrBand(e.target.value as "" | MrrBand)}
          disabled={submitting}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Pick one</option>
          <option value="pre_revenue">
            Pre-revenue – no paying customers yet
          </option>
          <option value="under_1k">Under $1k MRR</option>
          <option value="1k_to_5k">$1k – $5k MRR</option>
          <option value="5k_to_20k">$5k – $20k MRR</option>
          <option value="over_20k">$20k+ MRR</option>
        </select>
      </Field>

      <Field
        label="Question 2 of 6 – What is the single biggest blocker between you and your next paying customer?"
        htmlFor="biggest_blocker"
        hint="One paragraph. The more specific you are, the better the call goes."
        required
      >
        <Textarea
          id="biggest_blocker"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          value={biggestBlocker}
          onChange={(e) => setBiggestBlocker(e.target.value)}
          placeholder="The honest version, not the polished one."
          disabled={submitting}
        />
      </Field>

      <Field
        label="Question 3 of 6 – Why now?"
        htmlFor="why_now"
        hint="Why are you applying this week and not last month or next quarter?"
        required
      >
        <Textarea
          id="why_now"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          value={whyNow}
          onChange={(e) => setWhyNow(e.target.value)}
          placeholder="What changed. What is at stake. What is the cost of waiting."
          disabled={submitting}
        />
      </Field>

      <Field
        label="Question 4 of 6 – Do you have at least $997 in budget for this?"
        htmlFor="has_budget"
        hint="Honest yes or no. A no here just routes you back to the $1 Starter, no judgement."
        required
      >
        <div className="flex gap-3" role="radiogroup" id="has_budget">
          <BudgetChoice
            value="yes"
            current={budgetChoice}
            onSelect={setBudgetChoice}
            disabled={submitting}
            label="Yes – I can pay"
          />
          <BudgetChoice
            value="no"
            current={budgetChoice}
            onSelect={setBudgetChoice}
            disabled={submitting}
            label="No – not right now"
          />
        </div>
      </Field>

      <Field
        label="Question 5 of 6 – Which tier are you leaning toward?"
        htmlFor="preferred_tier"
        hint="Optional. You can decide on the call."
      >
        <select
          id="preferred_tier"
          value={preferredTier}
          onChange={(e) => setPreferredTier(e.target.value as PreferredTier)}
          disabled={submitting}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">No preference yet</option>
          <option value="sprint_997">
            $997 – Self-paced Sprint
          </option>
          <option value="sprint_1997">
            $1,997 – Sprint + one 1-hour 1:1 with Maryan
          </option>
        </select>
      </Field>

      <Field
        label="Question 6 of 6 – When could you do a 15-minute call?"
        htmlFor="calendar"
        hint="Optional. The Calendly on the next page has live slots."
      >
        <select
          id="calendar"
          value={calendar}
          onChange={(e) =>
            setCalendar(e.target.value as CalendarPreference)
          }
          disabled={submitting}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">No preference</option>
          <option value="this_week">This week</option>
          <option value="next_week">Next week</option>
          <option value="flexible">
            Flexible – any time in the next 14 days
          </option>
        </select>
      </Field>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full text-base py-6"
        disabled={submitting}
      >
        {submitting ? "Submitting your application…" : "Submit my application"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Six honest answers. One auto-reply within a minute, from Maryan. No
        sales-page redirect tricks. If you do not qualify today, the email
        tells you exactly which rung to start on.
      </p>
    </form>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function Field(props: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={props.htmlFor} className="text-sm font-medium block">
        {props.label}
        {props.required ? (
          <span className="text-muted-foreground font-normal"> (required)</span>
        ) : (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </label>
      {props.children}
      {props.hint && (
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      )}
    </div>
  );
}

function BudgetChoice(props: {
  value: "yes" | "no";
  current: "" | "yes" | "no";
  onSelect: (v: "yes" | "no") => void;
  disabled: boolean;
  label: string;
}) {
  const active = props.current === props.value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={props.disabled}
      onClick={() => props.onSelect(props.value)}
      className={
        "flex-1 rounded-md border px-4 py-3 text-sm font-medium transition " +
        (active
          ? "border-primary bg-primary/5 text-foreground"
          : "border-input bg-background hover:border-primary/40")
      }
    >
      {props.label}
    </button>
  );
}

function humanizeError(code: string): string {
  switch (code) {
    case "invalid_email":
      return "That email does not look right. Try again.";
    case "invalid_first_name":
      return "Please enter a first name (up to 60 characters).";
    case "invalid_mrr_band":
      return "Pick the band that best describes your current revenue.";
    case "invalid_blocker":
      return "The biggest-blocker answer is too short — at least 10 characters.";
    case "invalid_why_now":
      return "The why-now answer is too short — at least 10 characters.";
    case "invalid_budget":
      return "Confirm whether you have the budget for this.";
    case "invalid_tier":
      return "That tier value is not recognized. Refresh and try again.";
    case "invalid_calendar":
      return "That calendar value is not recognized. Refresh and try again.";
    case "db_upsert_failed":
      return "Something went wrong on my end saving the application. Try again in a moment.";
    default:
      return "Something went wrong. Try again, or email maryan@unlocksaas.com directly.";
  }
}
