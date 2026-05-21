import { createClient } from "@/lib/supabase/server";
import { FirstWinClient } from "./first-win-client";
import { loadLatestFirstWinRun } from "@/lib/first-win";

/**
 * Server entry point for the post-checkout first-win onboarding flow.
 *
 * Loads the most recent agent run (if any) and passes it to the client
 * for hydration. If the user revisits after starting a run, they see
 * their drafts in-place instead of restarting from scratch.
 *
 * On first visit, `latestRun` is null and the client streams from scratch.
 */
export default async function FirstWinPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  let latestRun = null;
  if (user?.email) {
    try {
      latestRun = await loadLatestFirstWinRun(
        supabase,
        user.email
      );
    } catch (err) {
      console.error("[first-win/page] loadLatestFirstWinRun failed:", err);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your AI-drafted first win</h1>
        <p className="text-muted-foreground">
          In the next 5 minutes, Claude will draft your Attractive Character
          profile and your first SOS email. These drafts are yours to edit and
          use for your founder audience.
        </p>
      </div>

      <FirstWinClient initialRun={latestRun} />
    </div>
  );
}
