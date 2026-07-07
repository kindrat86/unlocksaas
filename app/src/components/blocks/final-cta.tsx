/**
 * Final CTA – Brunson "the close before the close" rule (Building Block #21).
 *
 * Pivoted 2026-05-17 from newsletter-primary to diagnostic-primary so the
 * close mirrors the hero. The 5-email arc is preserved as a small subscribe
 * link below the primary diagnostic CTA.
 *
 * After the Stack, the Guarantee, the testimonials, and the scarcity block,
 * the visitor either acts or leaves. The Brunson rule: do not let the page
 * end on prose. The last block before the footer must be a CTA the visitor
 * cannot scroll past without seeing the offer one more time.
 *
 * Visual treatment: restrained shadcn – same Button defaults the rest of
 * the app uses.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FinalCta() {
  return (
    <section className="bg-muted/60 border-y border-border">
      <div className="py-16 px-6 max-w-2xl mx-auto text-center">
        <Badge variant="secondary" className="mb-4">
          One more time
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
          You read the whole page. That means something.
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
          Most founders who get this far do one of two things. They keep
          scrolling forever. Or they paste their live URL into the free
          diagnostic and find out – in ninety seconds – why the line is flat
          and which one move fixes it. The easiest first step is the second
          one.
        </p>

        {/* PRIMARY close – the diagnostic. */}
        <div className="max-w-md mx-auto mb-4">
          <Button asChild size="lg" className="w-full text-base sm:text-lg py-7 btn-glow">
            <Link href="/diagnostic">
              Get my free 2-minute diagnosis →
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Founding rate ($49/mo for life) closes at 100 builders.
          </p>
        </div>

        {/* Subordinate doors for the visitor who is already ready. */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Or pick a door
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button asChild variant="outline" size="lg">
            <Link href="/starter">Start the Playbook for $1</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/playbook-sales">The full Playbook – $49/mo</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Not ready to paste a URL?{" "}
          <a
            href="#newsletter-tail"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Subscribe to the newsletter
          </a>{" "}
          for one short letter a day for five days.
        </p>
      </div>
    </section>
  );
}
