import { CheckCircle2, Lock } from "lucide-react";
import {
  MACHINE_CHAPTERS,
  PLAYBOOK_CHAPTERS,
  STARTER_CHAPTERS,
} from "@/lib/playbook";

/**
 * Table of Contents preview rendered on /starter.
 *
 * Brunson DotCom Secrets Secret #17 + Secret #10 (23 Building Blocks): the
 * buyer wants to see every chapter of the book before paying. A TOC closes
 * the "what am I actually getting" friction better than three paragraphs of
 * feature copy. Free chapters get a green check. Locked chapters get a lock
 * + "$49 Machine unlocks" tag — sets up the OTO without selling against the
 * $1 here.
 *
 * Honest-math discipline: locked chapter blurbs stay visible (muted), not
 * blacked-out. The buyer can read what they're choosing to defer. Brunson
 * rule from Secret #1 (the skeptic avatar): never hide what you're selling.
 */
export function PlaybookContents() {
  return (
    <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
        Table of contents
      </p>
      <h2 className="text-xl font-bold mb-1">
        What lands in your Playbook.
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        The $1 unlocks the foreword, the first two chapters, and all three
        appendices — yours to keep, no recurring charge. The remaining five
        chapters open when you upgrade to the full Machine. Same Playbook,
        same cover, more pages.
      </p>

      <ol className="space-y-3 text-sm">
        {PLAYBOOK_CHAPTERS.map((ch) => (
          <li key={ch.id} className="flex items-start gap-3">
            {ch.unlockedAtStarter ? (
              <CheckCircle2
                className="h-4 w-4 text-primary mt-1 shrink-0"
                aria-label="Included at $1"
              />
            ) : (
              <Lock
                className="h-4 w-4 text-muted-foreground mt-1 shrink-0"
                aria-label="Unlocks with the $49 Machine"
              />
            )}
            <div>
              <p
                className={
                  ch.unlockedAtStarter
                    ? "font-semibold"
                    : "font-semibold text-muted-foreground"
                }
              >
                {ch.number !== null ? `Chapter ${ch.number}. ` : ""}
                {ch.title}
                {!ch.unlockedAtStarter && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    $49 Machine unlocks
                  </span>
                )}
              </p>
              <p
                className={
                  ch.unlockedAtStarter
                    ? "text-muted-foreground leading-relaxed"
                    : "text-muted-foreground/70 leading-relaxed"
                }
              >
                {ch.blurb}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
        <strong className="text-foreground">{STARTER_CHAPTERS.length}</strong>{" "}
        of {PLAYBOOK_CHAPTERS.length} entries unlocked at $1.{" "}
        <strong className="text-foreground">+{MACHINE_CHAPTERS.length}</strong>{" "}
        more on the $49 upgrade. The cover does not change.
      </p>
    </section>
  );
}
