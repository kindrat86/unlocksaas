import { NextRequest, NextResponse } from "next/server";
import { getAnthropic } from "@/lib/anthropic";

const STEP_PROMPTS: Record<string, { validate: string; assemble: string }> = {
  "1": {
    validate: `You are the engine inside "The Machine," a product for post-launch pre-revenue founders.
Your voice: Reluctant Hero — honest, direct, no fluff, no guru energy.

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
Your voice: Reluctant Hero — honest, direct, no fluff, no guru energy.

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
};

export async function POST(req: NextRequest) {
  const { stepId, questionIndex, answer, previousAnswers } = await req.json();

  const stepPrompt = STEP_PROMPTS[stepId];
  if (!stepPrompt) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  const totalQuestions = stepId === "1" ? 5 : 4;
  const isLastQuestion = questionIndex === totalQuestions - 1;

  // Validate the current answer
  const validationResponse = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: stepPrompt.validate,
    messages: [
      {
        role: "user",
        content: `Question ${questionIndex + 1}: The user answered: "${answer}"

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
    // If JSON parsing fails, try to extract from the response
    const jsonMatch = validationText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = { accepted: true, message: "Good. Next." };
    }
  }

  // If rejected, return pushback
  if (!parsed.accepted) {
    return NextResponse.json({
      accepted: false,
      message: parsed.message,
    });
  }

  // If accepted and this is the last question, assemble the output
  if (isLastQuestion) {
    const allAnswers = [...previousAnswers, answer];
    const assemblyResponse = await getAnthropic().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
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

    return NextResponse.json({
      accepted: true,
      message: parsed.message,
      output: outputText,
    });
  }

  // Accepted, not last question
  return NextResponse.json({
    accepted: true,
    message: parsed.message,
  });
}
