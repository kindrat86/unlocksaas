"use client";

/**
 * Tiny client-only "Copy" button. Lifted out of citation-block.tsx so
 * the parent stays a Server Component and only the clipboard interaction
 * ships JavaScript. The button gracefully degrades when navigator.clipboard
 * is unavailable (older browsers, secure-context violations) by falling
 * back to a synchronous document.execCommand("copy") path.
 *
 * No external state library, no toast wiring – the visible state lives
 * in one local useState. The button label flips to "Copied" for two
 * seconds, then snaps back.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  /** The text to copy when the button is clicked. */
  value: string;
  /** Default label. */
  label?: string;
  /** Label flashed after a successful copy. */
  copiedLabel?: string;
  /** ARIA label for screen readers. */
  ariaLabel?: string;
}

/**
 * Copy `value` to the clipboard with a graceful fallback. Returns
 * true when the copy succeeded (modern API or execCommand) and false
 * otherwise. The fallback uses a hidden textarea + execCommand because
 * navigator.clipboard is gated on secure contexts and on user-gesture
 * heuristics that some embedded iframes block.
 */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to execCommand
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      aria-label={ariaLabel ?? label}
      className="text-xs h-7 px-2"
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
