"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Pre-launch waitlist form. POSTs to /api/founding/waitlist which subscribes
 * the email to the PLE1-PLE6 sequence and sends PLE1 inline.
 */
export function FoundingWaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/founding/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "founding_page" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error ?? "We could not add you. Try again.");
        setState("error");
        return;
      }
      setState("ok");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 text-left">
        <p className="text-base font-semibold mb-1">
          You are on the waitlist.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Check your inbox in the next minute. The first email is a question
          from me. Reply to it — I read everything.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <Input
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state === "submitting"}
        className="flex-1"
      />
      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Adding..." : "Hold a founding seat"}
      </Button>
      {state === "error" && errorMessage && (
        <p className="text-sm text-red-600 sm:absolute sm:mt-14">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
