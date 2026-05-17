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
 * Visual treatment: ClickFunnels 1.0 light theme — white background, soft
 * purple top/bottom borders, gray-500 small caps "As seen in" label, gray-700
 * publication names with purple hover.
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
      className="bg-white border-y border-purple-100 py-6 px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-purple-700 text-center mb-3">
          As seen in
        </p>
        <ul className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm font-bold text-gray-700">
          {mentions.map((m) => (
            <li key={m.url}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                title={m.context ?? `Read at ${m.publication}`}
                className="hover:text-purple-700 transition-colors underline-offset-4 hover:underline"
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
