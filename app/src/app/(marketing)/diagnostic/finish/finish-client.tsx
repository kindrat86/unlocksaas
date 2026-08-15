"use client";

import { browserTimezone } from '@/lib/browser-tz';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

const TARGET_DURATION_S = 60;
const INSIGHT_INTERVAL_S = 7;

const STEPS: ReadonlyArray<{ at: number; label: string }> = [
  { at: 0, label: "Pulling your page." },
  { at: 8, label: "Reading the headline and the first scroll." },
  { at: 18, label: "Checking the offer against the outcome you promised." },
  { at: 28, label: "Mapping your funnel stage against the playbook." },
  { at: 40, label: "Drafting your diagnosis and the rewrite candidates." },
  { at: 55, label: "Almost there. Tightening the language." },
  { at: 90, label: "Taking longer than usual. Dense pages do that. Still working." },
];

const INSIGHTS: ReadonlyArray<string> = [
  "Pre-revenue is rarely a product problem. It is almost always a page problem.",
  "Your headline has about three seconds to name the visitor's pain. If it does not, nothing else on the page matters.",
  "The offer you think you are making and the offer the visitor reads are rarely the same offer.",
  "Most $0 MRR products were over-built and under-promised. The rewrite is almost always shorter than the original.",
  "Hooks earn the scroll. Stories earn the belief. Offers earn the click.",
  "If your headline could swap onto a competitor's page without anyone noticing, that is the diagnosis.",
  "A landing page is a conversation between two strangers. Most pages never let the visitor speak first.",
  "Most founders rewrite the product when they should rewrite the page above it.",
];

function stepLabelFor(elapsed: number): string {
  let label = STEPS[0].label;
  for (const s of STEPS) {
    if (elapsed >= s.at) label = s.label;
  }
  return label;
}

function insightFor(elapsed: number): string {
  const idx = Math.floor(elapsed / INSIGHT_INTERVAL_S) % INSIGHTS.length;
  return INSIGHTS[idx];
}

// Asymptotic curve toward 95% so completion stays visually distinct.
// At 60s → ~86%, at 90s → ~94%. Caps at 95%.
function progressFor(elapsed: number): number {
  return Math.min(95, 95 * (1 - Math.exp(-elapsed / 25)));
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const PENDING_KEY = "diagnostic_pending";

type Pending = {
  productUrl: string;
  survey: {
    time_since_launch: string;
    recent_revenue: string;
    biggest_attempt: string;
    // Quiz expansion (2026-05-21). Optional — a pre-expansion stash
    // produced before the user updated their tab still works because the
    // API edge treats every quiz-expansion field as optional.
    primary_goal?: string | null;
    hours_per_week?: string | null;
    biggest_fear?: string | null;
  };
  referrer: string | null;
  ts: number;
};

type Phase =
  | { kind: "running" }
  | { kind: "no_session" }
  | { kind: "no_pending" }
  | { kind: "error"; message: string }
  | { kind: "already_used"; existingId: string };

export function DiagnosticFinish() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "running" });
  // React Strict Mode double-fires effects in dev. Without this guard we'd
  // POST twice and the second call would see the first call's row and return
  // already_used:true incorrectly. Idempotent on production builds too.
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      let pending: Pending | null = null;
      try {
        const raw = window.localStorage.getItem(PENDING_KEY);
        if (raw) pending = JSON.parse(raw) as Pending;
      } catch {
        pending = null;
      }
      if (!pending?.productUrl || !pending?.survey) {
        setPhase({ kind: "no_pending" });
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getUser();
      const email = sessionData.user?.email ?? null;
      if (!email) {
        setPhase({ kind: "no_session" });
        return;
      }

      try {
        const res = await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            productUrl: pending.productUrl,
            survey: pending.survey,
            source: "google_oauth",
            referrer: pending.referrer ?? undefined,
            tz: browserTimezone(),
          }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          id?: string;
          error?: string;
          already_used?: boolean;
        };

        if (!res.ok || !body.id) {
          setPhase({
            kind: "error",
            message:
              body.error ||
              "The engine returned an error. Try again in a minute, or email me at maryan@unlocksaas.com.",
          });
          return;
        }

        // Clear the stash regardless of outcome — we used it.
        try {
          window.localStorage.removeItem(PENDING_KEY);
        } catch {
          /* private mode: ignore */
        }

        track(Event.DiagnosticFormSubmitted, {
          step_completed: 5,
          auth_method: "google",
          already_used: body.already_used === true,
        });

        if (body.already_used) {
          setPhase({ kind: "already_used", existingId: body.id });
          return;
        }
        router.replace(`/diagnostic/result?id=${body.id}`);
      } catch (err) {
        console.error("[diagnostic/finish] POST failed", err);
        setPhase({
          kind: "error",
          message:
            "Could not reach the diagnostic engine. Refresh in a minute, or email me at maryan@unlocksaas.com.",
        });
      }
    })();
  }, [router]);

  if (phase.kind === "running") {
    return <RunningShell />;
  }
  if (phase.kind === "no_pending") {
    return <NoPendingShell />;
  }
  if (phase.kind === "no_session") {
    return <NoSessionShell />;
  }
  if (phase.kind === "already_used") {
    return <AlreadyUsedShell existingId={phase.existingId} />;
  }
  return <ErrorShell message={phase.message} />;
}

