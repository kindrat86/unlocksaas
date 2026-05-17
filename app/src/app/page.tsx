import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getIdentityLabels, readIdentityFromCookies } from "@/lib/ab";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { BeforeAfter } from "@/components/blocks/before-after";
import { HonestTestimonials } from "@/components/blocks/honest-testimonials";
import { VslBlock } from "@/components/blocks/vsl-block";
import { MediaBar } from "@/components/blocks/media-bar";
import { AvatarWall } from "@/components/blocks/avatar-wall";
import { shouldRenderMediaBar } from "@/lib/media-mentions";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

/**
 * UnlockSaaS Funnel Hub.
 *
 * Building blocks per workbook 04 §2 + 23 Building Blocks (DotCom Secrets) +
 * Funnel Hacker's Cookbook v1 trust columns (strategy/funnel-hackers-cookbook.md):
 *   1. Hero — enemy sentence + one-line bio + 3 CTAs (diagnostic / starter / machine)
 *   2. Social proof bar (structural proof, not numeric)
 *   3. Media bar — earned mentions, auto-renders at ≥3 (Cookbook Swipe 3)
 *   4. Manifesto (half) — Verified / Paid Builders A/B from cookie
 *   5. Before / After block
 *   6. Founder VSL (env-driven, kinetic fallback)
 *   7. Founder timeline
 *   8. Comparison block — Machine vs Course vs DIY vs Doing-Nothing
 *   9. Honest testimonials — public quotes from real founders
 *  10. Avatar wall — verified builders, auto-renders at ≥9 (Cookbook Swipe 6)
 *  11. FAQ — sourced from strategy/dollar-objections.md (6 entries)
 *  12. Newsletter signup — real form, fires Day 0 of Soap Opera
 *  13. Honest "as seen in" empty-state — only renders when MediaBar is hidden
 *  14. Social links
 *  15. Footer
 */
