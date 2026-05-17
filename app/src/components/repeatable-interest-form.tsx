"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Rung 2 (Repeatable Revenue Layer) — interest-signal form.
 *
 * Brunson discipline (workbook 02 §5):
 *   - This is NOT a waitlist. No "we'll email you when it opens." No
 *     countdown timer. No fake scarcity.
 *   - This is a demand-signal layer. A click here records intent the
 *     operator reads during the Friday Audible Call (workbook 04 §8b).
 *   - Submission triggers NO follow-up sequence — the visitor stays on
 *     whatever cadence they were already in (Soap Opera, Seinfeld,
 *     Founding, or none).
 *
 * Why the message field is optional:
 *   The activation-gate read cares about Core-customer ask count, not
 *   prose. But operators DO read messages verbatim when shaping the Rung 2
 *   build spec. The field is optional so cold visitors can flip the signal
 *   in one click, and motivated Core customers can leave the language that
 *   shapes the layer they're asking for.
 *
 * Source token defaults to "repeatable_page" but can be overridden per
 * mount surface (e.g., the post-celebration card on /machine/verified
 * passes "verified_celebration" so the operator can tell which surface
 * drove the ask).
 */
interface RepeatableInterestFormProps {
  /** Free-form attribution token (≤64 chars). */
  source?: string;
  /** Optional preamble inside the card. */
  intro?: React.ReactNode;
  /** Label for the submit button. */
  ctaLabel?: string;
}

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "ok"; isCoreCustomer: boolean }
  | { status: "error"; reason: string };

export function RepeatableInterestForm({
  source = "repeatable_page",
  intro,
  ctaLabel = "Tell me you want this",
}: RepeatableInterestFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "submitting") return;
    setState({ status: "submitting" });

    try {
      const res = await fetch("/api/repeatable-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim().length > 0 ? message.trim() : null,
          source,
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setState({
          status: "error",
          reason: data.error ?? "submission_failed",
        });
        return;
      }

      const data: { ok: boolean; is_core_customer: boolean } = await res.json();
      track(Event.RepeatableInterestSubmitted, {
        source,
        is_core_customer: data.is_core_customer,
      });
      setState({ status: "ok", isCoreCustomer: data.is_core_customer });
    } catch {
      setState({ status: "error", reason: "network_failed" });
    }
  }

  if (state.status === "ok") {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Logged. Thank you.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {state.isCoreCustomer ? (
              <>
                You are a Core customer asking for this. That is the activation
                signal I built the gate to read. If you left a message, I read
                it the moment I open the dashboard. — Maryan
              </>
            ) : (
              <>
                You will not hear from me about this until the build gate
                fires. No emails about Rung 2. No countdown. When the door
                opens, you will see it. — Maryan
              </>
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  const submitting = state.status === "submitting";

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {intro ? (
          <div className="text-sm text-muted-foreground leading-relaxed">
            {intro}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="repeatable_email"
              className="text-sm font-medium text-foreground"
            >
              Your email
            </label>
            <Input
              id="repeatable_email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              maxLength={320}
            />
            <p className="text-xs text-muted-foreground">
              Used only to deduplicate the signal. No follow-up sequence is
              triggered by this form.
            </p>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="repeatable_message"
              className="text-sm font-medium text-foreground"
            >
              Optional — what would you actually use this for?
            </label>
            <textarea
              id="repeatable_message"
              name="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
              maxLength={2000}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="One sentence. The language you use here shapes the spec when the gate fires."
            />
          </div>
          {state.status === "error" ? (
            <p className="text-xs text-destructive">
              {state.reason === "invalid_email"
                ? "That email did not parse. Try again."
                : state.reason === "message_too_long"
                  ? "Message is over 2,000 characters. Shorten it."
                  : "Something broke on my end. Try again in a moment."}
            </p>
          ) : null}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Logging…" : ctaLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
