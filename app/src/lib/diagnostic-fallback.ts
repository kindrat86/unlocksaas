/**
 * Deterministic, evidence-based fallback diagnosis.
 *
 * Used when the AI engine (Vercel AI Gateway -> claude-sonnet) is unavailable:
 * restricted-model 403, provider down, timeout, or parse failure. The free
 * diagnostic must never dead-end, and must never return label "error" for
 * engine-side failures - the lead still gets a structured, honest teardown.
 *
 * Honesty rules (hard):
 *   - Every evidence string (top-level and per-axis) is an EXACT substring of
 *     the page text. Nothing is invented.
 *   - `competitors` is always [] - we cannot name real competitors without
 *     risking fabrication. The result page hides the section when empty.
 *   - `rewrites.*.current` is text actually present on the page.
 *   - `strengths` are observed facts only; if nothing positive is visible,
 *     a single neutral observed fact is used.
 *
 * Pure module: zero runtime imports, so it runs under node --test with
 * --experimental-strip-types and adds no bundle weight concerns.
 * Run tests: node --test --experimental-strip-types src/lib/diagnostic-fallback.test.ts
 */

// ---------------------------------------------------------------------------
// Local type mirrors (self-contained on purpose: no import graph).
// ---------------------------------------------------------------------------

type Label = "wrong_person" | "weak_offer" | "weak_belief";

type AxisScore = {
  score: number;
  diagnosis: string;
  evidence: string[];
};

type ProductSnapshot = {
  name: string;
  one_liner: string;
  audience_stated: string;
  pricing_visible: string | null;
};

type RewriteBlock = {
  current: string;
  alternates: [string, string, string];
  why_better: string;
};

type ValuePropRewrite = {
  current: string[];
  rewritten: string[];
  why_better: string;
};

type WeekPlan = { theme: string; deliverables: string[] };

type Plan30Day = {
  week1: WeekPlan;
  week2: WeekPlan;
  week3: WeekPlan;
  week4: WeekPlan;
};

export type FallbackResult = {
  label: Label;
  headline: string;
  explanation: string;
  evidence: string;
  nextStep: string;
  product_snapshot: ProductSnapshot;
  scores: { wrong_person: AxisScore; weak_offer: AxisScore; weak_belief: AxisScore };
  rewrites: {
    hero_headline: RewriteBlock;
    primary_cta: RewriteBlock;
    value_props: ValuePropRewrite;
  };
  plan_30_day: Plan30Day;
  competitors: never[];
  strengths: string[];
};

// ---------------------------------------------------------------------------
// Text extraction helpers
// ---------------------------------------------------------------------------

/** First line matching "LABEL: ..." (case-insensitive), text after the colon. */
function labeledLine(page: string, label: string): string | null {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "mi");
  const m = page.match(re);
  return m ? m[1].trim() : null;
}

