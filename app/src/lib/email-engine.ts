/**
 * Fallback path to the shared email-engine autoresponder
 * (https://email-engine-fawn.vercel.app, sequences/unlocksaas.yaml).
 *
 * ARCHITECTURE DECISION (owner, 2026-07-14): local-first, no cloud DB.
 * This engine path is the PRIMARY production subscribe system — the
 * Supabase-driven in-app SOS remains in the codebase but only activates
 * if a real Supabase env is ever configured. The engine owns double-opt-in
 * and schedules the linearized SOS (day 0/2/4/6/8) via Resend
 * scheduled_at: submit → "check your inbox" → confirm → letters. The
 * durable local record lives on the Mac mini in ~/.unlocksaas/funnel.db
 * (hourly sync from Resend + Stripe; scripts/sync-local-db.py).
 *
 * The engine's copy is a verbatim port of the in-app spine (see
 * ~/email-engine/sequences/unlocksaas.yaml), so subscribers migrated
 * between systems never see contradictory emails.
 */

const ENGINE_URL = "https://email-engine-fawn.vercel.app/api/subscribe";
const PRODUCT = "unlocksaas";

export type EngineSubscribeResult =
  | { ok: true }
  | { ok: false; error: string };

export async function subscribeViaEngine(
  email: string,
  source: string
): Promise<EngineSubscribeResult> {
  try {
    const res = await fetch(ENGINE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The engine keys everything on {product, email}; source rides along
      // for log correlation only (ignored by the current engine).
      body: JSON.stringify({ product: PRODUCT, email, source }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `engine_${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
