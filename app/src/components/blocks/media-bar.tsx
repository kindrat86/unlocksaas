/**
 * "As seen in" media bar — Brunson Funnel Hacker's Cookbook Swipe 3.
 *
 * Composition rules (acceptance test from strategy/funnel-hackers-cookbook.md):
 *   - Single row, muted, never above the H1.
 *   - Each label links to the actual artifact, not the publication's homepage.
 *   - Bar only renders when at least 3 earned mentions exist.
 *   - When fewer than 3, this component returns null and the funnel hub
 *     falls back to its existing honest empty-state section.
 *
 * Identity guardrail: no paid placements badged as earned. The filter in
 * `lib/media-mentions.ts` enforces this; this component trusts the filter.
 *
 * This is a server component. No interactivity. No client JS shipped.
 */
import { getEarnedMentions, shouldRenderMediaBar } from "@/lib/media-mentions";

export function MediaBar() {
  if (!shouldRenderMediaBar()) {
    // Pre-stage discipline: the component exists, ready for the moment three
    // earned mentions exist. Until then, render nothing — the funnel hub's
    // honest "Nowhere yet" empty-state stays visible instead.
    return null;
  }

  const mentions = getEarnedMentions();

  return (
    <section
      aria-label="Earned media mentions"
      className="border-y border-border/40 bg-card/30 py-5 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 text-center mb-3">
          As seen in
        </p>
        <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {mentions.map((m) => (
            <li key={m.url}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                title={m.context ?? `Read at ${m.publication}`}
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {m.publication}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
