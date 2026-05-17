/**
 * Verified Builder avatar wall — Brunson Funnel Hacker's Cookbook Swipe 6.
 *
 * Composition rules (acceptance test from strategy/funnel-hackers-cookbook.md):
 *   - Each avatar = first name initial + first name + product link.
 *   - Click an avatar → /builder/<slug> (Verified Builder badge page).
 *   - The wall renders only when 9+ public verified builders exist
 *     (WIP-grid number — Brunson canon: reads as a real, populated thing
 *     without crossing into "look how many we have").
 *   - When fewer than 9, this component returns null. The funnel hub's
 *     `HonestTestimonials` block continues to carry the proof layer.
 *
 * Identity guardrail:
 *   - No fabricated avatars, no stock photos, no AI-generated faces.
 *   - All data sourced from `builder_badges` view — filtered server-side
 *     to share_visibility=public, builder_slug NOT NULL, first_customer_at
 *     NOT NULL. The view definition is the security boundary.
 *
 * Server component. No client JS. Caches per request via the admin client
 * (the `loadVerifiedBuilders` helper).
 */
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { loadVerifiedBuilders } from "@/lib/builder-badge";

const AVATAR_WALL_MIN_COUNT = 9;

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "B";
  return trimmed[0]!.toUpperCase();
}

export async function AvatarWall() {
  const builders = await loadVerifiedBuilders(createAdminClient(), AVATAR_WALL_MIN_COUNT);

  if (builders.length < AVATAR_WALL_MIN_COUNT) {
    // Pre-stage discipline: the component exists, ready for the day the 9th
    // verified builder opts into public visibility. Until then, render nothing.
    // The honest empty state is carried by the surrounding `HonestTestimonials`
    // block — public quotes from real founders, swap-able 1:1 the day this
    // wall lights up.
    return null;
  }

  return (
    <section className="py-16 px-6 max-w-4xl mx-auto" aria-label="Verified Builders">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Verified Builders
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          Nine founders who shipped on AI tools and got a paying customer.
        </h2>
        <p className="text-sm text-muted-foreground italic mt-3 max-w-xl mx-auto leading-relaxed">
          Stripe-verified. Not self-reported. Click any avatar to see the
          badge page.
        </p>
      </div>

      <ul
        role="list"
        className="grid grid-cols-3 md:grid-cols-9 gap-4 max-w-3xl mx-auto"
      >
        {builders.map((b) => (
          <li key={b.id} className="flex flex-col items-center text-center">
            <Link
              href={`/builder/${b.slug}`}
              className="group flex flex-col items-center"
              aria-label={`${b.builderName}'s Verified Builder badge`}
            >
              <div className="h-14 w-14 md:h-12 md:w-12 rounded-full border border-border bg-muted/60 grid place-items-center text-base font-semibold text-foreground group-hover:bg-primary/10 group-hover:border-primary/40 transition-colors">
                {initialOf(b.builderName)}
              </div>
              <p className="text-xs text-foreground mt-2 group-hover:underline underline-offset-4">
                {b.builderName.split(/\s+/)[0]}
              </p>
              {b.productName ? (
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {b.productName}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground italic text-center mt-8 max-w-md mx-auto">
        Each badge is one paying customer detected on the founder&apos;s own
        connected Stripe account. The mechanic, not the marketing, is the
        proof.
      </p>
    </section>
  );
}
