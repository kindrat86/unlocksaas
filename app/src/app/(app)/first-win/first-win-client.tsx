"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";
import type { FirstWinOutput, FirstWinEvent } from "@/lib/first-win";

interface FirstWinClientProps {
  initialRun: {
    id: string;
    output: FirstWinOutput;
  } | null;
}

type UIState = "idle" | "generating" | "complete" | "error";

export function FirstWinClient({ initialRun }: FirstWinClientProps) {
  const [state, setState] = useState<UIState>(
    initialRun ? "complete" : "idle"
  );
  const [acProfile, setAcProfile] = useState(
    initialRun?.output.ac_profile_draft ?? ""
  );
  const [sosEmail, setSosEmail] = useState(
    initialRun?.output.sos_email_1_draft ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<
    "ac" | "sos1" | null
  >(null);

  // Track page view on mount
  useEffect(() => {
    track(Event.FirstWinPageViewed);
  }, []);

  const handleStart = async () => {
    setState("generating");
    setError(null);
    setAcProfile("");
    setSosEmail("");
    setCurrentSection(null);

    track(Event.FirstWinStreamStarted);

    try {
      const response = await fetch("/api/first-win/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(
          `Stream error: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line === ": connected") {
            // SSE comment, ignore
            continue;
          }
          if (line.startsWith("data: ")) {
            const eventStr = line.slice(6);
            const event: FirstWinEvent = JSON.parse(eventStr);

            if (event.type === "step") {
              // Visible reasoning step label – for future UI enhancement
            } else if (event.type === "token") {
              if (event.section === "ac") {
                setCurrentSection("ac");
                setAcProfile((prev) => prev + (event.text ?? ""));
              } else if (event.section === "sos1") {
                if (currentSection !== "sos1") {
                  setCurrentSection("sos1");
                }
                setSosEmail((prev) => prev + (event.text ?? ""));
              }
            } else if (event.type === "section_complete") {
              if (event.section === "ac") {
                setAcProfile(event.markdown ?? "");
                setCurrentSection("sos1");
              } else if (event.section === "sos1") {
                setSosEmail(event.markdown ?? "");
                setCurrentSection(null);
              }
            } else if (event.type === "done") {
              track(Event.FirstWinDraftsRevealed);
              setState("complete");
            } else if (event.type === "error") {
              throw new Error(event.message || "Stream error");
            }
          }
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setState("error");
      track(Event.FirstWinStreamFailed, { error_message: message });
    }
  };

  const handleAccept = () => {
    track(Event.FirstWinDraftAccepted, {
      has_ac: acProfile.length > 0,
      has_sos: sosEmail.length > 0,
    });
    // In a full implementation, here we'd save the drafts to project_state
    // and navigate to the playbook or next step. For now, just track.
  };

  const handleRegenerate = () => {
    track(Event.FirstWinDraftRegenerated);
    handleStart();
  };

  const handleSkip = () => {
    track(Event.FirstWinSkipped);
    // In a full implementation, navigate to playbook
  };

  if (initialRun && state === "complete" && acProfile && sosEmail) {
    // Hydrated state from previous run
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Attractive Character Profile
          </h2>
          <Textarea
            value={acProfile}
            onChange={(e) => setAcProfile(e.target.value)}
            className="min-h-48 font-mono text-sm"
            placeholder="Your AC profile will appear here..."
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">SOS Email 1</h2>
          <Textarea
            value={sosEmail}
            onChange={(e) => setSosEmail(e.target.value)}
            className="min-h-64 font-mono text-sm"
            placeholder="Your SOS email will appear here..."
          />
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={handleAccept}
            className="flex-1"
          >
            Accept drafts
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleRegenerate}
            className="flex-1"
          >
            Regenerate
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-6 max-w-md">
          Click below to generate your AC profile and first SOS email. This
          will take about 30–60 seconds.
        </p>
        <Button size="lg" onClick={handleStart}>
          Generate drafts
        </Button>
      </div>
    );
  }

  if (state === "generating") {
    return (
      <div className="space-y-8">
        {(currentSection === "ac" || acProfile) && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {currentSection === "ac" ? "Drafting AC Profile…" : "AC Profile (draft complete)"}
            </h2>
            <div className="bg-muted p-4 rounded border min-h-48 font-mono text-sm whitespace-pre-wrap">
              {acProfile || "(typing...)"}
            </div>
          </div>
        )}

        {(currentSection === "sos1" || sosEmail) && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {currentSection === "sos1" ? "Drafting SOS Email…" : "SOS Email 1 (draft complete)"}
            </h2>
            <div className="bg-muted p-4 rounded border min-h-64 font-mono text-sm whitespace-pre-wrap">
              {sosEmail || "(typing...)"}
            </div>
          </div>
        )}

        {!currentSection && !acProfile && !sosEmail && (
          <div className="text-center text-muted-foreground py-12">
            <p>Generating your drafts…</p>
          </div>
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="bg-destructive/10 border border-destructive rounded p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Generation failed
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleStart} variant="outline">
            Try again
          </Button>
          <Button onClick={handleSkip} variant="ghost">
            Skip
          </Button>
        </div>
      </div>
    );
  }

  // state === "complete" but no content yet (initial state)
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Attractive Character Profile
        </h2>
        <Textarea
          value={acProfile}
          onChange={(e) => setAcProfile(e.target.value)}
          className="min-h-48 font-mono text-sm"
          placeholder="Your AC profile will appear here..."
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">SOS Email 1</h2>
        <Textarea
          value={sosEmail}
          onChange={(e) => setSosEmail(e.target.value)}
          className="min-h-64 font-mono text-sm"
          placeholder="Your SOS email will appear here..."
        />
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={handleAccept}
          disabled={!acProfile || !sosEmail}
          className="flex-1"
        >
          Accept drafts
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleRegenerate}
          className="flex-1"
        >
          Regenerate
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={handleSkip}
          className="flex-1"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
