/**
 * Cross-funnel attribution plumbing for the eight-layer Funnel Stack.
 *
 * See strategy/funnel-stack.md for the full architecture. This file is the
 * launch-day subset that is compatible with One Funnel Away discipline: it
 * defines the namespace and writes the cookies so that when Layer 4 ships
 * (Sprint 3) every Stripe conversion already carries a stack path.
 *
 * Mirrors the pattern in lib/ab.ts:
 *   - Sticky cookies, set once in middleware, read everywhere
 *   - Type-safe variant enum (here: StackLayer)
 *   - Subject UUID per browser
 *   - Server-only reads via next/headers `await cookies()`
 *
 * What this file does NOT do at launch:
 *   - Insert into public.stack_events (table is deferred until Layer 4 ships;
 *     see strategy/funnel-stack.md "What does NOT ship at launch")
 *   - Render any UI to the user (framework-into-the-engine rule)
 *   - Activate Layers 4, 6, 7, 8 (those are evidence-gated)
 */

import { cookies } from "next/headers";

// ---- Layer taxonomy ---------------------------------------------------------

/**
 * The eight stack layers per strategy/funnel-stack.md.
 *
 *   0 ATTENTION    cold traffic, top of stack (X / IH / Reddit / podcast)
 *   1 DIAGNOSIS    Free Diagnostic squeeze
 *   2 STARTER      $1 Starter ANCHOR FUNNEL
 *   3 CORE         OTO → $49 Playbook subscription
 *   4 LONG_FORM    Cold-traffic direct $49 sales page (Sprint 3)
 *   5 IN_PRODUCT   /playbook member area
 *   6 ASCENSION    Verified Builder rerun / community (Phase 2)
 *   7 AFFILIATE    Affiliate Army (Phase 3)
 *   8 EXIT_INTENT  Bail recovery lateral (Phase 2)
 */
export const StackLayer = {
  ATTENTION: 0,
  DIAGNOSIS: 1,
  STARTER: 2,
  CORE: 3,
  LONG_FORM: 4,
  IN_PRODUCT: 5,
  ASCENSION: 6,
  AFFILIATE: 7,
  EXIT_INTENT: 8,
} as const;

export type StackLayerValue = (typeof StackLayer)[keyof typeof StackLayer];

const VALID_LAYERS: ReadonlySet<number> = new Set(Object.values(StackLayer));

/**
 * Human-readable names for the layers. Used by analytics dashboards and the
 * stack_events table once it ships. Never user-facing copy.
 */
export const STACK_LAYER_NAMES: Record<StackLayerValue, string> = {
  [StackLayer.ATTENTION]: "attention",
  [StackLayer.DIAGNOSIS]: "diagnosis",
  [StackLayer.STARTER]: "starter",
  [StackLayer.CORE]: "core",
  [StackLayer.LONG_FORM]: "long_form",
  [StackLayer.IN_PRODUCT]: "in_product",
  [StackLayer.ASCENSION]: "ascension",
  [StackLayer.AFFILIATE]: "affiliate",
  [StackLayer.EXIT_INTENT]: "exit_intent",
};

/**
 * Which layers are active at launch. Activation triggers are documented in
 * strategy/funnel-stack.md "Activation log". Code paths that bridge INTO a
 * non-launch layer should no-op silently at launch.
 */
export const LAUNCH_ACTIVE_LAYERS: ReadonlySet<StackLayerValue> = new Set([
  StackLayer.ATTENTION,
  StackLayer.DIAGNOSIS,
  StackLayer.STARTER,
  StackLayer.CORE,
  StackLayer.IN_PRODUCT,
]);

export function isLayerActiveAtLaunch(layer: StackLayerValue): boolean {
  return LAUNCH_ACTIVE_LAYERS.has(layer);
}

// ---- Cookie constants ------------------------------------------------------

export const STACK_SUBJECT_COOKIE = "usaas_stack_subject";
export const STACK_ENTRY_COOKIE = "usaas_stack_entry";
export const STACK_CURRENT_COOKIE = "usaas_stack_current";
export const STACK_PATH_COOKIE = "usaas_stack_path";
export const AFFILIATE_COOKIE = "usaas_affiliate";

// 1 year, matches the A/B cookie horizon in lib/ab.ts so a returning visitor
// is recognized as the same subject across the same stack path.
export const STACK_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Bound the path array so a determined attacker can't blow up the cookie.
export const STACK_PATH_MAX_LENGTH = 32;

// Affiliate slug shape (matches the canonical affiliate slug spec in
// workbook 10 §3): lowercase alphanumeric + hyphen, 2-64 chars.
const AFFILIATE_SLUG_RE = /^[a-z0-9-]{2,64}$/;

// ---- Read helpers (server-only) --------------------------------------------

/**
 * Read the stack subject UUID. Returns null when missing; callers should treat
 * null as "first-touch, write the cookie in middleware on the next response."
 */
export async function readStackSubjectFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(STACK_SUBJECT_COOKIE)?.value ?? null;
}

