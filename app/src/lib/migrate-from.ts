/**
 * /migrate-from/[slug] pSEO catalog — bottom-funnel migration guides.
 *
 * Each entry covers a real migration path indie SaaS founders make:
 * ClickFunnels to Stripe-plus-Supabase, Kajabi to a $49-stack, Gumroad
 * to Lemon Squeezy, etc. Different intent from /alternatives-to (which
 * is pre-decision "X or Y?") and /compare (which is dimension-by-
 * dimension). Migrate-from is "I already decided, now what?".
 *
 * Schema: HowTo (the steps ARE the migration) + Article + FAQPage +
 * BreadcrumbList. HowTo is the citation-friendly schema for "how to
 * migrate from X to Y" queries.
 *
 * Brunson Hard-Rule:
 *   - No fabricated pain points. The "why founders migrate" field
 *     names real reasons we have seen in the diagnostic engine output
 *     or in the published teardowns.
 *   - When the destination is multi-tool, every named destination tool
 *     must resolve to a real teardown OR be the locked UnlockSaaS
 *     infrastructure. Build-time guard at the bottom enforces this.
 *   - "Time to migrate" and "cost" fields are bands, not point
 *     estimates. Every band is labeled as such.
 */

import { TEARDOWN_SLUGS } from "./funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "./pricing-teardowns";

export interface MigrateStep {
  title: string;
  description: string;
  pitfall: string;
}

export interface MigrateFaq {
  q: string;
  a: string;
}

export interface MigrateFromEntry {
  slug: string;
  /** Source product, e.g. "ClickFunnels". */
  from: string;
  /** Destination — can be a single tool or a stack description. */
  to: string;
  /** Display name e.g. "Migrate from ClickFunnels to Stripe + Supabase". */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Why founders make this migration, in real-language reasons. */
  whyMigrate: ReadonlyArray<string>;
  /** When you should NOT migrate. */
  whenNotToMigrate: ReadonlyArray<string>;
  /** Ordered migration steps. */
  steps: ReadonlyArray<MigrateStep>;
  /** Time-to-migrate band. */
  timeToMigrateBand: string;
  /** Cost-of-migration band (in time + tool subscriptions). */
  migrationCostBand: string;
  /** Cost difference (annualized) after migration. */
  annualizedCostDifference: string;
  /**
   * Destination tool slugs. Each one cross-links to its teardown. If the
   * destination is a stack, list every tool slot's teardown slug here so
   * the detail page can render the right links.
   */
  destinationTeardownSlugs: ReadonlyArray<string>;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related comparison hub for the same source/destination axis. */
  relatedComparisons: ReadonlyArray<string>;
  faqs: ReadonlyArray<MigrateFaq>;
  lastVerified: string;
}

