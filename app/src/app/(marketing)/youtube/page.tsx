import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import {
  FOUNDERS_DIARY_CHANNEL,
  episodeSlug,
  hubDiagnosticUrl,
  liveEpisodes,
} from "@/lib/youtube";

/**
 * The Founder's Diary — public hub for the faceless YouTube channel.
 *
 * Channel #5, additive to the locked launch-minimum-four (X + IH + r/SaaS +
 * r/microsaas). See strategy/youtube-faceless-channel.md for the full spec.
 *
 * The page is intentionally simple:
 *   - Cold-open hook in the founder's voice
 *   - One CTA to /diagnostic (with youtube hub UTM)
 *   - Live episode grid (renders empty + honest state pre-launch, mirroring
 *     the /builders empty-state pattern)
 *
 * It is fully static — no async data reads, no Suspense gymnastics, no
 * cookie reads. The episode list is a typed module constant
 * (lib/youtube.ts) so all "data" is build-time visible to RSC.
 */

const HUB_URL = "https://unlocksaas.com/youtube";

export const metadata: Metadata = {
  title: "The Founder's Diary on YouTube – $0 to first paying customer, in public",
  description:
    "The faceless YouTube channel where Maryan logs the work of going from $0 to his first verified paying customer. Two short episodes a week. No talking-head, no fake urgency.",
  alternates: pageAlternates("/youtube"),
  openGraph: {
    title: "The Founder's Diary – $0 to first paying customer, in public",
    description:
      "Two short episodes a week. No talking-head, no fake urgency. Just the work, screen-recorded.",
    url: "/youtube",
    type: "website",
  },
};

export default function YoutubeHubPage() {
  const episodes = liveEpisodes();

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Site-graph anchor for SERP + LLM crawlers. Two-deep trail keeps the
          page positioned as a top-level marketing surface, parallel to /press
          and /bridge. */}
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "The Founder's Diary on YouTube", url: HUB_URL },
        ]}
      />
      <AbExposureBeacon />

      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          {FOUNDERS_DIARY_CHANNEL.name} · YouTube series
        </p>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
          {FOUNDERS_DIARY_CHANNEL.tagline}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          I shipped six products. None of them have a paying customer. For
          nine months I refused to look at the flat line in Stripe. This
          channel is the public log of me fixing it, one short episode at a
          time. No talking-head, no fake urgency, no neon. Just the work,
          screen-recorded.
        </p>

        <p className="text-sm text-muted-foreground italic mb-8">
          – Maryan, marketer, non-engineer, built a dozen AI products that
          nobody paid for. Then I figured out why.
        </p>

        <Card className="mb-10">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-semibold">
              If your Stripe line looks like mine, start where I started.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The 90-second free diagnostic reads your live product page and
              labels what is actually broken – Wrong Person, Weak Offer, or
              Weak Belief – and hands you the door that fixes it. No card.
              No bait-and-switch.
            </p>
            <Button asChild className="w-full mt-2">
              <Link href={hubDiagnosticUrl()}>
                Take the free diagnostic →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Separator className="mb-10" />

        <section aria-labelledby="episodes-heading" className="mb-12">
          <h2
            id="episodes-heading"
            className="text-xl font-semibold mb-4"
          >
            Episodes
          </h2>

          {episodes.length === 0 ? (
            /* Honest empty state. Mirrors the /builders directory convention:
               no fake episode count, no "coming soon" placeholders, just a
               truthful sentence about the gates the channel still has to
               clear before E01 ships. See
               strategy/youtube-faceless-channel.md §7. */
            <div className="rounded-lg border border-border bg-muted/30 p-6 text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                Episode 1 ships after three gates close: the first month&apos;s
                backlog is fully scripted, the production runbook has been
                dry-run once end-to-end, and the channel art is live on
                YouTube. The 30-episode arc is locked in
                <code className="mx-1 px-1 py-0.5 rounded bg-background text-foreground text-xs">
                  strategy/youtube-founders-diary-backlog.md
                </code>
                .
              </p>
              <p>
                Cadence on launch: {FOUNDERS_DIARY_CHANNEL.cadence}, two short
                episodes a week. If you want the first one in your inbox the
                day it drops, take the diagnostic above – the same email
                list ships the launch ping.
              </p>
            </div>
          ) : (
            <ol className="space-y-4">
              {episodes.map((ep) => {
                const episodePath = `/youtube/${episodeSlug(ep)}`;
                return (
                  <li key={ep.id}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                            {ep.id}
                          </span>
                          <h3 className="text-base font-semibold leading-tight">
                            <Link
                              href={episodePath}
                              className="hover:underline underline-offset-4"
                            >
                              {ep.title}
                            </Link>
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {ep.hook_3s}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button asChild size="sm">
                            <Link href={episodePath}>
                              Episode notes + transcript →
                            </Link>
                          </Button>
                          {ep.youtube_url && (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={ep.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Watch on YouTube
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <Separator className="mb-10" />

        <section aria-labelledby="why-faceless" className="mb-12">
          <h2
            id="why-faceless"
            className="text-xl font-semibold mb-3"
          >
            Why faceless
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            A solo founder cannot run a talking-head YouTube channel and a
            playbook and customer outreach. So this channel is scripted,
            voiced, and edited like a documentary instead. The voice is
            mine. The script is mine. The B-roll is generated. The cuts are
            tight. The series ends when the founder gets his first paying
            customer – which, if you are reading this before episode 30 ships,
            has not happened yet.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If that sounds like a series you would actually watch, the door
            is the diagnostic. Same as every other surface on this site.
          </p>
        </section>

        <div className="text-center">
          <Button asChild>
            <Link href={hubDiagnosticUrl()}>
              Take the free diagnostic →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