export async function readStackEntryFromCookies(): Promise<StackLayerValue | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(STACK_ENTRY_COOKIE)?.value;
  return parseStackLayer(raw);
}

export async function readStackCurrentFromCookies(): Promise<StackLayerValue | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(STACK_CURRENT_COOKIE)?.value;
  return parseStackLayer(raw);
}

/**
 * Read the stack path as an ordered array of layer integers. Returns [] on
 * missing or malformed cookies (defensive — never throws on visitor data).
 */
export async function readStackPathFromCookies(): Promise<StackLayerValue[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(STACK_PATH_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => parseStackLayer(typeof entry === "number" ? String(entry) : null))
      .filter((entry): entry is StackLayerValue => entry !== null)
      .slice(-STACK_PATH_MAX_LENGTH);
  } catch {
    return [];
  }
}

export async function readAffiliateFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AFFILIATE_COOKIE)?.value;
  if (!raw || !AFFILIATE_SLUG_RE.test(raw)) return null;
  return raw;
}

// ---- Pure helpers (used by middleware + Stripe metadata stamping) ----------

/**
 * 50/50? No. There's only one stack — every visitor gets the same UUID
 * generator. Exported as a function for symmetry with pickSubjectId in ab.ts.
 */
export function pickStackSubjectId(): string {
  return crypto.randomUUID();
}

/**
 * Normalize a raw cookie / metadata value to a StackLayerValue or null.
 * Used by code paths (Stripe webhook, /api/stack/event) that read layer from
 * arbitrary external input.
 */
export function parseStackLayer(raw: string | null | undefined): StackLayerValue | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n)) return null;
  if (!VALID_LAYERS.has(n)) return null;
  return n as StackLayerValue;
}

/**
 * Append a layer to the path array with two guards:
 *   1. Skip if it's a duplicate of the last entry (refresh = same layer, don't
 *      double-count).
 *   2. Truncate to STACK_PATH_MAX_LENGTH from the front (keep the recent tail).
 */
export function appendToStackPath(
  current: StackLayerValue[],
  layer: StackLayerValue,
): StackLayerValue[] {
  if (current.length > 0 && current[current.length - 1] === layer) {
    return current;
  }
  const next = [...current, layer];
  if (next.length > STACK_PATH_MAX_LENGTH) {
    return next.slice(next.length - STACK_PATH_MAX_LENGTH);
  }
  return next;
}

/**
 * Stripe checkout session metadata stamp. Bundles every attribution field
 * the funnel needs so the webhook can attribute even if cookies are gone.
 *
 * Joins (does not replace) the existing A/B + diagnostic stamps in
 * /api/checkout/route.ts — caller should spread this object into the metadata
 * object alongside the other stamp helpers.
 *
 * Stripe metadata values are strings; numbers and arrays are stringified.
 */
export interface StackStripeStamp {
  stack_subject: string;
  stack_entry: string;
  stack_current: string;
  stack_path: string;
  stack_layer_purchased: string;
  affiliate_slug?: string;
}

export function stackStripeStamp(args: {
  subject: string;
  entry: StackLayerValue;
  current: StackLayerValue;
  path: StackLayerValue[];
  layerPurchased: StackLayerValue;
  affiliate?: string | null;
}): StackStripeStamp {
  const stamp: StackStripeStamp = {
    stack_subject: args.subject,
    stack_entry: String(args.entry),
    stack_current: String(args.current),
    stack_path: JSON.stringify(args.path.slice(-STACK_PATH_MAX_LENGTH)),
    stack_layer_purchased: String(args.layerPurchased),
  };
  if (args.affiliate && AFFILIATE_SLUG_RE.test(args.affiliate)) {
    stamp.affiliate_slug = args.affiliate;
  }
  return stamp;
}

/**
 * Inverse: pull the stack stamp back out of Stripe session metadata in the
 * webhook handler. Returns null for any field that's missing or malformed so
 * the webhook can decide whether to log a partial attribution or skip.
 */
export function parseStackStripeStamp(metadata: Record<string, string> | null | undefined): {
  subject: string | null;
  entry: StackLayerValue | null;
  current: StackLayerValue | null;
  path: StackLayerValue[];
  layerPurchased: StackLayerValue | null;
  affiliate: string | null;
} {
  const m = metadata ?? {};
  let path: StackLayerValue[] = [];
  try {
    const raw = m.stack_path;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        path = parsed
          .map((e) => parseStackLayer(typeof e === "number" ? String(e) : null))
          .filter((e): e is StackLayerValue => e !== null)
          .slice(-STACK_PATH_MAX_LENGTH);
      }
    }
  } catch {
    path = [];
  }
  return {
    subject: m.stack_subject ?? null,
    entry: parseStackLayer(m.stack_entry),
    current: parseStackLayer(m.stack_current),
    path,
    layerPurchased: parseStackLayer(m.stack_layer_purchased),
    affiliate:
      m.affiliate_slug && AFFILIATE_SLUG_RE.test(m.affiliate_slug)
        ? m.affiliate_slug
        : null,
  };
}
