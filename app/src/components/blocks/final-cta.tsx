/**
 * Final CTA — Brunson "the close before the close" rule (Building Block #21).
 *
 * After the Stack, the Guarantee, and the testimonials, the visitor either
 * acts or leaves. The Brunson rule: do not let the page end on prose. The
 * last block before the footer must be a CTA the visitor cannot scroll past
 * without seeing the offer one more time.
 *
 * Architecture (mirrors the hero CTA, intentionally — repetition is the
 * point):
 *   - Primary: free diagnostic (Reluctant Hero opt-in, $0)
 *   - Secondary: Start the Machine for $1 (the Starter rung)
 *   - Tertiary: full Machine $49/mo (the buyer who is already ready)
 *
 * Visual treatment: restrained shadcn — same Button defaults the rest of
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
          Pick the door that matches where you are right now. The diagnostic is
          free, the Starter is $1, the Machine is $49/mo with a 60-day refund
          enforced by code. Three doors. Same destination.
        </p>

        <div className="flex flex-col items-center gap-3 mb-6">
          <Button asChild size="lg">
            <Link href="/diagnostic">Yes — get my free diagnosis</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Free · 2 minutes · No card required
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/starter">Start the Machine for $1</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/machine-sales">The Full Machine — $49/mo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
