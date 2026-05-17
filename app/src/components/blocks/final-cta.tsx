/**
 * Final CTA – Brunson "the close before the close" rule (Building Block #21).
 *
 * After the Stack, the Guarantee, the testimonials, and the scarcity block,
 * the visitor either acts or leaves. The Brunson rule: do not let the page
 * end on prose. The last block before the footer must be a CTA the visitor
 * cannot scroll past without seeing the offer one more time.
 *
 * Lead-funnel close: the homepage's primary target is the email opt-in. The
 * Final CTA leads with the newsletter, then offers the two paid doors below
 * for the visitor who is already ready. This matches the hero, on purpose –
 * repetition is the point.
 *
 * Visual treatment: restrained shadcn – same Button defaults the rest of
 * the app uses.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter-signup";

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
          scrolling forever. Or they put their email in the box and let me
          send them the five short letters that explain – in one founder&apos;s
          voice, no guru energy – what the work actually looks like. The
          easiest first step is the second one.
        </p>

        {/* PRIMARY close – newsletter opt-in (homepage target). */}
        <div className="max-w-md mx-auto mb-8 text-left">
          <NewsletterSignup variant="hero" source="final_cta" />
        </div>

        {/* Subordinate doors for the visitor who is already ready. */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Or skip the letters and pick a door
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/diagnostic">Free 2-minute diagnosis</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/starter">Start the Playbook for $1</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/playbook-sales">The full Playbook – $49/mo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
