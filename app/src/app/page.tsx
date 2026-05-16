import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { getIdentityLabels, readIdentityFromCookies } from "@/lib/ab";

export default function FunnelHub() {
  const variant = readIdentityFromCookies();
  const labels = getIdentityLabels(variant);

  return (
    <div className="min-h-screen flex flex-col">
      <AbExposureBeacon />
      {/* Hero */}
      <header className="py-20 px-6 text-center max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Unlock SaaS
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          The problem stuck founders have is not the product. It is that an
          entire industry profits from teaching them to keep building when the
          only thing left is to sell.
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Marketer, non-engineer, built a dozen AI products that nobody paid
          for. Then I figured out why.
        </p>

        {/* Three CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/diagnostic">Get Your Free Diagnosis</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/starter">Start the Machine for $1</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/machine-sales">The Full Machine — $49/mo</Link>
          </Button>
        </div>
      </header>

      <Separator className="max-w-4xl mx-auto" />

      {/* Manifesto (half) — A/B identity_label variant from sticky cookie. */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {labels.manifestoTitle}
        </h2>
        <blockquote className="text-muted-foreground space-y-4 leading-relaxed">
          <p>
            We are non-engineer founders who shipped real things with AI tools we
            did not write.
          </p>
          <p>
            We were told the answer was more building, then more traffic, then a
            better course. We tried all three. The line stayed flat.
          </p>
          <p>
            We stopped pretending the problem was the product. The problem was
            the work nobody taught us to do: name one real person, make one real
            promise, sell it before it felt ready.
          </p>
          <p>
            We measure progress in Stripe charges, not in encouragement. We do
            not collect praise. We collect customers.
          </p>
        </blockquote>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Founder Intro */}
      <section className="py-16 px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">The Founder</h2>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
          <p className="text-muted-foreground">
            Six-line intro video placeholder
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          I&apos;m a marketer and an operator. I have never written a line of
          production code. In 2026, Lovable and Claude opened the door and I
          shipped real AI products in weeks. The shipping part felt like magic.
          What came after did not. I would launch, open Stripe, and watch a line
          lie flat. What finally broke me was talking to more than ten other
          founders and hearing my own story back, every single time. So I built
          the machine I wish someone had handed me.
        </p>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Newsletter + Social */}
      <section className="py-16 px-6 max-w-md mx-auto text-center">
        <h2 className="text-lg font-bold mb-4">Stay in the loop</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Founders who build real things with AI deserve to get paid for them.
        </p>
        <div className="flex gap-4 justify-center text-sm text-muted-foreground">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="https://www.indiehackers.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Indie Hackers
          </a>
          <a
            href="https://reddit.com/r/SaaS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            r/SaaS
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-muted-foreground mt-auto">
        <p>&copy; 2026 Unlock SaaS. Built by a non-engineer who shipped anyway.</p>
      </footer>
    </div>
  );
}
