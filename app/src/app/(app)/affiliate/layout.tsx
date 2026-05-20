import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth-gated chrome for the affiliate dashboard.
 *
 * Same shape as /onboarding's layout — minimal header, no /playbook sidebar.
 * Affiliate dashboard is a flat "your numbers + your link" view; the
 * 7-step sidebar would be noise.
 *
 * Cache Components: the auth read happens inside a Suspense'd <AuthGate>,
 * not at the top level, so the layout shell streams from the CDN before
 * the Supabase RPC resolves.
 */
export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
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
      <main className="max-w-3xl mx-auto px-6 py-10">
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
    redirect("/login?next=/affiliate");
  }
  return <>{children}</>;
}
