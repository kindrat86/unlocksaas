"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

const PENDING_KEY = "diagnostic_pending";

type Pending = {
  productUrl: string;
  survey: {
    time_since_launch: string;
    recent_revenue: string;
    biggest_attempt: string;
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
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Reading your page
        </p>
        <h1 className="text-2xl font-bold leading-tight mb-3">
          Finishing your diagnosis.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hold on for a few seconds. The engine is reading what is publicly on
          your page and labelling the upstream failure. You will land on your
          diagnosis automatically.
        </p>
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
