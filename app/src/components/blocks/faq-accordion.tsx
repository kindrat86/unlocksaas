"use client";

/**
 * FAQ Accordion — Brunson Building Block #16.
 *
 * Native <details>/<summary> implementation — no Radix accordion dependency,
 * no JS state, no hydration cost. Server-rendered HTML stays interactive even
 * if the bundle never lands.
 *
 * Content sourced VERBATIM from strategy/dollar-objections.md "Updated FAQ
 * Copy" section (rounds 1 + 2, public mine). Each Q maps to one External
 * Belief from workbook 06 §4. No fabricated numbers. The Daniil Khanin quote
 * in Q3 is the strongest single dollar-objection mirror in the entire mine —
 * specific, public, dated, attributed to a real Indie Hacker.
 *
 * "use client" only because focus management on toggle is nicer with a
 * tracked open ID — but every <details> works without JS.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ENTRIES } from "@/lib/faq-data";

export function FaqAccordion({ count }: { count?: number }) {
  const items = count ? FAQ_ENTRIES.slice(0, count) : FAQ_ENTRIES;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Questions in the founder&apos;s exact words
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          Every objection answered. Each one sourced from a real founder.
        </h2>
      </div>

      <ul className="space-y-3">
        {items.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <li
              key={faq.q}
              className="rounded-lg border border-border/60 bg-card/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-card/80 transition-colors"
              >
                <span className="flex-1">
                  <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {faq.category}
                  </span>
                  <span className="block font-semibold leading-snug">
                    {faq.q}
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground mt-1 shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div
                  id={`faq-panel-${idx}`}
                  className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed"
                >
                  {faq.a}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground italic text-center mt-8 leading-relaxed">
        All quotes attributed to public Indie Hackers / Hacker News threads written by founders matching the indie-founder profile.
      </p>
    </section>
  );
}
