/**
 * Seinfeld Sequence content pools — JK5-native.
 *
 * Spec: strategy/workbooks/09-fill-your-funnel.md §2 (JK5 publishing plan),
 *       strategy/workbooks/08-your-dream-customer.md §6 (cadence + PS rules),
 *       strategy/workbooks/01-sales-funnel-secrets.md §6 (stories, polarity).
 *
 * Why JK5 here: Brunson's JK5 framework (5 publishing categories rotated
 * across every platform) is the locked publishing plan for Unlock SaaS in
 * workbook 09 §2. The Seinfeld email sequence is one of the platforms that
 * publishing plan governs. The previous design used three per-weekday pools
 * (Stories / Behind-the-Build / Industry Observations) — that covered three
 * of the five JK5 categories and silently dropped Polarity and Proof.
 *
 * This file replaces that with the full JK5 set:
 *
 *   1. PERSONAL  — Reluctant Hero confession; founder's lived experience
 *   2. PROCESS   — The Playbook deconstructed; mechanical, no fluff
 *   3. PATTERN   — Cohort observations from the 10+ founder conversations
 *   4. POLARITY  — AGAINST lines from workbook 01 §6 Beat 5; sharp, opinionated
 *   5. PROOF     — Real wins when they exist; honest, never fabricated
 *
 * Rotation (JK5 round-robin per send, not per weekday):
 *   send N → category (N mod 5), item (floor(N / 5) mod pool.length)
 *
 *   send 0 → PERSONAL[0]
 *   send 1 → PROCESS[0]
 *   send 2 → PATTERN[0]
 *   send 3 → POLARITY[0]
 *   send 4 → PROOF[0]
 *   send 5 → PERSONAL[1]
 *   ...
 *
 * The 3x/week cadence (Mon/Wed/Fri UTC) is preserved by the schedule layer.
 * The JK5 rotation drifts naturally across weeks (5 categories ÷ 3 sends
 * doesn't divide evenly), which gives the subscriber visible variety inside
 * any 7-day window without the rotation feeling mechanical.
 *
 * Content quantity at the moment of writing:
 *   PERSONAL  : 5 items
 *   PROCESS   : 5 items
 *   PATTERN   : 5 items
 *   POLARITY  : 6 items
 *   PROOF     : 5 items
 *   TOTAL     : 26 unique sends × ~3 sends/week ≈ 9 weeks before any repeat.
 *
 * Adding a new item to any pool extends the rotation with zero migration:
 * `current_index` on the subscriber row is taken modulo the pool length at
 * dispatch time.
 *
 * Voice rules (workbook 01 §6, workbook 05 §7):
 *   - Reluctant Hero, signed "— Maryan".
 *   - Story first. Soft offer in the PS only.
 *   - One lesson per email. No multi-topic dumps.
 *   - Polarity items name the enemy explicitly; they do NOT name people.
 *   - Proof items refuse to fabricate numbers. When there is no win yet,
 *     the item is honest about what proof will look like when it lands.
 *
 * PS-line policy (workbook 08 §6): every Seinfeld email ends with a single
 * line linking either the Free Diagnostic OR the $1 Starter, alternating
 * across the subscriber's lifetime. That alternation is handled by the
 * renderer based on sends_count parity — content items here do NOT include
 * the PS line.
 */

export type Jk5Category =
  | "personal"
  | "process"
  | "pattern"
  | "polarity"
  | "proof";

/**
 * Legacy kind label kept for back-compat with analytics dashboards built
 * against the pre-JK5 schema. Maps each JK5 category to its closest old-
 * world label so historical Resend tags stay queryable.
 */
export type ContentKind =
  | "story"
  | "behind_the_build"
  | "industry_observation"
  | "polarity"
  | "proof";

const KIND_FOR_JK5: Record<Jk5Category, ContentKind> = {
  personal: "story",
  process: "behind_the_build",
  pattern: "industry_observation",
  polarity: "polarity",
  proof: "proof",
};

export interface SeinfeldItem {
  /** Stable slug for analytics tagging. Never change once published. */
  id: string;
  /** JK5 category this item publishes from (workbook 09 §2). */
  jk5: Jk5Category;
  /** Legacy label for Resend analytics back-compat. Derived from `jk5`. */
  kind: ContentKind;
  subject: string;
  /** Body paragraphs. Renderer wraps them in HTML and joins for plaintext. */
  paragraphs: string[];
}

