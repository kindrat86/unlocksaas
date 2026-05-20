"use client";

/**
 * Agent panels embedded into Machine step completion screens.
 *
 * Isenberg overlay (vertical agent on a boring pain): the engine does the
 * work the founder was going to procrastinate. Three panels in v1:
 *
 *   - OfferScorerPanel   Step 2 completion: scores the locked offer + rewrites
 *                        the weakest beat.
 *   - PageRewriterPanel  Step 4 completion: rewrites the founder's live landing
 *                        page using locked WHO/WHAT/VOICE.
 *   - OutreachDrafterButton + drawer: Step 6 outreach log; per-action "draft
 *                        this for me" button hands the engine the target +
 *                        channel and returns a ready-to-send message.
 *
 * Each panel POSTs to /api/engine/agent and renders the result inline. Prior
 * runs are hydrated on mount via GET /api/engine/agent. No localStorage — the
 * canonical source of truth is the server, mirroring the existing
 * project_state pattern. UI affordance is "Let the engine do it" — a tier-2
 * Brunson Results-in-Advance move on top of the framework deliverable.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

type AgentKind = "offer_scorer" | "outreach_drafter" | "page_rewriter";

interface ApiRunResponse<T> {
  kind: AgentKind;
  output: T;
  durationMs: number;
  error?: string;
}

interface ApiErrorResponse {
  error: string;
}

type ApiResponse<T> = ApiRunResponse<T> | ApiErrorResponse;

async function postAgent<T>(
  kind: AgentKind,
  payload: Record<string, unknown> = {}
): Promise<{ ok: true; output: T } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/engine/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });
    const data = (await res.json()) as ApiResponse<T>;
    if (!res.ok || "error" in data) {
      const message =
        ("error" in data && data.error) ||
        "Engine could not run. Try again in a moment.";
      return { ok: false, error: message };
    }
    return { ok: true, output: (data as ApiRunResponse<T>).output };
  } catch {
    return { ok: false, error: "Network blip. Try again." };
  }
}

interface HydratedRuns {
  offer_scorer?: { output: OfferScorerOutput; created_at: string };
  outreach_drafter?: { output: OutreachDrafterOutput; created_at: string };
  page_rewriter?: { output: PageRewriterOutput; created_at: string };
}

/** Shared mount-time fetch: pulls the most-recent run per kind for this user. */
function useHydratedRuns(): HydratedRuns {
  const [runs, setRuns] = useState<HydratedRuns>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/engine/agent", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { runs: HydratedRuns };
        if (!cancelled) setRuns(data.runs ?? {});
      } catch {
        // Silent — the panel renders fine without hydration.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return runs;
}

// ---------------------------------------------------------------------------
// Step 2: Offer scorer
// ---------------------------------------------------------------------------

interface OfferScorerOutput {
  scorecard: {
    specificity: number;
    guarantee: number;
    math: number;
    irresistibility: number;
    total: number;
  };
  weakest_beat: string;
  weakness_note: string;
  rewrite: string;
}

