/**
 * Seinfeld Sequence content pools.
 *
 * Spec: strategy/workbooks/08-your-dream-customer.md §6.
 *
 * Three pools, one per weekday in the 3x/week cadence:
 *
 *   Monday    → PARABLES                (rotating, from workbook 01 §6 Beat 3)
 *   Wednesday → BEHIND_THE_BUILD        (rotating, founder-collected over time)
 *   Friday    → INDUSTRY_OBSERVATIONS   (rotating, Reluctant Hero angle on outside news)
 *
 * Each pool is round-robin. The rotation cursor on the subscriber row
 * (current_index) is taken modulo the pool length, so adding new items just
 * extends the pool — no migration needed.
 *
 * Voice rules (workbook 01 §6, workbook 05 §7):
 *   - Reluctant Hero, signed "— Maryan".
 *   - Story first. Soft offer in the PS only.
 *   - One lesson per email. No multi-topic dumps.
 *
 * PS-line policy (workbook 08 §6): every Seinfeld email ends with a single
 * line linking either the Free Diagnostic OR the $1 Starter, alternating
 * across the subscriber's lifetime. That alternation is handled by the
 * renderer based on sends_count parity — content items here do NOT include
 * the PS line.
 *
 * Parable rotation note: Soap Opera Emails 1, 2, 3, 4 used parables #1, #2,
 * #4, #5 respectively. Parable #3 (The SEO Escape Hatch) was not used in
 * Soap Opera. Seinfeld reuses all five with slightly different framings —
 * the subscriber arrives at Seinfeld already knowing the canonical stories,
 * so the framing here is "I keep coming back to this because..." rather than
 * a cold first-tell.
 */

export type ContentKind = "parable" | "behind_the_build" | "industry_observation";

export interface SeinfeldItem {
  /** Stable slug for analytics tagging. Never change once published. */
  id: string;
  kind: ContentKind;
  subject: string;
  /** Body paragraphs. Renderer wraps them in HTML and joins for plaintext. */
  paragraphs: string[];
}

// ── PARABLES (Monday pool) ──────────────────────────────────────────────────
// Reuses the 5 named parables from workbook 01 §6 Beat 3 with a Seinfeld-era
// frame ("I keep coming back to this..."). New parables append to the array.
export const PARABLES: SeinfeldItem[] = [
  {
    id: "parable-blank-offer-page-revisit",
    kind: "parable",
    subject: "Forty minutes in front of a blank doc.",
    paragraphs: [
      "I keep coming back to this one. Maybe because I still catch myself doing the avoidant version of it.",
      "There was a night, around month nine of the flat Stripe line, where I sat down to write the offer for the product I was building. Not the feature list. Not the roadmap. The offer. One sentence, addressed to one real person.",
      "I stared at the blank doc for forty minutes and produced nothing.",
      "What I noticed afterwards was the relief I felt when I closed it and went back to building. The blank doc had asked me a question I did not want to answer. Building did not ask me anything.",
      "That is the shape of the problem. It is not laziness. It is that the actual work is uncomfortable in a specific way, and almost any other founder task offers an honourable-looking escape from it.",
      "If you have a blank offer doc somewhere on your machine right now, you are not behind. You are normal. The question is whether you open it tomorrow morning before you open the editor.",
    ],
  },
  {
    id: "parable-stripe-refresh-revisit",
    kind: "parable",
    subject: "The most expensive habit of my last two years.",
    paragraphs: [
      "Day job done. Dinner done. Laptop open. Refresh Stripe. Same number.",
      "That ritual cost me more than any tool subscription or course I bought in 2024 or 2025. It was the daily proof I gave myself that I was working on the business, when in fact I was performing the shape of working on the business.",
      "The thing that broke it was not motivation. It was someone else describing their own version of it back to me, and the small cold recognition that I was doing the same thing.",
      "I think a lot about why that worked when nothing else had. My best guess: the refresh ritual feels private, so it never enters language. Once it enters language, it loses most of its power.",
      "If you have a ritual like that — pick yours, you know what it is — try saying it out loud to one other founder this week. Not as a confession. As a description. Watch what happens to it.",
    ],
  },
  {
    id: "parable-seo-escape-hatch",
    kind: "parable",
    subject: "The year I got embarrassingly good at SEO.",
    paragraphs: [
      "When the line stayed flat, I did not panic. I went deeper.",
      "I learned SEO. Then AEO. Then GEO. I could have taught a class on any of the three. I shipped technical pages, schema markup, semantic clusters, the whole thing.",
      "The line stayed flat.",
      "The truth I would not say out loud was simple. Learning more about traffic was not solving my problem. It was a respectable way of never looking at it.",
      "Productive work is the best-camouflaged form of avoidance, because nobody — including you — can call you out for it. You are visibly busy. You are visibly learning. You have a notion doc with frameworks in it.",
      "The cure is not less learning. It is naming, every week, which uncomfortable specific thing you are using the productive work to dodge. Mine that month was: I had not yet written to a single human and asked them to buy.",
    ],
  },
  {
    id: "parable-mirror-in-ten-founders-revisit",
    kind: "parable",
    subject: "I keep replaying that walk around the room.",
    paragraphs: [
      "Halfway through call six in a stretch of founder conversations, I had to mute, get up, and walk around the room.",
      "He was telling me about his flat Stripe line. His shelf of half-built products. His frantic faith that the next launch would be the one. A small cold voice said: that is you. He is describing you.",
      "I have replayed that moment a lot. Two things matter about it.",
      "First, no framework I had read landed until I heard it in someone else's mouth. The mirror effect is not optional. It is structurally required.",
      "Second, I almost did not have those calls. They felt like a detour from real work. I now think they were the only real work I did that quarter.",
      "If you have not talked to ten other post-launch pre-revenue founders this month, you are working on the wrong problem. Not because you are lazy. Because the input you actually need is not on the internet — it is in someone else's voice.",
    ],
  },
  {
    id: "parable-door-that-opened-revisit",
    kind: "parable",
    subject: "The strangest position a non-engineer can be in.",
    paragraphs: [
      "For most of my life, building software was a door that stayed closed. I made peace with being the one with ideas, not the one who shipped them.",
      "Then it was 2026. Lovable and Claude opened the door. I shipped real products in weeks.",
      "What I did not expect: the strangest position to be in is right after the door opens. The hardest part of building is suddenly behind you. The hard part of selling is now in front of you. And the entire industry that teaches the rest of the journey speaks a language that quietly assumes you can code.",
      "Every funnel guru I read in those first months had the same blind spot. Their examples were always 'here is how I A/B-tested the pricing page with my engineer.' I did not have an engineer. I had Claude and a deadline.",
      "If you are in that position right now — non-engineer, already shipped, now stuck — the discomfort you are feeling is not a personal failure. It is a structural gap in the available teaching. There is no playbook for you yet, because most of the playbook writers came up before the door opened.",
    ],
  },
];