function item(
  id: string,
  jk5: Jk5Category,
  subject: string,
  paragraphs: string[],
): SeinfeldItem {
  return { id, jk5, kind: KIND_FOR_JK5[jk5], subject, paragraphs };
}

// ── PERSONAL (JK5 category 1) ──────────────────────────────────────────────
// Reluctant Hero confession. Drawn from workbook 01 §6 Beat 3 (the five
// named stories). Seinfeld-era frame: "I keep coming back to this..."
export const PERSONAL: SeinfeldItem[] = [
  item(
    "personal-blank-offer-page-revisit",
    "personal",
    "Forty minutes in front of a blank doc.",
    [
      "I keep coming back to this one. Maybe because I still catch myself doing the avoidant version of it.",
      "There was a night, around month nine of the flat Stripe line, where I sat down to write the offer for the product I was building. Not the feature list. Not the roadmap. The offer. One sentence, addressed to one real person.",
      "I stared at the blank doc for forty minutes and produced nothing.",
      "What I noticed afterwards was the relief I felt when I closed it and went back to building. The blank doc had asked me a question I did not want to answer. Building did not ask me anything.",
      "That is the shape of the problem. It is not laziness. It is that the actual work is uncomfortable in a specific way, and almost any other founder task offers an honourable-looking escape from it.",
      "If you have a blank offer doc somewhere on your playbook right now, you are not behind. You are normal. The question is whether you open it tomorrow morning before you open the editor.",
    ],
  ),
  item(
    "personal-stripe-refresh-revisit",
    "personal",
    "The most expensive habit of my last two years.",
    [
      "Day job done. Dinner done. Laptop open. Refresh Stripe. Same number.",
      "That ritual cost me more than any tool subscription or course I bought in 2024 or 2025. It was the daily proof I gave myself that I was working on the business, when in fact I was performing the shape of working on the business.",
      "The thing that broke it was not motivation. It was someone else describing their own version of it back to me, and the small cold recognition that I was doing the same thing.",
      "I think a lot about why that worked when nothing else had. My best guess: the refresh ritual feels private, so it never enters language. Once it enters language, it loses most of its power.",
      "If you have a ritual like that — pick yours, you know what it is — try saying it out loud to one other founder this week. Not as a confession. As a description. Watch what happens to it.",
    ],
  ),
  item(
    "personal-seo-escape-hatch",
    "personal",
    "The year I got embarrassingly good at SEO.",
    [
      "When the line stayed flat, I did not panic. I went deeper.",
      "I learned SEO. Then AEO. Then GEO. I could have taught a class on any of the three. I shipped technical pages, schema markup, semantic clusters, the whole thing.",
      "The line stayed flat.",
      "The truth I would not say out loud was simple. Learning more about traffic was not solving my problem. It was a respectable way of never looking at it.",
      "Productive work is the best-camouflaged form of avoidance, because nobody — including you — can call you out for it. You are visibly busy. You are visibly learning. You have a notion doc with frameworks in it.",
      "The cure is not less learning. It is naming, every week, which uncomfortable specific thing you are using the productive work to dodge. Mine that month was: I had not yet written to a single human and asked them to buy.",
    ],
  ),
  item(
    "personal-mirror-in-ten-founders-revisit",
    "personal",
    "I keep replaying that walk around the room.",
    [
      "Halfway through call six in a stretch of founder conversations, I had to mute, get up, and walk around the room.",
      "He was telling me about his flat Stripe line. His shelf of half-built products. His frantic faith that the next launch would be the one. A small cold voice said: that is you. He is describing you.",
      "I have replayed that moment a lot. Two things matter about it.",
      "First, no framework I had read landed until I heard it in someone else's mouth. The mirror effect is not optional. It is structurally required.",
      "Second, I almost did not have those calls. They felt like a detour from real work. I now think they were the only real work I did that quarter.",
      "If you have not talked to ten other post-launch pre-revenue founders this month, you are working on the wrong problem. Not because you are lazy. Because the input you actually need is not on the internet — it is in someone else's voice.",
    ],
  ),
  item(
    "personal-door-that-opened-revisit",
    "personal",
    "The strangest position a non-engineer can be in.",
    [
      "For most of my life, building software was a door that stayed closed. I made peace with being the one with ideas, not the one who shipped them.",
      "Then it was 2026. Lovable and Claude opened the door. I shipped real products in weeks.",
      "What I did not expect: the strangest position to be in is right after the door opens. The hardest part of building is suddenly behind you. The hard part of selling is now in front of you. And the entire industry that teaches the rest of the journey speaks a language that quietly assumes you can code.",
      "Every funnel guru I read in those first months had the same blind spot. Their examples were always 'here is how I A/B-tested the pricing page with my engineer.' I did not have an engineer. I had Claude and a deadline.",
      "If you are in that position right now — non-engineer, already shipped, now stuck — the discomfort you are feeling is not a personal failure. It is a structural gap in the available teaching. There is no playbook for you yet, because most of the playbook writers came up before the door opened.",
    ],
  ),
];

