/**
 * Secret Formula — Brunson DotCom Secrets Chapter 2 (Who / What / When / Where / Why).
 *
 * Brunson dedicates an entire chapter to The Secret Formula — the five questions
 * every sales page must answer in the first 3 seconds. The homepage hook answers
 * them implicitly, but a DEDICATED section makes them explicit, citable copy the
 * visitor can scan, disagree with, or accept. If the visitor accepts all five
 * answers, the rest of the page is just evidence; if any one triggers doubt,
 * the section names the source of the doubt and the visitor knows where to push.
 *
 * Placement: right after Big Domino, before the SocialProofBar. The Big Domino
 * states the one belief; the Secret Formula lands the five specific answers that
 * belief implies. Together they form the "who/what/when/where/why" frame the
 * rest of the page fills with story and proof.
 *
 * Voice rule (Reluctant Hero): every answer carries the founder's scar. The section
 * reads "here is what I figured out" not "here is what the experts recommend."
 */
import { HelpCircle, Target, Clock, MapPin, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FormulaItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FORMULA: FormulaItem[] = [
  {
    question: "Who is this for?",
    answer:
      "The post-launch, pre-revenue, non-engineer founder. You shipped a real product with AI tools (Lovable, Claude, Replit, Bolt). Users signed up. Nobody paid. You are starting to wonder if the product is the problem — and it is not.",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    question: "What does it do?",
    answer:
      "A seven-step playbook engine that pushes back on vague answers until you have named one real person, written one real offer, and sent one real outreach — tracked by the software, not your willpower. It cannot move your Stripe line until those three things exist.",
    icon: <Target className="h-5 w-5" />,
  },
  {
    question: "When does it work?",
    answer:
      "60 days. The playbook walks you through seven steps, one per week. Day 60 is also the moment the guarantee fires — if you did the work (Steps 1–5 done in-product, 20 outreach actions logged) and Stripe still shows zero, the refund code runs. No support ticket.",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    question: "Where does it happen?",
    answer:
      "Inside the software. The outreach happens inside the tool — tracked, timestamped, connected to your own Stripe account. This is not a notion template. It is a web app that removes the avoidance option.",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    question: "Why should you listen?",
    answer:
      "Because I shipped 12 products that nobody paid for, spent a year believing traffic was the fix, and only broke the pattern when I sat down with ten other founders and heard my own story back. I am not a guru who succeeded first try. I am the founder who failed long enough to learn which order the work goes in.",
    icon: <Lightbulb className="h-5 w-5" />,
  },
];

import { cacheLife } from "next/cache";

export async function SecretFormula() {
  "use cache";
  cacheLife("days");
  return (
    <section
      aria-labelledby="secret-formula-heading"
      className="py-14 sm:py-20 px-4 sm:px-6"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            DotCom Secrets Chapter 2 — The Secret Formula
          </p>
          <h2
            id="secret-formula-heading"
            className="text-2xl sm:text-3xl font-bold leading-tight text-balance"
          >
            Five questions. If you accept all five answers, the price stops
            mattering.
          </h2>
          <p className="text-sm text-muted-foreground italic leading-relaxed mt-3 max-w-xl mx-auto">
            Brunson&apos;s rule: a page that answers all five in the first 3
            seconds converts. A page that&apos;s missing even one leaks buyers.
          </p>
        </div>

        <div className="space-y-4">
          {FORMULA.map((item) => (
            <Card key={item.question} className="border-border/80">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary mt-0.5">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {item.question}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic text-center mt-8 max-w-lg mx-auto leading-relaxed">
          Every answer above is something I learned the hard way. None of it
          came from a course — it came from Stripe showing me I was wrong.
        </p>
      </div>
    </section>
  );
}
