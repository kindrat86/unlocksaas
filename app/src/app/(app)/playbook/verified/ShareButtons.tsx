"use client";

/**
 * Share-intent buttons + copy-to-clipboard for the celebration page.
 *
 * Pure client surface — server already computed the intent URLs and caption.
 * No analytics calls, no posting on behalf of the user (Hard Rule #5 —
 * "Never auto-post to social platforms").
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Send, Globe, Share2 } from "lucide-react";

interface Props {
  badgeUrl: string;
  caption: string;
  intents: {
    x: string;
    linkedin: string;
    reddit: string;
  };
}

export function ShareButtons({ badgeUrl, caption, intents }: Props) {
  const [copied, setCopied] = useState<"caption" | "url" | null>(null);

  function copy(value: string, kind: "caption" | "url") {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(kind);
        setTimeout(() => setCopied(null), 1600);
      },
      () => undefined
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button asChild variant="outline">
          <a href={intents.x} target="_blank" rel="noopener noreferrer">
            <Send className="h-4 w-4 mr-2" />
            Post on X
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={intents.linkedin} target="_blank" rel="noopener noreferrer">
            <Globe className="h-4 w-4 mr-2" />
            Post on LinkedIn
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={intents.reddit} target="_blank" rel="noopener noreferrer">
            <Share2 className="h-4 w-4 mr-2" />
            Post on Reddit
          </a>
        </Button>
      </div>

      <div className="rounded-md border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Caption
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => copy(caption, "caption")}
          >
            {copied === "caption" ? (
              <>
                <Check className="h-3 w-3 mr-1.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1.5" />
                Copy
              </>
            )}
          </Button>
        </div>
        <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
          {caption}
        </pre>
      </div>

      <div className="rounded-md border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Badge URL
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => copy(badgeUrl, "url")}
          >
            {copied === "url" ? (
              <>
                <Check className="h-3 w-3 mr-1.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1.5" />
                Copy
              </>
            )}
          </Button>
        </div>
        <code className="text-sm break-all text-foreground">{badgeUrl}</code>
      </div>
    </div>
  );
}
