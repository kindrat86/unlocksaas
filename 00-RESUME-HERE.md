# RESUME HERE: Unlock SaaS

**Project:** Unlock SaaS, a micro-SaaS for post-launch pre-revenue founders.
**Domain:** unlocksaas.com (purchased via Namecheap, 2026-05-16).
**Strategy status:** COMPLETE. All 10 chapters of the Brunson "Unlock the Secrets" workbook done.
**Next phase:** BUILD.
**Last updated:** 2026-05-16.

## Folder layout

```
unlocksaas/                          (project root)
├── README.md                         (dev-facing orientation)
├── 00-RESUME-HERE.md                 (this file: strategic resume for AI sessions)
├── projects.json                     (project registry)
├── strategy/                         (all Brunson assets, locked)
│   ├── state.json                    (machine-readable record of every locked decision)
│   ├── BUILD-PROMPT-CLAUDE-CODE.md   (the prompt to paste into Claude Code)
│   └── workbooks/
│       ├── 01-sales-funnel-secrets.md
│       ├── 02-funnels-value-ladder.md
│       ├── 03-funnel-scripts.md
│       ├── 04-building-your-funnels.md
│       ├── 05-creating-your-movement.md
│       ├── 06-creating-belief.md
│       ├── 07-10x-secrets-one-to-many.md
│       ├── 08-your-dream-customer.md
│       ├── 09-fill-your-funnel.md
│       └── 10-growth-hacking.md
└── (code will be added by Claude Code at root)
```

## How to resume (AI session)

Load the **brunson-architect** skill, read `strategy/state.json` (every locked decision is there), then skim the 10 workbook files in numeric order. Memory of this project lives in these files, not in any single conversation.

## How to start building (developer / operator)

Open this folder in Claude Code. Paste the prompt block from `strategy/BUILD-PROMPT-CLAUDE-CODE.md`. Claude Code reads the 10 workbooks and starts the first sprint.

## The locked decisions, in brief

- **Dream customer:** Marco, 36, non-engineer, post-launch pre-revenue, flat Stripe line. Core false belief: "the problem is the product." Marco is the founder himself.
- **Offer:** Marco gets his first paying customer, verified by Stripe, within 60 days, or full refund. Price $49/mo. Core product is **The Machine**, a 7-step system.
- **Value ladder:** free diagnostic, then $1 one-time Starter (Machine Steps 1+2), then $49/mo core (Machine Steps 3-7 + guarantee).
- **Attractive Character:** Reluctant Hero. Three backstory lengths. Five named parables. Four flaws. Polarity with enemy sentence.
- **Movement:** Manifesto locked. Identity: **Verified Builders** (canonical / SSR default, LOCKED 2026-05-17). 50/50 A/B against "Paid Builders" is LIVE in production code (cookies + beacons + Stripe-metadata attribution shipped; awaiting Vercel deploy for first exposures). Future-based cause: "founders who build real things with AI deserve to get paid for them."
- **Belief work:** Full Epiphany Bridge (7 elements). Four Core Stories: Vehicle, 4 Internal rewrites with kinda-like bridges, 5 External rewrites, 3 chain breakers.
- **Long-form $49 sales page:** Big Domino written. Three Secrets fully scripted with Story-Strategy-Case Study. Stack slides 16-30. 16 mini-closes in 4 categories. Scarcity deliberately rejected.
- **Dream 100:** ~100 entries across 7 categories. Pending: founder confirms 10 specific Category 2 influencer names.
- **Launch channels:** X + Indie Hackers + r/SaaS + r/microsaas. All others deferred.
- **Growth map:** Three phases, evidence-based not time-based. Phase 2 trigger: 3 verified customer cycles. Phase 3 trigger: 50 paying customers.
- **Design principle:** framework into the engine, not onto the user.

## Founder open items before launch

1. Fill 10 specific Category 2 influencer names in the Dream 100 (entries 31-40 still TBD in workbook 08 and in `dream-100.csv`).
2. Fill `strategy/dollar-objections.md` template from 10+ founder conversations (template ready; conversations are founder-data-bound). This feeds $49 FAQ + disqualifying copy.
3. Post-launch (~200 exposures per variant, after Vercel deploy unblocks): read Verified vs Paid Builders A/B results — SQL query lives in `state.json` `expert_secrets.movement.identity_label.infrastructure.read_query`. The A/B itself is already live in code.

## Tech stack (locked in BUILD-PROMPT)

Next.js 14 + Supabase + Stripe + Anthropic Claude API + Resend, deployed to Vercel.

## If you are an AI session resuming this work

Read in this order: this file, then `strategy/state.json`, then the ten workbook files in numeric order. Load the **brunson-architect** skill. If the operator asks to start building, point them at `strategy/BUILD-PROMPT-CLAUDE-CODE.md`. If they ask for Brunson revisions, enter Revision Mode and update both the relevant workbook file and `state.json`. If they ask for competitive analysis, use the `brunson-funnel-hacker` skill.