export const MIGRATE_FROM_ENTRIES: ReadonlyArray<MigrateFromEntry> = [
  {
    slug: "migrate-from-clickfunnels-to-stripe-stack",
    from: "ClickFunnels",
    to: "Stripe + Supabase + Next.js",
    displayName: "Migrate from ClickFunnels to a Stripe + Supabase stack",
    metaTitle: "Migrate from ClickFunnels to Stripe + Supabase",
    metaDescription:
      "How indie founders migrate from ClickFunnels to a Stripe + Supabase + Next.js stack. Steps, time band, cost delta, and the pitfalls to avoid.",
    intro:
      "Moving off ClickFunnels to an indie SaaS stack is the most common pre-revenue migration we see. The technical work is one to two weeks; the harder work is preserving the funnel logic, the email list, and the customer attribution data. The steps below cover both.",
    whyMigrate: [
      "ClickFunnels is priced for funnels-as-business; indie SaaS does not need the funnel-builder layer once a real product is shipping.",
      "Custom domain handling, advanced Stripe integrations (Setup Intents, Connect), and developer-grade customization are easier on a code-based stack.",
      "Long-term cost — at $97-$297/month, ClickFunnels is more than a complete indie SaaS infrastructure costs to run.",
    ],
    whenNotToMigrate: [
      "If your funnel works and you are revenue-positive, the migration cost rarely pays back inside 12 months. Stay until the constraint forces the move.",
      "If you have an active email list inside ClickFunnels and have not validated export reliability, validate first. Losing the list is the worst case.",
    ],
    steps: [
      {
        title: "Inventory every funnel surface and its purpose",
        description:
          "List every page, every form, every email, every Stripe connection. Tag each as 'must migrate', 'rebuild in destination', or 'kill'. The 'kill' bucket is usually 30-50% by surface count.",
        pitfall:
          "Trying to migrate everything 1:1. Most ClickFunnels assets accumulate over years and are dead weight by migration time.",
      },
      {
        title: "Export the email list to a verified CSV",
        description:
          "ClickFunnels CSV export. Open it; verify the rows count matches the live dashboard count; confirm bounce/unsubscribe state is preserved. Import to the new email tool BEFORE shutting off ClickFunnels.",
        pitfall:
          "Skipping the verification step. CSV exports occasionally drop columns or truncate; finding out after ClickFunnels is off is a list-loss event.",
      },
      {
        title: "Rebuild the highest-traffic funnel surface first",
        description:
          "One page at a time, starting with the page that gets the most traffic. Move the Stripe product to a new Stripe account if you want clean separation, or keep the same account and just swap the checkout integration.",
        pitfall:
          "Building all surfaces in parallel. One surface at a time lets you cut traffic over per-page and roll back if something breaks.",
      },
      {
        title: "Set up redirects for every old URL",
        description:
          "ClickFunnels URLs are indexed by Google. Every active old URL must 301 to the new equivalent. Missing redirects costs organic traffic for weeks.",
        pitfall:
          "Letting old URLs 404. ClickFunnels typically does not let you set up arbitrary 301s on its own domain, so set up the redirects on your custom domain BEFORE you disconnect ClickFunnels.",
      },
      {
        title: "Cut traffic over per-funnel, watching conversion daily",
        description:
          "Send new traffic to the new surface; keep ClickFunnels running for active live links until the new surface matches or beats the old conversion rate over a 7-day window.",
        pitfall:
          "Hard-cutting everything at once. Indie SaaS migrations are reversible only if you keep the source running until the destination is proven.",
      },
      {
        title: "Migrate the email automation last",
        description:
          "Automation logic is the highest-touch surface. Map every ClickFunnels Follow-Up Funnel sequence to the new tool's sequences before shutting off ClickFunnels.",
        pitfall:
          "Underestimating the time to rebuild sequences. A 5-email sequence in ClickFunnels is 30 minutes; a 5-email sequence in a new tool with conditional logic is often a half-day.",
      },
      {
        title: "Cancel ClickFunnels only after 30 days of clean operation",
        description:
          "Keep ClickFunnels alive at the lowest tier for 30 days post-migration. Catches issues you missed; not paying the $97/month for one extra month is not worth a list-loss event.",
        pitfall:
          "Canceling early to save the subscription fee. The migration savings dwarf one extra month of source-system cost.",
      },
    ],
    timeToMigrateBand: "1 to 3 weeks of focused work for a single-funnel indie SaaS; longer for multi-funnel agencies.",
    migrationCostBand: "30-80 founder hours plus $0-$50 in new tool subscriptions before the source tool is canceled.",
    annualizedCostDifference:
      "Save approximately $900-$3,000/year on tool subscriptions, depending on your prior ClickFunnels tier. Time savings come from owning the funnel-builder layer once everything stabilizes.",
    destinationTeardownSlugs: ["stripe"],
    relatedGlossary: ["offer", "value-ladder"],
    relatedComparisons: [],
    faqs: [
      {
        q: "Can I run both ClickFunnels and the new stack in parallel?",
        a: "Yes, and you should during migration. Cancel ClickFunnels only after the new surface has matched or beaten the old conversion rate for 30 days. The parallel period is where you catch missed edge cases.",
      },
      {
        q: "Will I lose SEO traffic?",
        a: "Only if you skip the 301 redirects. Done right, the migration is search-engine-neutral — Google treats a 301 as a permanent move and re-indexes within 1-4 weeks.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-kajabi-to-indie-stack",
    from: "Kajabi",
    to: "Stripe + Supabase + Resend stack",
    displayName: "Migrate from Kajabi to a Stripe + Supabase stack",
    metaTitle: "Migrate from Kajabi to Indie SaaS Stack",
    metaDescription:
      "How creators and consultants move off Kajabi onto a Stripe + Supabase + Resend stack. Steps, content migration, member portal rebuild.",
    intro:
      "Kajabi bundles courses, payments, email, and member portals into one $149-$399/month product. Migrating off makes sense when the product is no longer a course-first business — when SaaS-style customization is the new constraint. The steps below cover content migration, member portal rebuild, and email continuity.",
    whyMigrate: [
      "Kajabi pricing assumes course-creator economics; indie SaaS operators paying for unused course features.",
      "Member portal customization in Kajabi has a ceiling; code-based portals do not.",
      "Email deliverability on Kajabi's shared sending infrastructure can degrade over time; a dedicated Resend or Loops domain is more controllable.",
    ],
    whenNotToMigrate: [
      "If your business is still primarily a course or coaching offering, Kajabi's bundled product remains the right fit.",
      "If you have not validated a SaaS-shaped revenue stream yet, migrating is premature.",
    ],
    steps: [
      {
        title: "Export every course / product, with all files",
        description:
          "Kajabi exports include video files, PDFs, and downloads. Download each course as a complete archive. Verify the file count matches Kajabi's dashboard count.",
        pitfall:
          "Not downloading video files. Kajabi-hosted video is often the largest asset and the most overlooked in migration.",
      },
      {
        title: "Export the member list with subscription state",
        description:
          "Kajabi CSV export. Members must be re-invited to the new platform with their current subscription state preserved. Stripe + Supabase can model this; the data lift is one CSV.",
        pitfall:
          "Treating canceled members the same as active. Stripe's subscription state model differs from Kajabi's; map them deliberately.",
      },
      {
        title: "Rebuild the member portal as a Next.js page tree",
        description:
          "Member-only pages, gated by Supabase auth. The course delivery layer can be Mux or Cloudflare Stream if you need streaming protection, or direct Supabase storage for simpler cases.",
        pitfall:
          "Trying to replicate Kajabi's drag-and-drop course builder. Most indie SaaS founders moving off Kajabi do not need it.",
      },
      {
        title: "Move email sequences to Resend or Loops",
        description:
          "Export Kajabi sequences as flat documents; rebuild in the new tool. Test each broadcast on a small segment before sending to the full list.",
        pitfall:
          "Hot-cutting email without sender-domain warm-up. The new domain has zero sending reputation; ramp over 2-3 weeks.",
      },
      {
        title: "Migrate Stripe payment methods (if Kajabi held them)",
        description:
          "Kajabi-managed Stripe customers need to be moved to your direct Stripe account. Stripe support can do the underlying card-token migration; you handle the customer notifications.",
        pitfall:
          "Forcing customers to re-enter cards. Cards-on-file migration via Stripe Support preserves the payment relationship.",
      },
      {
        title: "Set up 301 redirects from Kajabi URLs",
        description:
          "Same as the ClickFunnels migration — every old URL must redirect. Kajabi's domain-handling forces this onto your custom domain layer.",
        pitfall:
          "Skipping the redirects. Course landing pages on Kajabi typically have organic traffic worth preserving.",
      },
      {
        title: "Run parallel for 60 days, cancel Kajabi last",
        description:
          "Longer parallel window than ClickFunnels because course consumption happens over weeks. Keep Kajabi available so existing members can finish in-progress courses.",
        pitfall:
          "Cutting Kajabi off mid-course. Members will refund; refund processing on Kajabi is non-trivial.",
      },
    ],
    timeToMigrateBand: "3 to 8 weeks for a single-course business; longer if you have multiple courses and a substantial member base.",
    migrationCostBand: "60-200 founder hours plus $50-$200 in destination tool subscriptions during the parallel period.",
    annualizedCostDifference:
      "Save $1,500-$4,000/year on tool subscriptions plus video-hosting cost depending on tier. Watch for new costs in Mux/Cloudflare Stream that offset partial savings.",
    destinationTeardownSlugs: ["stripe", "resend"],
    relatedGlossary: ["offer", "value-ladder"],
    relatedComparisons: [],
    faqs: [
      {
        q: "What about courses with hundreds of hours of video?",
        a: "Mux or Cloudflare Stream replaces Kajabi's video layer at roughly $1-$3 per 1,000 minutes streamed. For courses with substantial video, that line item replaces a chunk of the Kajabi savings.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-gumroad-to-lemonsqueezy",
    from: "Gumroad",
    to: "Lemon Squeezy",
    displayName: "Migrate from Gumroad to Lemon Squeezy",
    metaTitle: "Migrate from Gumroad to Lemon Squeezy",
    metaDescription:
      "How indie sellers move from Gumroad to Lemon Squeezy. Merchant-of-record advantages, tax handling, and the migration steps.",
    intro:
      "Lemon Squeezy and Gumroad both operate as Merchant of Record (MoR) for digital products. Founders migrate primarily for Lemon Squeezy's more modern API, better European VAT handling, and stronger affiliate management. The migration is one of the simplest indie SaaS migrations — both products have similar customer-data shapes.",
    whyMigrate: [
      "Lemon Squeezy's API is more modern and easier to integrate with custom checkouts and member portals.",
      "VAT and global tax handling is cleaner on Lemon Squeezy, especially for non-US sellers.",
      "Affiliate program tooling is more flexible and the affiliate payouts are simpler to manage at scale.",
    ],
    whenNotToMigrate: [
      "If your Gumroad revenue is primarily impulse-buy traffic (Twitter shares, product launches), the brand recognition Gumroad has with creators may outweigh the technical benefits.",
      "If you are at very low volume (under $500/month), the migration cost rarely pays back inside a year.",
    ],
    steps: [
      {
        title: "Export Gumroad customer list and sales history",
        description:
          "Gumroad's CSV export includes customer email, license keys, and purchase history. Lemon Squeezy can import this directly via its admin tools.",
        pitfall:
          "Not exporting license keys. Active license keys must be preserved if your product relies on them for access control.",
      },
      {
        title: "Set up the same product in Lemon Squeezy",
        description:
          "Recreate every Gumroad product as a Lemon Squeezy product. Match prices, descriptions, and product files. Lemon Squeezy supports the same digital-download pattern.",
        pitfall:
          "Recreating the products manually when the import tool is available. Use the import.",
      },
      {
        title: "Switch your buy links to Lemon Squeezy",
        description:
          "Update every external buy link (Twitter bio, blog posts, newsletter) to point at the Lemon Squeezy checkout. Use a custom subdomain for cleanliness.",
        pitfall:
          "Missing buy links in newsletters or old blog posts. Set up Gumroad-to-Lemon-Squeezy redirects on a custom domain if you control the link layer.",
      },
      {
        title: "Notify existing customers about license-key continuity",
        description:
          "Send one email to existing customers explaining the migration. If license keys remain valid, the email is reassurance only. If they need re-issuing, the email is the re-issue notification.",
        pitfall:
          "Skipping the email and dealing with confused support tickets later.",
      },
      {
        title: "Keep Gumroad active for new sales for 30 days, then archive",
        description:
          "Active Gumroad products keep historical purchase links working. Archive (do not delete) after 30 days so customers can still access their downloads.",
        pitfall:
          "Deleting Gumroad products before customer download windows close.",
      },
    ],
    timeToMigrateBand: "1-3 days of focused work for a single-product seller.",
    migrationCostBand: "5-20 founder hours; no parallel-subscription cost during overlap.",
    annualizedCostDifference:
      "Net cost is roughly comparable — both charge 5% + processing on the front end. The advantage is operational, not financial.",
    destinationTeardownSlugs: ["lemonsqueezy"],
    relatedGlossary: ["offer"],
    relatedComparisons: ["lemonsqueezy-vs-paddle"],
    faqs: [
      {
        q: "What about Gumroad's affiliate program — do existing affiliates need to re-enroll?",
        a: "Yes, affiliate programs are not transferable between platforms. Communicate the migration to active affiliates, give them a clear re-enrollment path on Lemon Squeezy, and offer a small bonus for the transition.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-substack-to-beehiiv",
    from: "Substack",
    to: "Beehiiv",
    displayName: "Migrate from Substack to Beehiiv",
    metaTitle: "Migrate from Substack to Beehiiv",
    metaDescription:
      "How newsletter operators migrate from Substack to Beehiiv. List export, deliverability ramp, paid subscriber preservation, and the pitfalls.",
    intro:
      "Substack-to-Beehiiv is one of the most common newsletter migrations in 2026. Beehiiv's superior monetization tooling, recommendations engine, and lack of revenue-share at scale pull operators across. The list migration is straightforward; the deliverability ramp is the real work.",
    whyMigrate: [
      "Beehiiv keeps 100% of your subscription revenue (Substack takes 10%); the math flips for paid newsletters above 1,000 paid subscribers.",
      "Beehiiv's recommendation network and growth tools are more aggressive than Substack's.",
      "Custom-domain handling and analytics depth are stronger on Beehiiv.",
    ],
    whenNotToMigrate: [
      "If your Substack growth is driven primarily by the Substack network and Notes engagement, migrating cuts off that growth channel.",
      "If you have less than 1,000 free subscribers, the migration friction rarely pays back.",
    ],
    steps: [
      {
        title: "Export the full subscriber list from Substack",
        description:
          "Substack export includes free + paid subscriber lists with timestamps. Verify counts match the live dashboard.",
        pitfall:
          "Not exporting in the correct format — Beehiiv's importer expects specific columns; check the import spec before exporting.",
      },
      {
        title: "Set up the Beehiiv publication and verify the sending domain",
        description:
          "Add SPF, DKIM, and DMARC records on your sending domain in Beehiiv. Use mail-tester to verify 9/10+ score before any subscriber-facing send.",
        pitfall:
          "Sending to the full list before the new domain is warmed. Beehiiv reuses your existing sender domain if you bring one, so warm-up may be partial — verify deliverability with a small segment first.",
      },
      {
        title: "Import the free subscriber list",
        description:
          "Beehiiv import tool. Use the CSV from step 1. Verify final count matches expected.",
        pitfall:
          "Importing the paid list together with the free list. Paid subscribers need separate billing migration handled by Beehiiv support.",
      },
      {
        title: "Migrate paid subscribers via Beehiiv's Stripe handoff",
        description:
          "Beehiiv's paid-subscriber migration involves transferring Stripe Customers to a new connected account. Beehiiv support handles this — coordinate the cutover date.",
        pitfall:
          "Underestimating the coordination lift. Paid subscriber migration takes 5-10 business days end-to-end.",
      },
      {
        title: "Send a goodbye + redirect post on Substack",
        description:
          "One final post on Substack pointing readers at the new Beehiiv URL. Pin it. Keep Substack live for 60-90 days as a redirect layer.",
        pitfall:
          "Deleting the Substack publication immediately. Readers who bookmarked the old URL need time to update their habits.",
      },
      {
        title: "Set up custom-domain redirects",
        description:
          "If you used a custom domain on Substack, move it to Beehiiv and set up Substack-URL-to-Beehiiv-URL redirects for the high-traffic posts.",
        pitfall:
          "Losing organic search traffic. Substack post URLs are indexed by Google; 301 redirects preserve the SEO.",
      },
    ],
    timeToMigrateBand: "1-2 weeks for free-list only; 3-5 weeks if migrating paid subscribers.",
    migrationCostBand: "20-60 founder hours plus $0-$84 in Beehiiv subscription during the parallel period.",
    annualizedCostDifference:
      "For paid newsletters above 1,000 paid subscribers, the 10% Substack fee swap pays back the entire Beehiiv subscription within months. For free-only newsletters, the cost is roughly comparable.",
    destinationTeardownSlugs: ["beehiiv"],
    relatedGlossary: ["dream-100", "soap-opera-sequence"],
    relatedComparisons: ["beehiiv-vs-substack"],
    faqs: [
      {
        q: "Will paid subscribers be charged again during migration?",
        a: "No, Beehiiv's Stripe handoff preserves the existing subscription cycle. Subscribers should not see a charge interruption when the migration is handled through official channels.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-typeform-to-tally",
    from: "Typeform",
    to: "Tally",
    displayName: "Migrate from Typeform to Tally",
    metaTitle: "Migrate from Typeform to Tally",
    metaDescription:
      "How indie SaaS founders move from Typeform to Tally. Form-by-form migration, response data continuity, and the pitfalls.",
    intro:
      "Typeform-to-Tally is one of the simplest indie SaaS migrations — both products serve the same use case with similar paradigms. Founders typically migrate for cost (Tally's free tier is much more generous) and for the much wider integration ecosystem on Tally's modern stack.",
    whyMigrate: [
      "Tally's free tier covers most pre-revenue use cases; Typeform's free tier is heavily limited.",
      "Tally's conditional logic and calculations are more flexible.",
      "Tally's integrations and webhooks are more modern and developer-friendly.",
    ],
    whenNotToMigrate: [
      "If your Typeform usage relies on advanced features Tally does not yet match (advanced video questions, specific integration partners), validate parity before migrating.",
      "If forms are embedded in marketing materials with hard-to-update links, the redirect lift may outweigh the savings.",
    ],
    steps: [
      {
        title: "Inventory every Typeform form and its purpose",
        description:
          "List each form, where it is embedded, and what it does. Tag each as 'must migrate', 'rebuild simpler', or 'kill'.",
        pitfall:
          "Migrating dormant forms. 30-50% of Typeforms in mature accounts are abandoned; do not pay to migrate them.",
      },
      {
        title: "Rebuild each form in Tally",
        description:
          "Tally's UI is similar enough to Typeform that rebuilds take 5-15 minutes per form. Match field types and conditional logic.",
        pitfall:
          "Trying to import responses. Both tools store responses internally; export responses to CSV from Typeform separately if you need historical data.",
      },
      {
        title: "Export Typeform responses to CSV",
        description:
          "Typeform CSV export per form. Store these in a versioned location (Notion, GitHub) so historical response data is preserved independent of the form-builder tool.",
        pitfall:
          "Skipping this step. Form responses are valuable customer data; losing them is a Brunson Hard-Rule discipline failure.",
      },
      {
        title: "Update embeds and links",
        description:
          "Replace Typeform embeds with Tally embeds. Update standalone Typeform links to Tally URLs. Set up redirects from Typeform-hosted URLs if you control the embedding page.",
        pitfall:
          "Forgetting embeds in newsletter footers or off-platform marketing materials.",
      },
      {
        title: "Run parallel for one billing cycle",
        description:
          "Keep both forms live for one billing cycle. Compare response counts; if Tally is missing responses, find the leak before canceling Typeform.",
        pitfall:
          "Canceling Typeform before validating parity. One missed embed can lose weeks of submissions.",
      },
    ],
    timeToMigrateBand: "2-7 days for most accounts.",
    migrationCostBand: "10-30 founder hours; no overlap cost if both free tiers cover the parallel period.",
    annualizedCostDifference:
      "Save $300-$1,200/year depending on Typeform tier. The savings come primarily from Typeform's higher paid-tier pricing.",
    destinationTeardownSlugs: ["tally"],
    relatedGlossary: ["wrong-person"],
    relatedComparisons: ["tally-vs-typeform"],
    faqs: [
      {
        q: "Can I move historical responses to Tally?",
        a: "No — neither tool supports importing historical responses. Export from Typeform to CSV; treat Tally as the system of record going forward.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-calendly-to-cal-com",
    from: "Calendly",
    to: "Cal.com",
    displayName: "Migrate from Calendly to Cal.com",
    metaTitle: "Migrate from Calendly to Cal.com",
    metaDescription:
      "How indie founders move from Calendly to Cal.com. Event-type migration, calendar integrations, and team / embed-link transition.",
    intro:
      "Calendly-to-Cal.com is a low-friction migration for indie SaaS founders who want open-source scheduling with white-label flexibility. The product surfaces are similar; the migration is mostly recreating event types and updating embeds.",
    whyMigrate: [
      "Cal.com is open-source — you can self-host or use the hosted version, with portable data either way.",
      "White-labeling is fully supported on Cal.com, not on Calendly's lower tiers.",
      "Cal.com's pricing is generally lower at indie-SaaS scale, especially for teams.",
    ],
    whenNotToMigrate: [
      "If your Calendly setup uses advanced features (workflows, Salesforce sync) Cal.com does not yet match, validate parity first.",
      "If you have hundreds of booked events in the calendar already, the parallel migration is more complex.",
    ],
    steps: [
      {
        title: "Inventory event types and integrations",
        description:
          "List every event type, its duration, buffer time, and connected calendars / Zoom / Stripe links.",
        pitfall:
          "Forgetting third-party integrations. Calendly's Zapier and direct integrations need explicit reconnection in Cal.com.",
      },
      {
        title: "Connect calendars and recreate event types in Cal.com",
        description:
          "Connect Google / Outlook / Apple calendars. Recreate each event type with matching duration, buffer, and availability rules.",
        pitfall:
          "Not matching the time-zone behavior. Cal.com defaults differ from Calendly on some availability edge cases.",
      },
      {
        title: "Update booking links everywhere",
        description:
          "Email signature, website embeds, newsletter signature, calendar invites. Audit all places that contain a Calendly URL.",
        pitfall:
          "Missing an email signature on a personal account that auto-fills in business emails.",
      },
      {
        title: "Run parallel for 2 weeks",
        description:
          "Keep Calendly active while new traffic goes to Cal.com. Watch booking confirmations land cleanly.",
        pitfall:
          "Cutting Calendly off mid-booking. Existing scheduled events on Calendly remain valid; let them complete.",
      },
      {
        title: "Cancel Calendly after the last scheduled meeting completes",
        description:
          "Once the calendar has no future Calendly-booked events, cancel.",
        pitfall:
          "Canceling early and breaking already-scheduled meetings.",
      },
    ],
    timeToMigrateBand: "1-3 days of focused work.",
    migrationCostBand: "3-10 founder hours.",
    annualizedCostDifference:
      "Save $120-$960/year depending on Calendly tier. Teams save more.",
    destinationTeardownSlugs: ["cal-com"],
    relatedGlossary: [],
    relatedComparisons: ["cal-com-vs-calendly"],
    faqs: [
      {
        q: "Should I self-host Cal.com?",
        a: "Only if you have engineering capacity and a specific reason (compliance, custom branding, scale). Cal.com's hosted version is the right starting point for indie SaaS — migrate to self-hosted later if needed.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-google-analytics-to-plausible",
    from: "Google Analytics",
    to: "Plausible",
    displayName: "Migrate from Google Analytics to Plausible",
    metaTitle: "Migrate from Google Analytics to Plausible",
    metaDescription:
      "How indie SaaS founders move from GA4 to Plausible. Privacy, cookie banner removal, custom event mapping, and the pitfalls.",
    intro:
      "GA4-to-Plausible is the privacy-focused analytics migration. The biggest win is dropping the cookie consent banner in EU jurisdictions; the technical work is replacing event tracking with Plausible's lighter API.",
    whyMigrate: [
      "Plausible is GDPR-compliant by default — no cookie banner required in the EU.",
      "Plausible's UI is dramatically simpler; indie SaaS founders actually open it weekly, which GA4's complexity prevents.",
      "Plausible is open-source with a self-host option if data residency matters.",
    ],
    whenNotToMigrate: [
      "If you rely on GA4-specific audience export to Google Ads, Plausible does not replace that integration.",
      "If you need deep cohort analysis, GA4's free tier still wins — Plausible is intentionally simpler.",
    ],
    steps: [
      {
        title: "Add Plausible script alongside GA4",
        description:
          "Plausible's script is one line. Add it to your site head; do not remove GA4 yet. Both run in parallel.",
        pitfall:
          "Removing GA4 before Plausible has 30 days of data. The historical comparison is the migration's quality check.",
      },
      {
        title: "Recreate custom events",
        description:
          "List every GA4 custom event you depend on. Plausible's custom event API is simpler but uses different syntax. Map each event.",
        pitfall:
          "Skipping events because they 'do not matter' — usually two months later you discover one of them was load-bearing.",
      },
      {
        title: "Update funnel reports",
        description:
          "Plausible's Goals + Funnel features replace GA4's funnel exploration. Recreate the key funnels you check weekly.",
        pitfall:
          "Trying to recreate every GA4 exploration. Most are unused; rebuild only the ones you actually open.",
      },
      {
        title: "Run parallel for 30-60 days",
        description:
          "Compare Plausible vs GA4 numbers daily. They will differ slightly (Plausible's no-cookie design produces lower unique counts on bouncy traffic); calibrate your expectations.",
        pitfall:
          "Panicking at the difference and reverting. The numbers being different is the whole point.",
      },
      {
        title: "Remove the GA4 script and cookie banner",
        description:
          "Once Plausible is the trusted source, remove GA4 and the cookie consent banner (if GA4 was the only consent-requiring tracker).",
        pitfall:
          "Forgetting to remove the cookie banner. It is the most visible signal of the migration to your visitors.",
      },
    ],
    timeToMigrateBand: "1-2 weeks including parallel period.",
    migrationCostBand: "5-20 founder hours.",
    annualizedCostDifference:
      "GA4 is free; Plausible costs $9-$19/month. You pay slightly more in cash, save substantially in cookie-banner UX cost and developer time.",
    destinationTeardownSlugs: ["plausible"],
    relatedGlossary: [],
    relatedComparisons: [],
    faqs: [
      {
        q: "What about historical GA4 data?",
        a: "Export GA4 data to BigQuery before removing GA4. Plausible does not import historical data — treat the migration date as a clean break for analytics, and reference GA4 exports for pre-migration analysis.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "migrate-from-notion-to-linear-for-project-management",
    from: "Notion (as a PM tool)",
    to: "Linear",
    displayName: "Migrate from Notion to Linear for project management",
    metaTitle: "Migrate from Notion to Linear (Project Management)",
    metaDescription:
      "How indie SaaS teams move project management from Notion databases to Linear. Issue migration, workflow mapping, and integration setup.",
    intro:
      "Notion is excellent for docs and SOPs; it is poor as a daily project management tool past 2-3 contributors. Linear-as-PM with Notion-as-docs is the common indie SaaS split. The migration is mostly issue import and workflow mapping.",
    whyMigrate: [
      "Linear's keyboard-first UI is dramatically faster for daily issue work than Notion databases.",
      "Linear's cycle and project model maps to indie SaaS development rhythm; Notion databases do not.",
      "GitHub integration on Linear is first-class; on Notion it requires custom syncing.",
    ],
    whenNotToMigrate: [
      "If your team is 1-2 people, Notion's flexibility is still the right choice.",
      "If your work is primarily documentation rather than issue-tracking, do not migrate — keep Notion as the docs tool.",
    ],
    steps: [
      {
        title: "Categorize existing Notion 'projects' database into Linear-equivalent shapes",
        description:
          "Linear has Issues, Cycles, and Projects. Map your Notion entries to one of these. Most Notion 'task' entries are Linear Issues; multi-week initiatives are Projects.",
        pitfall:
          "1:1 importing every Notion page as a Linear issue. Notion accumulates dead work; cull first.",
      },
      {
        title: "Export active Notion items to CSV",
        description:
          "Linear's import tool accepts CSV. Map columns: title, description, status, assignee, priority.",
        pitfall:
          "Losing status mapping. Notion statuses and Linear states are not 1:1 — map deliberately.",
      },
      {
        title: "Import to Linear and verify counts",
        description:
          "Linear import tool. Verify the import count matches expected; resolve any rejected rows.",
        pitfall:
          "Importing assignees without first creating the Linear user accounts. Pre-create team members.",
      },
      {
        title: "Set up the Linear-GitHub integration",
        description:
          "Branches, PRs, and issues link automatically. This is the highest-ROI Linear feature for indie SaaS engineering teams.",
        pitfall:
          "Skipping the GitHub integration setup. It is the reason most teams stay on Linear after migration.",
      },
      {
        title: "Update team documentation and team rituals",
        description:
          "Standups, retros, and planning move to Linear cycles. Notion still hosts the docs / SOPs.",
        pitfall:
          "Trying to use Linear for documentation. It is built for issues; keep docs in Notion.",
      },
      {
        title: "Archive (do not delete) old Notion PM databases",
        description:
          "Keep Notion PM history accessible for retrospective lookup; just stop using it as the live tool.",
        pitfall:
          "Deleting Notion PM history. It contains decision context worth keeping.",
      },
    ],
    timeToMigrateBand: "3-10 days depending on issue volume.",
    migrationCostBand: "10-40 founder hours.",
    annualizedCostDifference:
      "Linear costs $8-$16/user/month; Notion is roughly the same. The migration is operational quality, not cost.",
    destinationTeardownSlugs: ["linear", "notion"],
    relatedGlossary: [],
    relatedComparisons: ["linear-vs-jira"],
    faqs: [
      {
        q: "What about engineering docs — should they move?",
        a: "No. Notion remains the right tool for docs, SOPs, and decision logs. Linear is for issue tracking and project management. The two tools complement each other.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const MIGRATE_FROM_SLUGS: ReadonlyArray<string> = MIGRATE_FROM_ENTRIES.map(
  (e) => e.slug,
);

export function getMigrateFromBySlug(
  slug: string,
): MigrateFromEntry | undefined {
  return MIGRATE_FROM_ENTRIES.find((e) => e.slug === slug);
}

export type TeardownKind = "funnel" | "pricing";

export function resolveMigrateTeardown(
  slug: string,
): { kind: TeardownKind; href: string } | undefined {
  if (TEARDOWN_SLUGS.includes(slug)) {
    return { kind: "funnel", href: `/funnel-teardown/${slug}` };
  }
  if (PRICING_TEARDOWN_SLUGS.includes(slug)) {
    return { kind: "pricing", href: `/pricing-teardown/${slug}` };
  }
  return undefined;
}

// Build-time guard: every destinationTeardownSlug must resolve.
{
  for (const entry of MIGRATE_FROM_ENTRIES) {
    for (const slug of entry.destinationTeardownSlugs) {
      if (!resolveMigrateTeardown(slug)) {
        throw new Error(
          `migrate-from.ts: entry "${entry.slug}" references unknown teardown slug "${slug}". Add the teardown first or correct the slug.`,
        );
      }
    }
  }
}
