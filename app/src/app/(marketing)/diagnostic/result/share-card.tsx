"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Brunson DCS Chapter 11 (The Best Bait) — share CTA on the result page.
 *
 * Three states:
 *   1. IDLE — show "Share my diagnosis" CTA. Email field hidden by default
 *      to reduce visual weight; expands when the user clicks the CTA.
 *   2. PUBLISHED — show the public link + an "Open on X" intent button +
 *      a "Copy link" button. Revoke link present but de-emphasized.
 *   3. REVOKED — show "Diagnosis is private again. Re-publish?" CTA.
 *
 * Brunson Soft-Consent rule (workbook 01 §6 Beat 5 polarity AGAINST #5):
 *   No auto-sharing, no opt-out checkboxes, no dark patterns. The visitor
 *   has to actively type their email and click publish for the diagnosis
 *   to become public.
 *
 * Privacy honesty paragraph below the CTA spells out exactly what becomes
 * public — the hostname, the label, the explanation, the evidence. Never
 * the email, never the IP, never the survey answers.
 */

type State =
  | { phase: "idle"; error: string | null }
  | { phase: "submitting"; action: "publish" | "revoke" }
  | {
      phase: "published";
      shareUrl: string;
      error: string | null;
    }
  | { phase: "revoked"; error: string | null };

export function DiagnosisShareCard({
  leadId,
  label,
  initialShareUrl,
  initialState,
}: {
  leadId: string;
  label: "wrong_person" | "weak_offer" | "weak_belief";
  initialShareUrl?: string | null;
  initialState: "private" | "public" | "revoked";
}) {
  const [state, setState] = useState<State>(() => {
    if (initialState === "public" && initialShareUrl) {
      return { phase: "published", shareUrl: initialShareUrl, error: null };
    }
    if (initialState === "revoked") {
      return { phase: "revoked", error: null };
    }
    return { phase: "idle", error: null };
  });
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState("");

  async function postShare(action: "publish" | "revoke") {
    setState({ phase: "submitting", action });
    try {
      const res = await fetch(`/api/diagnostic/${leadId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), action }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        share_visibility?: "public" | "revoked";
        share_url?: string | null;
        error?: string;
      };
      if (!res.ok || !body.share_visibility) {
        const message =
          body.error ??
          "Could not save that. Try once more, or email me at maryan@unlocksaas.com.";
        if (action === "publish") {
          setState({ phase: "idle", error: message });
        } else {
          setState({
            phase: "published",
            shareUrl: initialShareUrl ?? "",
            error: message,
          });
        }
        return;
      }
      if (body.share_visibility === "public" && body.share_url) {
        track(Event.DiagnosticShareCreated, {
          lead_id: leadId,
          label,
          surface: "result_page",
        });
        setState({
          phase: "published",
          shareUrl: body.share_url,
          error: null,
        });
        setEmailExpanded(false);
      } else {
        track(Event.DiagnosticShareRevoked, {
          lead_id: leadId,
          label,
          surface: "result_page",
        });
        setState({ phase: "revoked", error: null });
      }
    } catch {
      const message =
        "Network blip. Try once more, or email me at maryan@unlocksaas.com.";
      setState({ phase: "idle", error: message });
    }
  }

  function handlePublishClick() {
    track(Event.DiagnosticShareClicked, {
      lead_id: leadId,
      label,
      surface: "result_page",
    });
    if (!emailExpanded) {
      setEmailExpanded(true);
      return;
    }
    void postShare("publish");
  }

  if (state.phase === "published") {
    return (
      <PublishedPanel
        leadId={leadId}
        label={label}
        shareUrl={state.shareUrl}
        error={state.error}
        onRevoke={() => void postShare("revoke")}
      />
    );
  }

  if (state.phase === "revoked") {
    return (
      <div className="rounded-lg border border-border bg-muted/40 px-5 py-5 mt-8">
        <p className="text-sm font-semibold mb-1">
          Your diagnosis is private again.
        </p>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The public page now returns 404. The diagnosis itself stays on file
          in your inbox. You can re-publish any time.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePublishClick}
        >
          Re-publish
        </Button>
        {state.error && (
          <p className="text-xs text-destructive mt-3">{state.error}</p>
        )}
      </div>
    );
  }

  const submitting = state.phase === "submitting";

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-5 py-5 mt-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Butterfly Marketing — Loop 1
      </p>
      <p className="text-sm font-semibold mb-1">
        Make your diagnosis public.
      </p>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        I&apos;ll publish this diagnosis at{" "}
        <code className="text-foreground bg-background border border-border rounded px-1 py-0.5 text-xs">
          unlocksaas.com/diagnosis/...
        </code>
        . What becomes public: the hostname you submitted, the label, the
        explanation, the evidence sentence. What stays private: your email,
        your IP, your survey answers. Permanent link, you can revoke any
        time.
      </p>

      {emailExpanded && (
        <div className="space-y-3 mb-4">
          <label
            htmlFor="share-email"
            className="text-xs font-medium text-foreground block"
          >
            Confirm with the email you used to run the diagnostic
          </label>
          <Input
            id="share-email"
            type="email"
            autoComplete="email"
            placeholder="you@yourdomain.com"
            value={email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          disabled={submitting}
          onClick={handlePublishClick}
          data-share-cta="publish"
        >
          {submitting && state.action === "publish"
            ? "Publishing..."
            : emailExpanded
              ? "Publish my diagnosis"
              : "Share my diagnosis"}
        </Button>
        {emailExpanded && !submitting && (
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            onClick={() => {
              setEmailExpanded(false);
              setEmail("");
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {state.phase === "idle" && state.error && (
        <p role="alert" className="text-xs text-destructive mt-3">
          {state.error}
        </p>
      )}
    </div>
  );
}

function PublishedPanel({
  leadId,
  label,
  shareUrl,
  error,
  onRevoke,
}: {
  leadId: string;
  label: "wrong_person" | "weak_offer" | "weak_belief";
  shareUrl: string;
  error: string | null;
  onRevoke: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const intentText = encodeURIComponent(
    `My Unlock SaaS diagnosis came back: ${labelHuman(label)}. Read it: `,
  );
  const xIntent = `https://twitter.com/intent/tweet?text=${intentText}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 px-5 py-5 mt-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Your diagnosis is public
      </p>
      <p className="text-sm font-semibold mb-3">
        Anyone with this link can read it now.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input value={shareUrl} readOnly className="font-mono text-xs" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void handleCopy()}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="sm">
          <a href={xIntent} target="_blank" rel="noopener noreferrer">
            Share on X
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
            Open public page
          </Link>
        </Button>
        <button
          type="button"
          onClick={onRevoke}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground ml-auto"
          data-share-cta="revoke"
        >
          Make it private again
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive mt-3">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        Hidden audit: this share is tied to diagnosis{" "}
        <code className="font-mono">{leadId.slice(0, 8)}…</code>. If you spot
        anything off, email me at maryan@unlocksaas.com.
      </p>
    </div>
  );
}

function labelHuman(
  l: "wrong_person" | "weak_offer" | "weak_belief",
): string {
  if (l === "wrong_person") return "Wrong Person";
  if (l === "weak_offer") return "Weak Offer";
  return "Weak Belief";
}
