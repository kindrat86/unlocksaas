import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DiagnosticSnapshot {
  scored_at: string;
  label: string;
  scores: Record<string, number>;
}

interface FunnelTrendCardProps {
  snapshots: DiagnosticSnapshot[];
}

export function FunnelTrendCard({ snapshots }: FunnelTrendCardProps) {
  if (!snapshots.length) {
    return null;
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.scored_at).getTime() - new Date(a.scored_at).getTime()
  );

  const latest = sorted[0];
  const previous = sorted[1];

  const latestScores = latest.scores;
  const avgLatest = (
    ((latestScores?.person ?? 0) +
      (latestScores?.offer ?? 0) +
      (latestScores?.belief ?? 0)) /
    3
  ).toFixed(1);

  const prevScores = previous?.scores ?? {};
  const avgPrev = (
    ((prevScores?.person ?? 0) +
      (prevScores?.offer ?? 0) +
      (prevScores?.belief ?? 0)) /
    3
  ).toFixed(1);

  const isImproving = parseFloat(avgLatest) > parseFloat(avgPrev);
  const scoreDiff = Math.abs(parseFloat(avgLatest) - parseFloat(avgPrev)).toFixed(1);

  return (
    <Card className="border-accent/50 bg-accent/5">
      <CardHeader>
        <CardTitle className="text-base">Your Funnel Weekly Trend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{avgLatest}</span>
          <span className="text-sm text-muted-foreground">/ 10 average</span>
          {previous && (
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                isImproving ? "text-green-600" : "text-red-600"
              }`}
            >
              {isImproving ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {scoreDiff}
            </span>
          )}
        </div>

        {latest.label && (
          <div className="text-sm">
            <span className="text-muted-foreground">Current diagnosis: </span>
            <span className="font-medium">{labelToDisplay(latest.label)}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Last re-scored{" "}
          {new Date(latest.scored_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            This week&apos;s scores
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {["person", "offer", "belief"].map((axis) => (
              <div key={axis} className="bg-background rounded p-2 text-center">
                <div className="text-muted-foreground mb-1 capitalize">
                  {axis}
                </div>
                <div className="text-lg font-bold">
                  {latestScores?.[axis] ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function labelToDisplay(label: string): string {
  const labelMap: Record<string, string> = {
    wrong_person: "Wrong Person",
    weak_offer: "Weak Offer",
    weak_belief: "Weak Belief",
  };
  return labelMap[label] || label;
}
