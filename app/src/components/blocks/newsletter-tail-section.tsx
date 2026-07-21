import { cacheLife } from "next/cache";
import Link from "next/link";
import { TldrBlock } from "@/components/tldr-block";
import { NewsletterSignup } from "@/components/newsletter-signup";

/**
 * NewsletterTailSection — soft subscribe for visitors not ready to convert.
 * Extracted from page.tsx for code-splitting (page-weight optimization).
 */
export async function NewsletterTailSection() {
  "use cache";
  cacheLife("days");
  return (
    <section
      id="newsletter-tail"
      className="py-12 sm:py-16 px-4 sm:px-6 max-w-md mx-auto text-center scroll-mt-24"
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
        Not ready to paste a URL?
      </p>
      <h2 className="text-lg sm:text-xl font-bold mb-3 leading-tight text-balance">
        Get the 5-email arc instead.
      </h2>
      <TldrBlock>
        Five letters in five days from one founder who lived your year and
        built the way out. No sales pitch. Just answers to the questions every
        flat-line founder asks.
      </TldrBlock>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        One short letter a day for five days. Written like one founder to
        another, not a marketing sequence. By Friday you will know whether
        the Playbook is the right answer for you.
      </p>
      <div className="text-left">
        <NewsletterSignup
          variant="stacked"
          source="midpage_tail"
          ctaLabel="Subscribe to the newsletter"
        />
      </div>
      <p className="text-xs text-muted-foreground italic mt-5">
        Or{" "}
        <Link
          href="/diagnostic"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          skip the letters and run the free diagnostic
        </Link>
        .
      </p>
    </section>
  );
}