export default function FunnelHub() {
  const variant = readIdentityFromCookies();
  const labels = getIdentityLabels(variant);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Surface B (AEO/GEO) — strategy/google-strategy.md §B.2.
          Organization + WebSite schema for LLM citation anchoring. */}
      <OrganizationJsonLd />
      <AbExposureBeacon />

      {/* ---------------- HERO (ClickFunnels 1.0 visual treatment) ----------------
          Marco-avatar shoppers recognize Brunson's funnel pages by sight: yellow
          attention bar, purple + orange palette, headline with highlighted
          punch-phrases, big blocky orange CTA. Restyle only — copy and CTA
          architecture are locked per workbook 04. */}
      <div className="bg-yellow-300 text-black text-center py-2 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 border-yellow-500">
        Attention: Pre-revenue founders building with AI
      </div>

      <header className="bg-gradient-to-b from-purple-50 via-purple-50/40 to-white py-16 sm:py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-bold text-purple-700 mb-5">
            Unlock SaaS Presents
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] text-gray-900 mb-6 tracking-tight">
            The problem stuck founders have is{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              not the product.
            </span>{" "}
            It is that an entire industry profits from teaching them to{" "}
            <span className="text-purple-700">keep building</span>{" "}
            when the only thing left is{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              to sell.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Marketer, non-engineer, built a dozen AI products that nobody paid
            for. Then I figured out why.{" "}
            <span className="font-semibold text-gray-900">— Maryan</span>
          </p>

          <div
            className="text-3xl text-orange-500 mb-3 animate-bounce select-none"
            aria-hidden="true"
          >
            ↓
          </div>

          {/* Primary CTA — classic CF orange blocky button with bottom-border depth */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Button
              asChild
              className="h-auto rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 px-8 py-5 text-lg sm:text-xl font-extrabold uppercase tracking-wide w-full sm:w-auto sm:min-w-[420px] border-b-4 border-orange-700 hover:border-orange-800 transition-colors"
            >
              <Link href="/diagnostic">Yes! Get My Free Diagnosis →</Link>
            </Button>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Free · 2 minutes · No card required
            </p>
          </div>

          {/* Secondary CTAs — restrained, purple-trimmed for CF visual coherence */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white border-2 border-purple-700 text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-bold"
            >
              <Link href="/starter">Start the Machine for $1</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-semibold"
            >
              <Link href="/machine-sales">The Full Machine — $49/mo</Link>
            </Button>
          </div>

          {/* Reverse-squeeze bridge — DCS Secret 14 reverse variant. Value-first
              surface for the cold visitor not yet ready to opt in. */}
          <p className="mt-10 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/parables"
              className="font-bold text-purple-700 underline underline-offset-4 decoration-2 hover:text-purple-900"
            >
              read the five parables first
            </Link>
            {" "}— free, no email required.
          </p>
        </div>
      </header>

      {/* Building Block #20 — Social Proof Bar (honest variant, no fake counts). */}
      <SocialProofBar />

      {/* Cookbook Swipe 3 — "As seen in" earned-media bar. Pre-staged.
          Renders only when >= 3 earned mentions exist; returns null otherwise.
          Operator appends new mentions to lib/media-mentions.ts. */}
      <MediaBar />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- MANIFESTO (half) — A/B identity_label ---------------- */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {labels.manifestoTitle}
        </h2>
        <blockquote className="text-muted-foreground space-y-4 leading-relaxed">
          <p>
            We are non-engineer founders who shipped real things with AI tools
            we did not write.
          </p>
          <p>
            We were told the answer was more building, then more traffic, then
            a better course. We tried all three. The line stayed flat.
          </p>
          <p>
            We stopped pretending the problem was the product. The problem was
            the work nobody taught us to do: name one real person, make one
            real promise, sell it before it felt ready.
          </p>
          <p>
            We measure progress in Stripe charges, not in encouragement. We do
            not collect praise. We collect customers.
          </p>
        </blockquote>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- BEFORE / AFTER (Block #22) ---------------- */}
      <BeforeAfter />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FOUNDER VSL (Block #20, six-line intro framework) ---------------- */}
      <VslBlock />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FOUNDER TIMELINE ---------------- */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">The Timeline</h2>
        <ol className="space-y-4">
          {[
            {
              date: "2025, summer",
              line:
                "First AI product shipped with Lovable. Stripe stayed at zero. Told myself it was the product.",
            },
            {
              date: "2025, autumn",
              line:
                "Three more products shipped. Two paying users across all four. Started a deep dive into SEO so I would not have to look at the line.",
            },
            {
              date: "2026, winter",
              line:
                "Sat down to write the offer for the fifth product. Found nothing. No promise. No specific person.",
            },
            {
              date: "2026, spring",
              line:
                "Ran ten founder conversations. Heard my own story back, every time. Stopped fixing products. Started fixing the order.",
            },
            {
              date: "2026, May",
              line:
                "Locked the Brunson workbook chain end-to-end. Shipped this funnel.",
            },
          ].map((row) => (
            <li key={row.date} className="flex gap-4">
              <div className="shrink-0 w-32 text-xs uppercase tracking-widest text-muted-foreground pt-1">
                {row.date}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {row.line}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- COMPARISON ---------------- */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          What you have been trying — and what is different about this.
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-foreground">
              <tr>
                <th className="text-left p-3 font-semibold">Approach</th>
                <th className="text-left p-3 font-semibold">Cost</th>
                <th className="text-left p-3 font-semibold">Guarantee</th>
                <th className="text-left p-3 font-semibold">Removes avoidance?</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-t border-border">
                <td className="p-3">Doing nothing</td>
                <td className="p-3">Free</td>
                <td className="p-3">None</td>
                <td className="p-3">No — avoidance is the default state</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-3">Course / cohort</td>
                <td className="p-3">$497–$2,000</td>
                <td className="p-3">Refund-policy theatre</td>
                <td className="p-3">No — teaching, not doing</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-3">Hire a consultant</td>
                <td className="p-3">$3,000+</td>
                <td className="p-3">Hourly</td>
                <td className="p-3">No — outsourced understanding</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-3">Generic funnel/AI tool</td>
                <td className="p-3">$29–$99/mo</td>
                <td className="p-3">Trial only</td>
                <td className="p-3">No — assumes you already did the work</td>
              </tr>
              <tr className="border-t border-border bg-primary/5">
                <td className="p-3 font-semibold text-foreground">The Machine</td>
                <td className="p-3 font-semibold text-foreground">$49/mo</td>
                <td className="p-3 font-semibold text-foreground">Stripe-verified, code-enforced</td>
                <td className="p-3 font-semibold text-foreground">Yes — outreach happens inside the tool</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground italic text-center mt-4">
          The comparison is honest. Every other approach has a place. None of
          them remove the avoidance, which is the actual disease.
        </p>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- HONEST TESTIMONIALS (Block #7) ---------------- */}
      <HonestTestimonials />

      {/* Cookbook Swipe 6 — Verified Builder avatar wall. Pre-staged.
          Renders only when >= 9 public verified builders exist; returns null
          otherwise (the HonestTestimonials block above carries the proof
          layer until the wall lights up). Async — wrapped in Suspense so
          the DB read does not block the rest of the page. */}
      <Suspense fallback={null}>
        <AvatarWall />
      </Suspense>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FAQ ---------------- */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Honest objections.</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Mined from public Indie Hackers and Hacker News threads written by
          founders matching the Marco avatar. Full sources:{" "}
          <code className="text-xs">strategy/dollar-objections.md</code>.
        </p>
        <div className="space-y-6">
          {[
            {
              q: "I already have too many subscriptions.",
              a: "Start at $1, not $49. The Starter finishes your dream customer and your offer in a week and is yours to keep regardless of whether you upgrade.",
            },
            {
              q: "$49/mo is too much pre-revenue.",
              a: "Two coffees a week, $98 capped exposure over 60 days, refunded automatically if the work was done and Stripe shows no customer. Pre-revenue is the exact case the guarantee was written for.",
            },
            {
              q: "I have been burned by gurus.",
              a: "Same. This is not a course. The deliverable is software you run yourself. The refund is enforced by code — not by a 'describe your experience' email I read at my leisure.",
            },
            {
              q: "Customers are MY problem, not the tool's job.",
              a: "Every other tool quietly agreed with you. The Machine does not. Outreach happens inside the tool, tracked. The job cannot be outsourced; it can be removed-from-your-willpower. That is the design.",
            },
            {
              q: "I could build this myself in a weekend.",
              a: "You could build the form. Not the Stripe-webhook proof, the Dream 100 picker fed from a locked workbook, the engine pushback, or the 60-day refund logic. And while you build the tool, you are not running the funnel — which is the exact disease the Machine treats.",
            },
            {
              q: "What if I do the work and still get no paying customer?",
              a: "Then the guarantee fires. The code reads your Stripe account at day 60. If you completed Steps 1–5 in-product and logged 20 outreach actions and the line is still flat, you get the two months ($98) back. In writing.",
            },
          ].map((item) => (
            <div key={item.q}>
              <p className="font-semibold">{item.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="py-16 px-6 max-w-md mx-auto text-center">
        <h2 className="text-lg font-bold mb-4">
          Not ready to subscribe? Read the five-day arc first.
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Founders who build real things with AI deserve to get paid for them.
          One short email a day for five days, written like a letter from one
          founder to another. Reply STOP anytime.
        </p>
        <NewsletterSignup />
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- HONEST "AS SEEN IN" EMPTY-STATE ----------------
          Only renders when the MediaBar above is hidden (< 3 earned mentions).
          Once 3+ mentions land, MediaBar takes over near the top of the page
          and this empty-state disappears automatically — no duplicate render. */}
      {!shouldRenderMediaBar() ? (
        <>
          <section className="py-12 px-6 max-w-2xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              As seen in
            </p>
            <p className="text-sm text-muted-foreground italic">
              Nowhere yet. Reluctant Hero rule: no fake logos. The first time
              a podcast or newsletter mentions Unlock SaaS, that logo lands
              here. Build in public means showing the empty version too.
            </p>
          </section>

          <Separator className="max-w-4xl mx-auto" />
        </>
      ) : null}

      {/* ---------------- SOCIAL ---------------- */}
      <section className="py-12 px-6 max-w-md mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Find me
        </p>
        <div className="flex gap-4 justify-center text-sm text-muted-foreground">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="https://www.indiehackers.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Indie Hackers
          </a>
          <a
            href="https://reddit.com/r/SaaS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            r/SaaS
          </a>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="py-8 px-6 text-center text-xs text-muted-foreground mt-auto">
        <p>&copy; 2026 Unlock SaaS. Built by a non-engineer who shipped anyway.</p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link
            href="/builders"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Verified Builder directory
          </Link>
          <Link
            href="/bridge"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Came from a cold ad?
          </Link>
        </p>
      </footer>

    </div>
  );
}
