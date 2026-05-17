import { PLAYBOOK } from "@/lib/playbook";

/**
 * Visual mock-up of the Playbook "cover."
 *
 * Brunson DotCom Secrets Secret #17: the buyer needs to SEE the artifact
 * before they pay. Even on a digital book funnel Russell mocks up a cover.
 * The shape of the thing matters as much as the contents — it carries the
 * identity-anchor effect that the noun "Playbook" cannot deliver on its
 * own.
 *
 * Pure CSS, no image asset. Renders identically server-side and survives
 * static export. Decorative — `aria-hidden="true"`. Real cover-art slot is
 * reserved for post-launch (replace the gradient with a `next/image` block
 * when a designed cover exists).
 *
 * The yellow seal echoes the homepage attention bar (ClickFunnels visual
 * grammar) so the buyer's eye recognises the book as a UnlockSaaS artifact
 * before they read a single word.
 */
export function PlaybookMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto"
      style={{ width: 220, height: 300 }}
    >
      {/* Spine shadow — gives the cover a "physical" sense */}
      <div
        className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 to-transparent rounded-l-sm"
        style={{ transform: "translateX(-2px)" }}
      />
      {/* Cover face */}
      <div className="absolute inset-0 rounded-sm shadow-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white p-5 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.25em] text-purple-200 mb-2">
          The Unlock SaaS Playbook
        </p>
        <h3 className="text-[20px] font-black leading-tight mb-3">
          The Founder&apos;s First Customer Playbook
        </h3>
        <p className="text-[11px] text-purple-100/90 leading-snug mb-auto">
          {PLAYBOOK.subtitle}
        </p>
        {/* Yellow guarantee seal */}
        <div className="self-start bg-yellow-300 text-black text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-sm mb-3">
          60-day guarantee
        </div>
        <p className="text-[10px] text-purple-200">{PLAYBOOK.byline}</p>
      </div>
    </div>
  );
}
