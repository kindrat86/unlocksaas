"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

/**
 * One-shot copy button next to the affiliate share URL.
 *
 * Client component because navigator.clipboard is a browser API. Kept
 * deliberately tiny — no state library, no animation framework. The parent
 * server component stays a Server Component.
 */
export function CopyLink({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Permissions denied: select-all the input so the user can ctrl-c.
      const el = document.getElementById("affiliate-share-url") as HTMLInputElement | null;
      el?.select();
    }
  }

  return (
    <div className="flex items-stretch gap-2">
      <input
        id="affiliate-share-url"
        readOnly
        value={shareUrl}
        className="flex-1 rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onFocus={(e) => e.currentTarget.select()}
      />
      <Button type="button" onClick={onCopy} variant="outline" size="default">
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
