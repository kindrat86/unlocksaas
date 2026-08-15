"use client";

import { browserTimezone } from '@/lib/browser-tz';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Optional post-result email capture for /tools/* calculator pages.
 *
 * Requirements per conversion-repair task:
 *   - Appears AFTER the calculator result, never before.
 *   - Skippable — the calculator works with the field left empty.
 *   - Does not gate the calculator or contradict the "no email gate"
 *     promise on the hub page.
 *
 * The hub page promises "no email gate, no signup wall, no card."
 * This component does not gate anything — the result renders regardless.
 * The email ask is framed as "Want the benchmark data behind this?"
 * so it adds value without contradicting the core promise.
 */
export function PostResultEmailCapture({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitted">("idle");

  if (state === "submitted") {
    return (
      <p className="text-xs text-muted-foreground pt-3 italic">
        Benchmark data on the way. One email, no signup — promised.
      </p>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-xs font-medium text-foreground mb-2">
        Want the benchmark data behind this calculator?
      </p>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        One email. No signup. We send the dataset so you can compare your numbers.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          fetch("/api/soap-opera/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), source, tz: browserTimezone() }),
          });
          setState("submitted");
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-9 text-sm"
        />
        <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
          Send it
        </Button>
      </form>
    </div>
  );
}
