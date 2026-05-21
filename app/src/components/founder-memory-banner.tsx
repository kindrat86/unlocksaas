import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import {
  readFounderMemory,
  type FounderMemoryRow,
} from "@/lib/founder-memory";

/**
 * "We remember:" banner – Server Component.
 *
 * Reads the signed-in founder's most recent founder_memory row and renders
 * a compact 3-chip line: product/offer, audience/ICP, stage. Skips silently
 * when memory is missing – the host page keeps its existing layout untouched.
 *
 * Why a Server Component: lets us co-locate the Supabase service-role read
 * with the render without inflating the client bundle. The memory blob is
 * small (< 4kB) and changes only when a new diagnostic completes.
 *
 * Voice: Reluctant Hero, en dash only (no em dash). Founders signed in to
 * the app have already paid for the Playbook – the banner reads as
 * continuity, not novelty.
 */

interface Props {
  /** Auth.uid() of the signed-in founder. */
  userId: string;
  /** Email on the auth row, used as a fallback lookup key. */
  email?: string | null;
  /** Optional class applied to the outer Card. */
  className?: string;
}

export async function FounderMemoryBanner(props: Props) {
  const memory = await readFounderMemory({
    userId: props.userId,
    email: props.email ?? null,
  });
  if (!memory) return null;
  return <BannerView memory={memory} className={props.className} />;
}

function BannerView({
  memory,
  className,
}: {
  memory: FounderMemoryRow;
  className?: string;
}) {
  const m = memory.structured ?? {};
  const headline = m.product_name
    ? m.one_liner
      ? `${m.product_name} – ${m.one_liner}`
      : m.product_name
    : memory.summary ?? "We have your diagnostic on file.";

  const chips: Array<{ label: string; value: string }> = [];
  if (m.audience_stated) {
    chips.push({ label: "ICP", value: m.audience_stated });
  }
  if (m.stage?.time_since_launch || m.stage?.recent_revenue) {
    const parts: string[] = [];
    if (m.stage?.time_since_launch) {
      parts.push(STAGE_LABEL[m.stage.time_since_launch]);
    }
    if (m.stage?.recent_revenue) {
      parts.push(REVENUE_LABEL[m.stage.recent_revenue]);
    }
    chips.push({ label: "Stage", value: parts.join(", ") });
  }
  if (m.diagnosis?.label && m.diagnosis.label !== "error") {
    chips.push({
      label: "Diagnosis",
      value: m.diagnosis.label.replace(/_/g, " "),
    });
  }

  return (
    <Card className={className ?? "border-primary/30 bg-primary/5"}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 mt-0.5 shrink-0 text-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              We remember
            </p>
            <p className="text-sm font-medium leading-snug">{headline}</p>
            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <Badge
                    key={c.label}
                    variant="outline"
                    className="text-xs font-normal whitespace-normal text-left"
                  >
                    <span className="text-muted-foreground mr-1">{c.label}:</span>
                    {c.value}
                  </Badge>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Pulled from your last diagnostic. Every surface in here reads
              from the same memory – you should not have to re-explain your
              business.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Local stage labels – mirrors the ones in lib/founder-memory.ts. Kept
// here so the banner has zero coupling to that module's private mappings.
const STAGE_LABEL: Record<string, string> = {
  under_30: "under 30 days post-launch",
  "30_to_90": "30 to 90 days post-launch",
  "90_plus": "over 90 days post-launch",
};

const REVENUE_LABEL: Record<string, string> = {
  zero: "no revenue yet",
  under_100: "under $100/mo",
  "100_to_1k": "$100-$1k/mo",
  over_1k: "over $1k/mo",
};