// ── PROCESS (JK5 category 2) ───────────────────────────────────────────────
// The Playbook deconstructed one step at a time. Mechanical voice, no fluff.
export const PROCESS: SeinfeldItem[] = [
  item(
    "process-playbook-step5-outreach-engine",
    "process",
    "The hardest step in the Playbook, and why.",
    [
      "Quick update on the build.",
      "Step 5 of the Playbook is the outreach engine — the thing that takes your locked dream-customer profile and produces a real 20-target list, with a message tailored to each, drawn from the Dream 100.",
      "It is the hardest step. Not because the code is hard. Because the temptation to make it auto-post to social platforms is enormous, and that is the wrong design.",
      "Auto-posting violates platform ToS. It gets accounts banned. And — this matters more — it removes the founder from the moment that builds the muscle. The whole point of the Playbook is to walk you through the work you have been avoiding, not to do it for you.",
      "So Step 5 generates the asset, hands it to you, and verifies the public link after you post it from your own account. The verification is what the guarantee counts. The posting is what builds the founder.",
      "It took three rewrites to land on that division of labour. The first two designs did too much for the user. They felt like magic and trained no muscle. This one is uncomfortable in the right way.",
    ],
  ),
  item(
    "process-60-day-clock-mechanics",
    "process",
    "Why the 60-day clock is visible in the app header.",
    [
      "Design note on the Playbook.",
      "The 60-day guarantee clock is visible in the app header from the moment you start. Not hidden in a settings page. Not buried in the receipt. In the header.",
      "I argued with myself for a week about this. The conventional wisdom is to hide the clock — visible countdowns supposedly stress people out, hurt retention, and so on.",
      "I decided the opposite. The clock is a feature of the offer, not a side effect of it. If I am promising you a verified first paying customer in 60 days or your money back, you should see the time you have left every time you open the app. That visibility is the offer working as intended.",
      "It also disciplines me. I cannot quietly ship product changes that slow down the path to first revenue. The clock is watching me too.",
      "If you have made a similar choice in your own product — surfacing something the convention says to hide — I would love to hear what it was and how it landed.",
    ],
  ),
  item(
    "process-dream-100-picker",
    "process",
    "What the engine actually does with your Dream 100.",
    [
      "Behind-the-scenes on how Playbook Step 5 picks your 20 outreach targets.",
      "Every user, when they hit Step 5, has a Dream 100 — either the one the Playbook generates by walking them through the six-category prompt, or, for users in my niche, a starter list I seed.",
      "The engine then reads their dream-customer profile from Step 1 and picks the 20 entries most likely to contain that exact person. Not the 20 biggest accounts. The 20 most-overlapped congregations.",
      "Concretely: for a founder selling to designers, the engine ranks designer-heavy communities and individual designers above generic 'startup' newsletters, even if the newsletter has 10x the audience. The picker optimises for density of the dream customer, not raw reach.",
      "I tested this against my own use case last week. The 20 it picked for me were tighter than the 20 I would have picked myself. That was the moment I trusted the framework into the engine pattern — it had genuinely seen something I had missed.",
    ],
  ),
  item(
    "process-engine-pushback-design",
    "process",
    "Why the engine pushes back on vague answers.",
    [
      "Most onboarding flows reward the user for finishing the form quickly. The Playbook does the opposite. When you give a vague answer in Step 1 or Step 2, it pushes back.",
      "Example: ask 'who is your dream customer' and someone types 'founders.' The engine does not move on. It says something like 'Founders is a category, not a person. Try again with a name and a situation.'",
      "I built it this way because the entire problem the Playbook is designed to solve is that the user has been avoiding the precise version of these answers for months. A frictionless form lets them avoid it for one more session, wrapped in the feeling of progress.",
      "The pushback is the product. It is doing the uncomfortable work of refusing to let you escape into category-level answers. That refusal is what produces the locked dream-customer profile that everything downstream depends on.",
      "Some users find this annoying for the first ten seconds. Almost all of them thank me for it by the end of Step 1. It is the closest thing to a co-founder reading over your shoulder that I have figured out how to ship.",
    ],
  ),
  item(
    "process-stripe-only-proof",
    "process",
    "The metric that exists in the app, and the ones that do not.",
    [
      "Architectural decision worth flagging.",
      "The Playbook tracks exactly one outcome metric: did Stripe see a new customer charge on your account that postdates your onboarding date. That is it.",
      "Not signups. Not 'this is awesome' comments. Not waitlist sizes. Not vanity dashboards.",
      "I deliberately did not build an in-app metric panel because the whole avoidance pattern this product treats includes inflating soft metrics into proof. I would have built the very thing that makes the avoidance worse.",
      "What you see in the Playbook instead: how many outreach actions you have logged (a behavioural counter, not an outcome) and whether Stripe has fired yes-or-no for first revenue. The 60-day clock turns green on a yes, runs out on a no, and that is the only verdict the app issues.",
      "It is a strange product in that sense. Most SaaS dashboards are designed to make you feel productive. This one is designed to make you face whether you got paid.",
    ],
  ),
];

