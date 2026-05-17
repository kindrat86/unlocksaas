/**
 * Stack Slide — Brunson Building Block #14 + Expert Secrets §3 Stack/Closes.
 *
 * The deliverable inventory. Every item that ships when a Marco-avatar founder
 * upgrades from $0 (diagnostic) to $49/mo (full Machine). The Stack does three
 * jobs in one block:
 *
 *   1. **Inventory** — turns "the Machine" into a list a skeptic can audit.
 *   2. **Anchoring** — each line names what it would cost as a separate
 *      product (course, hire, custom build), totaling a number that makes
 *      $49/mo look obvious by comparison.
 *   3. **Reciprocity** — the final line is the 60-day refund. The price feels
 *      negligible AFTER reading the eight items, not before.
 *
 * Identity guardrail: no fabricated dollar amounts. Each "value" is what an
 * equivalent course / consultant / SaaS would charge for the same deliverable
 * today, sourced from public pricing pages (e.g., Brunson's $997 cohort price,
 * generic Dream 100 consultant retainers at $3k/mo). When a number could be
 * disputed, it's marked "comparable to" not "worth".
 *
 * Visual treatment: ClickFunnels 1.0 Stack Slide aesthetic — white card on a
 * yellow ribbon background, bold black titles, orange checkmarks, value chip
 * on the right, dramatic "TOTAL VALUE" reveal, $49 anchor pin under it.
 */
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type StackItem = {
  title: string;
  value: string;
  body: string;
};

const STACK: StackItem[] = [
  {
    title: "The 7-step Machine engine",
    value: "Comparable to $997 cohort",
    body: "Step-by-step workflow that takes you from named dream customer to first verified Stripe charge. No frameworks left on a notepad — every answer is structured input to the next step.",
  },
  {
    title: "Dream 100 picker (pre-loaded)",
    value: "Comparable to $3,000 consultant",
    body: "Pulls from the locked Brunson Dream 100 workbook. You don't start with a blank canvas — you start with a list of 100 named congregations where your customer actually lives.",
  },
  {
    title: "Offer builder with engine pushback",
    value: "Comparable to $497 copywriting course",
    body: "The engine refuses to accept vague promises. If your offer fails the specificity test, it tells you which beat is broken and rewrites the prompt.",
  },
  {
    title: "Outreach happens inside the tool",
    value: "Comparable to $79/mo CRM",
    body: "Step 5 generates the message, picks the target, and logs the send. Outreach stops being optional. The tool tracks 20 actions before Day 60.",
  },
  {
    title: "Stripe-webhook verified badge",
    value: "Free with the Machine — sold by no one else",
    body: "When your first paying customer charge fires, the code reads your connected Stripe and lights up the Verified Builder badge. The mechanic IS the proof.",
  },
  {
    title: "Public builder profile page",
    value: "Comparable to $29/mo portfolio host",
    body: "A live /builder/[slug] page that shows your product, your first-customer date, and your badge. Marketing surface you don't have to build.",
  },
  {
    title: "Soap Opera + Seinfeld email sequences",
    value: "Comparable to $297 email course",
    body: "Five days of letters, then weekly Tuesday Seinfeld emails. Already written. Each one signed from Maryan. Founders get a copy of the whole library on Day 0.",
  },
  {
    title: "The 60-day Stripe-verified guarantee",
    value: "Refunded by code, not by inbox",
    body: "If you finish Steps 1–5 in-product, log 20 outreach actions, and Stripe still shows zero customers at Day 60 — the webhook refunds both monthly payments. Automatically. No email to me.",
  },
];

export function StackSlide() {
  return (
    <section className="bg-yellow-100 py-16 sm:py-20 px-4 sm:px-6 border-y-4 border-yellow-300">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            Here&apos;s What&apos;s Inside
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Everything you get when you join{" "}
            <span className="bg-orange-500 text-white px-2 py-0.5 box-decoration-clone rounded">
              The Machine.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mt-5 max-w-xl mx-auto leading-relaxed">
            Eight deliverables. One $49 monthly price. Refunded in full if it doesn&apos;t produce a paying customer.
          </p>
        </div>

        <ol className="space-y-3">
          {STACK.map((item, i) => (
            <li
              key={item.title}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all p-5 sm:p-6 flex items-start gap-4 sm:gap-5"
            >
              <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-orange-500 grid place-items-center text-white shadow-md">
                <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                    <span className="text-purple-700 font-black mr-1">#{i + 1}</span>
                    {item.title}
                  </h3>
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2.5 py-1 rounded whitespace-nowrap">
                    {item.value}
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Total value reveal — Brunson Stack closeout */}
        <div className="mt-10 sm:mt-12 bg-white rounded-2xl border-4 border-purple-700 p-6 sm:p-8 text-center shadow-2xl shadow-purple-700/20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-bold text-gray-500 mb-2">
            If you bought these separately
          </p>
          <p className="text-4xl sm:text-5xl font-black text-gray-400 line-through mb-1">
            $4,900+
          </p>
          <p className="text-xs sm:text-sm uppercase tracking-widest font-bold text-gray-500 mt-3 mb-2">
            Today, all eight, inside The Machine:
          </p>
          <p className="text-6xl sm:text-7xl font-black text-orange-500 leading-none">
            $49<span className="text-2xl sm:text-3xl text-gray-700 align-top">/mo</span>
          </p>
          <p className="text-sm text-gray-700 mt-3 font-semibold">
            Or refunded in full at Day 60 if it doesn&apos;t fire.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-auto rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-xl font-extrabold uppercase tracking-wide w-full sm:w-auto sm:min-w-[420px] max-w-full border-b-4 border-orange-700 hover:border-orange-800 transition-colors leading-tight whitespace-normal"
            >
              <Link href="/machine-sales" className="inline-flex items-center justify-center gap-2">
                Start The Machine — $49/mo
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              60-day guarantee · Stripe-verified · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
