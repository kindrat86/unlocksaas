"use client";

/**
 * Minimal copy-to-clipboard button.
 *
 * Single-purpose client component. Stays small (no animation library, no
 * toast system) so it doesn't bloat any page that uses it.
 *
 * Used by the Verified Builder embed page to let the builder copy the
 * HTML / markdown snippet without selecting it by hand. Pattern can be
 * re-used anywhere we publish a snippet we want the visitor to paste.
 *
 * Falls back gracefully on environments where `navigator.clipboard` is
 * unavailable (e.g. very old browsers, non-https previews): the button
 * stays visible but the label flips to "Press Cmd+C" so the visitor
 * knows to fall back to manual selection.
 */

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  /** The text to write to the clipboard. */
  text: string;
  /** Idle-state button label. Defaults to "Copy". */
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "fallback">("idle");

  const onClick = useCallback(async () => {
    // navigator.clipboard requires a secure context. Most production traffic
    // and every Vercel preview deployment is https, but local file:// or
    // legacy intranet previews can be insecure – we surface a fallback
    // hint instead of silently failing.
    if (
      typeof navigator === "undefined" ||
      typeof navigator.clipboard?.writeText !== "function"
    ) {
      setState("fallback");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      // Reset after 2s so a second copy still feels responsive.
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("fallback");
    }
  }, [text]);

  const display =
    state === "copied"
      ? "Copied"
      : state === "fallback"
        ? "Press Cmd+C"
        : label;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-live="polite"
      className="text-xs"
    >
      {state === "copied" ? (
        <Check className="h-3 w-3 mr-1.5" />
      ) : (
        <Copy className="h-3 w-3 mr-1.5" />
      )}
      {display}
    </Button>
  );
}