/** The raw BODY text with the prefix stripped. */
function bodyText(page: string): string {
  const m = page.match(/^BODY:\s*([\s\S]*)$/m);
  return m ? m[1].trim() : page.trim();
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** First sentence containing any keyword (lowercase keywords). */
function firstSentenceWith(text: string, keywords: string[]): string | null {
  for (const s of sentences(text)) {
    const low = s.toLowerCase();
    for (const k of keywords) {
      if (low.includes(k)) return s;
    }
  }
  return null;
}

function firstSentences(text: string, n: number): string[] {
  return sentences(text).slice(0, n);
}

// ---------------------------------------------------------------------------
// Audience / offer heuristics
// ---------------------------------------------------------------------------

const GENERIC_AUDIENCE_WORDS = [
  "teams", "businesses", "companies", "organizations", "everyone",
  "users", "people", "customers of all", "anyone", "all sizes",
];

const SPECIFIC_AUDIENCE_HINTS = [
  "freelance", "agencies", "indie hackers", "solo founders", "bootstrapped",
  "saas founders", "e-commerce stores", "yoga studios", "restaurants",
  "dentists", "accountants", "lawyers", "developers", "designers",
  "marketers", "creators", "youtubers", "podcasters", "newsletter writers",
  "estimators", "recruiters", "real estate", "photographers", "consultants",
  "coaches", "gyms", "schools", "clinics", "plumbers", "electricians",
];

const HEDGING_WORDS = [
  "helps", "helping", "supports", "designed to", "enables", "allows you to",
  "makes it easy", "empowers", "built for", "crafted for", "made for",
];

const OUTCOME_WORDS = [
  "in 30 days", "in 14 days", "in 7 days", "in a week", "in two weeks",
  "first customer", "first 10 customers", "10x", "2x", "double",
  "guarantee", "guaranteed", "or your money back", "money back",
  "or it's free", "results in", "by friday", "in a month",
];

function audienceVerdict(pageLower: string): { generic: boolean; audienceStated: string } {
  const meta = labeledLine(pageLower, "META DESCRIPTION");
  const body = bodyText(pageLower);
  const audienceLine =
    meta ||
    firstSentenceWith(body, [" for "]) ||
    firstSentences(body, 1)[0] ||
    "";
  let specific = false;
  for (const h of SPECIFIC_AUDIENCE_HINTS) {
    if (pageLower.includes(h)) { specific = true; break; }
  }
  let generic = false;
  for (const g of GENERIC_AUDIENCE_WORDS) {
    if (audienceLine.includes(g)) { generic = true; break; }
  }
  // Generic wins only when no specific hint appears anywhere on the page.
  return { generic: generic && !specific, audienceStated: audienceLine };
}

function offerVerdict(pageText: string): {
  hedging: boolean;
  outcome: boolean;
  evidenceSentence: string | null;
} {
  // Search title + meta + body so "built for X" in the meta counts.
  const surface = [
    labeledLine(pageText, "TITLE") || "",
    labeledLine(pageText, "META DESCRIPTION") || "",
    bodyText(pageText),
  ].join(" ");
  const hedgingSentence = firstSentenceWith(surface, HEDGING_WORDS);
  const outcomeSentence = firstSentenceWith(surface, OUTCOME_WORDS);
  return {
    hedging: hedgingSentence !== null,
    outcome: outcomeSentence !== null,
    evidenceSentence: hedgingSentence || outcomeSentence,
  };
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildFallbackDiagnosis(
  url: string,
  pageText: string,
  reason: string,
): FallbackResult {
  const pageLower = pageText.toLowerCase();
  const body = bodyText(pageText);

  // ---- label selection (upstream order preserved) ------------------------
  const av = audienceVerdict(pageLower);
  const ov = offerVerdict(pageText);

  let label: Label;
  if (av.generic) {
    label = "wrong_person";
  } else if (!ov.outcome) {
    label = "weak_offer";
  } else {
    label = "weak_belief";
  }
  void reason; // logged upstream by the caller; never shown to the user

  // ---- extracted anchors --------------------------------------------------
  const titleLine = labeledLine(pageText, "TITLE") || "";
  const metaLine = labeledLine(pageText, "META DESCRIPTION") || "";
  const productName =
    titleLine.split(/\s+[|\-]\s+/)[0]?.trim() ||
    safeHostname(url) ||
    "the product";
  const oneLiner = metaLine || firstSentences(body, 1)[0] || "No one-line pitch stated.";
  const oneLinerTrimmed = clipWords(oneLiner, 25);

  const firstBody = firstSentences(body, 3);
  const audienceQuote =
    (av.audienceStated && pageText.includes(av.audienceStated) ? av.audienceStated : null) ||
    firstBody.find((s) => s.toLowerCase().includes(" for ")) ||
    firstBody[0] ||
    pageText.slice(0, 100);

  const ctaSentence =
    firstSentenceWith(body, [
      "sign up", "get started", "start free", "try ", "book a demo",
      "start your", "create your",
    ]) ||
    sentences(body).reverse().find((s) => s.length <= 60) ||
    firstBody[0];

  const pricingVisible = firstSentenceWith(body, [
    "pricing", "$", "free trial", "/month", "per month", "/year",
  ]);

  // ---- per-axis evidence (exact substrings only) ---------------------------
  const wpEvidenceRaw = audienceQuote;
  const wpEvidence =
    wpEvidenceRaw && pageText.includes(wpEvidenceRaw) ? [wpEvidenceRaw] : [];

  const offerEvidenceSentence =
    ov.evidenceSentence && pageText.includes(ov.evidenceSentence)
      ? ov.evidenceSentence
      : null;
  const offerEvidence = offerEvidenceSentence ? [offerEvidenceSentence] : [];

  const beliefEvidenceSentence =
    firstSentenceWith(body, [
      "automatically", "integrations", "dashboard", "features", "sync",
      "workflow", "smart", "powerful",
    ]) ||
    firstBody[1] ||
    firstBody[0];
  const beliefEvidence =
    beliefEvidenceSentence && pageText.includes(beliefEvidenceSentence)
      ? [beliefEvidenceSentence]
      : [];

  const wpScore = av.generic ? 2 : 6;
  const offerScore = ov.outcome ? (ov.hedging ? 5 : 7) : 3;
  const beliefScore = 4;

  const wrongPersonScore: AxisScore = {
    score: wpScore,
    diagnosis: av.generic
      ? `The page speaks to a broad category instead of one person with a named situation. ${productName} describes who it serves in general terms, so a visitor cannot tell if it is for them. Name the specific person you fit and the page reads differently.`
      : `${productName} names a narrower audience than most pages do. The description still reads as a category label rather than one person in a specific situation. Tightening the who sharpens everything downstream of it.`,
    evidence: wpEvidence.length ? wpEvidence : [firstBody[0] || pageText.slice(0, 80)],
  };

  const weakOfferScore: AxisScore = {
    score: offerScore,
    diagnosis: ov.outcome
      ? `The page gestures at outcomes but hedges the promise. ${productName} describes capabilities with soft language instead of committing to a measurable result by a date. A visitor cannot tell what they walk away with.`
      : `The page lists features without a promised result or timeframe. ${productName} explains what it has, not what a customer gets. No guarantee or remedy appears anywhere on the page.`,
    evidence: offerEvidence.length
      ? offerEvidence
      : [firstBody[1] || firstBody[0] || pageText.slice(0, 80)],
  };

  const weakBeliefScore: AxisScore = {
    score: beliefScore,
    diagnosis: `The page assumes the visitor already believes the problem is urgent and that tools like this work. There is no bridge from where they are to the belief required to buy. Documentation tone, not persuasion, so a skeptic scrolling past stays a skeptic.`,
    evidence: beliefEvidence.length
      ? beliefEvidence
      : [firstBody[1] || firstBody[0] || pageText.slice(0, 80)],
  };

  // ---- top-level copy ------------------------------------------------------
  const headlineTemplates: Record<Label, string> = {
    wrong_person: `${productName} speaks to everyone, so it speaks to no one`,
    weak_offer: `${productName} lists features, not a promised result`,
    weak_belief: `${productName} assumes the visitor already believes`,
  };
  const headline = clipWords(headlineTemplates[label], 12);

  const quotedAudience = clip(audienceQuote, 90);
  const quotedOffer = clip(ov.evidenceSentence || firstBody[0] || oneLiner, 90);
  const explanationCore: Record<Label, string> = {
    wrong_person: `Your page addresses a category, not a person. It reads as if anyone with a browser qualifies. The words on the page say "${quotedAudience}" - that is an audience described in the broadest terms. I pick this diagnosis first because every downstream fix depends on it: you cannot write an offer for a reader you have not named. Most pages in this state convert nobody, not because the product is weak, but because no reader feels addressed.`,
    weak_offer: `Your page describes capabilities without a promised outcome. The copy says "${quotedOffer}" - features framed as value. Until the page states a measurable result with a timeframe, and a remedy if it fails, visitors have nothing concrete to buy. Most visitors read this as a tool description, not an offer, and move on. The fix is narrower than a redesign: one sentence with a number and a date.`,
    weak_belief: `Your page assumes the visitor already believes the problem is worth solving and that products like this work. There is no bridge from their current belief to the one required to buy. The copy reads like documentation for the already-convinced. A specific who and a result exist; the missing piece is the why-now. One honest paragraph in your own voice changes what the page argues for.`,
  };
  const explanation = clampWords(
    `${explanationCore[label]} Fixing this changes the page from a description into an argument.`,
    80,
    120,
  );

  const evidence =
    (label === "wrong_person" && audienceQuote ? clip(audienceQuote, 110) : null) ||
    (label === "weak_offer" && offerEvidenceSentence
      ? clip(offerEvidenceSentence, 110)
      : null) ||
    clip(beliefEvidenceSentence || audienceQuote, 110);

  const nextStepTemplates: Record<Label, string> = {
    wrong_person: "Name one buyer, then rewrite the hero for them",
    weak_offer: "Promise one measurable result with a date",
    weak_belief: "Write the why-now paragraph above the fold",
  };
  const nextStep = clipWords(nextStepTemplates[label], 10);

  // ---- rewrites -------------------------------------------------------------
  const niche = nicheNoun(av, productName);
  const heroCurrent = titleLine || firstBody[0] || productName;
  const heroAlternates: Record<Label, [string, string, string]> = {
    wrong_person: [
      `For ${niche} who bill clients directly`,
      `${productName}: first customers for ${niche}`,
      `The ${niche} tool that ends the busywork`,
    ],
    weak_offer: [
      `${productName}: the result, in half the time`,
      `${productName}: your first ten clients, handled`,
      `${productName}: get it done, or your money back`,
    ],
    weak_belief: [
      `${productName}: why ${niche} stop putting this off`,
      `${productName}: the change ${niche} actually keep`,
      `${productName}: from putting it off to getting paid`,
    ],
  };

  const ctaCurrent = ctaSentence || heroCurrent;
  const ctaAlternates: [string, string, string] = [
    "Start with one named buyer this week",
    "Get your first paid invoice this month",
    "Try it on your worst client file today",
  ];

  const valuePropCurrent = firstBody.slice(0, 3).filter((s) => s.length > 10);
  const propsSource = valuePropCurrent.length ? valuePropCurrent : [oneLinerTrimmed];
  const rewriteRotations = [
    "Rewrite as a result with a date attached",
    "Turn the capability into a guarantee or cut it",
    "Name the buyer the capability serves",
  ];
  const valuePropsRewritten = propsSource.map(
    (_, i) => rewriteRotations[i % rewriteRotations.length],
  );

  // ---- 30-day plan (fixed, customer-conversations-first) --------------------
  const plan: Plan30Day = {
    week1: {
      theme: "Name the buyer",
      deliverables: [
        `Write a one-paragraph portrait of your one buyer in ${niche}`,
        "Call three people who match the portrait and ask about the problem",
        "Rewrite your hero headline to speak to that person only",
        "Cut every audience word that does not match the portrait",
      ],
    },
    week2: {
      theme: "Pin the offer",
      deliverables: [
        "Write one measurable result with a deadline",
        "Write a remedy line for when the result fails",
        `Send the rewritten page to five ${niche} for reaction`,
        "Cut two features from the page",
      ],
    },
    week3: {
      theme: "Build the belief bridge",
      deliverables: [
        "Write the why-now paragraph in your own voice",
        "Rewrite the CTA to name the first action, not the product",
        "Send ten personalized notes with the page attached",
        "Call back everyone from week one",
      ],
    },
    week4: {
      theme: "Ship and measure",
      deliverables: [
        "Ship the rewritten page",
        `Send twenty outreach notes to ${niche}`,
        "Write down every objection you heard",
        "Rewrite the objection into the page copy",
      ],
    },
  };

  // ---- strengths (honest observed facts) -------------------------------------
  const strengths: string[] = [];
  if (pageLower.includes("pricing") || body.includes("$")) {
    strengths.push("Pricing is visible on the page.");
  }
  if (/free trial|start free|sign up/i.test(body)) {
    strengths.push("A clear signup path sits in the body copy.");
  }
  if (metaLine.length > 0) {
    strengths.push("The page carries a real meta description, so search snippets read cleanly.");
  }
  if (strengths.length === 0) {
    strengths.push("The page loads and states what the product is in plain words.");
  }

  return {
    label,
    headline,
    explanation,
    evidence,
    nextStep,
    product_snapshot: {
      name: productName,
      one_liner: oneLinerTrimmed,
      audience_stated: clipWords(av.audienceStated || "Not stated specifically", 40),
      pricing_visible: pricingVisible,
    },
    scores: {
      wrong_person: wrongPersonScore,
      weak_offer: weakOfferScore,
      weak_belief: weakBeliefScore,
    },
    rewrites: {
      hero_headline: {
        current: heroCurrent,
        alternates: heroAlternates[label],
        why_better: "Each alternate names a person or a result instead of restating the product.",
      },
      primary_cta: {
        current: ctaCurrent,
        alternates: ctaAlternates,
        why_better: "Each alternate asks for one specific action with a time anchor.",
      },
      value_props: {
        current: propsSource,
        rewritten: valuePropsRewritten,
        why_better: "Each rewrite converts a capability into an outcome a buyer can picture.",
      },
    },
    plan_30_day: plan,
    competitors: [],
    strengths: strengths.slice(0, 3),
  };
}
// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + ".";
}

function clipWords(s: string, maxWords: number): string {
  const words = s.trim().split(/\s+/);
  if (words.length <= maxWords) return s;
  return words.slice(0, maxWords).join(" ");
}

function clampWords(s: string, minWords: number, maxWords: number): string {
  const filler = "It changes what the page argues for.";
  let words = s.trim().split(/\s+/);
  if (words.length > maxWords) words = words.slice(0, maxWords);
  while (words.length < minWords) words = words.concat(filler.split(/\s+/));
  return words.join(" ");
}

function nicheNoun(av: { audienceStated: string }, productName: string): string {
  const after = av.audienceStated.split(" for ").pop() || "";
  const words = after.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
  const stop = new Set([
    "teams", "businesses", "everyone", "users", "people", "companies",
    "and", "who", "that", "the", "your",
  ]);
  const niche = words.find((w) => !stop.has(w.toLowerCase()) && w.length > 2);
  return niche || `${productName} buyers`;
}
