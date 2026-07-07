/**
 * Founder signature footer — Funnel Hacker's Cookbook Swipe 4.
 *
 * The cookbook prescribes a real signature paragraph in Maryan's voice as the
 * last thing the visitor sees that is not a checkout page. Source: Pieter
 * Levels' Nomads.com signature footer.
 *
 * Composition (Brunson Hard-Rule Reluctant Hero):
 *   - Two short paragraphs in first-person, signed "— Maryan"
 *   - Structured link columns (NOT flex-wrap soup) — readable on mobile.
 *   - © line stays at the bottom as the last legal-required word, small.
 *
 * Visual treatment: shadcn tokens only, no script fonts, no special framing.
 * Matches the rest-of-app aesthetic.
 *
 * UX upgrade (2026-07-06): the 23 links were previously a single flex-wrap
 * <p> — unreadable on mobile and no visual hierarchy. Now organized into
 * clear column groups: Company, Resources, Legal. Mobile = stacked accordion-
 * like sections; desktop = 3-column grid.
 */
import Link from "next/link";

const FOOTER_LINKS = {
  company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/press", label: "Press" },
    { href: "/open", label: "The numbers" },
    { href: "/youtube", label: "The Founder's Diary" },
    { href: "/founder-diary", label: "Founder Diary" },
    { href: "/faq", label: "FAQ" },
  ],
  resources: [
    { href: "/glossary", label: "Glossary" },
    { href: "/who", label: "Who we serve" },
    { href: "/dream-100", label: "Dream 100" },
    { href: "/community-atlas", label: "Community Atlas" },
    { href: "/hso", label: "HSO Matrix" },
    { href: "/ad-library", label: "Ad Library" },
    { href: "/editorial-policy", label: "Editorial Policy" },
    { href: "/numbers", label: "The Numbers" },
    { href: "/dont-buy-unlock-saas", label: "Don't buy this" },
    { href: "/builders", label: "Verified Builders" },
    { href: "/bridge", label: "Came from a cold ad?" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
} as const;

function LinkCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignatureFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Founder signature — the personal close. */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
            <p>
              I&apos;m Maryan. I built this because I was that founder – a
              non-engineer who shipped products nobody paid for, and refused
              to look at the flat Stripe line for almost a year.
            </p>
            <p>
              The Playbook is what I wish someone had handed me back then. If you
              take it for a spin, reply to any email and you&apos;ll get me, not
              a support queue.
            </p>
            <p className="text-foreground font-medium">— Maryan</p>
          </div>
        </div>

        {/* Structured link columns — readable on mobile + desktop. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-10">
          <LinkCol title="Company" links={FOOTER_LINKS.company} />
          <LinkCol title="Resources" links={FOOTER_LINKS.resources} />
          <div className="col-span-2 sm:col-span-1">
            <LinkCol title="Legal" links={FOOTER_LINKS.legal} />
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Unlock SaaS. Built by a non-engineer who shipped
            anyway.
          </p>
        </div>
      </div>
    </footer>
  );
}
