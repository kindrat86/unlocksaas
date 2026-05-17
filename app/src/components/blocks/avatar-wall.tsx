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
 * Visual treatment: ClickFunnels 1.0 light theme — purple-700 avatar chips
 * on white background, orange ring on hover, bold black names.
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
    <section
      className="bg-white py-16 sm:py-20 px-4 sm:px-6"
      aria-label="Verified Builders"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            Verified Builders
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Nine founders who shipped on AI tools and{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              got a paying customer.
            </span>
          </h2>
          <p className="text-base text-gray-700 italic mt-5 max-w-xl mx-auto leading-relaxed">
            Stripe-verified. Not self-reported. Click any avatar to see the
            badge page.
          </p>
        </div>

        <ul
          role="list"
          className="grid grid-cols-3 md:grid-cols-9 gap-4 sm:gap-5 max-w-4xl mx-auto"
        >
          {builders.map((b) => (
            <li key={b.id} className="flex flex-col items-center text-center">
              <Link
                href={`/builder/${b.slug}`}
                className="group flex flex-col items-center"
                aria-label={`${b.builderName}'s Verified Builder badge`}
              >
                <div className="h-16 w-16 md:h-14 md:w-14 rounded-full bg-purple-700 grid place-items-center text-lg font-extrabold text-white ring-4 ring-purple-100 group-hover:ring-orange-300 group-hover:bg-purple-800 transition-all shadow-md">
                  {initialOf(b.builderName)}
                </div>
                <p className="text-sm font-bold text-gray-900 mt-2 group-hover:text-purple-700 transition-colors">
                  {b.builderName.split(/\s+/)[0]}
                </p>
                {b.productName ? (
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 max-w-[80px]">
                    {b.productName}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-600 italic text-center mt-10 max-w-xl mx-auto leading-relaxed">
          Each badge is one paying customer detected on the founder&apos;s own
          connected Stripe account.{" "}
          <span className="font-bold text-gray-900">The mechanic, not the marketing, is the proof.</span>
        </p>
      </div>
    </section>
  );
}
