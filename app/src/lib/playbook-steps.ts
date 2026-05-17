/**
 * The seven steps of the Unlock SaaS Playbook — canonical, structured form.
 *
 * Why this module exists
 * ----------------------
 * The seven steps were previously inlined twice: as a numbered prose list
 * inside `PLAYBOOK_SALES_BODY` in `src/lib/seo/markdown.ts`, and as
 * narrative slides on `/playbook-sales` HTML. The new
 * `PlaybookHowToJsonLd` (Surface B / AEO of strategy/google-strategy.md
 * §B.2) needs the same seven steps as schema.org `HowToStep[]`. Three
 * copies of the same data is the textbook drift bug — Google demotes
 * structured data the moment schema disagrees with rendered text.
 *
 * Single source of truth: this array. Consumers:
 *   - `src/components/seo/json-ld.tsx` → `PlaybookHowToJsonLd`
 *     (Schema.org HowTo with 7 numbered HowToStep entries).
 *   - `src/lib/seo/markdown.ts` → `PLAYBOOK_SALES_BODY`
 *     (the "## The seven steps" section consumed by `/playbook-sales.md`
 *     and `/llms-full.txt`).
 *
 * Brunson Hard-Rule reconciliation: every `name` and `text` below is
 * already public-visible on `/playbook-sales` and `/playbook-sales.md`.
 * No exclusive content in this module; it is structurally re-keying the
 * same facts the visitor reads.
 */

export type PlaybookStep = {
  /** Short imperative name. Maps to Schema.org `HowToStep.name`. */
  readonly name: string;
  /** Full description. Maps to Schema.org `HowToStep.text` and to the
   *  prose rendered on /playbook-sales and in /llms-full.txt. */
  readonly text: string;
};

export const PLAYBOOK_STEPS: readonly PlaybookStep[] = [
  {
    name: "Pin one real customer",
    text: "Name one specific human at one specific company in one specific role. The Playbook pushes back on persona-language until the answer is a person.",
  },
  {
    name: "Write one real offer",
    text: 'One sentence, naming the person and the result. The engine surfaces vague verbs ("help," "support," "enable") and forces specificity.',
  },
  {
    name: "Build one real proof",
    text: "The smallest artifact that proves the offer is real. A loom video, a screenshot, a one-page doc — whichever is the lowest-effort thing that proves the result is possible.",
  },
  {
    name: "Send one real message",
    text: "The Playbook generates the outreach copy inside the tool and tracks the send. No copy-pasting out to a separate CRM tab.",
  },
  {
    name: "Track the response",
    text: "The same dashboard surfaces replies, calls, and the Stripe webhook — so the founder watches the same thing that determines the guarantee.",
  },
  {
    name: "Iterate or escalate",
    text: "If 20 logged actions produce no Stripe ping, the engine has a deterministic playbook for offer revision or audience revision — based on which signal arrived (silence vs. praise without payment).",
  },
  {
    name: "Verify the cycle",
    text: "Stripe webhook confirms the first paying customer. The Verified Builders directory updates the moment the cycle closes.",
  },
] as const;
