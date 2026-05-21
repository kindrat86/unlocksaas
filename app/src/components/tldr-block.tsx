/**
 * TL;DR Block — Answer-first content for LLM citation lift.
 *
 * 72.4% of ChatGPT-cited pages have a direct answer in the first 60 words after
 * a question heading. 44.2% of all LLM citations come from the first 30% of text.
 *
 * Renders as italic gray text (~2 sentences max, <60 words) immediately after
 * H2/H3 headings to capture LLM attention early and boost citation metrics.
 *
 * Usage:
 *   <h2>Why isn't my SaaS converting?</h2>
 *   <TldrBlock>
 *     Most founders forget that traffic without an offer isn't a business.
 *     This diagnostic finds the single biggest leak in your funnel.
 *   </TldrBlock>
 */

export function TldrBlock({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground italic leading-relaxed my-3">
      {children}
    </p>
  );
}
