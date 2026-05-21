import { Card, CardContent } from "@/components/ui/card";
import type { HeadlineCopy } from "@/lib/diagnostic-variants";

/**
 * Per-answer headline overlay for the diagnostic result page.
 *
 * Renders the (preheader, headline, framing) triplet chosen by the variant
 * resolver in lib/diagnostic-variants.ts. Sits ABOVE the LLM-generated
 * Reluctant-Hero read-out so the founder sees their stated goal mirrored
 * back to them before they read the diagnosis.
 *
 * Server-renderable, no client JS. Hidden when printing — the saved PDF is
 * the teardown only.
 *
 * Source: 2026-05-21 quiz-funnel synthesis — visible personalization is the
 * differentiator between a 40.1%-conversion quiz funnel and a generic static
 * lead magnet (3–10%).
 */
export function QuizHeadlineOverlay({ copy }: { copy: HeadlineCopy }) {
  return (
    <Card className="mb-8 border-primary/30 bg-primary/5 print:hidden">
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {copy.preheader}
        </p>
        <h2 className="text-xl md:text-2xl font-bold leading-snug mb-3">
          {copy.headline}
        </h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          {copy.framing}
        </p>
      </CardContent>
    </Card>
  );
}
