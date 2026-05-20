import { Card, CardContent } from "@/components/ui/card";

/**
 * Inline audio player for a glossary detail page.
 *
 * Renders a native HTML5 `<audio controls>` element so:
 *   - Apple Safari's reader mode picks the audio up as the canonical
 *     spoken-content rendition;
 *   - Google's Chrome / Android voice surface offers "listen to this page"
 *     using this MP3 instead of synthesising new TTS from the prose;
 *   - browser-native ARIA + keyboard controls Just Work, no third-party
 *     widget bundle, no client-side JS;
 *   - assistive tech (VoiceOver, TalkBack, NVDA) reads `aria-label` and
 *     surfaces the audio as a discoverable region.
 *
 * `preload="none"` keeps the cold-start cost of the page at zero – the
 * MP3 is fetched only when the visitor presses play.
 *
 * Brunson Hard-Rule: render only when `getGlossaryAudio(slug)` returns
 * non-null. This component does not defensively check – its presence on
 * the page is itself the assertion that the audio file exists at audioUrl.
 */
export interface GlossaryAudioPlayerProps {
  /** Absolute or relative URL of the MP3 file. */
  audioUrl: string;
  /** Real duration in seconds, measured from the encoded file. */
  durationSeconds: number;
  /** Term display name – used in the ARIA label only. */
  termName: string;
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rem = total - minutes * 60;
  if (minutes === 0) return `${rem}s`;
  return `${minutes}m ${rem.toString().padStart(2, "0")}s`;
}

export function GlossaryAudioPlayer({
  audioUrl,
  durationSeconds,
  termName,
}: GlossaryAudioPlayerProps) {
  const label = formatDuration(durationSeconds);
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-baseline justify-between mb-3 gap-3">
          <p className="text-xs uppercase tracking-widest text-primary">
            Listen to the definition
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">{label}</p>
        </div>
        <audio
          controls
          preload="none"
          className="w-full"
          aria-label={`Audio definition of ${termName}`}
        >
          <source src={audioUrl} type="audio/mpeg" />
          <p className="text-sm text-muted-foreground">
            Your browser does not support inline audio playback.{" "}
            <a href={audioUrl} className="underline hover:text-foreground">
              Download the MP3
            </a>{" "}
            instead.
          </p>
        </audio>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Narrated reading of the short definition above. The full page is
          the transcript; this audio is one episode of the{" "}
          <a
            href="/glossary/podcast.xml"
            className="underline hover:text-foreground"
          >
            Unlock SaaS Glossary podcast feed
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
