/**
 * VSL Cuts Registry — Brunson DotCom Secrets Secret #20.
 *
 * Russell's VSL chapter is not "record one video and embed it everywhere."
 * The chapter is: every surface in the funnel gets the cut that fits it.
 * Cold ad gets 22 seconds. Funnel hub hero gets 45 seconds. Sales-page top
 * gets the long form. Email 1 gets a 90-second cut anchored on the WHAT.
 * Indie Hackers profile gets a 28-second WHO. Podcast pitches get a
 * 30-second clip the host can decide on.
 *
 * Source-of-truth for cut content:
 *   - `strategy/founder-vsl-script.md` — master 3:45 + X / IH / podcast cuts
 *   - `strategy/vsl-script.md`         — WWWH 4-5 min + hero + email-1 cuts
 *   - `app/src/lib/vsl/script.ts`      — the 110s kinetic-compact cut
 *
 * Each cut here is a metadata record. It does TWO jobs:
 *
 *   1. **Runtime swap.** When the operator records that surface's video and
 *      pushes `NEXT_PUBLIC_VSL_<KEY>_URL` to Vercel, `<VslBlock cut="..." />`
 *      flips from the 110s kinetic fallback to the cut-specific recording,
 *      with the right poster, the right JSON-LD duration, the right
 *      VideoObject `name` and `description`. No code change.
 *
 *   2. **Discoverability + operator ergonomics.** The transcript route at
 *      `/vsl/transcript` renders all seven cuts inline with chapter
 *      headings (WHO / WHAT / WHY / HOW) — feeds AEO/GEO + accessibility
 *      readers. The teleprompter at `/vsl/teleprompter` lets Maryan read a
 *      single cut at shoot-day reading pace with speaker notes alongside.
 *
 * Why all of this lives in one file: the seven cuts share scenes. If the
 * Big Domino sentence changes, it changes in one record (`bigDomino`) and
 * every cut that uses it updates together. If the cut metadata lived in
 * markdown alone, copy would drift between scripts the day after the first
 * edit.
 */

// ────────────────────────────────────────────────────────────────────────────
// Cut taxonomy
// ────────────────────────────────────────────────────────────────────────────

/**
 * The seven cuts of the founder VSL, in the order Brunson teaches them
 * (shortest → longest, cold → warm).
 *
 * Stable string IDs — never rename. Used as URL fragments in
 * `/vsl/transcript#<id>` and as analytics property values.
 */
export type VslCutId =
  | "bridge_cold_ad"        // 22s — cold-traffic X video, `/bridge` page
  | "indie_hackers_profile" // 28s — Indie Hackers profile video
  | "podcast_pitch"         // 30s — embedded in podcast cold-pitch emails
  | "funnel_hub_hero"       // 45s — `/` homepage above-the-fold
  | "email_1_what_why"      // 90s — Soap Opera Email 1 attachment
  | "kinetic_compact"       // 110s — kinetic-typography fallback (text-EB)
  | "full_long_form";       // 3:45 — `/machine-sales` + `/starter` top

/**
 * Brunson WWWH chapter labels. Used as JSON-LD `hasPart` Clip names and as
 * heading anchors on the transcript route.
 */
export type VslChapter =
  | "hook"
  | "who"
  | "what"
  | "why"
  | "how"
  | "offer"
  | "cta";

/**
 * One Brunson-chapter segment within a cut. Each segment is the smallest
 * unit that gets its own JSON-LD `hasPart` Clip when the video is recorded:
 * Google + LLMs use these to surface deep links ("watch the Big Domino").
 *
 * `startOffsetSec` is the chapter's start time inside the recorded video.
 * Until the video is recorded, the offsets serve the teleprompter (so the
 * operator knows when to switch from confession voice to claim voice).
 */
export interface VslCutSegment {
  /** Brunson chapter label — drives transcript headings + Clip naming. */
  chapter: VslChapter;
  /** Short label rendered in the player chapter chip + teleprompter rail. */
  label: string;
  /** Body — one entry per spoken paragraph beat. Plain text, no HTML. */
  paragraphs: string[];
  /** Camera / delivery direction for shoot day. Never rendered to visitors. */
  speakerNote?: string;
  /** Chapter start in seconds inside the cut. Drives JSON-LD Clip offsets. */
  startOffsetSec: number;
  /** Chapter length in seconds. */
  lengthSec: number;
}