// ── PATTERN (JK5 category 3) ───────────────────────────────────────────────
// Cohort observations. Reporter / observer voice. What I see across the 10+
// founder conversations and the broader build-in-public timeline.
export const PATTERN: SeinfeldItem[] = [
  item(
    "pattern-ship-is-not-enough",
    "pattern",
    "Shipping is no longer the moat.",
    [
      "Friday observation.",
      "Five years ago, shipping a working SaaS product over a weekend was a flex. The act itself was scarce. If you shipped, you were ahead of 99% of people who said they would.",
      "Today, shipping is the easy part. The Lovable + Claude + Cursor stack moved the bottleneck. Anyone who can describe a product clearly can ship one in days.",
      "What this changed: the people who used to win on shipping speed are now stuck. Their entire advantage was the build, and the build is no longer scarce. They are post-launch, pre-revenue, and they cannot understand why the line is flat.",
      "What is scarce now: pinning one named customer. Writing one clear promise. Sending the message. The pre-AI bottleneck moved over, and the post-AI bottleneck took its place. It looks like the old work — copy, sales, distribution — and the founders who came up shipping fast are the ones least practised at it.",
      "If you recognise yourself here, you are not unusual. You are part of a cohort. That cohort is the entire reason this company exists.",
    ],
  ),
  item(
    "pattern-traffic-is-not-the-bottleneck",
    "pattern",
    "Why 'more traffic' is the wrong answer ninety percent of the time.",
    [
      "Reading a lot of 'how I grew to X visitors a month' posts this week. Worth saying the quiet part out loud.",
      "For a post-launch pre-revenue founder, traffic is almost never the limiting factor. The math is usually obvious once you draw it: if your sales page converts at 0% on 100 visitors, it will convert at 0% on 10,000 visitors.",
      "I went through the entire SEO / AEO / GEO playbook chasing a traffic answer to what was actually a copy problem. The line stayed flat. More traffic to a page that did not sell anything just gave more people the opportunity to silently leave.",
      "The way to know which side of this you are on: look at your last 30 visitors. If you can name what they each did, you have a copy problem disguised as a traffic problem. If you cannot, you may actually need traffic.",
      "Almost every founder in my cohort is in the first bucket. Including, for the longest time, me.",
    ],
  ),
  item(
    "pattern-comments-versus-charges",
    "pattern",
    "Comments are not customers.",
    [
      "Observation from the timeline this week.",
      "A founder I follow shipped a slick product demo. The comments were ecstatic. 'This is incredible.' 'Take my money.' 'I would absolutely pay for this.'",
      "Three weeks later, the product is live. The comments did not convert. Not one of the 'take my money' commenters typed a card number.",
      "This is not a story about that founder. It is a story about a structural feature of build-in-public: positive social signal is decoupled from purchase intent. Comments are cheap. Charges are not. The two metrics are not even on the same axis.",
      "What I tell myself now: any feedback that does not arrive attached to a card number is information about how my marketing reads, not about whether my offer sells. They are useful in different ways. They are not interchangeable.",
      "If a wall of 'this is awesome' comments has been doing the emotional work of proof for you, that is the work the comments are designed to do — for the commenter, free.",
    ],
  ),
  item(
    "pattern-courses-versus-cures",
    "pattern",
    "When the cure is doing, courses sell the avoidance.",
    [
      "A spicy one this week.",
      "There is a whole genre of course in the founder ecosystem now: 'How to validate your idea.' 'How to find your customer.' 'How to write a sales page.'",
      "The dirty secret of that genre is that most buyers do not finish the course. They get the dopamine of having bought the answer, and then they go back to building.",
      "I have bought several. I finished one. The one I finished did not move the line. What moved the line was talking to ten founders and then writing one specific promise on a one-page sales page. No course required.",
      "I am not against teaching. I am against teaching that gets sold as a substitute for doing. The two are different products with different price tags, and the industry consistently conflates them.",
      "If you are looking at a course or a framework right now and the timeline you are imagining starts with 'first I will learn this, then I will write the offer,' the order is wrong. Write the offer this week, badly, to one named person. Then come back to the course with a real question.",
    ],
  ),
  item(
    "pattern-non-engineer-founder-decade",
    "pattern",
    "The non-engineer founder decade is just starting.",
    [
      "Wide-angle observation.",
      "For the last fifteen years, the path to founding a software company ran through writing code. The 'no-code' movement chipped at that, but most no-code tools still rewarded the founder who could think like an engineer.",
      "What changed in the last eighteen months: the AI build stack does not require engineering thinking. It requires clear specification of what you want. That is a writing skill, a thinking skill, a customer-empathy skill — none of which correlate strongly with being able to code.",
      "The cohort this opens the door to is huge and underserved. People who have spent careers in sales, design, ops, education — who have customer instincts and never had a way to ship — can now ship.",
      "What is missing for that cohort: the second half of the founder playbook. The one about getting paid. Almost no existing teaching meets them where they are, because almost no existing teaching was built for them.",
      "I think the next decade of micro-SaaS belongs to that cohort, and I think the founders who teach into it honestly will do well. That is also the bet behind everything I am building.",
    ],
  ),
];

