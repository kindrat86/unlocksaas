import { Suspense } from "react";

/**
 * Chrome for the post-checkout onboarding flow.
 *
 * Authentication stays in page.tsx because only the page receives request
 * search parameters. Keeping a second auth redirect in this layout would drop
 * the Stripe session and attribution context before the buyer reaches login.
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
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}
