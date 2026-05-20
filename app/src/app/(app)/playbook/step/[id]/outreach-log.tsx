"use client";

/**
 * Step 6: Do Outreach.
 *
 * The avoidance step. The whole reason the product exists is to stop the
 * founder from skipping this. We make the act of logging an action smaller
 * than the act of avoiding it.
 *
 * v1 storage: localStorage. The `outreach_actions` Supabase table lands in
 * Sprint 3 — until then, the count is per-browser. The 20th logged entry
 * fires the `twenty_outreach_actions_logged` milestone via the milestone
 * API endpoint, so the guarantee verifier picks it up correctly.
 *
 * Voice: Reluctant Hero. The empty state confesses. The completion state
 * does not celebrate — it points at Step 7.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { OutreachDrafterPanel } from "./agent-panels";

const LS_KEY = "unlocksaas.outreach.actions.v1";
const TARGET = 20;

interface OutreachAction {
  id: string;
  channel: string;
  target: string;
  message: string;
  publicLink?: string;
  loggedAt: string;
}

export function OutreachLog() {
  const [actions, setActions] = useState<OutreachAction[]>([]);
  const [draft, setDraft] = useState<Omit<OutreachAction, "id" | "loggedAt">>({
    channel: "",
    target: "",
    message: "",
    publicLink: "",
  });
  const [milestoneFiringState, setMilestoneFiringState] = useState<
    "idle" | "firing" | "fired" | "error"
  >("idle");

  // Load from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setActions(JSON.parse(raw) as OutreachAction[]);
    } catch {
      // Bad storage state — start clean.
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(actions));
    } catch {
      // Storage full or denied — non-fatal.
    }
  }, [actions]);

  // When count crosses 20, fire the milestone server-side.
  useEffect(() => {
    if (
      actions.length >= TARGET &&
      milestoneFiringState === "idle"
    ) {
      setMilestoneFiringState("firing");
      fetch("/api/milestones/outreach-twenty", { method: "POST" })
        .then(async (res) => {
          if (res.ok || res.status === 401) {
            // 401 just means auth UI isn't wired yet; we still count the
            // 20 locally so the UI advances. Server will catch up later.
            setMilestoneFiringState("fired");
          } else {
            setMilestoneFiringState("error");
          }
        })
        .catch(() => setMilestoneFiringState("error"));
    }
  }, [actions.length, milestoneFiringState]);

  const isComplete = actions.length >= TARGET;
  const progressPct = Math.min(100, (actions.length / TARGET) * 100);

  function addAction(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.channel.trim() || !draft.target.trim()) return;

    const action: OutreachAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channel: draft.channel.trim(),
      target: draft.target.trim(),
      message: draft.message.trim(),
      publicLink: draft.publicLink?.trim() || undefined,
      loggedAt: new Date().toISOString(),
    };

    setActions((prev) => [action, ...prev]);
    setDraft({ channel: "", target: "", message: "", publicLink: "" });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Badge variant="outline" className="mb-2">
          Step 6 of 7
        </Badge>
        <h1 className="text-2xl font-bold mb-2">Do Outreach</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is the step every founder I know skips. The avoidance disease&apos;s
          home field. Twenty real actions, logged here. Story first. Offer last.
          The 20th action unlocks Step 7.
        </p>
      </header>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {actions.length} of {TARGET} actions logged
          </span>
          {isComplete && <span>Step complete</span>}
        </div>
        <Progress value={progressPct} />
      </div>

      {/* Add action form */}
      {!isComplete && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={addAction} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={draft.channel}
                  onChange={(e) =>
                    setDraft({ ...draft, channel: e.target.value })
                  }
                  placeholder="Channel (e.g. Indie Hackers, X DM, r/SaaS)"
                  required
                />
                <Input
                  value={draft.target}
                  onChange={(e) =>
                    setDraft({ ...draft, target: e.target.value })
                  }
                  placeholder="Target (name or handle)"
                  required
                />
              </div>
              <Textarea
                value={draft.message}
                onChange={(e) =>
                  setDraft({ ...draft, message: e.target.value })
                }
                placeholder="What you sent (or a 1-line summary)"
                className="min-h-[60px]"
              />
              {/* Isenberg overlay: let the engine draft the message for this
                  specific target + channel using locked WHO/WHAT/VOICE. The
                  draft fills the textarea above so the founder can tweak +
                  log it in one motion. */}
              <OutreachDrafterPanel
                channel={draft.channel}
                target={draft.target}
                notes={draft.message || undefined}
                onDraft={(text) => setDraft((d) => ({ ...d, message: text }))}
              />
              <Input
                value={draft.publicLink ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, publicLink: e.target.value })
                }
                placeholder="Public link (optional — for posts/threads/comments)"
                type="url"
              />
              <Button
                type="submit"
                disabled={!draft.channel.trim() || !draft.target.trim()}
              >
                Log this action
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Completion CTA */}
      {isComplete && (
        <Card className="border-primary/30">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm leading-relaxed">
              Twenty actions logged. That&apos;s the work the guarantee was
              conditional on. The verdict at the 60-day mark is now in your
              hands either way — Stripe will tell us.
            </p>
            {milestoneFiringState === "error" && (
              <p className="text-xs text-destructive">
                Couldn&apos;t reach the server to mark the milestone. The 20
                actions are stored locally; we&apos;ll retry on next page load.
              </p>
            )}
            <Button asChild>
              <Link href="/playbook/step/7">
                Continue to Step 7: Verify Your First Customer
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action list */}
      {actions.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Logged actions
          </h2>
          <ul className="space-y-2">
            {actions.map((a) => (
              <li
                key={a.id}
                className="text-sm border rounded-md p-3 space-y-1"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{a.target}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.channel}
                  </span>
                </div>
                {a.message && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {a.message}
                  </p>
                )}
                {a.publicLink && (
                  <a
                    href={a.publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline break-all"
                  >
                    {a.publicLink}
                  </a>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(a.loggedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