// ── POLARITY (JK5 category 4) ──────────────────────────────────────────────
// Each item pairs one AGAINST line from workbook 01 §6 Beat 5 with the FOR
// it implies. Sharp, opinionated, but never naming people. The enemy is the
// pattern, not the person.
export const POLARITY: SeinfeldItem[] = [
  item(
    "polarity-seo-as-substitute",
    "polarity",
    "I do not believe SEO is a substitute for selling anything.",
    [
      "Picking one of the things I am openly against.",
      "I do not believe SEO, AEO, or GEO can substitute for a real offer. I believe they are the most respectable form of avoidance available to a stuck founder, and I believe the industry that sells them as a path to revenue knows this.",
      "I spent close to a year inside that avoidance. I learned all three letter-pairs cold. I shipped pages, schema, semantic clusters. The Stripe line did not move because the page I was driving traffic to did not sell anything.",
      "The honest version of the trade-off: SEO compounds well, but only on a page that already converts. Without that page, every visitor SEO sends you is a tax on your future inbox, not a customer in your future revenue.",
      "If you are post-launch pre-revenue and your weekly review is mostly 'I added these technical SEO improvements,' you are not in the wrong career. You are dodging the specific paragraph of work that scares you. Mine was: write one sentence that promises one named person a result.",
      "Write that sentence this week. Then bring it back to your SEO plan and ask: does this page now do the job the traffic is going to expect?",
    ],
  ),
  item(
    "polarity-funnel-tooling-assumes-code",
    "polarity",
    "I do not believe funnel tooling should quietly assume you can code.",
    [
      "Most of the funnel-builder ecosystem grew up before AI changed who could ship.",
      "That ecosystem is good at one kind of founder: someone who can read a docs page, set up a webhook, debug a deploy. Almost every onboarding video assumes the viewer has those reflexes.",
      "For the non-engineer founder who has just shipped a real product through Lovable or Claude or Cursor, that assumption is a barrier hidden inside what is supposedly a no-code tool. You hit it on the third screen, when the tooltip mentions 'configure your DNS' and your stomach drops.",
      "I am against tooling that pretends to serve non-engineers while quietly grading them on engineering reflexes. It is dishonest as positioning, and it produces a high-friction funnel exactly for the cohort it claims to welcome.",
      "What I am for: tools where the framework lives in the engine. The user answers human questions. The tool does the technical work behind the curtain. If you have to learn the tool's metaphors before it does anything for you, the tool is shifting the work back onto you and charging you for it.",
    ],
  ),
  item(
    "polarity-validate-your-idea",
    "polarity",
    "I do not believe 'validate your idea' is the right advice for a founder who already shipped.",
    [
      "There is one piece of standard founder advice that I think actively harms post-launch pre-revenue founders.",
      "'Validate your idea before you build.'",
      "It is good advice for a founder who has not built anything yet. It is the wrong advice — and a small disaster as motivation — for a founder who has already shipped a real product nobody is buying.",
      "When that founder hears 'validate,' they hear 'go back to square one.' They hear that the months of building were wasted. They start a second product instead of selling the first, which is exactly the loop they need to break.",
      "What that founder actually needs is downstream of validation: name one real person in the cohort who would benefit from what you already built, write a promise they can defend in their own head, and sell it. The work is offer construction and outreach, not customer-development theatre.",
      "If you already shipped, your validation question is not 'is this a good idea.' It is 'will this specific person pay this specific price for this specific promise this month.' That question has a different answer and a different cure.",
    ],
  ),
  item(
    "polarity-praise-as-traction",
    "polarity",
    "I do not believe praise is traction.",
    [
      "There is a metric I refuse to track and refuse to celebrate.",
      "Comments. Likes. 'This is amazing.' 'Take my money.' Any signal that arrived without a card number attached.",
      "I do not believe any of it is traction. I believe it is the social-media equivalent of polite small talk, and treating it as proof of anything is one of the most reliable ways to spend a year on a flat Stripe line.",
      "This is not cynicism. The commenters mean it. The reason they do not pay is not that they were lying — it is that the cost of 'take my money' is zero and the cost of taking out their card is real, and a wide gap exists between those two costs that survey research consistently underestimates.",
      "What I am for: counting customers. The number of names attached to charges. Nothing else gets a column in my weekly review. Everything that is not a charge is information about my marketing, not evidence of my market.",
      "If your last three weeks of progress are mostly 'I got great engagement on that post,' you have a data input, not a result. The two are useful in different ways. They are not interchangeable.",
    ],
  ),
  item(
    "polarity-teaching-as-cure",
    "polarity",
    "I do not believe teaching is the cure when doing is.",
    [
      "Sharp one.",
      "There is a whole sub-industry that sells teaching to founders who need to do the thing. Cohort programs. Communities. Workshops. Courses. Frameworks. Some of them are excellent. None of them are a substitute for the doing they describe.",
      "The pattern I see most often: founder spends three weeks inside a program on offer construction, emerges with a clearer mental model, and still cannot answer the specific question 'what one sentence will I say to one specific person to ask them for fifty dollars this month.'",
      "That gap is structural. Teaching is one-to-many; doing is one-to-one with a person you have to find. The teacher is not lying. They simply cannot do the second part for you, because the second part requires your customer and your name and your offer.",
      "What I am for: tools that put you in the doing immediately. Where the framework lives in the engine, the user answers human questions, and the next thing on the screen is the next thing you have to send. Not another module, another lesson, another framework PDF.",
      "If you have been in education-mode for three months and the Stripe line has not moved, the problem is not that you have not learned enough. It is that you have not done enough. There is a difference, and the difference is your next sixty days.",
    ],
  ),
  item(
    "polarity-honest-math",
    "polarity",
    "I would rather have honest small math than exciting fake math.",
    [
      "A confession about copy.",
      "Most of the sales pages I funnel-hacked in my SEO year had inflated value math. 'Total value: $4,997. Today: $49.' Then a stack of bonuses, each priced at numbers nobody had ever paid for them in the wild.",
      "I tried to write that kind of stack for my own page. I could not finish it. Every line I wrote, I could hear my dream customer in my head asking 'who actually pays $497 for that bonus, name them.'",
      "So the page I have today has small math. Real numbers, defensible to a skeptic. Total value $496 if you tally honestly. Your price $49. The ratio is 10.1x, which clears the bar Brunson teaches, and it does so without making me lie to land on it.",
      "I think the inflated stack is short-term effective and long-term corrosive. It converts the credulous and trains the skeptical to disbelieve the entire genre — including pages that are telling the truth.",
      "My dream customer is a skeptic. He has been burned by inflated math before. The page that reaches him is the page that does the math out loud and says where each number came from. That is the page I want to write, even when it makes the headline less exciting.",
    ],
  ),
];