/**
 * The full record for one cut. Everything pages, schemas, and the
 * operator-shoot teleprompter need to render the cut on its own surface.
 */
export interface VslCut {
  /** Stable id — see `VslCutId`. */
  id: VslCutId;
  /** Env-var infix. Resolves `NEXT_PUBLIC_VSL_<KEY>_URL` and friends. */
  envKey: string;
  /** Headline shown above the player on its surface. */
  title: string;
  /** Subhead shown beneath the title. Used as JSON-LD `description`. */
  subtitle: string;
  /** Surfaces this cut is intended to mount on. Audit + UI grouping. */
  surfaces: VslSurfaceTag[];
  /** Total runtime, integer seconds. */
  lengthSec: number;
  /** ISO-8601 duration (e.g. "PT45S") for JSON-LD `duration`. */
  iso8601Duration: string;
  /** Brunson-chapter segments in delivery order. */
  segments: VslCutSegment[];
  /** Shoot-day production notes, surfaced on the teleprompter. */
  productionNotes?: string[];
  /** Cold-traffic posting frame (e.g. "9:16 vertical, captions burned in"). */
  outputFraming?: string;
}

/**
 * Which page surface a cut is intended for. Free-form because the surfaces
 * are documented and don't need an enum constraint at this layer.
 */
export type VslSurfaceTag =
  | "bridge"
  | "funnel_hub"
  | "starter"
  | "machine_sales"
  | "founding"
  | "soap_opera_email_1"
  | "indie_hackers_profile"
  | "podcast_outreach"
  | "x_thread"
  | "transcript"
  | "teleprompter";

// ────────────────────────────────────────────────────────────────────────────
// Shared sentences — change once, every cut updates
// ────────────────────────────────────────────────────────────────────────────

/**
 * The Big Domino sentence. Workbook 07 §1. Used verbatim in every cut that
 * has a WHAT segment. If this sentence changes, change here only.
 */
const BIG_DOMINO =
  "Your first paying customer is reachable in 60 days, through software. Not through more building. Not through more traffic.";

/**
 * The guarantee sentence. Workbook 01 §2. Used verbatim wherever a cut
 * lands the guarantee on screen.
 */
const GUARANTEE =
  "Run the machine I built. Do the work it tracks. If 60 days pass and your Stripe shows no new paying customer, you get both months back. In full. Ninety-eight dollars. The risk is mine.";

/**
 * The disqualifier line. Workbook 01 §6 Beat 5. Used only in cuts ≥ 90s
 * because the line costs runtime and needs a beat of silence on either
 * side to land. Cold-ad cuts skip it.
 */
const DISQUALIFIER =
  "This is not for you if you have not shipped anything yet. Go ship first. Come back when your Stripe is flat.";

// ────────────────────────────────────────────────────────────────────────────
// The seven cuts
// ────────────────────────────────────────────────────────────────────────────

const CUT_BRIDGE_COLD_AD: VslCut = {
  id: "bridge_cold_ad",
  envKey: "COLD_AD",
  title: "Twenty-two seconds. Sound on.",
  subtitle:
    "If your Stripe is flat and your users say nice things, you do not have a product problem.",
  surfaces: ["bridge", "x_thread"],
  lengthSec: 22,
  iso8601Duration: "PT22S",
  segments: [
    {
      chapter: "hook",
      label: "The flat line",
      paragraphs: [
        "I'd launch. I'd open Stripe. And I'd watch a line lie flat.",
        "Twelve users. Two paying.",
      ],
      speakerNote:
        "Flat, factual delivery. No emotion, no apology. The flatness IS the hook.",
      startOffsetSec: 0,
      lengthSec: 10,
    },
    {
      chapter: "who",
      label: "The mirror",
      paragraphs: [
        "What finally broke me was sitting with ten other founders and hearing my own story back. Every single time.",
      ],
      speakerNote:
        "Pause after 'broke me'. Memory, not marketing line.",
      startOffsetSec: 10,
      lengthSec: 12,
    },
  ],
  outputFraming:
    "Vertical 9:16 export. Captions burned in (sound-off viewing is default on X). NO link in the post body — link lives in bio per workbook 09 §1.",
};

