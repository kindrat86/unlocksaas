import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth-gated container for the post-checkout onboarding flow.
 *
 * Distinct from /machine/layout.tsx because the onboarding view should NOT
 * show the 7-step sidebar — the user is configuring access before stepping
 * into the Machine, and the sidebar adds noise.
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?next=/onboarding");
  }

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
      <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
