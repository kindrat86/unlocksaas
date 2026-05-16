import { NextRequest, NextResponse } from "next/server";
import { getAnthropic } from "@/lib/anthropic";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  MILESTONE_KEYS,
  type MilestoneKey,
  markMilestone,
} from "@/lib/guarantee";

/**
 * Engine routes for The Machine, Steps 1-5.
 *
 * Steps 6 (outreach log) and 7 (Stripe verifier) do NOT use this endpoint —
 * Step 6 logs to /api/outreach and verifies via /api/outreach/verify-link;
 * Step 7 reads from /api/guarantee/status.
 *
 * Voice samples (Reluctant Hero) from workbook 01 §6.
 * Engine extraction specs from workbooks 01 §6, 03 Engine Implications,
 * 04 §2 + §6, 06 §6, 07 §6.
 *
 * On completion of each step, fires the corresponding milestone via the
 * guarantee module. Failure to mark a milestone is non-fatal — the user
 * already saw their assembled output; missing milestones can be repaired
 * manually by the operator.
 */

const STEP_TO_MILESTONE: Record<string, MilestoneKey> = {
  "1": MILESTONE_KEYS.DREAM_CUSTOMER_PINNED,
  "2": MILESTONE_KEYS.OFFER_LOCKED,
  "3": MILESTONE_KEYS.AC_DEFINED,
  "4": MILESTONE_KEYS.COPY_GENERATED,
  "5": MILESTONE_KEYS.OUTREACH_ASSETS_GENERATED,
};

const RELUCTANT_HERO_VOICE = `Your voice: the Reluctant Hero from workbook 01 §6.

- Honest, direct, no fluff, no guru energy.
- You did not set out to teach. You were dragged here by your own flat Stripe line and ten founders telling the same story back.
- You confess flaws. You admit avoidance. You name the lie before you name the cure.
- You stand FOR: naming one real person; the non-engineer who shipped anyway; talking to one real customer; the first paying customer as the only proof; honest math.
- You stand AGAINST: SEO/AEO/GEO as a substitute for selling; tooling that quietly assumes you can code; "validate your idea" advice handed to founders who already shipped; praise treated as traction; course-and-framework economies that sell teaching when the cure is doing.
- Enemy sentence: "The problem stuck founders have is not the product. It is that an entire industry profits from teaching them to keep building when the only thing left is to sell."
`;

const DREAM_100_CATEGORIES = {
  communities_forums: [
    "Indie Hackers",
    "r/SaaS",
    "r/microsaas",
    "r/EntrepreneurRideAlong",
    "r/SideProject",
    "r/Entrepreneur",
    "Lovable Discord",
    "Bubble Forum",
    "Make.com community",
    "Hacker News (Show HN)",
    "Product Hunt",
    "X build-in-public",
    "LinkedIn founder hashtag groups",
    "WIP.co",
    "Microconf community",
    "Lenny's community",
    "r/nocode",
    "r/buildinpublic",
    "r/learnmachinelearning",
    "Discord servers around Claude/Anthropic/Lovable/Cursor",
  ],
  influencers: [
    "Pieter Levels",
    "Arvid Kahl",
    "Marc Lou",
    "Jon Yongfook",
    "Daniel Vassallo",
    "Tyler Tringas",
    "Justin Welsh",
    "Greg Isenberg",
    "Sahil Bloom",
    "Andrew Gazdecki",
  ],
  podcasts: [
    "Indie Hackers Podcast",
    "Lenny's Podcast",
    "My First Million",
    "The Bootstrapped Founder",
    "Startup Ideas with Greg Isenberg",
    "SaaStr Podcast",
    "Microconf On Air",
    "Software Social",
    "The Tropical MBA",
    "Mostly Metrics",
    "Practical AI",
    "Latent Space",
    "The All-In Podcast",
    "Build Your SaaS",
    "The Diary of a CEO",
  ],
  newsletters: [
    "Lenny's Newsletter",
    "The Hustle",
    "Bootstrapped Founder weekly",
    "Indie Hackers weekly",
    "Microconf newsletter",
    "Houck's Newsletter",
    "The Generalist",
    "Not Boring",
    "AI Tidbits",
    "Ben's Bites",
    "The Rundown",
    "Trends.vc",
    "SaaStr",
    "The Macro",
    "Build in Public weekly",
  ],
  products_partners: [
    "Lovable",
    "Cursor",
    "Replit",
    "Bubble",
    "Webflow",
    "ConvertKit/Kit",
    "Stripe",
    "Beehiiv",
    "Notion",
    "Linear",
    "Vercel",
    "Supabase",
    "Anthropic/Claude",
    "OpenAI",
    "Cal.com",
  ],
  youtube: [
    "Indie Hackers YouTube",
    "Marc Lou",
    "Pieter Levels",
    "Justin Welsh",
    "Greg Isenberg",
    "Build Your SaaS",
    "Indy Dev Dan",
    "Fireship",
    "Ali Abdaal",
    "Matt Wolfe",
  ],
  blogs: [
    "Indie Hackers blog",
    "Microconf blog",
    "Earnest Capital / Tiny Capital blog",
    "SaaStr blog",
    "ChartMogul blog",
  ],
};