// ── PROOF (JK5 category 5) ─────────────────────────────────────────────────
// Real wins when they exist. Until they do, the items are honest about that
// — they describe what proof will look like when it lands, and refuse to
// fabricate. New customer events APPEND items here over time.
//
// Design rule: every Proof item must survive the test "could a skeptical
// reader screenshot this and call me on it." Numbers must be real or
// labelled as templates. Names appear only with permission.
export const PROOF: SeinfeldItem[] = [
  item(
    "proof-what-this-section-will-look-like",
    "proof",
    "I would rather have an empty proof section than a fake one.",
    [
      "If you read these emails for any length of time, you will eventually see a different kind of email from me. The subject line will be a screenshot.",
      "It will say something like 'X just verified their first paying customer through the Playbook.' It will name the founder (with their permission) and the date Stripe fired the charge.",
      "Until that exists, this category of email looks different. I will not invent it. I will not run testimonials I do not have. I will not write 'one of my users' in a way that implies more users than I have.",
      "That is a deliberate choice. The founder I am writing to has been burned by inflated proof before. He spots it from three sentences away. The only proof that works on him is proof he can verify.",
      "So instead, this email is the proof of the proof rule. When real wins land, you will see them, attributed, with the founder named. When they have not landed yet, you will see me say so. The empty section is itself a feature.",
      "If you want to be one of the screenshots — that is what the Playbook is for.",
    ],
  ),
  item(
    "proof-first-self-charge",
    "proof",
    "The first charge in my Stripe was mine.",
    [
      "An honest beat about my own plumbing.",
      "The first non-test charge in the Unlock SaaS Stripe account was a dollar I sent to myself. I bought my own Starter, finished my own Steps 1 and 2, watched the OTO appear, and clicked through to confirm the subscription path worked end-to-end.",
      "I am telling you this because someone reviewing my numbers a year from now will see that charge in the export and wonder. The answer is: yes, it was me, and it was for the boring reason that I needed to verify the plumbing one more time before sending a real human through it.",
      "This is not proof of validation. A founder paying himself a dollar proves nothing about whether the product converts strangers. I am not going to count it on any sales page.",
      "What it proves: that the checkout works, that the webhook fires, that the OTO surfaces correctly, and that the receipt email lands in the inbox with the right sender name. That is plumbing proof, not market proof. They are different. The first one is necessary; the second one is the whole point.",
      "Real market proof comes later. When it does, you will see it here, named.",
    ],
  ),
  item(
    "proof-verified-builder-badge-mechanic",
    "proof",
    "What a Verified Builder badge actually verifies.",
    [
      "Worth explaining the mechanic so the proof, when it lands, is legible.",
      "When a Playbook user verifies their first paying customer — meaning Stripe shows a charge to a real human, not the user themselves — the app emits a public badge. It lives at a unique URL with the user's slug. It can be shared on X, embedded on their site, posted in their bio.",
      "The badge is auto-generated as an Open Graph image, so when they paste it into a tweet, the preview unfolds with their name, the product they sell, the date of the first verified charge, and a link back to a public page that explains the criteria.",
      "What the badge verifies: a Stripe-confirmed customer charge on the user's own account, dated after their Playbook onboarding, attributable to a user who completed the in-app outreach milestones the guarantee depends on.",
      "What it does not verify: revenue volume, customer satisfaction, product-market fit. The badge is binary. You got the first customer, or you did not. The Playbook refuses to grade anything in between, because the entire diagnosis was that 'in between' is where founders get stuck for years.",
      "When the first badge lands, the proof email here will link to it. The link will be live. You will be able to click it and see the verification page yourself.",
    ],
  ),
  item(
    "proof-what-i-am-tracking",
    "proof",
    "The metric I check on Monday morning.",
    [
      "Process note that doubles as a proof commitment.",
      "Every Monday, I open three numbers. The number of verified first-paying-customer events in the Playbook database. The number of $49 active subscriptions in Stripe. The number of refunds in the 60-day window.",
      "That is the entire dashboard. I refuse to add a fourth number. The temptation to add 'signups' or 'diagnostic completions' or 'page views' is real every week, and every week I resist it, because the moment I let myself feel productive about those numbers is the moment my own avoidance disease reactivates.",
      "I am telling you this now, in writing, partly so you know what to expect and partly so I have committed publicly to the discipline. If you ever see me publish a milestone post that celebrates a number outside those three, you have permission to remind me of this email.",
      "When the first number — verified first-paying-customer events — moves above zero, the proof emails here change shape. Until then, the empty section is itself the proof. Of the discipline, if nothing else.",
    ],
  ),
  item(
    "proof-template-for-when-the-first-one-lands",
    "proof",
    "The template I am holding back until a real one fits it.",
    [
      "Meta-email about the email I am not sending.",
      "I have a draft template in a Notion doc titled 'first verified customer post.' It has been there for six weeks. I will not publish it until there is a real customer in the variables.",
      "The shape of the email, when it lands, will be: the founder's first name, the product they sell, the date Stripe fired the charge, a screenshot of the verification page, and one paragraph in the founder's own voice — never mine — describing what changed about how they were working in the week before the charge landed.",
      "I am holding it back for the same reason a magician does not show you the gimmick. The first one has to be real. If I rehearse it on fictional examples, the rehearsal will leak into the real one and the readers who matter will smell it.",
      "I am writing this email instead, because I would rather show you the empty stage and the script and let you see the discipline of waiting than fabricate a star.",
      "If you want to be the founder in that template — you know where to start.",
    ],
  ),
];

