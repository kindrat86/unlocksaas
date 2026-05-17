/**
 * The Funnel Hub VSL script — Who / What / Why / How.
 *
 * Source: DotCom Secrets Secret #20 (VSL Funnels), Expert Secrets Section Two
 * (Epiphany Bridge) and Section Three (Big Domino + Three Secrets), and the
 * locked Attractive Character + Vehicle Story from `strategy/state.json`.
 *
 * Why this file exists: the script is the SAME content whether the founder
 * records a real-camera VSL or whether the site renders the
 * `ScriptedVsl` kinetic-typography fallback. Encoding it as typed data:
 *   1. Keeps copy in one place. Workbook updates flow through here.
 *   2. Lets the scripted fallback auto-time itself off `durationMs`.
 *   3. Lets the recording-instructions doc (`strategy/vsl-script.md`)
 *      stay in sync: regenerate from this file when copy changes.
 *
 * Total runtime: ~110 seconds at 180 wpm + 1s per scene pause. This sits in
 * the Brunson sweet spot for cold-traffic funnel-hub VSL (60-120s).
 *
 * Voice rule (Reluctant Hero, locked in workbook 01 §6 Beat 1):
 * confess first, claim second. Every scene that makes a claim is preceded
 * or paired with a scene that confesses the same wall the visitor is hitting.
 */

export type VslSceneRole =
  | "hook"        // arrests scroll
  | "who"         // who am I and why should you listen
  | "big_domino"  // the one belief whose acceptance reorders everything
  | "what"        // the new opportunity, named
  | "why"         // why your old way did not work / why this does
  | "how"         // the mechanical seven steps
  | "offer"       // the promise + guarantee in one sentence
  | "cta";        // what to click next

export interface VslScene {
  /** Stable id for analytics — never rename historic ids. */
  id: string;
  role: VslSceneRole;
  /** Short label shown in the per-scene progress indicator. */
  chapter: string;
  /** Body copy. Each entry is one line break on screen + one beat. */
  lines: string[];
  /** One word per scene gets bold emphasis — kinetic-typography accent. */
  emphasis?: string;
  /** Read-time + pause, in milliseconds. */
  durationMs: number;
  /**
   * Spoken delivery notes for the founder when recording the real VSL.
   * Surfaces in `strategy/vsl-script.md`, never rendered on screen.
   */
  speakerNote?: string;
}

export interface VslScript {
  /** Canonical title used in og-image + transcripts. */
  title: string;
  /** One-sentence subhead the page renders above the player. */
  subtitle: string;
  /** Ordered scenes. */
  scenes: VslScene[];
  /** Computed total runtime ms, for analytics + recording target. */
  totalDurationMs: number;
}

