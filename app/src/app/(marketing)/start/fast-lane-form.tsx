"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * The Canonical Brunson Lead Squeeze form (DCS Chapter 14, forward variant).
 *
 * Why one field and not the 5-step diagnostic survey:
 *
 *   - The diagnostic form (/diagnostic) is a Survey Funnel (DCS Secret 15).
 *     It earns the email through commitment-build. Best on visitors who
 *     arrived via a Reluctant-Hero parable post and are willing to invest
 *     ~60 seconds.
 *
 *   - This form is the OTHER pattern from the same chapter. Cold ad
 *     traffic, X bio click-throughs, podcast call-outs, and Indie Hackers
 *     reply links all share one trait: every additional click is friction
 *     that kills the conversion. For those audiences the right squeeze is
 *     a single field and a single button.
 *
 *   - Both forms feed the same Day 0 Soap Opera Sequence. The difference
 *     is which door the visitor walked through, which we capture as the
 *     attribution `source` on soap_opera_subscribers. The per-source
 *     conversion is measurable in supabase/views/squeeze_conversion.sql.
 *
 * Source: strategy/workbooks/01-sales-funnel-secrets.md §5 (Hook #3),
 *         strategy/workbooks/04-building-your-funnels.md §5 (the Soap
 *         Opera Sequence the opt-in routes into).
 */
export function FastLaneSqueezeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Client-side guard. Real validation lives on the server.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState({
        kind: "error",
        message: "That does not look like an email address.",
      });
      return;
    }

    setState({ kind: "submitting" });
    track(Event.FastLaneSqueezeSubmitted, {
      email_domain: email.trim().split("@")[1] ?? null,
    });

    try {
      const res = await fetch("/api/soap-opera/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "fast_lane_squeeze",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        subscribed?: boolean;
        error?: string;
      };

      // Day 0 send is best-effort; "subscribed" alone is the conversion.
      if (body.subscribed) {
        setState({ kind: "ok" });
        return;
      }

      setState({
        kind: "error",
        message:
          body.error ??
          "Could not subscribe you. Try once more, or email maryan@unlocksaas.com directly.",
      });
    } catch {
      setState({
        kind: "error",
        message:
          "Could not reach the server. Try once more in a minute, or email maryan@unlocksaas.com directly.",
      });
    }
  }

  if (state.kind === "ok") {
    return (
      <div
        role="status"
        className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4"
      >
        <p className="text-sm font-semibold mb-1">
          You are in. Email one is on its way.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Check spam if you do not see it in two minutes. Whitelist
          maryan@unlocksaas.com so the next four do not slip past you. Reply
          to email one if you want me to read your live page personally.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
      aria-label="Subscribe to the five emails"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="fast-lane-email"
          className="text-sm font-medium text-foreground"
        >
          Your email
        </label>
        <Input
          id="fast-lane-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@yourdomain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === "submitting"}
          aria-invalid={state.kind === "error" ? true : undefined}
          autoFocus
        />
      </div>

      {state.kind === "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={state.kind === "submitting"}
        className="w-full text-base py-6"
      >
        {state.kind === "submitting"
          ? "Sending email one..."
          : "Send me the five emails"}
      </Button>

      {/* Cookbook Swipe 8 — Justin Welsh trust line + what-happens-next.
          Brunson rule: trust line BELOW the button. Visitors who already
          decided do not read it; visitors on the fence are the ones who
          need it. */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Email one arrives now. Emails two through five at 9am each
          weekday. Reply STOP to unsubscribe with one click. I never sell
          your data.
        </p>
        <p>Replies land in my inbox, not a support queue. — Maryan</p>
      </div>
    </form>
  );
}
