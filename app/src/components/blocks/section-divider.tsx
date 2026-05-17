/**
 * Section divider with eye-flow arrow — Brunson page-rhythm rule.
 *
 * Between Brunson Building Blocks, the visitor's eye needs a visual nudge
 * to keep moving down. A bare <Separator /> closes the previous section
 * but offers no momentum cue. Adding a small bouncing arrow (used in the
 * hero CTA) signals "there's more — keep reading."
 *
 * Three variants:
 *   - "default" — single bouncing arrow over a soft purple line
 *   - "muted"   — line only, no arrow (for between dense, equal-weight
 *                 blocks where another arrow would be noise)
 *   - "loud"    — orange arrow, used right before a CTA block
 *
 * Respects prefers-reduced-motion: animation pauses for visitors who opt out.
 */

type Variant = "default" | "muted" | "loud";

interface Props {
  variant?: Variant;
  className?: string;
}

export function SectionDivider({ variant = "default", className }: Props) {
  if (variant === "muted") {
    return (
      <div
        className={`flex justify-center py-6 ${className ?? ""}`}
        aria-hidden="true"
      >
        <div className="h-px w-24 bg-purple-200" />
      </div>
    );
  }

  const arrowColor = variant === "loud" ? "text-orange-500" : "text-purple-400";
  const arrowSize = variant === "loud" ? "text-4xl" : "text-2xl";

  return (
    <div
      className={`flex flex-col items-center justify-center py-6 sm:py-8 ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="h-px w-24 bg-purple-200 mb-3" />
      <div className={`${arrowColor} ${arrowSize} animate-bounce motion-reduce:animate-none select-none leading-none`}>
        ↓
      </div>
    </div>
  );
}