export function OfferScorerPanel() {
  const hydrated = useHydratedRuns();
  const [output, setOutput] = useState<OfferScorerOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated.offer_scorer?.output && !output) {
      setOutput(hydrated.offer_scorer.output);
    }
  }, [hydrated, output]);

  async function run() {
    setLoading(true);
    setError(null);
    track(Event.PlaybookAgentInvoked, { kind: "offer_scorer" });
    const res = await postAgent<OfferScorerOutput>("offer_scorer");
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOutput(res.output);
    track(Event.PlaybookAgentCompleted, {
      kind: "offer_scorer",
      total: res.output.scorecard.total,
    });
  }

  return (
    <Card className="border-muted">
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-semibold text-base">
            Let the engine score this offer
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Brunson rubric, 0–100. You get a scorecard, a name for the weakest
            beat, and a rewrite that fixes it. Reluctant Hero voice.
          </p>
        </div>

        {!output && (
          <Button onClick={run} disabled={loading} size="sm">
            {loading ? "Scoring..." : "Score my offer"}
          </Button>
        )}

        {output && (
          <div className="space-y-4">
            <ScorecardDisplay scorecard={output.scorecard} />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                Weakest beat: {output.weakest_beat}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {output.weakness_note}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                Rewrite
              </p>
              <div className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-md p-3">
                {output.rewrite}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={run} disabled={loading}>
              {loading ? "Re-scoring..." : "Re-score"}
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

function ScorecardDisplay({
  scorecard,
}: {
  scorecard: OfferScorerOutput["scorecard"];
}) {
  const rows: Array<[string, number]> = [
    ["Specificity", scorecard.specificity],
    ["Guarantee", scorecard.guarantee],
    ["10x Math", scorecard.math],
    ["Irresistibility", scorecard.irresistibility],
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{scorecard.total}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
        <Badge variant={scorecard.total >= 75 ? "default" : "outline"}>
          {scorecard.total >= 90
            ? "Locked in"
            : scorecard.total >= 75
              ? "Ship-ready"
              : scorecard.total >= 50
                ? "Tighten one beat"
                : "Needs a rewrite"}
        </Badge>
      </div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value} / 25</span>
            </div>
            <Progress value={(value / 25) * 100} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Page rewriter
// ---------------------------------------------------------------------------

interface PageRewriterOutput {
  headlines: string[];
  hero_section: string;
  oto_block: string;
  notes: string;
}

export function PageRewriterPanel() {
  const hydrated = useHydratedRuns();
  const [pageText, setPageText] = useState("");
  const [output, setOutput] = useState<PageRewriterOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydratedFromServer, setHydratedFromServer] = useState(false);

  useEffect(() => {
    if (hydrated.page_rewriter?.output && !output) {
      setOutput(hydrated.page_rewriter.output);
      setHydratedFromServer(true);
    }
  }, [hydrated, output]);

  async function run() {
    if (pageText.trim().length < 80) {
      setError(
        "Paste at least 80 characters of your current landing page. A subhead alone is not enough."
      );
      return;
    }
    setLoading(true);
    setError(null);
    setHydratedFromServer(false);
    track(Event.PlaybookAgentInvoked, { kind: "page_rewriter" });
    const res = await postAgent<PageRewriterOutput>("page_rewriter", {
      page_text: pageText,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOutput(res.output);
    track(Event.PlaybookAgentCompleted, { kind: "page_rewriter" });
  }

  return (
    <Card className="border-muted">
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-semibold text-base">
            Let the engine rewrite your live page
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Paste your current landing page (or any HTML/markdown). The engine
            keeps your facts and rewrites the headline, hero, and OTO using
            your locked WHO, WHAT, and VOICE.
          </p>
        </div>

        <Textarea
          value={pageText}
          onChange={(e) => setPageText(e.target.value)}
          placeholder="Paste your current landing page text here. Anything from a hero block to the whole page."
          className="min-h-[140px] text-xs font-mono"
        />

        <div className="flex gap-2">
          <Button onClick={run} disabled={loading || pageText.trim().length < 80}>
            {loading
              ? "Rewriting..."
              : output
                ? "Re-rewrite with this text"
                : "Rewrite the page"}
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            {pageText.length.toLocaleString()} chars
          </span>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {output && (
          <div className="space-y-5 pt-2">
            {hydratedFromServer && (
              <p className="text-xs text-muted-foreground">
                Loaded from your last rewrite. Paste new text + re-run any time.
              </p>
            )}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                5 headline variants
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                {output.headlines.map((h, i) => (
                  <li key={i} className="leading-relaxed">
                    {h}
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                Hero section
              </p>
              <div className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-md p-3">
                {output.hero_section}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                OTO block
              </p>
              <div className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-md p-3">
                {output.oto_block}
              </div>
            </div>
            {output.notes && (
              <p className="text-xs text-muted-foreground italic">
                {output.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Outreach drafter (per-action)
// ---------------------------------------------------------------------------

interface OutreachDrafterOutput {
  draft: string;
  channel: string;
  target: string;
  why_this_target: string;
}

/**
 * Inline-on-form panel for Step 6. Founder enters a channel + target; this
 * widget produces a ready-to-paste draft. The draft is auto-inserted into the
 * outreach-log message field via the onDraft callback so the founder can
 * tweak + log it in one motion.
 */
export function OutreachDrafterPanel({
  channel,
  target,
  notes,
  onDraft,
}: {
  channel: string;
  target: string;
  notes?: string;
  onDraft: (draft: string) => void;
}) {
  const [output, setOutput] = useState<OutreachDrafterOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = channel.trim() && target.trim();

  async function run() {
    if (!ready) return;
    setLoading(true);
    setError(null);
    track(Event.PlaybookAgentInvoked, { kind: "outreach_drafter" });
    const res = await postAgent<OutreachDrafterOutput>("outreach_drafter", {
      target_channel: channel,
      target_name: target,
      notes,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOutput(res.output);
    onDraft(res.output.draft);
    track(Event.PlaybookAgentCompleted, { kind: "outreach_drafter" });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={run}
          disabled={loading || !ready}
        >
          {loading
            ? "Drafting..."
            : output
              ? "Re-draft for this target"
              : "Draft this for me"}
        </Button>
        {!ready && (
          <span className="text-xs text-muted-foreground">
            Channel + target first.
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {output?.why_this_target && (
        <p className="text-xs text-muted-foreground italic">
          {output.why_this_target}
        </p>
      )}
    </div>
  );
}
