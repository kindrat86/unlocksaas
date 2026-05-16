import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/onboarding";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  Gift,
  User,
  FileText,
  Send,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";

const steps = [
  { id: 1, name: "Dream Customer", icon: Target, milestone: "Dream Customer Pinned" },
  { id: 2, name: "Build Offer", icon: Gift, milestone: "Offer Locked" },
  { id: 3, name: "Attractive Character", icon: User, milestone: "AC Defined" },
  { id: 4, name: "Write Copy", icon: FileText, milestone: "Copy Generated" },
  { id: 5, name: "Outreach Assets", icon: Send, milestone: "Outreach Assets Generated" },
  { id: 6, name: "Do Outreach", icon: Activity, milestone: "20 Outreach Actions Logged" },
  { id: 7, name: "Convert & Verify", icon: CheckCircle2, milestone: "First Paying Customer Verified" },
];

export default async function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth gate — anonymous traffic gets sent to /login with the original
  // path preserved so we can deep-link back after sign-in.
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?next=/machine");
  }

  // Tier-driven step gating. Sourced from public.profiles, which the Stripe
  // webhook writes on checkout.session.completed + invoice.payment_succeeded.
  //   - core    → all 7 steps unlocked
  //   - starter → Steps 1+2 only (BUILD-PROMPT Hard Rule #6:
  //               "The $1 Starter delivers Machine Steps 1 and 2 only.")
  //   - none    → user landed here without buying. Send to /starter so they
  //               don't see a locked-out sidebar with no path forward.
  const profile = await getProfileByUserId(supabase, data.user.id);
  const tier = profile?.tier ?? "none";

  if (tier === "none") {
    redirect("/starter");
  }

  const unlockedSteps =
    tier === "core" ? [1, 2, 3, 4, 5, 6, 7] : [1, 2];

  // First Paying Customer Verified — sidebar badge lights up the instant a
  // verified_conversions row exists. Wrapped in try/catch so the layout still
  // renders if the migration hasn't been applied yet in a given env.
  // The verified_conversions table has both `project_id` (migration 0002) and
  // `profile_id` (guarantee.sql) live in the DB, but the generated types only
  // know about `project_id`. Cast eq() through unknown until the type-graph is
  // regenerated. TODO: reconcile the dual schema and regen database.types.ts.
  let firstCustomerVerified = false;
  try {
    if (profile?.id) {
      const { count } = await (supabase
        .from("verified_conversions")
        .select("id", { count: "exact", head: true })
        .eq as unknown as (col: string, val: string) => Promise<{ count: number | null }>)(
        "profile_id",
        profile.id
      );
      firstCustomerVerified = (count ?? 0) > 0;
    }
  } catch {
    firstCustomerVerified = false;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-bold">The Machine</h2>
          <p className="text-xs text-muted-foreground mt-1">
            7 steps to your first paying customer
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {steps.map((step) => {
            const isUnlocked = unlockedSteps.includes(step.id);
            const Icon = isUnlocked ? step.icon : Lock;

            return (
              <div key={step.id}>
                {isUnlocked ? (
                  <Link
                    href={`/machine/step/${step.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{step.name}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{step.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <Separator className="my-4" />

        {/* Milestone Badges */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Milestones
          </p>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => {
              const earned = step.id === 7 && firstCustomerVerified;
              return earned ? (
                <Link key={step.id} href="/machine/verified">
                  <Badge
                    variant="default"
                    className="text-[10px] cursor-pointer"
                    title="Open your Verified Builder badge"
                  >
                    {step.milestone}
                  </Badge>
                </Link>
              ) : (
                <Badge
                  key={step.id}
                  variant="outline"
                  className="text-[10px] opacity-40"
                >
                  {step.milestone}
                </Badge>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
