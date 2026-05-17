import {
  MIN_PUBLIC_COUNT_FOR_SOCIAL_PROOF,
  countPublicDiagnoses,
} from "@/lib/diagnostic-share";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Honest empty-state public-diagnosis counter for the squeeze.
 *
 * Brunson rule (mirror media-bar + avatar-wall on `/`):
 *   - Below MIN_PUBLIC_COUNT_FOR_SOCIAL_PROOF (10) → render the honest
 *     empty-state line ("You'd be early. Nobody has made theirs public
 *     yet."). Empty-state is itself bait-positive — Brunson DCS Chapter 11
 *     calls out that "first-mover scarcity" outperforms inflated proof.
 *   - At ≥ 10 → render the count ("X founders made their diagnosis
 *     public. Yours can join them when you opt in.")
 *
 * Server component; Suspense-friendly. Read happens once per request.
 */
export async function DiagnosticPublicCounter() {
  let count = 0;
  try {
    count = await countPublicDiagnoses(createAdminClient());
  } catch {
    count = 0;
  }

  if (count < MIN_PUBLIC_COUNT_FOR_SOCIAL_PROOF) {
    return (
      <p className="text-xs uppercase tracking-widest text-muted-foreground/80">
        You&apos;d be early. Nobody has made theirs public yet.
      </p>
    );
  }

  return (
    <p className="text-xs uppercase tracking-widest text-muted-foreground/80">
      {count.toLocaleString("en-US")} founders made their diagnosis public.
      Yours can join them when you opt in.
    </p>
  );
}
