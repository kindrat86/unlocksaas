import Link from "next/link";
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

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For Sprint 1: Steps 1-2 unlocked, 3-7 locked
  const unlockedSteps = [1, 2];

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
            {steps.map((step) => (
              <Badge
                key={step.id}
                variant="outline"
                className="text-[10px] opacity-40"
              >
                {step.milestone}
              </Badge>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