const CUT_INDIE_HACKERS_PROFILE: VslCut = {
  id: "indie_hackers_profile",
  envKey: "IH_PROFILE",
  title: "Indie Hackers profile, 28 seconds.",
  subtitle:
    "Non-engineer, shipped real things with AI, figured out how to get paid.",
  surfaces: ["indie_hackers_profile"],
  lengthSec: 28,
  iso8601Duration: "PT28S",
  segments: [
    {
      chapter: "who",
      label: "Who I am",
      paragraphs: [
        "I'm a marketer. I'm an operator. I have never written a line of production code in my life.",
        "For most of my life, that closed a door. Then in 2026, Lovable and Claude opened it. And I shipped real AI products in a few weeks. The shipping part felt like magic.",
        "What came after did not.",
      ],
      speakerNote:
        "Same opening as Beat 1 of the master. Land 'never written a line of production code' as the polarity wedge.",
      startOffsetSec: 0,
      lengthSec: 22,
    },
    {
      chapter: "what",
      label: "The promise",
      paragraphs: [
        "So here is what I'd say to you, if you're on the other side of that flat Stripe line right now.",
        "Your first paying customer is reachable in 60 days.",
      ],
      speakerNote:
        "Lift slightly. Voice firms up. End on the 60 days, hold the look.",
      startOffsetSec: 22,
      lengthSec: 6,
    },
  ],
  outputFraming:
    "16:9 horizontal. IH profile videos play inline, audio on, so no burned captions required (but include SRT for accessibility). Hosted on IH's own video uploader, not YouTube embed.",
};

const CUT_PODCAST_PITCH: VslCut = {
  id: "podcast_pitch",
  envKey: "PODCAST_PITCH",
  title: "Thirty seconds, for podcast hosts.",
  subtitle:
    "Embedded in the five Tier-1 podcast pitch emails — gives the host the voice without committing to a pre-call.",
  surfaces: ["podcast_outreach"],
  lengthSec: 30,
  iso8601Duration: "PT30S",
  segments: [
    {
      chapter: "who",
      label: "Who I am",
      paragraphs: [
        "I'm a marketer. I have never written a line of production code in my life. In 2026, Lovable and Claude opened the door and I shipped real AI products. Stripe stayed flat for almost a year.",
      ],
      speakerNote:
        "Same opening voice as the IH profile. Plain, not selling.",
      startOffsetSec: 0,
      lengthSec: 12,
    },
    {
      chapter: "who",
      label: "The mirror",
      paragraphs: [
        "What finally broke me was sitting with more than ten other founders and hearing my own story back, every single time. Halfway through call six I had to mute, get up, walk around the room. A small cold voice said: that is you. He is describing you.",
      ],
      speakerNote:
        "Pause before 'that is you'. This is the episode angle — let the host feel it.",
      startOffsetSec: 12,
      lengthSec: 14,
    },
    {
      chapter: "cta",
      label: "Sign off",
      paragraphs: ["That's the story I'd love to tell on your show."],
      speakerNote:
        "Friendly, not pushy. Last frame freezes on the founder; captions overlay reads 'Maryan / maryan@unlocksaas.com / 30-second pitch.'",
      startOffsetSec: 26,
      lengthSec: 4,
    },
  ],
  outputFraming:
    "16:9. Plain background. No B-roll — the host needs to see the founder's face the whole time to judge if there's an episode there.",
};

