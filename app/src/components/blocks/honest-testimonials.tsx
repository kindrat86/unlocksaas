/**
 * Honest Testimonials — Brunson Building Block #7 (skeptic-safe variant).
 *
 * Marco is a Praise Junkie (workbook 01 §6 Beat 4) who has been burned by
 * fabricated reviews on every other tool he tried. So this block carries
 * PUBLIC QUOTES from real Indie Hackers / Hacker News threads (sourced in
 * strategy/dollar-objections.md) where founders described the SAME PAIN
 * the Machine fixes — not testimonials about the product itself (we have
 * zero customers; we will not fabricate any).
 *
 * The job of this block: turn public pain into recognition. Marco reads
 * the quotes, says "that is me," and the gap between him and the buyer is
 * closed. The CTA is implicit: "you are not alone in the flat-line — the
 * Machine is the way out."
 *
 * When real customers exist (workbook 09 §6 public proof loop), swap one
 * to three of these for first-paying-customer screenshots WITH PERMISSION.
 *
 * Visual treatment: ClickFunnels 1.0 light theme — white cards on a soft
 * purple background, a big oversized purple quote glyph behind each quote,
 * bold uppercase pain-label tag on top in orange.
 */
import { Quote } from "lucide-react";

type QuoteItem = {
  text: string;
  author: string;
  source: string;
  pain: string;
};

const QUOTES: QuoteItem[] = [
  {
    pain: "Flat line after launch",
    text: "10,947 registered users over 9 years. 90 ever paid anything. Total revenue: €6,356.",
    author: "Daniil Khanin",
    source: "Indie Hackers",
  },
  {
    pain: "Silence after shipping",
    text: "Most of us don't fail because we can't build. We fail because we build… and nobody shows up.",
    author: "Abdelrahman Al Omari",
    source: "Indie Hackers",
  },
  {
    pain: "Avoidance disguised as work",
    text: "Meanwhile: zero paying customers. Zero cold emails sent. Zero uncomfortable conversations.",
    author: "jackfranklyn",
    source: "Indie Hackers",
  },
  {
    pain: "Praise is not payment",
    text: "The people who upvote your milestones aren't always the people who pay for your product.",
    author: "nimesh",
    source: "Indie Hackers",
  },
  {
    pain: "Specificity, not distribution",
    text: "Most indie founders doing $0 aren't distribution-constrained. They're specificity-constrained.",
    author: "pradeepbisht",
    source: "Indie Hackers",
  },
  {
    pain: "The actual diagnosis",
    text: "The product works. What's broken is everything around it — how I sell, who I sell to, what I sell.",
    author: "Daniil Khanin",
    source: "Indie Hackers",
  },
];

export function HonestTestimonials() {
  return (
    <section className="bg-purple-50/40 py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            The Mirror In Ten Founders
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            We are not the first to describe this.{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              You are not alone in it.
            </span>
          </h2>
          <p className="text-base text-gray-700 italic mt-5 max-w-2xl mx-auto leading-relaxed">
            Public quotes from real founders. We have zero customers and refuse to invent any.
            When real wins arrive, they replace these.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {QUOTES.map((q) => (
            <div
              key={q.text}
              className="relative bg-white rounded-xl border-2 border-purple-200 p-6 sm:p-7 shadow-md hover:shadow-xl hover:border-purple-400 transition-all overflow-hidden"
            >
              <Quote
                className="absolute -top-2 -right-2 h-24 w-24 text-purple-100"
                aria-hidden="true"
              />
              <span className="relative inline-block bg-orange-500 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-4">
                {q.pain}
              </span>
              <blockquote className="relative text-base sm:text-lg text-gray-900 leading-relaxed font-medium mb-5">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <p className="relative text-xs font-bold text-purple-700 uppercase tracking-wider">
                — {q.author}
                <span className="text-gray-500 font-medium normal-case tracking-normal ml-1">
                  ({q.source})
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
