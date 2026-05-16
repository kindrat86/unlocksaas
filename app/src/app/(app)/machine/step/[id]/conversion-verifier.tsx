"use client";

/**
 * Step 7: Convert + Verify.
 *
 * The product was always pointed at this moment. The guarantee resolves here.
 *
 * v1 verification path: manual. The founder pastes the Stripe charge ID (or
 * customer email + amount) from their own account; we record it as a
 * verified_conversion which flips the guarantee verdict to `verdict_kept`.
 *
 * Sprint 3: Stripe Connect — when the user connects their own Stripe account,
 * we listen to webhooks from that account and auto-record.
 *
 * Voice: Reluctant Hero. Honest about what we can and can't auto-detect.
 */
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface VerifiedConversion {
  id: string;
  stripe_charge_id: string | null;
  amount_cents: number;
  currency: string;
  customer_email: string | null;
  detected_at: string;
  source: "connect" | "manual";
}

export function ConversionVerifier() {
  const [conversions, setConversions] = useState<VerifiedConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual record form
  const [draft, setDraft] = useState({
    stripeChargeId: "",
    customerEmail: "",
    amountDollars: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversions");
      if (res.status === 401) {
        setConversions([]);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Couldn't load verified customers.");
        setLoading(false);
        return;
      }
      const body = (await res.json()) as { conversions: VerifiedConversion[] };
      setConversions(body.conversions ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function recordManual(e: React.FormEvent) {
    e.preventDefault();
    const amountDollarsNum = Number(draft.amountDollars);
    if (!Number.isFinite(amountDollarsNum) || amountDollarsNum <= 0) {
      setError("Enter a positive dollar amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeChargeId: draft.stripeChargeId.trim() || undefined,
          customerEmail: draft.customerEmail.trim() || undefined,
          amountCents: Math.round(amountDollarsNum * 100),
          source: "manual",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "Couldn't record customer.");
        setSubmitting(false);
        return;
      }
      setDraft({ stripeChargeId: "", customerEmail: "", amountDollars: "" });
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  const hasConversions = conversions.length > 0;

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Badge variant="outline" className="mb-2">
          Step 7 of 7
        </Badge>
        <h1 className="text-2xl font-bold mb-2">
          Verify Your First Customer
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Stripe is the only proof. When a paying customer hits your account,
          this is where it shows up — and where the guarantee resolves. No
          screenshots, no testimonials, no proxies.
        </p>
      </header>

      {/* Result */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : hasConversions ? (
        <Card className="border-primary/30">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-medium">
              Promise kept — {conversions.length} verified customer
              {conversions.length === 1 ? "" : "s"} on record.
            </p>
            <ul className="space-y-2">
              {conversions.map((c) => (
                <li
                  key={c.id}
                  className="text-sm border rounded-md p-3 space-y-1"
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">
                      ${(c.amount_cents / 100).toFixed(2)}{" "}
                      {c.currency.toUpperCase()}
                    </span>
                    <Badge variant="outline">
                      {c.source === "connect" ? "auto" : "manual"}
                    </Badge>
                  </div>
                  {c.customer_email && (
                    <p className="text-muted-foreground">{c.customer_email}</p>
                  )}
                  {c.stripe_charge_id && (
                    <p className="text-xs text-muted-foreground break-all">
                      {c.stripe_charge_id}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.detected_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm">
              No verified customers yet. When one comes through, two things can
              happen:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Auto:</strong> connect your Stripe account (lands in
                Sprint 3) and new charges register automatically.
              </li>
              <li>
                <strong>Manual:</strong> paste the charge below. The guarantee
                will flip to &quot;kept&quot; immediately.
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Manual record form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={recordManual} className="space-y-3">
            <h2 className="text-sm font-medium">
              Record a customer manually
            </h2>
            <Input
              value={draft.stripeChargeId}
              onChange={(e) =>
                setDraft({ ...draft, stripeChargeId: e.target.value })
              }
              placeholder="Stripe charge id (ch_… or py_… — optional)"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={draft.customerEmail}
                onChange={(e) =>
                  setDraft({ ...draft, customerEmail: e.target.value })
                }
                placeholder="Customer email (optional)"
                type="email"
              />
              <Input
                value={draft.amountDollars}
                onChange={(e) =>
                  setDraft({ ...draft, amountDollars: e.target.value })
                }
                placeholder="Amount in USD (e.g. 49)"
                inputMode="decimal"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !draft.amountDollars.trim()}
            >
              {submitting ? "Recording…" : "Record verified customer"}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