const CUT_FUNNEL_HUB_HERO: VslCut = {
  id: "funnel_hub_hero",
  envKey: "HERO",
  title: "Forty-five seconds, from the founder.",
  subtitle:
    "Why the line is flat, and the one belief that reorders the rest of the page.",
  surfaces: ["funnel_hub"],
  lengthSec: 45,
  iso8601Duration: "PT45S",
  segments: [
    {
      chapter: "who",
      label: "Who I am",
      paragraphs: [
        "I'm a marketer. I have never written a line of production code. In 2026, Lovable and Claude opened the door and I shipped real AI products in weeks. The shipping part felt like magic. What came after did not.",
      ],
      speakerNote:
        "Same opening as the master. This is the WHO-only cut from vsl-script.md §1 (the 'cut for / homepage' note).",
      startOffsetSec: 0,
      lengthSec: 18,
    },
    {
      chapter: "who",
      label: "The wall",
      paragraphs: [
        "I would launch, open Stripe, and watch a line lie flat. I told myself it was the product, then the funnel, then the traffic. I went embarrassingly deep into SEO. The truth is that was just a respectable way of not looking at the line.",
      ],
      speakerNote:
        "Matter-of-fact, tired honesty. Voice does not lift here. The flatness IS the message.",
      startOffsetSec: 18,
      lengthSec: 16,
    },
    {
      chapter: "what",
      label: "The Big Domino",
      paragraphs: [BIG_DOMINO],
      speakerNote:
        "Slow down. Land each sentence. Beat between them. This is the load-bearing line of the entire page.",
      startOffsetSec: 34,
      lengthSec: 11,
    },
  ],
  outputFraming:
    "16:9 horizontal. Plays muted on hero with captions auto-showing; click-to-unmute. CTA overlay appears at the end pointing at the diagnostic + $1 Starter + Machine doors.",
};

const CUT_EMAIL_1_WHAT_WHY: VslCut = {
  id: "email_1_what_why",
  envKey: "EMAIL_1",
  title: "Ninety seconds — the WHAT and the first WHY.",
  subtitle:
    "Linked from Soap Opera Email 1. Lifts the Big Domino out loud and the first of the three secrets.",
  surfaces: ["soap_opera_email_1"],
  lengthSec: 90,
  iso8601Duration: "PT1M30S",
  segments: [
    {
      chapter: "what",
      label: "The Big Domino",
      paragraphs: [
        "Here is the one belief I'm going to ask you to accept for the next ninety seconds.",
        BIG_DOMINO,
        "If you accept that one sentence, everything else reorganizes around it. If you reject it, close this tab.",
      ],
      speakerNote:
        "Look at camera. Telegraph that the next sentence matters.",
      startOffsetSec: 0,
      lengthSec: 30,
    },
    {
      chapter: "why",
      label: "Why this works",
      paragraphs: [
        "Every funnel builder, AI copywriter, SEO suite I have ever bought assumed I had already done the upstream work. None of them refused to let me skip it. The Machine refuses.",
        "Step 1 is locked until you have one real person named, not a category. Step 2 is locked until you have a real promise written, not a feature list. Step 5 will not mark itself complete until 20 outreach actions have been verified in-tool.",
        "The Machine works because it removes the option to skip.",
      ],
      speakerNote:
        "Mechanical, deliberate tone — match the brand. Land each lock.",
      startOffsetSec: 30,
      lengthSec: 50,
    },
    {
      chapter: "cta",
      label: "The door",
      paragraphs: [
        "The full WHY plus the guarantee math is on the next page. The transcript of all seven cuts is at unlocksaas.com/vsl/transcript.",
      ],
      speakerNote:
        "Friendly. The email body carries the link — the video does not push.",
      startOffsetSec: 80,
      lengthSec: 10,
    },
  ],
  outputFraming:
    "16:9. Embedded as a Mux video link in Email 1 (NOT autoplay — Outlook strips video). Click takes them to the hosted transcript page where the video autoplays.",
};

/**
 * The 110s kinetic-typography cut. Mirrors the scenes in `lib/vsl/script.ts`
 * so they stay in sync. When the operator records a 110s face-to-camera
 * version, this is the fallback that retires.
 */
