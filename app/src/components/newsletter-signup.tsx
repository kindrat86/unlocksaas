"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

/**
 * Newsletter signup for the Funnel Hub. Wires the visitor into the Soap
 * Opera Sequence with `source: "funnel_hub"` (Day 0 fires immediately,
 * cron picks up Days 1-4). One field, one CTA. No "spam free" cliches.
 *
 * Variants:
 *   - "stacked" (default) – vertical input + button, for the in-page panels.
 *   - "hero"              – primary CTA in the homepage hero. Same vertical
 *     stack, larger button, slightly different microcopy beat.
 *
 * The `source` prop wires attribution into the Soap Opera Sequence so the
 * brunson-funnel-metrics dashboard can split first-touch surface ("hero" vs
 * "tail of the homepage" vs "outside the homepage entirely").
 */
type Props = {
  variant?: "stacked" | "hero";
  ctaLabel?: string;
  source?: string;
};

export function NewsletterSignup({
  variant = "stacked",
  ctaLabel,
  source = "funnel_hub",
}: Props = {}) {
  const [email, setEmail] = useState("");
  // Honeypot — humans never see or fill it; bots that do get a fake success.
  const [gotcha, setGotcha] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState({ kind: "error", message: "That does not look like an email." });
      return;
    }

    setState({ kind: "submitting" });
    track(Event.FunnelHubCtaClicked, { surface: `newsletter:${source}` });

    try {
      const res = await fetch("/api/soap-opera/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source, _gotcha: gotcha }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState({
          kind: "error",
          message:
            body.error || "Could not subscribe. Try once more, then email me directly.",
        });
        return;
      }
      setState({ kind: "ok" });
      setEmail("");
    } catch {
      setState({
        kind: "error",
        message: "Could not reach the server. Try again in a minute.",
      });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 text-sm leading-relaxed text-left">
        First email is in your inbox. One short note a day for five days.
        Reply STOP to unsubscribe. – Maryan
      </div>
    );
  }

  const submitLabel =
    ctaLabel ??
    (variant === "hero"
      ? "Yes – send me the 5 emails"
      : "Send me the five emails");

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
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
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@yourdomain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.kind === "submitting"}
        required
        aria-invalid={state.kind === "error"}
        aria-describedby={state.kind === "error" ? "newsletter-email-error" : undefined}
      />
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={state.kind === "submitting"}
      >
        {state.kind === "submitting" ? "Subscribing..." : submitLabel}
      </Button>
      {state.kind === "error" && (
        <p id="newsletter-email-error" role="alert" className="text-xs text-destructive text-left">{state.message}</p>
      )}
      <p className="text-xs text-muted-foreground text-left">
        Five emails over five days. Reply STOP anytime. No spam, ever.
      </p>
    </form>
  );
}
