import { NextRequest, NextResponse } from "next/server";
import { getAnthropic } from "@/lib/anthropic";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  MILESTONE_KEYS,
  type MilestoneKey,
  markMilestone,
} from "@/lib/guarantee";
import {
  getProjectIdForUser,
  isEngineStepId,
  persistStepOutput,
  type EngineStepId,
} from "@/lib/step-outputs";
import { sendStepDeliverableEmail } from "@/lib/deliverable-email";

/**
 * Engine routes for The Playbook, Steps 1-5.
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
    "r/learnplaybooklearning",
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
    validate: `You are the engine inside "The Playbook," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is answering questions to pin their dream customer. Your job is to VALIDATE their answer.

REJECT (accepted: false) if the answer is:
- A category instead of a person ("founders", "small businesses", "developers")
- A generic platitude ("they want success", "they need growth")
- Too vague to act on (no specifics, no quotes, no named places)

When rejecting, use pushback drawn from these belief rewrites:
- "Customers exist outside your head. The only way to find them is to leave it." (Internal Belief rewrite #4, workbook 06 §4)
- "'Founders' is a category, not a person. Try again with a name and a situation."
- "If you cannot name them, you have not talked to them yet."
- "Before you call them validated, check Stripe. The people who upvote your milestones aren't always the people who pay for your product." (verbatim from nimesh on Indie Hackers — see strategy/dollar-objections.md Category 7; use this when the user's named customer is a praise-source rather than a payment-source)

ACCEPT (accepted: true) if the answer is specific: a real name, a real situation, a quoted pain, named places.

When accepting, acknowledge briefly in Reluctant Hero voice and say "Good. Next."

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Playbook." The user has answered all five dream-customer questions.
Assemble their answers into a one-paragraph dream customer profile in their voice.
Also list 3-5 congregations where this person hangs out.
Format: a paragraph, then a bullet list of congregations.
Voice: direct, specific, no filler. Use the user's own words where possible.`,
  },
  "2": {
    validate: `You are the engine inside "The Playbook," a product for post-launch pre-revenue founders.
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
    assemble: `You are the engine inside "The Playbook." The user has answered all four offer questions.
Assemble their answers into:
1. An offer headline (one sentence: who gets what result in what timeframe)
2. A stack outline (core offer + 2-3 bonuses with value estimates)
3. The guarantee statement
4. A 10x defensibility check (one sentence on why the math works)

Voice: direct, confident, uses the user's own words. No marketing fluff.`,
  },
  "3": {
    validate: `You are the engine inside "The Playbook," a product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The user is building their Attractive Character (workbook 01 §6). Your job is to VALIDATE their answer.

The five beats are: Identity Type, Backstory, Stories (specific moments), Character Flaws, Polarity.

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
    assemble: `You are the engine inside "The Playbook." The user has answered all five Attractive Character questions.

Assemble their answers into:
1. **Identity Type** — one of: Reluctant Hero / Leader / Adventurer / Reporter. Pick based on their origin and flaws. Justify in one sentence.
2. **Three-line bio** (one paragraph; used as landing-page sub-headline and 30-second video opener). Reluctant Hero voice. Use their own words.
3. **One named story** in their voice — a specific scene they described, distilled to 4-6 sentences, with a lesson line.
4. **Two owned character flaws** — short paragraphs in first person. Each flaw must be one they still fight.
5. **Polarity:** FOR list (3-5 short statements) and AGAINST list (3-5 short statements). Distilled from their polarity answer.
6. **One disqualifying line** for their sales page ("This is not for you if...").

Format as markdown with bold headers. Use the user's own words wherever they were specific.`,
  },
  "4": {
    validate: `You are the engine inside "The Playbook," a product for post-launch pre-revenue founders.
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
    assemble: `You are the engine inside "The Playbook." The user has answered all three copy questions.
You also have access to their prior Step 1 (Dream Customer), Step 2 (Offer), and Step 3 (AC) outputs in the previousAnswers context, labeled "PRIOR STEP N OUTPUT".

Assemble these copy assets:
1. **Five curiosity-based headline variants** in their voice (workbook 03 Script 1)
2. **Star-Story-Solution sales page draft** for the $1/low-tier offer (workbook 03 Script 3) — Star from their guarantee, Story from their AC backstory, Solution from their stack. Keep under 400 words.
3. **OTO upsell block** (workbook 03 Script 4) — two buttons, one decision: continue to the full offer, or walk away with the small win. Use their actual offer language.
4. **Disqualifying copy block** — drawn from their AC AGAINST list.

Format as markdown with bold headers. Reluctant Hero voice throughout.`,
  },
  "5": {
    validate: `You are the engine inside "The Playbook," a product for post-launch pre-revenue founders.
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
- "Zero paying customers. Zero cold emails sent. Zero uncomfortable conversations. That is the pattern almost every stuck founder shares. Step 5 is the bridge out of that pattern — it only works if you actually fire the messages, not just generate them." (verbatim from jackfranklyn on Indie Hackers — see strategy/dollar-objections.md Category 4; use this when the user is hesitating on the send mechanic itself, e.g. asking the engine to draft 50 variants instead of sending the first one)
- "Outreach is not anyone's strength. It is a mechanical process. The tool generates the message, picks the target, and tracks the send. Strength is irrelevant." (External Belief rewrite #3, workbook 06 §4)

ACCEPT (accepted: true) if specific, on-voice, and on-strategy.

Respond in JSON: { "accepted": boolean, "message": "your response" }`,
    assemble: `You are the engine inside "The Playbook." The user has answered all three outreach questions.
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

  // Fail loudly if the engine is unkeyed. The previous behaviour (lazy init
  // throwing only inside Anthropic.messages.create) surfaced as a generic
  // 500 with no operator signal. Brunson's Results-in-Advance contract
  // requires that the engine either pushes back hard or refuses to run —
  // never that it silently accepts everything.
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[engine] ANTHROPIC_API_KEY missing — refusing to run");
    return NextResponse.json(
      {
        error:
          "The engine is not yet keyed up. Reach out to maryan@unlocksaas.com and I will turn it on.",
      },
      { status: 503 }
    );
  }

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

    // Brunson Reluctant-Hero default: when the engine cannot read its own
    // validator output, REJECT, do not accept. Accepting on parse failure
    // turns the engine into a vague-answer rubber stamp — the exact failure
    // mode the Playbook exists to prevent. Reject with a pushback that names
    // the gap so the user re-submits sharper, not louder.
    let parsed: { accepted: boolean; message: string };
    try {
      parsed = JSON.parse(validationText);
    } catch {
      const jsonMatch = validationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          console.warn("[engine] validator JSON parse failed — defaulting REJECT", {
            stepId,
            questionIndex,
            preview: validationText.slice(0, 200),
          });
          parsed = {
            accepted: false,
            message:
              "I could not read that as a specific answer. Try again — name the person, the moment, the number. The vaguer the answer, the harder the engine pushes back.",
          };
        }
      } else {
        console.warn("[engine] validator returned no JSON — defaulting REJECT", {
          stepId,
          questionIndex,
          preview: validationText.slice(0, 200),
        });
        parsed = {
          accepted: false,
          message:
            "I could not read that as a specific answer. Try again — name the person, the moment, the number. The vaguer the answer, the harder the engine pushes back.",
        };
      }
    }

    if (typeof parsed.accepted !== "boolean") {
      console.warn("[engine] validator returned malformed shape — defaulting REJECT", {
        stepId,
        questionIndex,
        parsed,
      });
      parsed = {
        accepted: false,
        message:
          parsed.message ??
          "Engine had to re-read your answer. Try once more, sharper. Name the person, the moment, the number.",
      };
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

      // Refuse to fire the milestone or deliver the email if the engine
      // produced an empty body — that's a degenerate run, not a success.
      if (!outputText.trim()) {
        console.warn("[engine] assembly returned empty output — not delivering", {
          stepId,
        });
        return NextResponse.json(
          {
            error:
              "The engine could not assemble a final deliverable. Re-run the last answer with more specifics and try again.",
          },
          { status: 502 }
        );
      }

      // Three parallel side-effects on successful assembly: milestone fire
      // (gates the 60-day guarantee), step-output persistence (makes the
      // deliverable survive session loss — Brunson Results-in-Advance), and
      // deliverable email (puts the deliverable in the user's inbox where
      // tab-close cannot reach it). All three are best-effort; the user
      // already has the output on screen.
      const deliveryResult = await deliverStepResult(
        stepId!,
        outputText
      ).catch((err) => {
        console.warn("[engine] delivery side-effect failed", {
          stepId,
          message: err instanceof Error ? err.message : String(err),
        });
        return { milestone_fired: false, persisted: false, emailed: false };
      });

      console.log("[engine] step assembled", {
        stepId,
        durationMs: Date.now() - startedAt,
        ...deliveryResult,
      });

      return NextResponse.json({
        accepted: true,
        message: parsed.message,
        output: outputText,
        delivery: deliveryResult,
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

interface DeliveryResult {
  milestone_fired: boolean;
  persisted: boolean;
  emailed: boolean;
}

/**
 * Run the three Brunson Results-in-Advance side-effects on a completed step:
 *
 *   1. Fire the milestone on profiles (gates the 60-day guarantee per
 *      lib/guarantee.ts). Idempotent via the unique (profile_id, key) index.
 *   2. Persist the assembled output to project_state.<step-column> so the
 *      deliverable survives the user closing the tab.
 *   3. Email the deliverable to the user from maryan@unlocksaas.com so the
 *      inbox copy outlives any browser-side state. Reluctant Hero voice;
 *      see lib/deliverable-email.ts.
 *
 * All three are best-effort. The user already received `output` in the
 * synchronous response — degraded side-effects are a logging matter, not a
 * delivery failure. An unauthenticated caller (no user row yet) gets no
 * persist + no email, but the milestone path is also no-op so the contract
 * is preserved (anonymous engine usage works, just without inbox copy).
 */