const CUT_KINETIC_COMPACT: VslCut = {
  id: "kinetic_compact",
  envKey: "KINETIC", // unused today — kinetic plays from text, no env URL
  title: "The Machine — in 110 seconds.",
  subtitle:
    "Why your line is flat, what fixes it, and the 60-day promise — said out loud.",
  surfaces: ["funnel_hub", "starter", "machine_sales"],
  lengthSec: 110,
  iso8601Duration: "PT1M50S",
  segments: [
    {
      chapter: "hook",
      label: "Hook",
      paragraphs: [
        "I built a dozen AI products.",
        "Nobody paid for any of them.",
      ],
      speakerNote: "Flat, factual delivery. The flatness IS the hook.",
      startOffsetSec: 0,
      lengthSec: 7,
    },
    {
      chapter: "who",
      label: "Who",
      paragraphs: [
        "I am not an engineer. I have never written a line of production code.",
        "What broke me was sitting with ten other founders and hearing my own story back. Every time.",
      ],
      speakerNote:
        "Confession voice. Same beats as the master cut, compressed.",
      startOffsetSec: 7,
      lengthSec: 17,
    },
    {
      chapter: "what",
      label: "The setup",
      paragraphs: [
        "There is one belief that, if you accept it, changes everything.",
        BIG_DOMINO,
        "It is called The Machine. Seven steps. Each one mechanical. Each one verified.",
      ],
      speakerNote: "Land the Big Domino. Then name the vehicle.",
      startOffsetSec: 24,
      lengthSec: 30,
    },
    {
      chapter: "why",
      label: "Why it works",
      paragraphs: [
        "You were told the answer was a better product. Then more traffic. Then a course. The line stayed flat.",
        "What does break the flat line: name one real person, write one real promise, send one real message.",
      ],
      speakerNote: "List rhythm — pause between each line. The last lands like a verdict.",
      startOffsetSec: 54,
      lengthSec: 26,
    },
    {
      chapter: "how",
      label: "How",
      paragraphs: [
        "The Machine refuses to let you skip that work.",
        "The engine pushes back on vague answers. The outreach is generated and tracked. The result is verified by your own Stripe.",
      ],
      speakerNote: "Mechanical, brisk. Three claims back-to-back.",
      startOffsetSec: 80,
      lengthSec: 15,
    },
    {
      chapter: "offer",
      label: "The promise",
      paragraphs: ["Sixty days.", "First paying customer, verified.", "Or you do not pay."],
      speakerNote: "Three sentences, each on its own beat.",
      startOffsetSec: 95,
      lengthSec: 11,
    },
    {
      chapter: "cta",
      label: "Where to go next",
      paragraphs: ["Three doors below.", "Pick the one that fits where you are."],
      speakerNote: "Friendly, not pushy.",
      startOffsetSec: 106,
      lengthSec: 4,
    },
  ],
  outputFraming:
    "Renders as kinetic typography in the dark 16:9 player on any surface where the env-var URL is not yet set. When the recorded 110s version is pushed, this fallback retires automatically.",
};