// ── BEHIND THE BUILD (Wednesday pool) ───────────────────────────────────────
// Founder updates on what's actually being built / shipped / learned.
// Voice: candid, specific, in progress (not "look what I made").
export const BEHIND_THE_BUILD: SeinfeldItem[] = [
  {
    id: "btb-machine-step5-outreach-engine",
    kind: "behind_the_build",
    subject: "The hardest step in the Machine, and why.",
    paragraphs: [
      "Quick update on the build.",
      "Step 5 of the Machine is the outreach engine — the thing that takes your locked dream-customer profile and produces a real 20-target list, with a message tailored to each, drawn from the Dream 100.",
      "It is the hardest step. Not because the code is hard. Because the temptation to make it auto-post to social platforms is enormous, and that is the wrong design.",
      "Auto-posting violates platform ToS. It gets accounts banned. And — this matters more — it removes the founder from the moment that builds the muscle. The whole point of the Machine is to walk you through the work you have been avoiding, not to do it for you.",
      "So Step 5 generates the asset, hands it to you, and verifies the public link after you post it from your own account. The verification is what the guarantee counts. The posting is what builds the founder.",
      "It took three rewrites to land on that division of labour. The first two designs did too much for the user. They felt like magic and trained no muscle. This one is uncomfortable in the right way.",
    ],
  },
  {
    id: "btb-60-day-clock-mechanics",
    kind: "behind_the_build",
    subject: "Why the 60-day clock is visible in the app header.",
    paragraphs: [
      "Design note on the Machine.",
      "The 60-day guarantee clock is visible in the app header from the moment you start. Not hidden in a settings page. Not buried in the receipt. In the header.",
      "I argued with myself for a week about this. The conventional wisdom is to hide the clock — visible countdowns supposedly stress people out, hurt retention, and so on.",
      "I decided the opposite. The clock is a feature of the offer, not a side effect of it. If I am promising you a verified first paying customer in 60 days or your money back, you should see the time you have left every time you open the app. That visibility is the offer working as intended.",
      "It also disciplines me. I cannot quietly ship product changes that slow down the path to first revenue. The clock is watching me too.",
      "If you have made a similar choice in your own product — surfacing something the convention says to hide — I would love to hear what it was and how it landed.",
    ],
  },
  {
    id: "btb-dream-100-picker",
    kind: "behind_the_build",
    subject: "What the engine actually does with your Dream 100.",
    paragraphs: [
      "Behind-the-scenes on how Machine Step 5 picks your 20 outreach targets.",
      "Every user, when they hit Step 5, has a Dream 100 — either the one the Machine generates by walking them through the six-category prompt, or, for users in my niche, a starter list I seed.",
      "The engine then reads their dream-customer profile from Step 1 and picks the 20 entries most likely to contain that exact person. Not the 20 biggest accounts. The 20 most-overlapped congregations.",
      "Concretely: for a founder selling to designers, the engine ranks designer-heavy communities and individual designers above generic 'startup' newsletters, even if the newsletter has 10x the audience. The picker optimises for density of the dream customer, not raw reach.",
      "I tested this against my own use case last week. The 20 it picked for me were tighter than the 20 I would have picked myself. That was the moment I trusted the framework into the engine pattern — it had genuinely seen something I had missed.",
    ],
  },
  {
    id: "btb-engine-pushback-design",
    kind: "behind_the_build",
    subject: "Why the engine pushes back on vague answers.",
    paragraphs: [
      "Most onboarding flows reward the user for finishing the form quickly. The Machine does the opposite. When you give a vague answer in Step 1 or Step 2, it pushes back.",
      "Example: ask 'who is your dream customer' and someone types 'founders.' The engine does not move on. It says something like 'Founders is a category, not a person. Try again with a name and a situation.'",
      "I built it this way because the entire problem the Machine is designed to solve is that the user has been avoiding the precise version of these answers for months. A frictionless form lets them avoid it for one more session, wrapped in the feeling of progress.",
      "The pushback is the product. It is doing the uncomfortable work of refusing to let you escape into category-level answers. That refusal is what produces the locked dream-customer profile that everything downstream depends on.",
      "Some users find this annoying for the first ten seconds. Almost all of them thank me for it by the end of Step 1. It is the closest thing to a co-founder reading over your shoulder that I have figured out how to ship.",
    ],
  },
  {
    id: "btb-stripe-only-proof",
    kind: "behind_the_build",
    subject: "The metric that exists in the app, and the ones that do not.",
    paragraphs: [
      "Architectural decision worth flagging.",
      "The Machine tracks exactly one outcome metric: did Stripe see a new customer charge on your account that postdates your onboarding date. That is it.",
      "Not signups. Not 'this is awesome' comments. Not waitlist sizes. Not vanity dashboards.",
      "I deliberately did not build an in-app metric panel because the whole avoidance pattern this product treats includes inflating soft metrics into proof. I would have built the very thing that makes the avoidance worse.",
      "What you see in the Machine instead: how many outreach actions you have logged (a behavioural counter, not an outcome) and whether Stripe has fired yes-or-no for first revenue. The 60-day clock turns green on a yes, runs out on a no, and that is the only verdict the app issues.",
      "It is a strange product in that sense. Most SaaS dashboards are designed to make you feel productive. This one is designed to make you face whether you got paid.",
    ],
  },
];

