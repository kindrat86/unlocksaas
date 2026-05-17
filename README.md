# Unlock SaaS

A micro-SaaS for post-launch pre-revenue founders. The tool refuses to let you skip the work that actually gets you paid.

**Domain:** unlocksaas.com
**Status:** Strategy locked. Build phase next.

## Start here

If you are the **operator** (Maryan) and you want to start building:

1. Open this folder in Claude Code.
2. Open `strategy/BUILD-PROMPT-CLAUDE-CODE.md`.
3. Copy the prompt block between the horizontal rules.
4. Paste it into a fresh Claude Code session.
5. Hit enter.

Claude Code will read the strategy folder, scaffold the project, and begin Sprint 1 (Funnel Hub + $1 Starter funnel).

If you are an **AI session** resuming this project: read `00-RESUME-HERE.md` first, then `strategy/state.json`, then the 10 workbook files in `strategy/workbooks/` in numeric order. Load the `brunson-architect` skill for any further strategic work.

## What is in this folder

```
unlocksaas/
├── README.md                         (this file)
├── 00-RESUME-HERE.md                 (strategic resume for AI sessions)
├── projects.json                     (project registry, can stay or be cleaned)
├── strategy/                         (all Brunson workbook assets, locked)
│   ├── state.json                    (playbook-readable: every locked decision)
│   ├── BUILD-PROMPT-CLAUDE-CODE.md   (the prompt you paste into Claude Code)
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
└── (code files added by Claude Code at build time)
```

## The premise, in one paragraph

Founders who shipped a real product with Lovable and Claude have a flat Stripe line. They are stuck, not broke. They have been told the answer is more traffic, more features, or a better course. None of those produce the first paying customer. The work that does is the work nobody taught them: name one real person, write one real promise, send one real message. Unlock SaaS is the playbook that runs that work and verifies every step in Stripe. The promise: first paying customer in 60 days, or you do not pay.

## Tech stack

Next.js 14, Supabase, Stripe, Anthropic Claude API, Resend, Vercel. Domain at Namecheap pointing DNS to Vercel.

## License

Private. All rights reserved.