const CUT_FULL_LONG_FORM: VslCut = {
  id: "full_long_form",
  envKey: "MASTER",
  title: "The full story behind the Machine — three minutes forty-five.",
  subtitle:
    "Six beats. The flat line, the mirror, the blank offer page, the Big Domino, the disqualifier, the guarantee.",
  surfaces: ["machine_sales", "starter", "founding"],
  lengthSec: 225,
  iso8601Duration: "PT3M45S",
  segments: [
    {
      chapter: "who",
      label: "Beat 1 — Opening confession",
      paragraphs: [
        "I'm a marketer. I'm an operator. I have never written a line of production code in my life.",
        "For most of my life, that closed a door.",
        "Then in 2026, Lovable and Claude opened it. And I shipped real AI products in a few weeks. The shipping part felt like magic.",
        "What came after did not.",
      ],
      speakerNote:
        "Frame: medium close-up. Founder looking PAST the lens to start, then turning into the lens at 'the shipping part felt like magic.'",
      startOffsetSec: 0,
      lengthSec: 50,
    },
    {
      chapter: "who",
      label: "Beat 2 — The flat line",
      paragraphs: [
        "I would launch. I would open Stripe. And I would watch a line lie flat.",
        "Twelve users. Two paying. A handful of comments that said 'this is awesome' from people who would never reach for a card.",
        "I told myself it was the product. I told myself the funnel was leaking. I went embarrassingly deep into SEO. AEO. GEO. I got good at being found.",
        "The truth I would not say out loud, for almost a year, was that learning more about traffic was not solving my problem. It was a respectable way of never looking at the flat line.",
      ],
      speakerNote:
        "Cut to Stripe-flat B-roll then back to founder. Matter-of-fact, tired honesty. NOT energetic.",
      startOffsetSec: 50,
      lengthSec: 45,
    },
    {
      chapter: "who",
      label: "Beat 3 — The break",
      paragraphs: [
        "What finally broke me was not the dashboard.",
        "It was sitting with more than ten other founders. And hearing my own story back. Every single time.",
        "Halfway through call six I had to mute, get up, walk around the room. A small cold voice said: that is you. He is describing you.",
        "That was the night I sat down to write the offer for this product, and found nothing on the page. I had been building beautiful things for no one in particular and acting surprised when no one paid.",
      ],
      speakerNote:
        "Emotional pivot. Founder fully on camera. Slight zoom in over the line 'that is you. He is describing you.'",
      startOffsetSec: 95,
      lengthSec: 40,
    },
    {
      chapter: "what",
      label: "Beat 4 — The Big Domino",
      paragraphs: [
        "So here is what I would say to you, if you are on the other side of that flat Stripe line right now.",
        BIG_DOMINO,
        "Through the one piece of work you were probably taught to skip — name one real person, write one real promise, send one real message — and a tool that refuses to let you skip it.",
      ],
      speakerNote:
        "Founder steps back from confession. Voice firms up. Camera goes slightly wider. Looking just to the side, making the argument to a peer.",
      startOffsetSec: 135,
      lengthSec: 35,
    },
    {
      chapter: "why",
      label: "Beat 5 — Disqualifier + Guarantee",
      paragraphs: [
        DISQUALIFIER,
        "If you have shipped, here is what I will put in writing.",
        GUARANTEE,
      ],
      speakerNote:
        "Look at camera for the disqualifier — direct, almost cold. Then soften slightly for the guarantee.",
      startOffsetSec: 170,
      lengthSec: 40,
    },
    {
      chapter: "cta",
      label: "Beat 6 — The CTA",
      paragraphs: [
        "You already did the hard part. You built something real.",
        "Get your free diagnosis below. Ninety seconds. It tells you the truth, even if the truth is hard.",
      ],
      speakerNote:
        "Soft. Founder smiles slightly here — the only smile in the video. Last frame: founder looks at camera, holds the look for a beat before cut.",
      startOffsetSec: 210,
      lengthSec: 15,
    },
  ],
  productionNotes: [
    "Microphone: lavalier (Rode Wireless Go II or equivalent) clipped at the sternum. Under -12 dB peak.",
    "Lighting: key light at 45° off-camera-left, soft. No on-camera ring light.",
    "Framing: medium close-up. Founder eye line at top third of the frame.",
    "Background: real, lived-in. NOT a creator-bokeh background. The Reluctant Hero records from a real room.",
    "Wardrobe: what the founder actually wears on a Tuesday. Plain crew or solid shirt, no logos.",
    "Multiple takes per beat: record each beat 3–4 times. NEVER record top-to-bottom on take one and call it done. Beat 3 almost always needs take 4+ to feel real instead of rehearsed.",
    "No music bed. Silence between beats.",
    "Color grade: flat, slightly desaturated. NOT the warm-and-glossy creator look.",
  ],
  outputFraming:
    "Master at 4K, edit at 1080p, export at 1080p for embed. The 4K master gives flexibility to crop the bridge_cold_ad, indie_hackers_profile, and podcast_pitch cuts from the same recording session without losing resolution.",
};

// ────────────────────────────────────────────────────────────────────────────
// Registry
// ────────────────────────────────────────────────────────────────────────────

/**
 * The seven cuts, in stable iteration order. The transcript route renders
 * them in this order; the operator teleprompter cut-switcher offers them
 * in this order.
 */
export const VSL_CUTS: ReadonlyArray<VslCut> = [
  CUT_BRIDGE_COLD_AD,
  CUT_INDIE_HACKERS_PROFILE,
  CUT_PODCAST_PITCH,
  CUT_FUNNEL_HUB_HERO,
  CUT_EMAIL_1_WHAT_WHY,
  CUT_KINETIC_COMPACT,
  CUT_FULL_LONG_FORM,
];

const CUTS_BY_ID: Record<VslCutId, VslCut> = VSL_CUTS.reduce(
  (acc, cut) => {
    acc[cut.id] = cut;
    return acc;
  },
  {} as Record<VslCutId, VslCut>,
);

/**
 * Look up one cut by id. Throws at module-load time if a typo'd id reaches
 * the cut switcher, so the operator-teleprompter never silently shows the
 * wrong cut.
 */
