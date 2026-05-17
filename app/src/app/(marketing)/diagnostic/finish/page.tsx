import type { Metadata } from "next";
import { DiagnosticFinish } from "./finish-client";

/**
 * Google-OAuth handoff for the Free Diagnostic.
 *
 * Flow:
 *   1. User completes 5-step survey, clicks "Continue with Google" on step 5.
 *   2. Form stashes {productUrl, survey} into localStorage["diagnostic_pending"].
 *   3. Browser redirects through Google → /auth/callback (exchanges PKCE code,
 *      creates Supabase session) → here.
 *   4. We read the verified session email, read the stashed survey, POST to
 *      /api/diagnostic, then route to /diagnostic/result?id=<row>.
 *
 * If the API answers `already_used: true` the user lands on the existing
 * result page anyway (the bridge there is the destination either way).
 *
 * If localStorage was cleared between steps 5 and here (private window,
 * cross-device hop), the client falls back to a "send me back to /diagnostic"
 * recovery card — we don't have the survey, so the only safe move is restart.
 */

export const metadata: Metadata = {
  title: "Finishing your diagnosis — Unlock SaaS",
  description: "Reading your page now. This takes about a minute.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DiagnosticFinishPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <DiagnosticFinish />
      </div>
    </div>
  );
}
