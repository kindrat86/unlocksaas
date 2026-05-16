"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Message = {
  role: "engine" | "user";
  content: string;
};

const STEP_CONFIG: Record<
  string,
  {
    title: string;
    intro: string;
    questions: string[];
    milestone: string;
  }
> = {
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
};

export default function MachineStepPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = params.id as string;
  const config = STEP_CONFIG[stepId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [output, setOutput] = useState("");

  if (!config) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Step Locked</h1>
        <p className="text-muted-foreground">
          This step unlocks with the $49/mo Machine. Steps 3 through 7 are where
          the paying customer happens.
        </p>
      </div>
    );
  }

  const progress = isComplete
    ? 100
    : (currentQuestion / config.questions.length) * 100;

  async function handleSubmit() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          questionIndex: currentQuestion,
          answer: input.trim(),
          previousAnswers: messages
            .filter((m) => m.role === "user")
            .map((m) => m.content),
        }),
      });

      const data = await res.json();

      if (data.accepted) {
        // Answer accepted, move to next question or complete
        const nextQ = currentQuestion + 1;
        if (nextQ >= config.questions.length) {
          // All questions answered — get the assembled output
          setMessages([
            ...newMessages,
            { role: "engine", content: data.message },
          ]);
          setOutput(data.output || "");
          setIsComplete(true);
        } else {
          setMessages([
            ...newMessages,
            { role: "engine", content: data.message },
          ]);
          setCurrentQuestion(nextQ);
        }
      } else {
        // Pushback — answer was vague
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
        {/* Initial question */}
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

        {/* Current question (after pushback or acceptance) */}
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
          {/* Assembled output */}
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-3">Your {config.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {output}
              </p>
            </CardContent>
          </Card>

          <Badge className="animate-pulse">{config.milestone}</Badge>

          {stepId === "1" ? (
            <Button onClick={() => router.push("/machine/step/2")}>
              Continue to Step 2: Build Your Offer
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You are done with the Starter. Your WHO and WHAT are finished.
              </p>
              <Button variant="secondary" asChild>
                <a href="/oto">
                  Unlock the full Machine — $49/mo, 60-day guarantee
                </a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
