import { cacheLife } from "next/cache";
import Link from "next/link";

/**
 * ExploreResources — internal linking hub for SEO PageRank distribution.
 *
 * Extracted from page.tsx for code-splitting (page-weight optimization).
 * Originally added 2026-07-06 audit. Funnel-demoted 2026-07-14: rendered
 * BELOW the Final CTA, collapsed by default in a <details> block so the
 * 20+ exit links don't interrupt the persuasion arc.
 */
export async function ExploreResources() {
  "use cache";
  cacheLife("days");

  const categories = [
    {
      title: "Learn the framework",
      links: [
        { href: "/glossary", label: "SaaS Marketing Glossary", desc: "Every term defined" },
        { href: "/benchmarks", label: "SaaS Benchmarks", desc: "Real metrics from real SaaS" },
        { href: "/funnel-teardown", label: "Funnel Teardowns", desc: "How indie SaaS funnels work" },
        { href: "/case-studies", label: "First-Customer Stories", desc: "How founders got to $1" },
      ],
    },
    {
      title: "Compare tools",
      links: [
        { href: "/alternatives-to", label: "SaaS Alternatives", desc: "Honest tool comparisons" },
        { href: "/compare", label: "Head-to-Head", desc: "A vs B breakdowns" },
        { href: "/pricing-teardown", label: "Pricing Teardowns", desc: "How SaaS prices itself" },
        { href: "/vs", label: "Versus", desc: "Direct competitor analysis" },
      ],
    },
    {
      title: "Free tools",
      links: [
        { href: "/tools", label: "SaaS Calculators", desc: "5 free calculators, no email" },
        { href: "/tools/ltv-calculator", label: "LTV Calculator", desc: "Lifetime value" },
        { href: "/tools/churn-cost-calculator", label: "Churn Cost", desc: "What churn really costs" },
        { href: "/tools/revenue-projector", label: "Revenue Projector", desc: "12-month forecast" },
      ],
    },
    {
      title: "Guides & playbooks",
      links: [
        { href: "/how-to", label: "How-To Guides", desc: "Step-by-step founder playbooks" },
        { href: "/mistakes", label: "Common Mistakes", desc: "What kills indie SaaS" },
        { href: "/launch-checklist", label: "Launch Checklists", desc: "Pre-launch, launch, post-launch" },
        { href: "/answers", label: "Founder Q&A", desc: "Real questions, real answers" },
      ],
    },
    {
      title: "Distribution & traffic",
      links: [
        { href: "/who", label: "Who We Serve", desc: "The dream customer avatar" },
        { href: "/dream-100", label: "Dream 100", desc: "27 people to reach in 2026" },
        { href: "/community-atlas", label: "Community Atlas", desc: "18 communities where they hang out" },
        { href: "/hso", label: "HSO Matrix", desc: "8 ready-to-deploy content units" },
        { href: "/ad-library", label: "Ad Creative Library", desc: "9 paid distribution concepts" },
      ],
    },
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-4xl mx-auto">
      <details className="group rounded-lg border border-border bg-card">
        <summary className="cursor-pointer list-none px-5 py-4 text-center [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-semibold text-foreground">
            Explore 200+ free resources
          </span>
          <span className="block text-xs text-muted-foreground mt-1">
            Teardowns, benchmarks, and guides — no email gate, no paywall.
            <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">
              ↓
            </span>
          </span>
        </summary>
        <div className="px-5 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {cat.title}
              </h3>
              <ul className="space-y-2">
                {cat.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link block rounded-lg border border-border bg-card p-3 card-hover hover:border-primary/40 hover:bg-accent/50 hover:shadow-md"
                    >
                      <span className="block text-sm font-medium text-foreground group-hover/link:text-primary transition-colors">
                        {link.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {link.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