export function getCut(id: VslCutId): VslCut {
  const cut = CUTS_BY_ID[id];
  if (!cut) {
    throw new Error(`Unknown VSL cut id: ${id}`);
  }
  return cut;
}

/** All cuts intended for a given surface tag. Used by `/vsl/transcript`. */
export function getCutsForSurface(surface: VslSurfaceTag): VslCut[] {
  return VSL_CUTS.filter((cut) => cut.surfaces.includes(surface));
}

// ────────────────────────────────────────────────────────────────────────────
// Env-driven URL resolution
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the recorded-video URL for a cut from env. Returns `undefined`
 * until the operator records that cut and pushes the env var to Vercel.
 *
 * Pattern: `NEXT_PUBLIC_VSL_<ENVKEY>_URL`.
 *
 * Example:
 *   getCutVideoUrl("funnel_hub_hero") reads NEXT_PUBLIC_VSL_HERO_URL
 *   getCutVideoUrl("full_long_form") reads NEXT_PUBLIC_VSL_MASTER_URL
 *
 * Why one var per cut: each cut is a separate recording with a separate
 * Mux/Cloudflare Stream URL. The operator can ship the cuts incrementally —
 * `bridge_cold_ad` might be the first one mounted, `full_long_form` the
 * last. Each surface lights up the moment its own env var is set.
 *
 * Legacy fallback: `NEXT_PUBLIC_VSL_URL` (the original single-cut env var)
 * still resolves the `kinetic_compact` and `funnel_hub_hero` cuts, so any
 * Vercel project that pushed the legacy var continues working until the
 * per-cut vars are populated.
 */
export function getCutVideoUrl(id: VslCutId): string | undefined {
  const cut = getCut(id);
  const perCutVar = `NEXT_PUBLIC_VSL_${cut.envKey}_URL`;
  const url = perCutVarRead(perCutVar);
  if (url) return url;

  // Legacy single-cut fallback for hero + kinetic_compact only.
  // Other cuts must use their per-cut env var.
  if (id === "funnel_hub_hero" || id === "kinetic_compact") {
    const legacy = process.env.NEXT_PUBLIC_VSL_URL;
    if (legacy && legacy.trim().length > 0) return legacy;
  }
  return undefined;
}

/** Resolve the poster URL for a cut from env. Same pattern as the video. */
export function getCutPosterUrl(id: VslCutId): string | undefined {
  const cut = getCut(id);
  const perCutVar = `NEXT_PUBLIC_VSL_${cut.envKey}_POSTER_URL`;
  const url = perCutVarRead(perCutVar);
  if (url) return url;
  if (id === "funnel_hub_hero" || id === "kinetic_compact") {
    const legacy = process.env.NEXT_PUBLIC_VSL_POSTER_URL;
    if (legacy && legacy.trim().length > 0) return legacy;
  }
  return undefined;
}

/** Resolve the thumbnail URL (JSON-LD `thumbnailUrl`) from env. */
export function getCutThumbnailUrl(id: VslCutId): string | undefined {
  const cut = getCut(id);
  const perCutVar = `NEXT_PUBLIC_VSL_${cut.envKey}_THUMBNAIL_URL`;
  const url = perCutVarRead(perCutVar);
  if (url) return url;
  // Fall back to poster URL if a dedicated thumbnail isn't set — same
  // image works for both surfaces in practice.
  return getCutPosterUrl(id);
}

/**
 * Read an env var by literal name. Next.js inlines `NEXT_PUBLIC_*` vars at
 * build time by name, so we have to switch on the literal name rather than
 * read by dynamic key. This is the per-cut switch; new cuts get a new case.
 */
