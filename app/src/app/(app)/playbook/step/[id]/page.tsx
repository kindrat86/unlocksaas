"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";
import { OutreachLog } from "./outreach-log";
import { ConversionVerifier } from "./conversion-verifier";
import { OfferScorerPanel, PageRewriterPanel } from "./agent-panels";

type Message = {
  role: "engine" | "user";
  content: string;
};

type StepConfig = {
  title: string;
  intro: string;
  questions: string[];
  milestone: string;
  /** Step IDs whose assembled outputs should be sent to the engine as context. */
  needsPriorOutputs?: ("1" | "2" | "3" | "4")[];
  /** Override the default next-step navigation. */
  nextHref?: string;
  nextLabel?: string;
};

const STEP_CONFIG: Record<string, StepConfig> = {
  "1": {
    title: "Pin Your Dream Customer",
    intro:
      "I did not know who my product was for until I sat down and forced myself to name one real person. Not a category. Not a demographic. A human with a name and a situation. This is the hardest step because your brain will fight to stay vague. I will not let it.",
    questions: [
      "Who specifically? Give me a real first name and one sentence of context. Not 'founders' — one person.",
      "What is their biggest pain right now? Quote them if you can. If you cannot quote them, you have not talked to them yet.",
      "What have they already tried that did not work? Be specific — name the tactic, the tool, the advice.",
      "What do they secretly want, the thing they will not say out loud?",
      "Where do they hang out online? Name 3 to 5 specific places — subreddits, Discord servers, communities.",
    ],
    milestone: "Dream Customer Pinned",
  },
  "2": {
    title: "Build Your Offer",
    intro:
      "You have a person. Now you need a promise. Not a feature list. A single result you can guarantee to that specific person. Most founders skip this because writing a guarantee feels terrifying. That terror is the signal you are doing it right.",
    questions: [
      "What is the ONE result you guarantee to this person? One sentence. If you cannot say it in one sentence, it is not clear enough yet.",
      "How fast can you deliver it? Give me a number and a unit — days, weeks, sessions.",
      "What is your remedy if they do not get the result? What happens? What do they get back?",
      "Why is the package you offer worth 10x what you charge? Walk me through the math — what would it cost them to solve this without you?",
    ],
    milestone: "Offer Locked",
  },
  "3": {
    title: "Define Your Attractive Character",
    intro:
      "The voice that sells is the voice you confess in. The Reluctant Hero earns trust by naming the lie before naming the cure. Five questions. You will be tempted to polish your way through these. The engine will catch you doing it and ask again. Honest beats polished here — every time.",
    questions: [
      "Tell me about the moment you stopped being who you were and became someone who could build this. What broke? Give me a scene, not a summary.",
      "What was the hardest stretch of your founder life so far? Give me one specific scene — a room, a day, a thing you said out loud — that captures it.",
      "Give me one specific memory from your founder life that taught you the thing you most want your customer to learn. Set the scene.",
      "Name the flaw you fight hardest. Not 'perfectionism' — a real one you catch yourself doing this week. Avoider, can't code, praise junkie, over-planner, or your own.",
      "What advice in your industry makes you furious, and what is the truer thing nobody is saying? Pick a side.",
    ],
    milestone: "AC Defined",
  },
  "4": {
    title: "Write Your Copy",
    intro:
      "You have the WHO, the WHAT, and the VOICE. Now the engine assembles the launch copy. You answer three questions. The engine writes the headlines, the sales page, the OTO block. You will edit. You will not start from blank.",
    questions: [
      "What is the one sentence about your product that someone in your audience would stop scrolling for? Your gut try — I will sharpen it.",
      "What is the small piece you sell first? The thing someone could pay $1 to $5 for and walk away with a complete small win. Describe it.",
      "Any non-negotiable tone notes? Anything you want me to keep or kill in your voice? If none, say 'use AC voice as-is'.",
    ],
    milestone: "Copy Generated",
    needsPriorOutputs: ["1", "2", "3"],
  },
  "5": {
    title: "Generate Outreach Assets",
    intro:
      "This is the step every founder I know skips. The avoidance disease's home field. The engine removes the option to skip — it picks the 20 targets, writes the messages, and Step 6 tracks every action. Three questions to seed it.",
    questions: [
      "What 2-3 niche keywords describe your dream customer the way they would describe themselves to a stranger? Not 'founders' — be specific.",
      "Pick 3-5 categories where your dream customer actually congregates. Choose from: communities_forums, influencers, podcasts, newsletters, products_partners, youtube, blogs. Just list the ones you pick.",
      "Any tone notes for outreach? If none, say 'use AC voice as-is'. Reject: pushiness, urgency tricks, fake scarcity — those break the funnel.",
    ],
    milestone: "Outreach Assets Generated",
    needsPriorOutputs: ["1", "2", "3"],
    nextHref: "/playbook/step/6",
    nextLabel: "Continue to Step 6: Do Outreach",
  },
  // Steps 6 and 7 use dedicated UI components, not Q&A.
};

