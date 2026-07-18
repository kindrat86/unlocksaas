"use client";

/**
 * How-Did-You-Hear-About-Us (HDYHAU) survey for the $1 Starter surface.
 *
 * Why this exists
 * ---------------
 * PostHog's UTM autocapture + the `ai_engine` super-property catch the
 * FIRST touch (where the visitor literally came from). But AI-search
 * referrals massively undercount because:
 *   - ChatGPT/Perplexity clicks often pass no referrer → land in "direct".
 *   - A visitor who heard about Unlock SaaS from a ChatGPT answer on
 *     Tuesday may type the URL in directly on Thursday. UTM sees
 *     "direct"; the truth is "AI assistant".
 *
 * The AEO methodology names the self-reported HDYHAU survey as the
 * single most reliable way to tie AI visibility to revenue. This
 * component is that survey, placed at the highest-intent moment on the
 * highest-intent surface (right above the $1 CTA on /starter), and
 * forwarded to Stripe session metadata so the webhook can stamp the
 * answer on the converted customer — closing the loop from "AI mentioned
 * us" → "real Stripe charge".
 *
 * Design rules (project conventions)
 * ----------------------------------
 * - "use client" — touches localStorage + PostHog, runs browser-side.
 * - PostHog lazy-loads; if the SDK isn't warm yet the event queues, no
 *   data is lost (see lib/analytics/client.ts).
 * - Reluctant Hero voice: one honest sentence, not a needy popup.
 *   No "we'll never share your data" boilerplate — we don't collect
 *   anything we don't need.
 * - Brunson Hard-Rule: no fabricated options, no dark patterns, no
 *   pre-selection. "Prefer not to say" is a first-class option.
 * - Answer persists to localStorage so a returning visitor doesn't see
 *   the question twice. Cleared on submit.
 *
 * Analytics contract
 * -------------------
 * Emits `hdyhau_answered` with `{ hdyhau_source, hdyhau_detail?, surface }`.
 * The parent (starter-client.tsx) reads the stored answer via
 * `getStoredHdyhau()` and forwards it on the existing
 * `starter_checkout_clicked` event + the /api/checkout body, so the
 * Stripe webhook can write the answer into session metadata and the
 * operator can join converted customers back to acquisition channel
 * without a separate dashboard.
 */

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Canonical HDYHAU options. These strings appear verbatim as PostHog
 * property values and (eventually) Stripe metadata — do NOT rename
 * without coordinating a dashboard migration. The dashboard filters
 * key on these exact strings.
 *
 * The AI-specific options are intentionally split out so the operator
 * can see "ChatGPT" vs "Google AI Overviews" vs "Perplexity" without
 * a second-level breakdown — that split is the whole point of the
 * survey, because the UTM layer can't see it.
 */
export type HdyhauSource =
  | "chatgpt"
  | "claude"
  | "perplexity"
  | "google-ai-overviews"
  | "gemini"
  | "copilot"
  | "google-search"
  | "reddit"
  | "indie-hackers"
  | "x-twitter"
  | "youtube"
  | "newsletter"
  | "referral-friend"
  | "other"
  | "prefer-not-to-say";

export const HDYHAU_OPTIONS: ReadonlyArray<{
  value: HdyhauSource;
  label: string;
}> = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "perplexity", label: "Perplexity" },
  { value: "google-ai-overviews", label: "Google AI Overviews" },
  { value: "gemini", label: "Gemini" },
  { value: "copilot", label: "Copilot" },
  { value: "google-search", label: "Google search" },
  { value: "reddit", label: "Reddit" },
  { value: "indie-hackers", label: "Indie Hackers" },
  { value: "x-twitter", label: "X / Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "newsletter", label: "Newsletter" },
  { value: "referral-friend", label: "Referral / friend" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const STORAGE_KEY = "usaas_hdyhau_starter";
const STORAGE_ANSWERED_FLAG = "usaas_hdyhau_starter_answered";

/**
 * Read the stored HDYHAU answer (if any) from localStorage.
 * Used by the parent checkout handler to forward the answer into
 * Stripe session metadata on /api/checkout, without the parent needing
 * to own the survey state.
 *
 * Returns null if no answer is stored or localStorage is unavailable.
 */
export function getStoredHdyhau(): { source: HdyhauSource; detail?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { source?: HdyhauSource; detail?: string };
    if (!parsed.source) return null;
    return { source: parsed.source, detail: parsed.detail };
  } catch {
    return null;
  }
}

/**
 * Has the visitor already answered the survey in a prior session?
 * Used to suppress re-rendering the question after a submit.
 */
function hasAlreadyAnswered(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_ANSWERED_FLAG) === "1";
  } catch {
    return false;
  }
}

/**
 * Native HTML <select> for the source. One question, one dropdown,
 * no multi-step modal. The goal is a 5-second answer at the exact
 * moment of purchase intent — not a research survey.
 *
 * Voice: Reluctant Hero. One honest sentence about WHY we ask
 * (AI referrals undercount in analytics), not a privacy disclaimer.
 */
export function HdyhauSurvey() {
  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState<HdyhauSource | "">("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Suppress SSR/hydration mismatch: the component renders nothing on
  // the server and only becomes interactive after mount, because
  // localStorage reads are browser-only.
  useEffect(() => {
    setMounted(true);
    if (hasAlreadyAnswered()) setSubmitted(true);
  }, []);

  function persist(value: HdyhauSource, detailValue?: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ source: value, detail: detailValue || undefined }),
      );
    } catch {
      // localStorage may be unavailable (private mode, quota). The
      // PostHog event still fires with the answer, so analytics is
      // not lost — only the checkout-metadata forwarding is.
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as HdyhauSource;
    setSource(value);
    // Persist immediately so even a non-submitting visitor's answer
    // is available to the checkout handler if they click the CTA next.
    persist(value, detail);
    if (value !== "other") {
      // Auto-submit on every non-"other" selection — the visitor has
      // answered, no need to make them press a second button.
      finalize(value, detail);
    }
  }

  function handleDetailBlur() {
    if (source === "other" && detail.trim()) {
      persist("other", detail.trim());
      finalize("other", detail.trim());
    }
  }

  function finalize(value: HdyhauSource, detailValue?: string) {
    track(Event.HdyhauAnswered, {
      hdyhau_source: value,
      hdyhau_detail: detailValue || undefined,
      surface: "starter",
    });
    try {
      window.localStorage.setItem(STORAGE_ANSWERED_FLAG, "1");
    } catch {
      // Same defensive catch as persist().
    }
    setSubmitted(true);
  }

  // Hide the survey entirely once answered. The CTA forwarding still
  // reads the stored value via getStoredHdyhau().
  if (!mounted || submitted) return null;

  return (
    <div className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <label
        htmlFor="hdyhau-source"
        className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
      >
        Quick one before you start
      </label>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        Where did you first hear about Unlock SaaS? AI referrals don&apos;t
        always show up in our analytics, and this answer helps us know what&apos;s
        actually working.
      </p>
      <select
        id="hdyhau-source"
        value={source}
        onChange={handleChange}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Where did you first hear about Unlock SaaS?"
      >
        <option value="" disabled>
          Select one…
        </option>
        {HDYHAU_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {source === "other" && (
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          onBlur={handleDetailBlur}
          placeholder="Tell us where (optional)"
          maxLength={120}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Where else did you hear about Unlock SaaS?"
        />
      )}
    </div>
  );
}
