"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

type FieldError = { email?: string; productUrl?: string; form?: string };

/**
 * Client form for the Free Diagnostic squeeze.
 *
 * On submit:
 *   1. POST {email, productUrl, referrer} to /api/diagnostic.
 *   2. The API normalizes the URL, runs the Claude diagnosis, and upserts a
 *      row in diagnostic_leads. It returns { id }.
 *   3. Navigate to /diagnostic/result?id=<id> — the labeled result page that
 *      reads the stored diagnosis and hands the visitor to the $1 Starter.
 *
 * Spec source: strategy/workbooks/04-building-your-funnels.md §3.
 */
export function DiagnosticForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    // Client-side guard: keep the request count down for obvious garbage.
    // The real validation lives on the server (see /api/diagnostic).
    const next: FieldError = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "That does not look like an email address.";
    }
    let normalizedUrl = productUrl.trim();
    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
      // Throws on invalid URLs.
      new URL(normalizedUrl);
    } catch {
      next.productUrl = "Paste the full link to your live product page.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    track(Event.DiagnosticFormSubmitted, {
      // The product URL is not PII, but the email is — capture only the
      // domain so we can segment by ICP without storing addresses.
      email_domain: email.trim().split("@")[1] ?? null,
      product_url: normalizedUrl,
    });
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          productUrl: normalizedUrl,
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
        return;
      }

      router.push(`/diagnostic/result?id=${body.id}`);
    } catch {
      setErrors({
        form:
          "Could not reach the diagnostic engine. Try again in a minute, or email me directly at maryan@unlocksaas.com.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="diagnostic-email"
          className="text-sm font-medium text-foreground"
        >
          Your email
        </label>
        <Input
          id="diagnostic-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          inputMode="email"
          placeholder="you@yourdomain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "diagnostic-email-error" : undefined}
          disabled={submitting}
        />
        {errors.email ? (
          <p id="diagnostic-email-error" className="text-xs text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="diagnostic-url"
          className="text-sm font-medium text-foreground"
        >
          Your product URL
        </label>
        <Input
          id="diagnostic-url"
          name="productUrl"
          type="url"
          autoComplete="url"
          required
          inputMode="url"
          placeholder="https://yourproduct.com"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          aria-invalid={errors.productUrl ? true : undefined}
          aria-describedby={
            errors.productUrl ? "diagnostic-url-error" : undefined
          }
          disabled={submitting}
        />
        {errors.productUrl ? (
          <p id="diagnostic-url-error" className="text-xs text-destructive">
            {errors.productUrl}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full text-base py-6"
      >
        {submitting ? "Reading your page..." : "See why your launch is flat"}
      </Button>

      <p className="text-xs text-muted-foreground">
        I email the diagnosis. No spam. Reply STOP to unsubscribe.
      </p>
    </form>
  );
}