export default function PlaybookStepPage() {
  const params = useParams();
  const stepId = params.id as string;

  // Step 6 (Do Outreach) and Step 7 (Convert & Verify) are not guided
  // conversations — they have their own UIs and their own state. Render them
  // directly to avoid mounting the GuidedConversation hooks for steps that
  // do not use them.
  if (stepId === "6") return <OutreachLog />;
  if (stepId === "7") return <ConversionVerifier />;

  return <GuidedConversation stepId={stepId} />;
}

/**
 * Q&A flow for Steps 1-5.
 *
 * Each step has an intro paragraph and 3-5 questions. On each answer the
 * engine validates: if vague it pushes back with Reluctant Hero voice; if
 * specific it accepts and moves on. After the last question the engine
 * assembles a structured output that we persist to localStorage so later
 * steps can read it as context. Server-side, the engine route fires the
 * step's milestone into Supabase via the guarantee module.
 */
function GuidedConversation({ stepId }: { stepId: string }) {
  const router = useRouter();
  const config = STEP_CONFIG[stepId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [output, setOutput] = useState("");
  // True when the assembled output was sent to the user's inbox by the
  // engine route. Drives the "We emailed you a copy" notice on the
  // completion screen.
  const [emailedOnAssembly, setEmailedOnAssembly] = useState(false);
  // True when the output was hydrated from the server on return-visit (vs.
  // freshly assembled this session). Suppresses the "Just emailed" notice
  // on hydration since the email was sent on the original assembly.
  const [hydratedFromServer, setHydratedFromServer] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  // Fire PlaybookStepStarted exactly once when the page mounts with a valid
  // step config. Guarded inside useEffect so it does not fire during SSR or
  // on the locked-step fallback branch.
  useEffect(() => {
    if (!config) return;
    track(Event.PlaybookStepStarted, {
      step_id: stepId,
      step_name: config.title,
    });
  }, [stepId, config]);

  // Hydrate the completion view from the server on mount. If the user
  // finished this step in a previous session, project_state holds the
  // canonical deliverable text and we want to surface it immediately —
  // not force them to re-run the Q&A. Brunson Results-in-Advance: a
  // deliverable that vanishes when the tab closes is not a deliverable.
  // Fall back to localStorage when the server has no record (anonymous
  // or pre-Starter flows).
  useEffect(() => {
    if (!config) return;
    if (stepId === "6" || stepId === "7") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/engine/output?stepId=${encodeURIComponent(stepId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          stepId: string;
          output: { assembled_at: string; output_text: string } | null;
        };
        if (cancelled) return;
        if (data.output?.output_text) {
          setOutput(data.output.output_text);
          setIsComplete(true);
          setHydratedFromServer(true);
          return;
        }
        // Server has nothing — try localStorage as a fallback.
        const cached = window.localStorage.getItem(`playbook.step.${stepId}.output`);
        if (!cancelled && cached) {
          setOutput(cached);
          setIsComplete(true);
          setHydratedFromServer(true);
        }
      } catch {
        // Network or parse failure — silently fall through to the Q&A flow.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config, stepId]);

  // Persist the assembled output for later steps to read as engine context.
  // localStorage is the third tier (server is authoritative, inbox is
  // durable, localStorage is the fast-path read for the same browser).
  useEffect(() => {
    if (isComplete && output && config) {
      try {
        window.localStorage.setItem(`playbook.step.${stepId}.output`, output);
      } catch {
        // Ignore quota / private-mode failures.
      }
    }
  }, [isComplete, output, stepId, config]);

  if (!config) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Step Locked</h1>
        <p className="text-muted-foreground">
          This step unlocks with the $49/mo Playbook. Steps 3 through 7 are where
          the paying customer happens.
        </p>
      </div>
    );
  }

  const progress = isComplete
    ? 100
    : (currentQuestion / config.questions.length) * 100;

  async function handleSubmit() {
    if (!input.trim() || !config) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    track(Event.PlaybookStepAnswerSubmitted, {
      step_id: stepId,
      step_name: config.title,
      question_index: currentQuestion,
    });

    try {
      const answersInThisStep = newMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content);

      const previousAnswers: string[] = [];
      if (config.needsPriorOutputs) {
        for (const priorStep of config.needsPriorOutputs) {
          try {
            const priorOutput = window.localStorage.getItem(
              `playbook.step.${priorStep}.output`
            );
            if (priorOutput) {
              previousAnswers.push(
                `PRIOR STEP ${priorStep} OUTPUT:\n${priorOutput}`
              );
            }
          } catch {
            // Ignore localStorage failures.
          }
        }
      }
      // Prior answers from this step (excluding the one just submitted).
      previousAnswers.push(...answersInThisStep.slice(0, -1));

      const res = await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          questionIndex: currentQuestion,
          answer: input.trim(),
          previousAnswers,
        }),
      });

      const data = await res.json();

      if (data.accepted) {
        const nextQ = currentQuestion + 1;
        if (nextQ >= config.questions.length) {
          setMessages([
            ...newMessages,
            { role: "engine", content: data.message },
          ]);
          setOutput(data.output || "");
          setIsComplete(true);
          setHydratedFromServer(false);
          // Engine route sets delivery.emailed true when the inbox copy
          // was sent (signed-in user + RESEND_API_KEY present). Drives the
          // "Just emailed" notice on the completion screen.
          setEmailedOnAssembly(Boolean(data.delivery?.emailed));
          track(Event.PlaybookStepCompleted, {
            step_id: stepId,
            step_name: config.title,
          });
          track(Event.MilestoneEarned, {
            step_id: stepId,
            milestone_name: config.milestone,
          });
        } else {
          setMessages([
            ...newMessages,
            { role: "engine", content: data.message },
          ]);
          setCurrentQuestion(nextQ);
        }
      } else {
        // Pushback — answer was vague. Useful signal for brunson-funnel-metrics:
        // which question triggers the most pushback tells us where the engine
        // is doing real work.
        track(Event.PlaybookEnginePushback, {
          step_id: stepId,
          step_name: config.title,
          question_index: currentQuestion,
        });
        setMessages([
          ...newMessages,
          { role: "engine", content: data.message },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "engine",
          content: "Something went wrong. Try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendEmail() {
    if (!config) return;
    setResendStatus("sending");
    try {
      const res = await fetch("/api/engine/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId }),
      });
      if (res.ok) {
        setResendStatus("sent");
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    }
  }

  function handleDownload() {
    if (!config || !output) return;
    // Build a self-contained text file: title, divider, deliverable, then
    // a short Reluctant Hero footer naming this as the Brunson
    // Results-in-Advance keepable from the $1 Starter.
    const filename = `unlocksaas-step-${stepId}-${config.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}.txt`;

    const body = [
      `Your ${config.title}`,
      `Generated by UnlockSaaS — The Playbook, Step ${stepId} of 7`,
      `${new Date().toISOString().slice(0, 10)}`,
      ``,
      `---`,
      ``,
      output.trim(),
      ``,
      `---`,
      ``,
      `This is yours to keep. Refer to it the next time you write a line of`,
      `copy, send a DM, or argue with yourself about whether the product is`,
      `the problem. The line of writing the engine just produced is the line`,
      `that names the actual gap.`,
      ``,
      `— Maryan`,
      `maryan@unlocksaas.com`,
      ``,
    ].join("\n");

    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function renderCompletionNav() {
    if (!config) return null;

    if (stepId === "1") {
      return (
        <Button onClick={() => router.push("/playbook/step/2")}>
          Continue to Step 2: Build Your Offer
        </Button>
      );
    }
    if (stepId === "2") {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You are done with the Starter. Your WHO and WHAT are finished.
          </p>
          <Button variant="secondary" asChild>
            <a href="/oto">
              Unlock the full Playbook — $49/mo, 60-day guarantee
            </a>
          </Button>
        </div>
      );
    }
    if (config.nextHref) {
      return (
        <Button onClick={() => router.push(config.nextHref!)}>
          {config.nextLabel ?? "Continue"}
        </Button>
      );
    }
    const nextStep = String(Number(stepId) + 1);
    return (
      <Button onClick={() => router.push(`/playbook/step/${nextStep}`)}>
        Continue to Step {nextStep}
      </Button>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Badge variant="outline" className="mb-2">
          Step {stepId} of 7
        </Badge>
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <Progress value={progress} className="mt-4" />
      </div>

      {/* Intro paragraph (Reluctant Hero voice) */}
      {messages.length === 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed italic">
              {config.intro}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conversation */}
      <div className="space-y-4 mb-6">
        {messages.length === 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium">{config.questions[0]}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "bg-primary/10 rounded-lg p-4 ml-8"
                : "bg-muted/50 rounded-lg p-4 mr-8"
            }
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {!isComplete &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "engine" && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium">
                {config.questions[currentQuestion]}
              </p>
            </div>
          )}
      </div>

      {/* Input */}
      {!isComplete ? (
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your answer..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSubmit();
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="self-end"
          >
            {isLoading ? "..." : "Send"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-3">Your {config.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {output}
              </p>
            </CardContent>
          </Card>

          {/* Isenberg overlay: vertical agent on the boring pain. Steps 2
              and 4 each get an "engine does it" panel — score the offer on
              Step 2, rewrite the live landing page on Step 4. Step 6 has
              its own per-action drafter in OutreachLog. */}
          {stepId === "2" && <OfferScorerPanel />}
          {stepId === "4" && <PageRewriterPanel />}

          {/* "Yours to keep" — Brunson Results-in-Advance affordances:
              email the deliverable to inbox (re-trigger original send) and
              download as a plain-text file. Both should always be available
              on the completion screen; the user paid $1 for a real, keepable
              small win. */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={resendStatus === "sending"}
            >
              {resendStatus === "sending"
                ? "Sending..."
                : resendStatus === "sent"
                  ? "Sent — check your inbox"
                  : "Email me a copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              Download as text
            </Button>
          </div>

          {emailedOnAssembly && !hydratedFromServer && (
            <p className="text-xs text-muted-foreground">
              I just emailed this to you. Reluctant Hero rule: the inbox copy
              outlives the tab.
            </p>
          )}
          {hydratedFromServer && (
            <p className="text-xs text-muted-foreground">
              Loaded from your last session. Re-run the questions any time —
              the new deliverable overwrites this one.
            </p>
          )}
          {resendStatus === "error" && (
            <p className="text-xs text-destructive">
              Could not send. Try again in a moment.
            </p>
          )}

          <Badge className="animate-pulse">{config.milestone}</Badge>

          {renderCompletionNav()}
        </div>
      )}
    </div>
  );
}
