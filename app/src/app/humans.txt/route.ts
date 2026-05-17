import { NextResponse } from "next/server";
import { FOUNDER, ORGANIZATION, BASE_URL } from "@/lib/seo/entity";

/**
 * /humans.txt — humanstxt.org convention.
 *
 * Tiny convention page that names the humans behind the site. Most
 * crawlers ignore it; some indie aggregators (humans.txt directory,
 * a few link-curation sites) treat its presence as a small trust
 * signal. The cost of shipping it is one route handler.
 *
 * Brunson Hard-Rule reconciliation: every name and credit below
 * corresponds to a real, present, attributable participant in this
 * project. No invented team, no aspirational "Head of Growth"
 * placeholder. If the only human is the founder, the only human
 * listed is the founder.
 */

export const dynamic = "force-static";

export function GET() {
  const body = [
    `/* TEAM */`,
    ``,
    `${FOUNDER.jobTitle}: ${FOUNDER.name}`,
    `Contact: ${FOUNDER.email}`,
    `From: EU`,
    ``,
    `/* THANKS */`,
    ``,
    `Russell Brunson — for the trilogy that shaped every page on this site.`,
    `The indie SaaS community on Indie Hackers and Hacker News — for the verbatim`,
    `objections we mined for /faq.`,
    ``,
    `/* SITE */`,
    ``,
    `Name: ${ORGANIZATION.name}`,
    `Founded: ${ORGANIZATION.foundingDate}`,
    `Slogan: ${ORGANIZATION.slogan}`,
    `URL: ${BASE_URL}`,
    `Built with: Next.js, React, Tailwind, shadcn/ui, Geist, Stripe, Supabase,`,
    `             Resend, Vercel, PostHog — and an honest amount of Claude Code.`,
    `Last updated: 2026-05-17`,
    ``,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
