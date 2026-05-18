/**
 * /dont-buy-unlock-saas.md — markdown mirror of /dont-buy-unlock-saas.
 *
 * Standalone (not registered in src/lib/seo/markdown.ts SURFACES)
 * because the polarity page is a single editorial unit with its own
 * voice, not a content-registry-driven page. Same pattern as
 * /mcp.md and /dataset/README.md ship with: hand-rolled body that
 * mirrors the rendered HTML section-for-section.
 *
 * Brunson Hard-Rule reconciliation: every line below is also
 * verbatim-rendered on the HTML page. Drift between this markdown
 * and the HTML is a maintenance bug — any disqualifier text edit
 * must update both files in the same PR.
 */

import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";

export const dynamic = "force-static";
export const revalidate = 86400;

const BODY = `# Don't buy Unlock SaaS if these describe you

Five honest reasons the Playbook is the wrong fit. If any of these describe you, close the tab. The founders who get the verified Stripe ping are the ones who can read this whole page without flinching at any of it.

## 1. You're pre-launch

The Playbook starts with an already-shipped product that has a public URL and a Stripe account wired up. Step 1 is pinning a real customer; you can't pin a real customer for a thing that doesn't exist yet. Step 6's escalation logic assumes a live offer page to revise.

If you're still building, leave. Build the product first. Then come back when you have a URL you'd let a stranger read. The diagnostic at /diagnostic refuses to score pre-launch URLs precisely because there's nothing to diagnose yet – that's not a UX accident, it's the discipline.

## 2. You hate writing

Five of the seven Playbook steps produce written output. Step 2 is a one-sentence offer naming the person and the result – the engine pushes back on every vague verb until you replace it. Step 4 is outreach copy. Step 5 is the reply-handling script. Step 7 is the iteration log. There's no skip button on any of them.

If the idea of writing one paragraph that names a real person and a real result reads as homework you'd procrastinate on for a week, the Playbook is the wrong tool. You don't need a system; you need to either hire a writer or pick a different business model. Saying that out loud here saves us both the refund cycle.

## 3. You think Stripe verification is a gimmick

The Playbook's guarantee fires only when Stripe pings the webhook for your first verified payment, not when a customer says "yes I'll buy". Some founders read this as theater – "obviously you'd pay if you got the result". It isn't theater. Most founders who self-report "I've tried customer interviews" stop at praise. Praise is free. A Stripe charge is the only test of the offer that costs the buyer a real thing.

If your read of this guarantee design is "the founder is making it harder than it needs to be on purpose", you'll fight the engine in Step 3 and Step 6. Close the tab. The founders who get the result are the ones who agree, before they sign up, that the only proof that counts is the Stripe ping.

## 4. You want a magic button

The Playbook is not an AI agent that does the outreach for you. It generates the copy, but you send the email. It tracks the reply, but you read it. It surfaces the iteration recommendation, but you decide whether to revise the offer or the audience. Twenty logged outreach actions is the floor before the guarantee can fire. Twenty.

If you came to UnlockSaaS hoping for a fully-automated revenue robot, that product exists elsewhere and it doesn't work, but you'll find versions of it. The Playbook is the opposite tool: a structured forcing-function that puts you in front of the work the product doesn't do for you. If you don't want to be in front of that work, this isn't your tool.

## 5. You already know your customer and your offer

Some readers land here from a search like "$49/mo SaaS playbook" while already knowing exactly who buys their product and exactly what to say to them. They don't need a system to pin a person – they have the name. They don't need help writing an offer – the offer page converts. They need volume, not clarity.

If that's you, you need a paid-ads channel, an SEO content engine, or a partnership pipeline – not the Playbook. Two surfaces on this site that might be the right tool instead: the funnel teardown library at /funnel-teardown (for studying how indie SaaS scale traffic) and the dataset at /dataset (for self-serve analysis of what's working). Don't sign up for the Playbook to scale a known-good offer. The Playbook is for the founders who don't yet know what their offer should say.

## Still here? Good.

If you read all five and none of them rang true, the Playbook is probably for you. Start with the free diagnostic at ${BASE_URL}/diagnostic – paste your live product URL and the engine labels what is actually broken in about ninety seconds.

The long form lives at ${BASE_URL}/playbook-sales. The $1 Starter at ${BASE_URL}/starter is the lowest-stakes way to verify the engine works on your specific product.

Maintained by Maryan. Editorial policy at ${BASE_URL}/editorial-policy.
`;

export function GET() {
  return new NextResponse(BODY, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      link: `<${BASE_URL}/dont-buy-unlock-saas>; rel="canonical"`,
    },
  });
}