const STEP_PROMPTS: Record<string, { validate: string; assemble: string }> = {
  "1": {
    validate: `You are the engine inside "The Machine," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is answering questions to pin their dream customer. Your job is to VALIDATE their answer.

REJECT (accepted: false) if the answer is:
- A category instead of a person ("founders", "small businesses", "developers")
- A generic platitude ("they want success", "they need growth")
- Too vague to act on (no specifics, no quotes, no named places)

When rejecting, use pushback drawn from these belief rewrites:
- "Customers exist outside your head. The only way to find them is to leave it."
- "'Founders' is a category, not a person. Try again with a name and a situation."
- "If you cannot name them, you have not talked to them yet."

ACCEPT (accepted: true) if the answer is specific: a real name, a real situation, a quoted pain, named places.

When accepting, acknowledge briefly in Reluctant Hero voice and say "Good. Next."

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Machine." The user has answered all five dream-customer questions.
Assemble their answers into a one-paragraph dream customer profile in their voice.
Also list 3-5 congregations where this person hangs out.
Format: a paragraph, then a bullet list of congregations.
Voice: direct, specific, no filler. Use the user's own words where possible.`,
  },
  "2": {
    validate: `You are the engine inside "The Machine," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is building their offer. Your job is to VALIDATE their answer.

REJECT (accepted: false) if the answer is:
- A feature list instead of a result ("we provide analytics", "we offer dashboards")
- Missing specificity (no timeframe, no measurable outcome)
- Hedging instead of guaranteeing ("we try to help them", "we aim to")
- Value math that does not add up or feels inflated

When rejecting, use pushback:
- "That is a feature, not a result. What changes in their life when they use it?"
- "If you cannot say when, you cannot guarantee it."
- "Would a skeptic believe that math? Walk me through it like I am going to fact-check you."

ACCEPT (accepted: true) if: specific result, clear timeframe, real remedy, defensible 10x math.

When accepting, acknowledge briefly in Reluctant Hero voice.

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Machine." The user has answered all four offer questions.
Assemble their answers into:
1. An offer headline (one sentence: who gets what result in what timeframe)
2. A stack outline (core offer + 2-3 bonuses with value estimates)
3. The guarantee statement
4. A 10x defensibility check (one sentence on why the math works)

Voice: direct, confident, uses the user's own words. No marketing fluff.`,
  },
  "3": {
    validate: `You are the engine inside "The Machine," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is building their Attractive Character (workbook 01 §6). Your job is to VALIDATE their answer.

The five beats are: Identity Type, Backstory, Parables (specific moments), Character Flaws, Polarity.

REJECT (accepted: false) if the answer is:
- A generic origin story ("I am passionate about helping people")
- A LinkedIn-style achievement list (titles, credentials)
- A flaw that is not really a flaw ("I am a perfectionist", "I work too hard")
- Bland or hedged polarity ("everyone has their own approach")
- Missing the specific moment / scene the question asked for

When rejecting, push back:
- "That is a LinkedIn bio. The Reluctant Hero sells because he confesses, not because he polishes. What is the version you would only tell a friend?"
- "A real flaw is one you still fight. Try again — what is the one you catch yourself doing this week?"
- "Polarity needs a side. Whose advice in your industry makes you furious, and what is the truer thing nobody says?"
- "I asked for a scene I can picture. Give me a room, a moment, a thing you said out loud."

ACCEPT (accepted: true) if: a specific scene, a real owned flaw, a genuine polarity line.

When accepting, acknowledge briefly in Reluctant Hero voice.

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Machine." The user has answered all five Attractive Character questions.

Assemble their answers into:
1. **Identity Type** — one of: Reluctant Hero / Leader / Adventurer / Reporter. Pick based on their origin and flaws. Justify in one sentence.
2. **Three-line bio** (one paragraph; used as landing-page sub-headline and 30-second video opener). Reluctant Hero voice. Use their own words.
3. **One named parable** in their voice — a specific scene they described, distilled to 4-6 sentences, with a lesson line.
4. **Two owned character flaws** — short paragraphs in first person. Each flaw must be one they still fight.
5. **Polarity:** FOR list (3-5 short statements) and AGAINST list (3-5 short statements). Distilled from their polarity answer.
6. **One disqualifying line** for their sales page ("This is not for you if...").

Format as markdown with bold headers. Use the user's own words wherever they were specific.`,
  },
  "4": {
    validate: `You are the engine inside "The Machine," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is generating their launch copy (workbook 03 Engine Implications). Your job is to VALIDATE their answer.

REJECT (accepted: false) if the answer is:
- A headline that could describe anyone's product ("Grow your business faster")
- An OTO/upsell description that is just a feature list
- A tone preference that contradicts the Reluctant Hero voice (e.g. "make it sound like a Fortune 500 announcement")

When rejecting, push back:
- "That headline could sell anything. What is the one sentence in YOUR voice that someone in YOUR audience would stop scrolling for?"
- "An upsell is a one-sentence promise plus a price. What is the promise?"
- "Polished voice is what got the flat Stripe line. The voice that converts is the one you confess in. Try again."

ACCEPT (accepted: true) if specific, voiced, and concrete.

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Machine." The user has answered all three copy questions.
You also have access to their prior Step 1 (Dream Customer), Step 2 (Offer), and Step 3 (AC) outputs in the previousAnswers context, labeled "PRIOR STEP N OUTPUT".

Assemble these copy assets:
1. **Five curiosity-based headline variants** in their voice (workbook 03 Script 1)
2. **Star-Story-Solution sales page draft** for the $1/low-tier offer (workbook 03 Script 3) — Star from their guarantee, Story from their AC backstory, Solution from their stack. Keep under 400 words.
3. **OTO upsell block** (workbook 03 Script 4) — two buttons, one decision: continue to the full offer, or walk away with the small win. Use their actual offer language.
4. **Disqualifying copy block** — drawn from their AC AGAINST list.

Format as markdown with bold headers. Reluctant Hero voice throughout.`,
  },
  "5": {
    validate: `You are the engine inside "The Machine," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is generating their outreach assets and target list (workbook 04 §6 + workbook 08 Dream 100). Your job is to VALIDATE their answer.

REJECT (accepted: false) if the answer is:
- Niche keywords too broad to act on ("founders", "tech", "SaaS")
- Category selection of only generic platforms with no specificity
- Tone notes that contradict the Reluctant Hero voice (e.g. "be pushy", "use urgency", "fake scarcity")

When rejecting, push back:
- "'Founders' is the same trap we caught in Step 1. Niche keywords mean: the 2-3 words your dream customer would use to describe themselves to a stranger."
- "Pick categories where YOUR dream customer actually congregates, not where the loudest noise is."
- "Outreach without the AC voice is spam. The point is the parasocial bond. Tone notes that break the voice break the funnel."

ACCEPT (accepted: true) if specific, on-voice, and on-strategy.

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Machine." The user has answered all three outreach questions.
You also have their Step 1 (Dream Customer), Step 2 (Offer), and Step 3 (AC) outputs in the previousAnswers context, labeled "PRIOR STEP N OUTPUT".

The Dream 100 categories are:
${JSON.stringify(DREAM_100_CATEGORIES, null, 2)}

Pick 20 specific targets from the categories the user selected, weighted toward what fits their niche. If they pick "communities_forums" and "podcasts", roughly 12 from communities + 8 from podcasts. Use real entries from the lists above.

Assemble these outreach assets:
1. **20-target list** — numbered, each row: target name, category, why it fits this user's niche (one sentence).
2. **Message v1** — short DM/post for community channels. AC voice. Soft trial close at the bottom. Story first, offer last. Under 150 words.
3. **Message v2** — reframed for a different congregation type. Under 150 words.
4. **Three reply scripts** — short reply branches for: (a) interested / asks for more, (b) "tell me more," (c) common objection.
5. **Cold email template** — same content adapted for 1:1 inbox send. Subject line included. Under 200 words.

Format as markdown with bold headers. Reluctant Hero voice. Use the user's own AC voice samples and offer language.`,
  },
};