// ── JK5 rotation ───────────────────────────────────────────────────────────
//
// One canonical ordered list of categories. Send N picks JK5[N mod 5]. Item
// inside that category picks pool[floor(N / 5) mod pool.length]. Adding a
// new item to any pool extends the rotation cleanly; reordering JK5_ORDER
// changes the cadence and is a deliberate, traceable change.

export const JK5_ORDER: readonly Jk5Category[] = [
  "personal",
  "process",
  "pattern",
  "polarity",
  "proof",
] as const;

const POOLS: Record<Jk5Category, SeinfeldItem[]> = {
  personal: PERSONAL,
  process: PROCESS,
  pattern: PATTERN,
  polarity: POLARITY,
  proof: PROOF,
};

export interface PickResult {
  item: SeinfeldItem;
  jk5: Jk5Category;
  /** Position in the global JK5 rotation. Equals sendsCount at call time. */
  rotation_index: number;
}

/**
 * Pick the right Seinfeld item for a given lifetime send count.
 *
 * `sendsCount` is the subscriber's `sends_count` BEFORE this send (i.e. the
 * number of emails they have already received). The very first send for a
 * new subscriber passes 0 and gets PERSONAL[0].
 *
 * No I/O. Deterministic. Same input always returns the same item, which
 * makes the cron idempotent for diagnostic purposes — running the picker
 * against a subscriber row tells you exactly what they will receive next.
 */
export function pickForSend(sendsCount: number): PickResult {
  const n = Math.max(0, Math.floor(sendsCount));
  const jk5 = JK5_ORDER[n % JK5_ORDER.length];
  const pool = POOLS[jk5];
  // Defensive: a deploy that empties a pool should never crash the cron.
  // Returning a synthetic fallback would mask the bug; instead, fall back to
  // the personal pool's first item so the sequence keeps moving while logs
  // surface the missing data.
  if (!pool || pool.length === 0) {
    return {
      item: PERSONAL[0],
      jk5: "personal",
      rotation_index: n,
    };
  }
  const indexWithinCategory = Math.floor(n / JK5_ORDER.length) % pool.length;
  return {
    item: pool[indexWithinCategory],
    jk5,
    rotation_index: n,
  };
}

/**
 * For diagnostics / admin endpoints: total unique sends before the rotation
 * repeats. Equals the LCM-ish "all categories repeat together" length but a
 * subscriber sees a repeat in any single category at floor(this / 5) sends.
 */
export function uniqueRotationLength(): number {
  return JK5_ORDER.reduce((acc, cat) => acc + (POOLS[cat]?.length ?? 0), 0);
}
