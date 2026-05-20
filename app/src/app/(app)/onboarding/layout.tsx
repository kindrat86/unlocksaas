import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth-gated container for the post-checkout onboarding flow.
 *
 * Distinct from /playbook/layout.tsx because the onboarding view should NOT
 * show the 7-step sidebar — the user is configuring access before stepping
 * into the Playbook, and the sidebar adds noise.
 *
 * Under Cache Components (Next 16+), the layout itself cannot `await
 * supabase.auth.getUser()` at the top level — that would be "uncached data
 * accessed outside <Suspense>". Pattern: the layout is a pure render of the
 * static chrome (header, sign-out form, `<main>` container) plus a Suspense
 * boundary containing an `<AuthGate>` server component that performs the
 * cookie-based auth read and either renders children or redirects.
 *
 * The Suspense fallback is intentionally minimal — the auth read is fast
 * (one Supabase RPC), and a flash of loading state is preferable to the
 * whole page blocking the initial paint.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">UnlockSaaS</h2>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Suspense fallback={null}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </main>
    </div>
  );
}

async function AuthGate({ children }: { children: React.ReactNode }) {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?next=/onboarding");
  }
  return <>{children}</>;
}