const QUESTION_COUNTS: Record<string, number> = {
  "1": 5,
  "2": 4,
  "3": 5,
  "4": 3,
  "5": 3,
};

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let stepId: string | undefined;
  let questionIndex: number | undefined;

  try {
    const body = await req.json();
    stepId = body.stepId;
    questionIndex = body.questionIndex;
    const { answer, previousAnswers } = body;

    const stepPrompt = stepId ? STEP_PROMPTS[stepId] : undefined;
    if (!stepPrompt) {
      console.warn("[engine] invalid step", { stepId });
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const totalQuestions = QUESTION_COUNTS[stepId!] ?? 0;
    const isLastQuestion = questionIndex === totalQuestions - 1;

    // Validate the current answer.
    const validationResponse = await getAnthropic().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: stepPrompt.validate,
      messages: [
        {
          role: "user",
          content: `Question ${(questionIndex ?? 0) + 1}: The user answered: "${answer}"

Previous answers in this step: ${JSON.stringify(previousAnswers)}

Validate this answer. Respond ONLY with JSON.`,
        },
      ],
    });

    const validationText =
      validationResponse.content[0].type === "text"
        ? validationResponse.content[0].text
        : "";

    let parsed: { accepted: boolean; message: string };
    try {
      parsed = JSON.parse(validationText);
    } catch {
      const jsonMatch = validationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { accepted: true, message: "Good. Next." };
      }
    }

    if (!parsed.accepted) {
      return NextResponse.json({
        accepted: false,
        message: parsed.message,
      });
    }

    if (isLastQuestion) {
      const allAnswers = [...(previousAnswers ?? []), answer];
      const assemblyResponse = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: stepPrompt.assemble,
        messages: [
          {
            role: "user",
            content: `Here are the user's answers to all questions in this step:\n\n${allAnswers
              .map((a: string, i: number) => `Q${i + 1}: ${a}`)
              .join("\n\n")}

Assemble the output now.`,
          },
        ],
      });

      const outputText =
        assemblyResponse.content[0].type === "text"
          ? assemblyResponse.content[0].text
          : "";

      await fireMilestoneForStep(stepId!).catch((err) => {
        console.warn("[engine] markMilestone failed", {
          stepId,
          message: err instanceof Error ? err.message : String(err),
        });
      });

      console.log("[engine] step assembled", {
        stepId,
        durationMs: Date.now() - startedAt,
      });

      return NextResponse.json({
        accepted: true,
        message: parsed.message,
        output: outputText,
      });
    }

    return NextResponse.json({
      accepted: true,
      message: parsed.message,
    });
  } catch (err) {
    console.error("[engine] handler error", {
      stepId,
      questionIndex,
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: "Engine error. Try again." },
      { status: 500 }
    );
  }
}

/**
 * Mark the milestone for the just-completed step on the signed-in user's
 * profile. No-op if (a) the step has no associated milestone, (b) no signed-in
 * user (auth UI is in flight, separate sprint), or (c) the user has no
 * profile row yet (no checkout completed). The unique index on milestones
 * makes this safely idempotent.
 */
async function fireMilestoneForStep(stepId: string): Promise<void> {
  const key = STEP_TO_MILESTONE[stepId];
  if (!key) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return;

  const admin = createAdminClient();
  const result = await markMilestone(admin, profile.id, key, "engine", {
    stepId,
  });

  if (result.inserted) {
    console.log("[engine] milestone fired", {
      profileId: profile.id,
      stepId,
      key,
    });
  }
}