const SCENES: VslScene[] = [
  {
    id: "01_hook",
    role: "hook",
    chapter: "Hook",
    lines: [
      "I built a dozen AI products.",
      "Nobody paid for any of them.",
    ],
    emphasis: "Nobody",
    durationMs: 6500,
    speakerNote:
      "Flat, factual delivery. No emotion, no apology. The flatness IS the hook.",
  },
  {
    id: "02_who_non_engineer",
    role: "who",
    chapter: "Who",
    lines: [
      "I am not an engineer.",
      "I have never written a line of production code.",
    ],
    emphasis: "not",
    durationMs: 7000,
    speakerNote:
      "Lean into the confession. This is the polarity wedge — non-engineer who shipped anyway.",
  },
  {
    id: "03_who_mirror",
    role: "who",
    chapter: "Who",
    lines: [
      "What broke me was sitting with ten other founders",
      "and hearing my own story back. Every time.",
    ],
    emphasis: "Every time.",
    durationMs: 9500,
    speakerNote:
      "Pause after 'broke me'. This is Parable #4, 'The Mirror in Ten Founders' — say it like a memory, not a marketing line.",
  },
  {
    id: "04_what_setup",
    role: "what",
    chapter: "The setup",
    lines: [
      "There is one belief that",
      "if you accept it, changes everything.",
    ],
    emphasis: "one belief",
    durationMs: 7500,
    speakerNote:
      "Slow down. Look at the camera. This is the Big Domino setup — telegraph that the next sentence matters.",
  },
  {
    id: "05_big_domino",
    role: "big_domino",
    chapter: "The big domino",
    lines: [
      "Your first paying customer is reachable in 60 days",
      "through software.",
      "Not more building. Not more traffic.",
    ],
    emphasis: "60 days",
    durationMs: 13000,
    speakerNote:
      "Land each sentence. Beat between them. This is the load-bearing line of the entire page.",
  },
  {
    id: "06_what_name",
    role: "what",
    chapter: "What",
    lines: [
      "It is called The Machine.",
      "Seven steps. Each one mechanical. Each one verified.",
    ],
    emphasis: "The Machine",
    durationMs: 9000,
    speakerNote:
      "Mechanical, deliberate tone — match the brand. No vibe, no fluff.",
  },
  {
    id: "07_why_old_way",
    role: "why",
    chapter: "Why your old way failed",
    lines: [
      "You were told the answer was a better product.",
      "Then more traffic.",
      "Then a course.",
      "The line stayed flat.",
    ],
    emphasis: "stayed flat",
    durationMs: 13000,
    speakerNote:
      "List rhythm — pause between each line. Then the last line lands like a verdict.",
  },
  {
    id: "08_why_real_work",
    role: "why",
    chapter: "Why this works",
    lines: [
      "What does break the flat line:",
      "name one real person.",
      "Write one real promise.",
      "Send one real message.",
    ],
    emphasis: "one real",
    durationMs: 12500,
    speakerNote:
      "Three short imperatives. Land each. This is the through-line of the manifesto.",
  },
  {
    id: "09_how_engine",
    role: "how",
    chapter: "How it works",
    lines: [
      "The Machine refuses to let you skip that work.",
      "The engine pushes back on vague answers.",
      "The outreach is generated and tracked.",
      "The result is verified by your own Stripe.",
    ],
    emphasis: "your own Stripe",
    durationMs: 14500,
    speakerNote:
      "Move briskly. This is the proof block — three mechanical claims back-to-back.",
  },
  {
    id: "10_offer",
    role: "offer",
    chapter: "The promise",
    lines: [
      "Sixty days.",
      "First paying customer, verified.",
      "Or you do not pay.",
    ],
    emphasis: "Or you do not pay.",
    durationMs: 10500,
    speakerNote:
      "Three sentences, each on its own beat. End on the guarantee — and stop.",
  },
  {
    id: "11_cta",
    role: "cta",
    chapter: "Where to go next",
    lines: [
      "Three doors below.",
      "Pick the one that fits where you are.",
    ],
    emphasis: "Pick",
    durationMs: 7000,
    speakerNote:
      "Friendly, not pushy. Then sign off with one beat of silence so the buttons take over.",
  },
];

export const VSL_SCRIPT: VslScript = {
  title: "The Machine — in 110 seconds",
  subtitle:
    "Why your line is flat, what fixes it, and the 60-day promise — said out loud.",
  scenes: SCENES,
  totalDurationMs: SCENES.reduce((sum, s) => sum + s.durationMs, 0),
};

/**
 * Source of truth for the video URL.
 *
 * When `NEXT_PUBLIC_VSL_URL` is set in env (Cloudflare Stream HLS, Mux,
 * a direct MP4, anything `<video>` can play), the player renders the real
 * recording. When unset (today), the player renders the kinetic-typography
 * `ScriptedVsl` fallback so the funnel hub is NEVER without a VSL surface.
 *
 * The scripted fallback is not a placeholder. It is a real Brunson VSL
 * format (Frank Kern + Russell himself have used kinetic-typography VSLs
 * in production for campaigns where face-to-camera was not yet ready).
 * The recording replaces it, it does not unblock it.
 */
export function getVslVideoUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_VSL_URL;
  if (!url || url.trim().length === 0) return undefined;
  return url;
}

export function getVslPosterUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_VSL_POSTER_URL;
  if (!url || url.trim().length === 0) return undefined;
  return url;
}
