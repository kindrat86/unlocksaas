"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

type Placement = "mid_content" | "end_content";

type Props = {
  /**
   * Where on the page this form is rendered. Used to attribute conversions
   * — the mid-content opt-in tells us the reader bounced before the end;
   * the end-content opt-in tells us they finished all five stories.
   */
  placement: Placement;
  /** Copy on the submit button. */
  ctaLabel: string;
  /** Small disclaimer text under the form. */
  trustLine: string;
};

/**
 * The Reverse Squeeze opt-in form (DotCom Secrets Secret 14, the reverse
 * variant).
 *
 * Brunson's rule for a reverse squeeze: give the value FIRST, then ask. The
 * email is the price the reader pays for "more of what they just enjoyed,"
 * not for a fragment they have not yet read.
 *
 * Routes opt-ins straight to /api/soap-opera/subscribe with
 *   source = "reverse_squeeze_stories_<placement>"
 * so the Day 0 email fires immediately and the daily drip picks up from
 * Day 1 onward.
 */
export function StoriesOptIn({ placement, ctaLabel, trustLine }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const source = `reverse_squeeze_stories_${placement}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Client-side guard. The real validation lives on the server.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState({
        kind: "error",
        message: "That does not look like an email address.",
      });
      return;
    }

    setState({ kind: "submitting" });
    track(Event.StoriesOptInSubmitted, {
      placement,
      email_domain: email.trim().split("@")[1] ?? null,
    });

    try {
      const res = await fetch("/api/soap-opera/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        subscribed?: boolean;
        error?: string;
      };

      // The Day 0 send is best-effort; "subscribed" alone is the conversion.
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
          maryan@unlocksaas.com so the next four do not slip past you. Reply to
          email one if you want me to read your live page personally.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      noValidate
      aria-label={`Subscribe – ${placement.replace("_", " ")}`}
    >
      <div className="space-y-1.5">
        <label
          htmlFor={`stories-email-${placement}`}
          className="text-sm font-medium text-foreground"
        >
          Your email
        </label>
        <Input
          id={`stories-email-${placement}`}
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
        {state.kind === "submitting" ? "Sending..." : ctaLabel}
      </Button>

      <p className="text-xs text-muted-foreground">{trustLine}</p>
    </form>
  );
}
