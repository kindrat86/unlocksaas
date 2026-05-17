/**
 * Social Proof Bar — Brunson Building Block #20 (honest variant).
 *
 * Block-the-fake-testimonials rule: Marco is a skeptic avatar (workbook 01 §6
 * Beat 4: "Cannot Code" + "Praise Junkie"). Fabricated "trusted by X founders"
 * counters destroy his trust in three seconds. So this bar carries STRUCTURAL
 * proof instead of inflated numbers:
 *
 *   - the mechanism that ENFORCES the promise (Stripe-verified refund logic)
 *   - the founder's own scar tissue (12 shipped products, flat lines)
 *   - the conversation-corpus the avatar is built on (10+ founder interviews)
 *
 * Every line here is true today. When real customers exist, replace one or
 * two slots with first-paying-customer counts (per workbook 09 §6 Public
 * Proof Loop).
 *
 * Visual treatment: ClickFunnels 1.0 light theme — white cards, purple icon
 * chips, bold black headlines, gray-700 body. Matches the homepage hero so
 * the eye flows without a tonal break.
 */
import { Stamp, Wallet, Users } from "lucide-react";

export function SocialProofBar() {
  return (
    <section
      aria-label="What this is built on"
      className="bg-white border-y-4 border-purple-700 py-8 sm:py-10 px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 h-12 w-12 rounded-full bg-purple-700 grid place-items-center text-white">
            <Stamp className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              Refund enforced by code
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-1">
              The guarantee is a Stripe webhook, not a promise.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="shrink-0 h-12 w-12 rounded-full bg-purple-700 grid place-items-center text-white">
            <Wallet className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              12 shipped products, one flat line
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-1">
              Built on the founder&apos;s own scar tissue first.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="shrink-0 h-12 w-12 rounded-full bg-purple-700 grid place-items-center text-white">
            <Users className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              10+ founder conversations
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-1">
              Every parable below is sourced from a real conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
