import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlaybookDashboard() {
  // The layout already enforces auth + tier gating. Here we only need the
  // First Paying Customer Verified flag to decide whether to render the
  // celebration banner above the Step 1 CTA.
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  let verified = false;
  if (userData?.user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (profile?.id) {
        // verified_conversions has both project_id (migration 0002) and
        // profile_id (guarantee.sql) in the live DB, but the generated types
        // only know about project_id. Cast the column name to `never` until
        // the type-graph is regenerated. Matches the same pattern in
        // playbook/layout.tsx. TODO: reconcile dual schema + regen types.
        const { count } = await supabase
          .from("verified_conversions")
          .select("id", { count: "exact", head: true })
          .eq("profile_id" as never, profile.id);
        verified = (count ?? 0) > 0;
      }
    } catch {
      verified = false;
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {verified && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle2 className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">
                  The line moved.
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Stripe confirmed a paying customer on your account. The
                  promise is kept. Your Verified Builder badge is ready when
                  you are — claim it whenever.
                </p>
                <Button asChild size="sm">
                  <Link href="/playbook/verified">
                    Open your Verified Builder badge
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome, Builder.</h1>
        <p className="text-muted-foreground">
          You are here because you shipped something real. The only thing
          between that product and your first paying customer is the work you
          were taught to skip. Let&apos;s do it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start Step 1: Pin Your Dream Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Five questions. The engine pushes back on vague answers until you
            have one real person, named and specific. Not a category. A person.
          </p>
          <Button asChild>
            <Link href="/playbook/step/1">Begin</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
