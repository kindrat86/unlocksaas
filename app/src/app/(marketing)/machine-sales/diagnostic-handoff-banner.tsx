"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Brunson Bridge → Door consistency banner for /machine-sales (DCS Secret 15).
 *
 * Parallel to /starter's DiagnosticHandoffBanner. The Bridge Page at
 * /diagnostic/result routes `ready_to_scale` buckets directly here, skipping
 * the $1 Starter. Without this banner, those visitors land on the same hero
 * a cold visitor sees — the bridge label "Ready to Scale" gets dropped at the
 * door, and the Brunson "the bridge points to the door; the door confirms the
 * bridge" rule breaks.
 *
 * Resolution order, matching /starter:
 *   1. bucket query param (Survey Funnel) → bucket-specific reframe
 *   2. label query param (Claude label) → legacy fallback for pre-survey rows
 *   3. no match → renders null (cold visitors see the unaltered hero)
 *
 * Keys must stay in sync with app/src/lib/diagnostic.ts BUCKETS +
 * DiagnosticLabel and with app/src/app/(marketing)/starter/page.tsx's
 * DIAGNOSTIC_HANDOFF map. The /starter banner names the $1 door explicitly;
 * this banner names the $49 door — same Reluctant Hero voice, same script
 * structure, different price.
 */

const HANDOFF_COPY: Record<string, { title: string; body: string }> = {
  // -- Bucket-aware (Brunson Survey Funnel + Bridge Scripts) ----------------
  // ready_to_scale is the canonical bucket that lands here directly. The
  // others fall through to the legacy Claude-label entries below in case a
  // visitor flips the secondary-CTA (downgrade from $49 to $1 then back).
  ready_to_scale: {
    title: "Ready to Scale. The bridge pointed at the full system; the door confirms it.",
    body: "Steps 1 and 2 of the Machine are downstream of where you are. This page is the full seven-step system, the 60-day Stripe-verified guarantee, and the Outreach Room. Read with that in mind.",
  },
  customer_avoider: {
    title: "Customer Avoider. You took the long door — that is allowed.",
    body: "The $1 Starter is the work you have been avoiding. The full Machine on this page is the same work plus Steps 3–7 plus the 60-day guarantee. Read on; the price is justified by what is on the other side of the guarantee.",
  },
  stuck_builder: {
    title: "Stuck Builder. You took the long door — that is allowed.",
    body: "The $1 Starter is offer construction. The full Machine on this page is offer construction plus the outreach engine that converts it. Read on; the long door costs $49 and carries a 60-day verified-customer guarantee.",
  },
  tactic_shopper: {
    title: "Tactic Shopper. You took the long door — that is allowed.",
    body: "The $1 Starter fixes the upstream piece. The full Machine on this page fixes the upstream piece AND replaces the tactics that did not work with a 20-target outreach engine. Read on.",
  },
  traction_but_stuck: {
    title: "Traction but Stuck. You took the long door — that is allowed.",
    body: "The $1 Starter helps you name the pattern in your existing buyers. The full Machine on this page builds the repeatable engine around that pattern. Read on; the leverage compounds.",
  },
  premature: {
    title: "Premature. You skipped past the wait.",
    body: "I told you to wait. You came anyway. The $1 Starter would have been a softer entry. The full Machine on this page is the right destination eventually — read it now and come back when the silence has bent you a little.",
  },

  // -- Legacy Claude-label fallback (rows from before the survey shipped) ---
  wrong_person: {
    title: "Wrong Person. The full Machine fixes the upstream and the downstream.",
    body: "Steps 1 and 2 pin a real person and write a real offer. Steps 3–7 generate the outreach and verify the first paying customer in Stripe. The $49/mo on this page covers all seven.",
  },
  weak_offer: {
    title: "Weak Offer. The full Machine builds the offer and verifies the result.",
    body: "Step 2 has engine pushback on every hedge. Steps 5 and 6 run the outreach. Step 7 listens for the Stripe charge that closes the 60-day guarantee. The $49/mo on this page covers all of it.",
  },
  weak_belief: {
    title: "Weak Belief. The full Machine rebuilds belief and converts it to revenue.",
    body: "Step 4 — Write Copy — is where the Epiphany Bridge gets generated for your specific avatar. Steps 5–7 turn that belief shift into a verified paying customer in 60 days, or you do not pay.",
  },
  error: {
    title: "Diagnosis failed. The door is still open.",
    body: "Half the pages I cannot read are pages that hide the offer behind a login. The $49 Machine on this page works whether the diagnostic ran or not — you finish Steps 1–7 inside the tool, regardless.",
  },
};

function HandoffInner() {
  const params = useSearchParams();
  const from = params.get("from");
  if (from !== "diagnostic") return null;

  const bucketKey = params.get("bucket") ?? "";
  const labelKey = params.get("label") ?? "";
  const copy = HANDOFF_COPY[bucketKey] ?? HANDOFF_COPY[labelKey];
  if (!copy) return null;

  return (
    <aside
      role="note"
      className="mx-auto max-w-3xl mt-6 mb-2 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4"
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
        From your diagnosis
      </p>
      <p className="text-base font-semibold leading-snug mb-1">{copy.title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {copy.body}
      </p>
    </aside>
  );
}

/**
 * Suspense wrapper. useSearchParams forces CSR bailout in Next.js 14, but the
 * rest of the page is a Server Component — wrapping the client island in
 * Suspense keeps the SSR path warm while the banner hydrates.
 */
export function DiagnosticHandoffBanner() {
  return (
    <Suspense fallback={null}>
      <HandoffInner />
    </Suspense>
  );
}