// ── INDUSTRY OBSERVATIONS (Friday pool) ─────────────────────────────────────
// Outside-the-product observations with a Reluctant Hero angle. Topical
// enough to feel current; principled enough to age. New items append.
export const INDUSTRY_OBSERVATIONS: SeinfeldItem[] = [
  {
    id: "obs-ship-is-not-enough",
    kind: "industry_observation",
    subject: "Shipping is no longer the moat.",
    paragraphs: [
      "Friday observation.",
      "Five years ago, shipping a working SaaS product over a weekend was a flex. The act itself was scarce. If you shipped, you were ahead of 99% of people who said they would.",
      "Today, shipping is the easy part. The Lovable + Claude + Cursor stack moved the bottleneck. Anyone who can describe a product clearly can ship one in days.",
      "What this changed: the people who used to win on shipping speed are now stuck. Their entire advantage was the build, and the build is no longer scarce. They are post-launch, pre-revenue, and they cannot understand why the line is flat.",
      "What is scarce now: pinning one named customer. Writing one clear promise. Sending the message. The pre-AI bottleneck moved over, and the post-AI bottleneck took its place. It looks like the old work — copy, sales, distribution — and the founders who came up shipping fast are the ones least practised at it.",
      "If you recognise yourself here, you are not unusual. You are part of a cohort. That cohort is the entire reason this company exists.",
    ],
  },
  {
    id: "obs-traffic-is-not-the-bottleneck",
    kind: "industry_observation",
    subject: "Why 'more traffic' is the wrong answer ninety percent of the time.",
    paragraphs: [
      "Reading a lot of 'how I grew to X visitors a month' posts this week. Worth saying the quiet part out loud.",
      "For a post-launch pre-revenue founder, traffic is almost never the limiting factor. The math is usually obvious once you draw it: if your sales page converts at 0% on 100 visitors, it will convert at 0% on 10,000 visitors.",
      "I went through the entire SEO / AEO / GEO playbook chasing a traffic answer to what was actually a copy problem. The line stayed flat. More traffic to a page that did not sell anything just gave more people the opportunity to silently leave.",
      "The way to know which side of this you are on: look at your last 30 visitors. If you can name what they each did, you have a copy problem disguised as a traffic problem. If you cannot, you may actually need traffic.",
      "Almost every founder in my cohort is in the first bucket. Including, for the longest time, me.",
    ],
  },
  {
    id: "obs-comments-versus-charges",
    kind: "industry_observation",
    subject: "Comments are not customers.",
    paragraphs: [
      "Observation from the timeline this week.",
      "A founder I follow shipped a slick product demo. The comments were ecstatic. 'This is incredible.' 'Take my money.' 'I would absolutely pay for this.'",
      "Three weeks later, the product is live. The comments did not convert. Not one of the 'take my money' commenters typed a card number.",
      "This is not a story about that founder. It is a story about a structural feature of build-in-public: positive social signal is decoupled from purchase intent. Comments are cheap. Charges are not. The two metrics are not even on the same axis.",
      "What I tell myself now: any feedback that does not arrive attached to a card number is information about how my marketing reads, not about whether my offer sells. They are useful in different ways. They are not interchangeable.",
      "If a wall of 'this is awesome' comments has been doing the emotional work of proof for you, that is the work the comments are designed to do — for the commenter, free.",
    ],
  },
  {
    id: "obs-courses-versus-cures",
    kind: "industry_observation",
    subject: "When the cure is doing, courses sell the avoidance.",
    paragraphs: [
      "A spicy one this week.",
      "There is a whole genre of course in the founder ecosystem now: 'How to validate your idea.' 'How to find your customer.' 'How to write a sales page.'",
      "The dirty secret of that genre is that most buyers do not finish the course. They get the dopamine of having bought the answer, and then they go back to building.",
      "I have bought several. I finished one. The one I finished did not move the line. What moved the line was talking to ten founders and then writing one specific promise on a one-page sales page. No course required.",
      "I am not against teaching. I am against teaching that gets sold as a substitute for doing. The two are different products with different price tags, and the industry consistently conflates them.",
      "If you are looking at a course or a framework right now and the timeline you are imagining starts with 'first I will learn this, then I will write the offer,' the order is wrong. Write the offer this week, badly, to one named person. Then come back to the course with a real question.",
    ],
  },
  {
    id: "obs-non-engineer-founder-decade",
    kind: "industry_observation",
    subject: "The non-engineer founder decade is just starting.",
    paragraphs: [
      "Wide-angle observation.",
      "For the last fifteen years, the path to founding a software company ran through writing code. The 'no-code' movement chipped at that, but most no-code tools still rewarded the founder who could think like an engineer.",
      "What changed in the last eighteen months: the AI build stack does not require engineering thinking. It requires clear specification of what you want. That is a writing skill, a thinking skill, a customer-empathy skill — none of which correlate strongly with being able to code.",
      "The cohort this opens the door to is huge and underserved. People who have spent careers in sales, design, ops, education — who have customer instincts and never had a way to ship — can now ship.",
      "What is missing for that cohort: the second half of the founder playbook. The one about getting paid. Almost no existing teaching meets them where they are, because almost no existing teaching was built for them.",
      "I think the next decade of micro-SaaS belongs to that cohort, and I think the founders who teach into it honestly will do well. That is also the bet behind everything I am building.",
    ],
  },
];

/**
 * Pick the appropriate content pool for a given UTC weekday.
 * Returns null on non-send days (Tue, Thu, Sat, Sun).
 *
 * Send days, per workbook 08 §6:
 *   Mon (1) → PARABLES
 *   Wed (3) → BEHIND_THE_BUILD
 *   Fri (5) → INDUSTRY_OBSERVATIONS
 */
export function poolForWeekday(weekday: number): SeinfeldItem[] | null {
  switch (weekday) {
    case 1:
      return PARABLES;
    case 3:
      return BEHIND_THE_BUILD;
    case 5:
      return INDUSTRY_OBSERVATIONS;
    default:
      return null;
  }
}
