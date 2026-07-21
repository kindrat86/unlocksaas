/**
 * Before / After — Brunson Building Block #22.
 *
 * The transformation made concrete. Workbook 04 §2 (offer/dream-outcome).
 * The "after" column intentionally names ONE specific event (a Stripe charge),
 * not vague aspirations ("more revenue", "growth"). Specificity is the entire
 * marketing for a skeptic.
 *
 * No fabricated screenshots. The dashboards described are the founder's OWN Stripe
 * dashboard — past state vs future state. The Playbook is the road between them.
 */
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cacheLife } from "next/cache";

export async function BeforeAfter() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Two Stripe Dashboards
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          You only need one of these to change.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Before
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-4 leading-tight">
              The flat line you refresh every morning.
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>Product shipped. Users signed up. Praise in comments.</li>
              <li>Stripe MRR: a horizontal line you cannot explain.</li>
              <li>The story you tell yourself: &ldquo;one more feature.&rdquo;</li>
              <li>The story underneath: &ldquo;I haven&apos;t talked to a customer.&rdquo;</li>
              <li>Hours spent on SEO, X threads, tactic-shopping.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                After (Day 60 or earlier)
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-4 leading-tight">
              One verified Stripe charge, in your dashboard, from a real customer.
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>A named dream customer you can describe in one sentence.</li>
              <li>An offer with a guaranteed result. Defensible 10x math.</li>
              <li>20 logged outreach actions. Each one tracked, not imagined.</li>
              <li>Stripe webhook fires. The badge lights up. You exhale.</li>
              <li>The Playbook: still running. The next 9 customers come faster.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground italic text-center mt-6 leading-relaxed">
        If the &ldquo;after&rdquo; dashboard does not exist in 60 days and you completed the
        in-product milestones, the two monthly payments come back.
      </p>
    </section>
  );
}