function perCutVarRead(name: string): string | undefined {
  const v = ((): string | undefined => {
    switch (name) {
      case "NEXT_PUBLIC_VSL_COLD_AD_URL":
        return process.env.NEXT_PUBLIC_VSL_COLD_AD_URL;
      case "NEXT_PUBLIC_VSL_COLD_AD_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_COLD_AD_POSTER_URL;
      case "NEXT_PUBLIC_VSL_COLD_AD_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_COLD_AD_THUMBNAIL_URL;
      case "NEXT_PUBLIC_VSL_IH_PROFILE_URL":
        return process.env.NEXT_PUBLIC_VSL_IH_PROFILE_URL;
      case "NEXT_PUBLIC_VSL_IH_PROFILE_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_IH_PROFILE_POSTER_URL;
      case "NEXT_PUBLIC_VSL_IH_PROFILE_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_IH_PROFILE_THUMBNAIL_URL;
      case "NEXT_PUBLIC_VSL_PODCAST_PITCH_URL":
        return process.env.NEXT_PUBLIC_VSL_PODCAST_PITCH_URL;
      case "NEXT_PUBLIC_VSL_PODCAST_PITCH_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_PODCAST_PITCH_POSTER_URL;
      case "NEXT_PUBLIC_VSL_PODCAST_PITCH_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_PODCAST_PITCH_THUMBNAIL_URL;
      case "NEXT_PUBLIC_VSL_HERO_URL":
        return process.env.NEXT_PUBLIC_VSL_HERO_URL;
      case "NEXT_PUBLIC_VSL_HERO_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_HERO_POSTER_URL;
      case "NEXT_PUBLIC_VSL_HERO_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_HERO_THUMBNAIL_URL;
      case "NEXT_PUBLIC_VSL_EMAIL_1_URL":
        return process.env.NEXT_PUBLIC_VSL_EMAIL_1_URL;
      case "NEXT_PUBLIC_VSL_EMAIL_1_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_EMAIL_1_POSTER_URL;
      case "NEXT_PUBLIC_VSL_EMAIL_1_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_EMAIL_1_THUMBNAIL_URL;
      case "NEXT_PUBLIC_VSL_KINETIC_URL":
        return process.env.NEXT_PUBLIC_VSL_KINETIC_URL;
      case "NEXT_PUBLIC_VSL_KINETIC_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_KINETIC_POSTER_URL;
      case "NEXT_PUBLIC_VSL_KINETIC_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_KINETIC_THUMBNAIL_URL;
      case "NEXT_PUBLIC_VSL_MASTER_URL":
        return process.env.NEXT_PUBLIC_VSL_MASTER_URL;
      case "NEXT_PUBLIC_VSL_MASTER_POSTER_URL":
        return process.env.NEXT_PUBLIC_VSL_MASTER_POSTER_URL;
      case "NEXT_PUBLIC_VSL_MASTER_THUMBNAIL_URL":
        return process.env.NEXT_PUBLIC_VSL_MASTER_THUMBNAIL_URL;
      default:
        return undefined;
    }
  })();
  if (!v || v.trim().length === 0) return undefined;
  return v;
}

/**
 * Does a cut have a recorded video pushed to env? Drives the JSON-LD
 * VideoObject gate — under the honest-claims rule, we only render
 * VideoObject schema when a real video exists.
 */
export function isCutRecorded(id: VslCutId): boolean {
  return Boolean(getCutVideoUrl(id) && getCutThumbnailUrl(id));
}

/**
 * Concatenate all paragraphs of a cut for transcript display + JSON-LD
 * description. Whitespace-normalized so structured-data fields read as
 * one continuous paragraph (per Google's VideoObject best practice).
 */
export function getCutPlainTranscript(id: VslCutId): string {
  const cut = getCut(id);
  return cut.segments
    .flatMap((seg) => seg.paragraphs)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cut order for `/vsl/transcript` rendering. Stable export so the page
 * route doesn't have to know the literal order.
 */
export const CUT_DISPLAY_ORDER: ReadonlyArray<VslCutId> = VSL_CUTS.map(
  (c) => c.id,
);

// ────────────────────────────────────────────────────────────────────────────
// Schema (JSON-LD) helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build the VideoObject `hasPart` Clip array for a cut. Each Brunson chapter
 * becomes one Clip with `startOffset` + `endOffset`, so search engines can
 * surface "watch the Big Domino" deep links.
 *
 * Returns an empty array if no cut.segments — defensive, but every cut in
 * the registry above has at least one segment.
 */
export function getCutClipParts(id: VslCutId): Array<{
  "@type": "Clip";
  name: string;
  startOffset: number;
  endOffset: number;
}> {
  const cut = getCut(id);
  return cut.segments.map((seg) => ({
    "@type": "Clip" as const,
    name: seg.label,
    startOffset: seg.startOffsetSec,
    endOffset: seg.startOffsetSec + seg.lengthSec,
  }));
}