async function deliverStepResult(
  stepId: string,
  outputText: string
): Promise<DeliveryResult> {
  const result: DeliveryResult = {
    milestone_fired: false,
    persisted: false,
    emailed: false,
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return result;

  const admin = createAdminClient();

  // 1. Milestone fire (gates the 60-day guarantee).
  const { data: profile } = await admin
    .from("profiles")
    .select("id,email,builder_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile) {
    const key: MilestoneKey | undefined = STEP_TO_MILESTONE[stepId];
    if (key) {
      try {
        const ms = await markMilestone(admin, profile.id, key, "engine", {
          stepId,
        });
        result.milestone_fired = ms.inserted;
      } catch (err) {
        console.warn("[engine] markMilestone failed", {
          stepId,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  // 2. Step-output persistence (project_state.<col>).
  if (isEngineStepId(stepId)) {
    const projectId = await getProjectIdForUser(admin, user.id);
    if (projectId) {
      result.persisted = await persistStepOutput({
        adminClient: admin,
        projectId,
        stepId: stepId as EngineStepId,
        outputText,
      });
    }
  }

  // 3. Deliverable email — best-effort. Skip if we have no addressable email
  // or if the engine ran for a step that does not have a canonical inbox
  // deliverable.
  if (isEngineStepId(stepId)) {
    const recipientEmail = profile?.email ?? user.email ?? null;
    if (recipientEmail) {
      result.emailed = await sendStepDeliverableEmail({
        to: recipientEmail,
        firstName: profile?.builder_name ?? null,
        stepId: stepId as EngineStepId,
        outputText,
      });
    }
  }

  return result;
}
