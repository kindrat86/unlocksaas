"use client";

/**
 * PrintPageLink — Brunson "PWP" (Perfect Webinar Print) discipline.
 *
 * DotCom Secrets Secret #22 / Expert Secrets Secret #11: the long-form sales
 * page must be saveable — Brunson's skeptic-avatar archetype saves the page
 * to read offline, share with a partner, or revisit before deciding. A page
 * with no save mechanism is implicitly read-once-or-lose. This is the cheapest
 * piece of the PWP — `window.print()` lets the browser save as PDF on every
 * platform (Cmd-P → "Save as PDF" on macOS, Ctrl-P on Windows, share-sheet
 * on iOS Safari).
 *
 * Pairs with `print:hidden` Tailwind utilities sprinkled across the sales
 * page on transient elements (jump-nav, separators, CTAs) so the printed
 * artifact reads like a sales letter, not a copied web page.
 *
 * The "use client" boundary is tiny — only `window.print()` needs the
 * browser. The label, the styles, and the SSR copy stay on the server.
 */
export function PrintPageLink({
  className,
  label = "Save or print this page",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      className={
        className ??
        "text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
      }
    >
      {label}
    </button>
  );
}
