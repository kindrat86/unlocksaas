"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * 14-Day Sprint opt-in form.
 *
 * Three fields, in priority order: email (required), first name (required),
 * product URL (optional but encouraged — feeds the Day 1 prompt). Posts to
 * /api/challenge/subscribe; on success, routes to /challenge/thanks.
 *
 * Brunson rule: minimize fields. Three is the soft ceiling for a free
 * Challenge opt-in. The product URL is optional precisely because a missing
 * URL should not block the opt-in; we can ask for it inside Email 1.
 */
export function ChallengeForm({ source }: { source: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !firstName.trim()) {
      setError("Email and first name are both required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/challenge/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          product_url: productUrl.trim() || null,
          source,
        }),
      });

      if (res.ok) {
        router.push("/challenge/thanks");
        return;
      }

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (body.error === "invalid_email") {
        setError("That email does not look right. Try again.");
      } else if (body.error === "invalid_first_name") {
        setError("Please enter a first name (up to 60 characters).");
      } else {
        // 502 day_0_send_failed still subscribed the row — route to thanks anyway.
        if (res.status === 502) {
          router.push("/challenge/thanks?day0=delayed");
          return;
        }
        setError(
          "Something went wrong on my end. Try again in a moment, or email maryan@unlocksaas.com directly."
        );
      }
    } catch {
      setError(
        "Network error. Try again in a moment, or email maryan@unlocksaas.com directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="firstName" className="text-sm font-medium block">
          First name
        </label>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          required
          maxLength={60}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Marco"
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium block">
          Email
        </label>
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
      </div>

      <div className="space-y-2">
        <label htmlFor="productUrl" className="text-sm font-medium block">
          Your product URL{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          id="productUrl"
          type="url"
          inputMode="url"
          maxLength={2048}
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://yourapp.com"
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground">
          Helpful for Day 1. If you do not have a URL yet, leave blank.
        </p>
      </div>

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
        {submitting ? "Starting the Sprint…" : "Start the 14-Day Sprint"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Free. One email per day. One-click unsubscribe in every email.
        No upsell until Day 14.
      </p>
    </form>
  );
}