function RunningShell() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const step = stepLabelFor(elapsed);
  const insight = insightFor(elapsed);
  const progress = progressFor(elapsed);

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Reading your page
          </p>
          <h1 className="text-2xl font-bold leading-tight mb-3">
            Finishing your diagnosis.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hold on while the engine reads what is publicly on your page and
            labels the upstream failure. You will land on your diagnosis
            automatically.
          </p>
        </div>

        <div
          className="space-y-3"
          role="status"
          aria-live="polite"
          aria-label="Diagnosis progress"
        >
          <div className="flex items-baseline justify-between gap-4 font-mono text-xs text-muted-foreground tabular-nums">
            <span>{formatElapsed(elapsed)} elapsed</span>
            <span>~{formatElapsed(TARGET_DURATION_S)} typical</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
              aria-hidden="true"
            />
            <p className="text-sm text-foreground/90 leading-tight">{step}</p>
          </div>
        </div>

        <div className="border-t pt-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            While you wait
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed italic min-h-[5rem]">
            {insight}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NoPendingShell() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold leading-tight mb-3">
          I lost your survey answers.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          You signed in with Google, but the survey you filled out before the
          redirect did not come back with you. Easiest fix: run the diagnostic
          again — it takes about sixty seconds.
        </p>
        <Button asChild className="w-full">
          <Link href="/diagnostic">Run the diagnostic</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function NoSessionShell() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold leading-tight mb-3">
          I do not see a Google sign-in.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          The Google round-trip did not return a session. That sometimes
          happens on shared devices or in strict-privacy browsers. Try the
          email field instead — it works the same.
        </p>
        <Button asChild className="w-full">
          <Link href="/diagnostic">Back to the diagnostic</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AlreadyUsedShell({ existingId }: { existingId: string }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            One free diagnosis per founder
          </p>
          <h1 className="text-2xl font-bold leading-tight">
            You already used yours.
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The diagnosis I ran for you is still on file. Re-open it any time —
          or, if you are ready, take the next door.
        </p>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href={`/diagnostic/result?id=${existingId}`}>
            Re-open my diagnosis
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-base py-6">
          <Link href={`/starter?from=diagnostic_repeat&lead=${existingId}`}>
            Start the Playbook — $1 Starter
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full text-sm">
          <Link
            href={`/playbook-sales?from=diagnostic_repeat&lead=${existingId}`}
          >
            Or skip ahead to The Playbook — $49/mo
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold leading-tight mb-3">
          Something went sideways.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {message}
        </p>
        <Button asChild className="w-full">
          <Link href="/diagnostic">Try again</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
