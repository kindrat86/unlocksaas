import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WelcomeClient } from "./welcome-client";

/**
 * /welcome — post-purchase landing.
 *
 * Server-component entry. The old implementation was a "use client" page
 * reading ?path= via useSearchParams() inside <Suspense fallback={null}>,
 * which server-rendered an EMPTY <main>: a buyer reopening the link from
 * email (or any crawler) saw a blank page until JS hydrated.
 *
 * Current shape mirrors /starter and /oto: synchronous Suspense wrapper,
 * async body that calls `await connection()` before awaiting searchParams,
 * then:
 *
 *   - routing params present (?path= and/or ?session_id=) → the existing
 *     client behavior (per-path copy + 12s auto-redirect).
 *   - no params → a generic server-rendered "you're in" with honest next
 *     steps (free diagnostic, homepage). No blank page, no dead-end.
 */
export default function Welcome(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={null}>
      <WelcomeBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function WelcomeBody(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const rawPath = searchParams.path;
  const path = (Array.isArray(rawPath) ? rawPath[0] : rawPath) ?? "";
  const rawSession = searchParams.session_id;
  const sessionId =
    (Array.isArray(rawSession) ? rawSession[0] : rawSession) ?? "";

  if (path || sessionId) {
    return <WelcomeClient path={path || "starter_only"} />;
  }

  return <WelcomeFallback />;
}

/**
 * No-params fallback — fully server-rendered. A visitor landing here cold
 * (old email link, shared URL, crawler) gets a real page instead of a
 * blank one.
 */
function WelcomeFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Welcome
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          You&apos;re in.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          If you just bought something and landed here without your session
          link, the purchase still went through — your receipt and welcome
          email are in your inbox. If you arrived cold, the honest place to
          start is the free 90-second diagnostic. — Maryan
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full text-lg py-6">
            <Link href="/diagnostic">Run the free diagnostic</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href="/">Back to the homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
