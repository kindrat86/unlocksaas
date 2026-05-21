/**
 * Honest Testimonials — Brunson Building Block #7 (skeptic-safe variant).
 *
 * The avatar is a Praise Junkie (workbook 01 §6 Beat 4) who has been burned by
 * fabricated reviews on every other tool he tried. So this block carries
 * PUBLIC QUOTES from real Indie Hackers / Hacker News threads (sourced in
 * strategy/dollar-objections.md) where founders described the SAME PAIN
 * the Playbook fixes — not testimonials about the product itself (we have
 * zero customers; we will not fabricate any).
 *
 * The job of this block: turn public pain into recognition. The founder reads
 * the quotes, says "that is me," and the gap between him and the buyer is
 * closed. The CTA is implicit: "you are not alone in the flat-line — the
 * Playbook is the way out."
 *
 * When real customers exist (workbook 09 §6 public proof loop), swap one
 * to three of these for first-paying-customer screenshots WITH PERMISSION.
 */
import { Card, CardContent } from "@/components/ui/card";

type Quote = {
  text: string;
  author: string;
  source: string;
  pain: string;
};

const QUOTES: Quote[] = [
  {
    pain: "Flat line after launch",
    text: "10,947 registered users over 9 years. 90 ever paid anything. Total revenue: €6,356.",
    author: "Daniil Khanin",
    source: "Indie Hackers",
  },
  {
    pain: "Shipped to crickets, repeatedly",
    text: "I've shipped products to crickets more times than I'd like to admit.",
    author: "erichjeff",
    source: "Indie Hackers",
  },
  {
    pain: "Built, nobody showed up",
    text: "Most of us don't fail because we can't build. We fail because we build… and nobody shows up.",
    author: "Abdelrahman Al Omari",
    source: "Indie Hackers",
  },
  {
    pain: "The distribution problem nobody names",
    text: "The silence after shipping isn't market rejection. It's a distribution problem nobody talks about enough.",
    author: "launchstack_hq",
    source: "Indie Hackers",
  },
  {
    pain: "Feedback is not intent",
    text: "I got tonnes of feedback, but nobody was interested.",
    author: "Daniel Gibbons",
    source: "Indie Hackers",
  },
  {
    pain: "Praise is not payment",
    text: "The people who upvote your milestones aren't always the people who pay for your product.",
    author: "nimesh",
    source: "Indie Hackers",
  },
  {
    pain: "Avoidance disguised as work",
    text: "Meanwhile: zero paying customers. Zero cold emails sent. Zero uncomfortable conversations.",
    author: "jackfranklyn",
    source: "Indie Hackers",
  },
  {
    pain: "Built beside, not inside",
    text: "Most founders think they are building a product. In reality they are often building a second tool that sits beside the thing people already use.",
    author: "Astra Wysocka",
    source: "Indie Hackers",
  },
  {
    pain: "Specificity, not distribution",
    text: "Most indie founders doing $0 aren't distribution-constrained. They're specificity-constrained.",
    author: "pradeepbisht",
    source: "Indie Hackers",
  },
  {
    pain: "Market motion, not product",
    text: "A lot of founders think they have a product problem when they really have a market-motion problem.",
    author: "clawback",
    source: "Indie Hackers",
  },
];

export function HonestTestimonials() {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Mirror In Ten Founders
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          We are not the first to describe this. You are not alone in it.
        </h2>
        <p className="text-sm text-muted-foreground italic mt-3 max-w-xl mx-auto leading-relaxed">
          Public quotes from real founders. We have zero customers and refuse to invent any.
          When real wins arrive, they replace these.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {QUOTES.map((q) => (
          <Card key={q.text}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                {q.pain}
              </p>
              <blockquote className="text-sm leading-relaxed italic mb-4">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <p className="text-xs text-muted-foreground">
                — {q.author} ({q.source})
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
