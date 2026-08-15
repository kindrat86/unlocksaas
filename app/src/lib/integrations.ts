/**
 * /integration/[slug] pSEO catalog — tool-pair integration patterns.
 *
 * Each entry covers ONE common indie SaaS tool-pair integration
 * (Stripe + Supabase, Resend + Next.js, Cal.com + Stripe, etc.) with
 * the integration shape, what each tool owns, the webhook + auth flow,
 * the common gotchas, and the typical implementation order. Pattern-
 * level, not code-level.
 *
 * Distinct from:
 *   - /stack (multi-tool stack recommendations)
 *   - /migrate-from (post-decision execution)
 *   - /pricing-teardown (specific products' pricing structure)
 *
 * /integration is the "how do these two specific tools fit together"
 * surface.
 *
 * Schema: HowTo (the integration steps) + Article + FAQPage +
 * BreadcrumbList.
 *
 * Brunson Hard-Rule:
 *   - No fabricated code samples. Patterns and concepts only.
 *   - Tool slugs cross-link to real teardowns. Build-time guard at
 *     the bottom enforces this against funnel-teardowns +
 *     pricing-teardowns.
 */

import { TEARDOWN_SLUGS } from "./funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "./pricing-teardowns";

export interface IntegrationStep {
  title: string;
  description: string;
  gotcha?: string;
}

export interface IntegrationFaq {
  q: string;
  a: string;
}

export interface IntegrationEntry {
  slug: string;
  /** Two tools being integrated. */
  toolA: string;
  toolB: string;
  /** Display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** Intro: 2-3 sentences. */
  intro: string;
  /** What each tool owns in the integration. */
  toolAOwns: string;
  toolBOwns: string;
  /** The integration shape: webhook, polling, direct call, etc. */
  integrationShape: string;
  /** Implementation steps in order. */
  steps: ReadonlyArray<IntegrationStep>;
  /** Common gotchas across the whole integration. */
  commonGotchas: ReadonlyArray<string>;
  /** When NOT to build this integration (alternatives). */
  whenNotToBuild: string;
  /** Teardown slugs for cross-link. Resolved against funnel + pricing teardowns. */
  toolATeardownSlug?: string;
  toolBTeardownSlug?: string;
  faqs: ReadonlyArray<IntegrationFaq>;
  lastVerified: string;
}

export const INTEGRATION_ENTRIES: ReadonlyArray<IntegrationEntry> = [
  {
    slug: "stripe-supabase",
    toolA: "Stripe",
    toolB: "Supabase",
    displayName: "Stripe + Supabase integration",
    metaTitle: "Stripe + Supabase Integration Pattern (Indie SaaS)",
    metaDescription:
      "How indie SaaS founders integrate Stripe with Supabase. The webhook pattern, what each tool owns, the auth handoff, and the common gotchas.",
    intro:
      "Stripe + Supabase is the dominant indie SaaS payment + database integration. Stripe owns checkout and subscription state; Supabase owns user identity and product state. The integration glue is a webhook handler that reflects Stripe events into Supabase tables.",
    toolAOwns:
      "Customer payment methods, subscription lifecycle, invoice generation, refunds, taxes (if MoR or Stripe Tax enabled), pricing tiers.",
    toolBOwns:
      "User authentication, user profile, application data (what the user paid FOR), role-based access control, audit log.",
    integrationShape:
      "Webhook-driven. Stripe fires events to your endpoint; your endpoint authenticates the signature, then updates Supabase tables (customers, subscriptions, paid_features) to reflect the Stripe state. Application reads Supabase only — never queries Stripe in the hot path.",
    steps: [
      {
        title: "Set up a Stripe Customer record at signup (or first purchase)",
        description:
          "When a user signs up in Supabase, create a Stripe Customer with metadata pointing back to the Supabase user_id. Store the Stripe customer_id on the Supabase user row.",
        gotcha:
          "Creating a Stripe Customer on every login (instead of first signup) produces duplicate customers. Use upsert keyed on user_id metadata.",
      },
      {
        title: "Build the webhook endpoint",
        description:
          "Single Next.js route handler that receives all Stripe events. Verify the signature with stripe-signature header + your webhook secret. Reject anything that fails.",
        gotcha:
          "Webhook signature verification requires the raw body, not the parsed JSON. Use the framework-specific raw-body access; do not let body parsing destroy the signature.",
      },
      {
        title: "Handle the 4-5 events you actually need",
        description:
          "Most indie SaaS only needs: checkout.session.completed (first payment), customer.subscription.updated (status changes), customer.subscription.deleted (cancellation), invoice.payment_succeeded (renewals), invoice.payment_failed (dunning).",
        gotcha:
          "Subscribing to all events floods your endpoint with noise. Pick the events you handle; ignore the rest in Stripe Dashboard.",
      },
      {
        title: "Make the webhook handler idempotent",
        description:
          "Stripe retries failed webhooks for 3 days. Your handler must produce the same end-state regardless of how many times the event arrives. Key idempotency on event.id and store processed event IDs.",
        gotcha:
          "Idempotency-by-side-effect fails. A handler that 'just runs' a second time produces duplicate emails, duplicate access grants, duplicate row inserts. Explicit dedup is required.",
      },
      {
        title: "Reflect subscription state into Supabase",
        description:
          "Keep a subscriptions table in Supabase mirroring the relevant Stripe state (status, plan, current_period_end). Application reads this; never queries Stripe at request time.",
        gotcha:
          "Querying Stripe at every page load is the single most common mistake. Stripe rate limits and adds latency; Supabase reads are 10-100x faster.",
      },
      {
        title: "Use Row-Level Security (RLS) for access control",
        description:
          "Supabase RLS policies check the user's subscription row to gate access to paid features. The policy reads from the subscriptions table, not from Stripe.",
        gotcha:
          "RLS policies that query Stripe-side data cannot work. RLS runs at query time; only Supabase-side data is available.",
      },
      {
        title: "Test the full flow with Stripe CLI before deploying webhooks",
        description:
          "stripe listen --forward-to localhost:3000/api/webhook lets you trigger events locally. Test customer.created, subscription.updated, subscription.deleted, payment.failed before going to production.",
        gotcha:
          "Production webhook secret differs from CLI's local secret. Use environment-specific secrets and verify both.",
      },
    ],
    commonGotchas: [
      "Storing Stripe data in Supabase as the source of truth, then drifting from Stripe's actual state. Stripe is always the source of truth; Supabase mirrors.",
      "Missing webhook events between retries — your endpoint must be idempotent and tolerate replays.",
      "Not handling the gap between subscription.created and the first invoice.paid event. The customer can be 'subscribed' but unpaid for 60 seconds; design for it.",
      "Hardcoding Stripe price IDs in application code. Store them in a config table; new prices should not require a deploy.",
    ],
    whenNotToBuild:
      "If you only need one-time payments (no subscriptions), Stripe Payment Links + a single webhook handler is simpler than the full Stripe + Supabase pattern. The full pattern is for SaaS with recurring billing.",
    toolATeardownSlug: "stripe",
    toolBTeardownSlug: undefined,
    faqs: [
      {
        q: "Should I use Stripe Checkout or Stripe Elements?",
        a: "Stripe Checkout for indie SaaS — hosted checkout that Stripe maintains. Elements is for custom checkouts where you need pixel-perfect control. Most indie SaaS should use Checkout until the volume justifies the Elements engineering cost.",
      },
      {
        q: "Where should webhook secrets live?",
        a: "Environment variables, never in code. Use Vercel env vars (or platform equivalent) with one secret per environment. Production webhook secret is the one Stripe Dashboard shows for your production endpoint.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "resend-nextjs",
    toolA: "Resend",
    toolB: "Next.js",
    displayName: "Resend + Next.js integration",
    metaTitle: "Resend + Next.js Integration Pattern (Transactional Email)",
    metaDescription:
      "How indie SaaS founders integrate Resend with Next.js for transactional email. The route-handler pattern, React Email templates, and the deliverability gotchas.",
    intro:
      "Resend + Next.js is the modern indie SaaS transactional-email stack. Resend provides the API and deliverability; Next.js Server Actions or Route Handlers call the API; React Email templates render JSX into HTML emails. Three-line setup once the domain is verified.",
    toolAOwns:
      "Email delivery infrastructure, deliverability reputation (per-domain), templates-as-React storage, suppressions, bounce + complaint handling, send history.",
    toolBOwns:
      "Trigger logic (when to send), template composition (React Email components), recipient address (from user data), tracking event side effects (logging to database).",
    integrationShape:
      "Server-side API call. Next.js server code (Route Handler, Server Action, or webhook handler) calls Resend's SDK with a React Email template + recipient. Resend handles the rest.",
    steps: [
      {
        title: "Verify your sending domain in Resend",
        description:
          "DNS records: SPF, DKIM, DMARC. Verification typically completes in 5-30 minutes after DNS propagation. Send only from verified domains.",
        gotcha:
          "Sending from unverified domains lands in spam reliably. The verification step is not optional.",
      },
      {
        title: "Install React Email and set up the templates folder",
        description:
          "npm install @react-email/components. Create app/emails/ folder for templates. Each template is a JSX component exporting a function that returns an email body.",
        gotcha:
          "Email HTML is its own world — most CSS does not work. React Email components handle the table-based layout and inline styles that survive Gmail/Outlook/Apple Mail.",
      },
      {
        title: "Wire Resend SDK into Server Actions or Route Handlers",
        description:
          "Import { Resend } from 'resend'. Initialize with API key from env. Call resend.emails.send({ from, to, subject, react: <Template /> }) from server-side code.",
        gotcha:
          "Calling resend.emails.send from client components leaks the API key. Resend calls must be server-side only — Server Actions, Route Handlers, or middleware.",
      },
      {
        title: "Handle send failures gracefully",
        description:
          "Resend returns success/error responses. Log failures to your observability system; do not silently swallow. For critical emails (receipts, password resets), retry on transient failures.",
        gotcha:
          "Not handling failures means customers occasionally do not receive their receipt or reset link. The support cost of debugging silent failures is higher than the cost of retry logic.",
      },
      {
        title: "Listen to webhooks for bounce + complaint events",
        description:
          "Resend webhook events for email.bounced, email.complained, email.delivered. Route to your webhook handler; update the user's subscriptions/preferences to suppress future sends.",
        gotcha:
          "Continuing to send to bounced addresses degrades sender reputation. Suppress on first hard bounce.",
      },
      {
        title: "Separate transactional from marketing",
        description:
          "Transactional sends (receipts, password resets) should not be in the same domain as marketing sends (newsletters, promos). Resend supports separate domains; use them.",
        gotcha:
          "A marketing campaign that hurts reputation should not prevent transactional emails from landing. Domain separation is the firewall.",
      },
    ],
    commonGotchas: [
      "Email previews in React Email's dev tool look different from Gmail rendering. Test in actual clients before production.",
      "Resend free tier (3,000/month) is enough for early indie SaaS; the pricing jumps make sense once you cross 10k/month.",
      "DKIM record rotates every 90 days on managed domains. Verify your DNS provider supports the rotation.",
      "Sending from a no-reply@ address loses replies that customers genuinely send. Use a monitored real address.",
    ],
    whenNotToBuild:
      "If your email volume is under 100/month or your needs are sequence-heavy (drip campaigns, broadcasts), tools like Loops, Customer.io, or Mailchimp work better than Resend + custom code. Resend shines for transactional + simple broadcasts.",
    toolATeardownSlug: "resend",
    toolBTeardownSlug: undefined,
    faqs: [
      {
        q: "Should I use Resend for marketing emails too?",
        a: "Resend handles broadcasts but is primarily transactional-focused. For sequence-heavy marketing (drip campaigns, segmentation), Loops or Customer.io has stronger tooling. Many indie SaaS use Resend for transactional + a separate tool for marketing.",
      },
      {
        q: "How do I avoid the spam folder on Gmail?",
        a: "SPF + DKIM + DMARC alignment, low complaint rate, consistent sending patterns. Resend's deliverability is good out of the box; most spam issues are content (subject line, link density) or list quality (cold list, low engagement).",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "cal-com-stripe",
    toolA: "Cal.com",
    toolB: "Stripe",
    displayName: "Cal.com + Stripe integration",
    metaTitle: "Cal.com + Stripe Integration Pattern (Paid Booking)",
    metaDescription:
      "How indie SaaS founders integrate Cal.com bookings with Stripe payments. The booking-then-charge flow, the deposit pattern, and the common gotchas.",
    intro:
      "Cal.com + Stripe is the indie SaaS pattern for paid scheduling (coaching calls, consultations, paid meetings). Cal.com handles the calendar logic; Stripe handles the payment. The integration sits at the booking-creation moment.",
    toolAOwns:
      "Availability rules, time-zone handling, video-call generation, booking confirmation emails, reminder emails, calendar sync.",
    toolBOwns:
      "Payment collection, payment method on file, receipts, refunds (if booking is canceled), tax handling.",
    integrationShape:
      "Cal.com app + Stripe app combined. Cal.com's Stripe app charges at booking time using Stripe Payment Intents. On cancellation, Cal.com refunds via Stripe. The integration is Cal.com-native; minimal custom code.",
    steps: [
      {
        title: "Install Cal.com Stripe app",
        description:
          "Cal.com Dashboard → Apps → Stripe → Install. Connect your Stripe account via OAuth.",
        gotcha:
          "Cal.com Stripe app requires Stripe live mode keys for live bookings. Test mode is supported separately.",
      },
      {
        title: "Configure paid event types",
        description:
          "For each event type that should be paid, edit settings → Payment → enable Stripe → set price + currency. Different event types can have different prices.",
        gotcha:
          "Changing the price after bookings exist does not update existing bookings. Future bookings only.",
      },
      {
        title: "Decide on deposit-vs-full-payment",
        description:
          "Cal.com supports full upfront or deposit. Deposit pattern reduces no-show rate; full payment maximizes commitment. For services above $100, deposit is usually right.",
        gotcha:
          "Deposit pattern requires capture-on-booking + capture-on-completion semantics. Test the flow end-to-end before going live.",
      },
      {
        title: "Set up cancellation + refund policy",
        description:
          "Cal.com cancellation triggers Stripe refund. Decide your policy: full refund vs partial vs no-refund-after-24h. Publish the policy clearly on the booking page.",
        gotcha:
          "Stripe refunds take 5-10 business days to appear on customer card. Communicate this in the cancellation confirmation email so customers do not refund-rage.",
      },
      {
        title: "Test the booking-payment-refund cycle end-to-end",
        description:
          "Book a test event with a real card. Confirm Stripe charge. Cancel the booking. Confirm Stripe refund. Confirm Cal.com freed the slot.",
        gotcha:
          "Skipping this test produces production bugs — bookings without payment, payments without bookings, slots that do not free after cancel.",
      },
    ],
    commonGotchas: [
      "Cal.com Stripe app uses its own Stripe Connect setup, not your direct Stripe account integration. Confirm your platform fee structure.",
      "Bookings made before payment completes can leave Cal.com in an inconsistent state. Cal.com handles this; verify in your test.",
      "Multi-currency: Cal.com supports it, but tax handling becomes complex. Consider single-currency for indie SaaS simplicity.",
      "Cal.com webhooks fire on booking events; use them to update your CRM/customer data alongside the Cal.com-native flow.",
    ],
    whenNotToBuild:
      "If you do not need calendar integration (just a payment for a service), Stripe Payment Links + manual scheduling is simpler. The Cal.com pattern is for products where scheduling is core, not occasional.",
    toolATeardownSlug: "cal-com",
    toolBTeardownSlug: "stripe",
    faqs: [
      {
        q: "Can I use a discount code with Cal.com Stripe?",
        a: "Yes — Cal.com supports discount codes that apply at the Stripe payment step. Configure them in Cal.com Dashboard → Apps → Stripe → Discount codes.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "supabase-vercel",
    toolA: "Supabase",
    toolB: "Vercel",
    displayName: "Supabase + Vercel deployment pattern",
    metaTitle: "Supabase + Vercel Integration Pattern (Indie SaaS Deploy)",
    metaDescription:
      "How indie SaaS founders deploy Supabase-backed Next.js apps to Vercel. The env-var pattern, the preview-deployment gotcha, and the migration flow.",
    intro:
      "Supabase + Vercel is the dominant indie SaaS hosting stack. Supabase provides the database, auth, and storage; Vercel provides the Next.js hosting with preview deployments. The integration sits at environment variables and migration workflow.",
    toolAOwns:
      "Database (Postgres), authentication, file storage, edge functions (server-side database access), row-level security policies.",
    toolBOwns:
      "Next.js application hosting, edge network, preview-per-PR deployments, environment variable management, serverless function execution.",
    integrationShape:
      "Connection by environment variables. Vercel-hosted Next.js code reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for client-side; SUPABASE_SERVICE_ROLE_KEY for server-side admin operations.",
    steps: [
      {
        title: "Create the Supabase project and copy the keys",
        description:
          "Supabase Dashboard → Project Settings → API. Copy URL, anon key, service role key. Service role key is admin; keep it server-only.",
        gotcha:
          "Service role key bypasses Row-Level Security. Never expose it in client-side code. Use environment variables marked as not-NEXT_PUBLIC.",
      },
      {
        title: "Configure Vercel environment variables",
        description:
          "Vercel project Settings → Environment Variables. Three variables minimum: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (both client-safe), SUPABASE_SERVICE_ROLE_KEY (server-only).",
        gotcha:
          "Vercel has separate env-var contexts for Production, Preview, Development. Set the keys in all three contexts or your preview deploys break.",
      },
      {
        title: "Set up Supabase migrations in the repo",
        description:
          "supabase init in the repo. supabase/migrations/ folder commits to git. Local development uses supabase start; production uses supabase db push or the Supabase Dashboard SQL editor.",
        gotcha:
          "Running migrations on production manually is the most common indie SaaS Supabase mistake. Always test in a staging Supabase project first.",
      },
      {
        title: "Use Vercel preview deploys with a separate Supabase project",
        description:
          "Preview deploys against the production Supabase project produce real database mutations. Set up a separate Supabase project for preview environments; use Vercel's branch-specific env vars.",
        gotcha:
          "Preview deploys against production Supabase have caused real data corruption in indie SaaS. The separate-project pattern is non-optional for non-trivial apps.",
      },
      {
        title: "Set up auth callback URL for Vercel domain",
        description:
          "Supabase Dashboard → Authentication → URL Configuration. Add your Vercel production URL and the preview-deploy URL pattern to the allowed redirect URLs.",
        gotcha:
          "Missing URLs in the allowed list make auth fail silently in production. Test the auth flow on the production URL before launch.",
      },
    ],
    commonGotchas: [
      "Supabase free tier pauses inactive projects after 7 days. For production, upgrade to the $25/mo Pro tier.",
      "Vercel's edge runtime is incompatible with Supabase's full client; use the server-side Supabase client in Route Handlers.",
      "Connection pooling matters at scale. Supabase's connection pooler (PgBouncer) is enabled by default; use the pooler URL in Vercel env, not the direct database URL.",
      "Vercel Function timeouts (10-30s on free tier) can interact with slow Supabase queries. Profile your queries and use indexes.",
    ],
    whenNotToBuild:
      "If you need a database with operational characteristics Supabase does not provide (sub-50ms read latency globally, complex multi-region, niche extensions), consider Neon + Vercel or direct Postgres. The Supabase + Vercel pattern is the indie SaaS default; not the only valid stack.",
    toolATeardownSlug: undefined,
    toolBTeardownSlug: "vercel",
    faqs: [
      {
        q: "Should I use Supabase Auth or a separate auth provider?",
        a: "Supabase Auth for indie SaaS up to ~10k users; it covers email + social + magic link. Once you need enterprise features (SSO, SAML, complex RBAC), Clerk or WorkOS are stronger. Below that complexity, Supabase Auth is enough.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "stripe-beehiiv",
    toolA: "Stripe",
    toolB: "Beehiiv",
    displayName: "Stripe + Beehiiv (paid newsletter) integration",
    metaTitle: "Stripe + Beehiiv Integration for Paid Newsletters",
    metaDescription:
      "How newsletter operators integrate Stripe with Beehiiv for paid subscriptions. The native flow, the custom-domain gotcha, and migration considerations.",
    intro:
      "Stripe + Beehiiv is the dominant paid-newsletter stack as of 2026. Beehiiv has native Stripe integration; the operator connects Stripe via OAuth and Beehiiv handles subscription state, paid-content gating, and customer portal access.",
    toolAOwns:
      "Payment processing, recurring billing, customer payment methods, refunds, tax (via Stripe Tax if enabled), subscription lifecycle.",
    toolBOwns:
      "Newsletter delivery, paid-content gating (which subscribers get which posts), subscriber list management, content authoring, branding.",
    integrationShape:
      "Beehiiv-native. Operator connects Stripe via OAuth in Beehiiv Dashboard. Beehiiv calls Stripe via the connected account; subscribers' payment + content access is managed Beehiiv-side. Minimal custom code; mostly configuration.",
    steps: [
      {
        title: "Connect Stripe via Beehiiv OAuth",
        description:
          "Beehiiv Dashboard → Settings → Payments → Connect Stripe. OAuth flow grants Beehiiv access to your Stripe account for the newsletter's billing.",
        gotcha:
          "OAuth grants Beehiiv permission to create customers and subscriptions on your behalf. The Stripe account stays yours; the payouts flow to your bank.",
      },
      {
        title: "Configure paid subscription tiers in Beehiiv",
        description:
          "Beehiiv Dashboard → Subscriptions → Add tier. Set price, frequency (monthly/annual), and which content is gated to this tier.",
        gotcha:
          "Tier changes affect new subscriptions only — existing paid subscribers stay on their original tier until they renew/upgrade.",
      },
      {
        title: "Configure paid-content gating",
        description:
          "Each post can be marked as Free, Subscriber-only (any paid tier), or Premium (specific tier). Free preview + paywall is the typical pattern.",
        gotcha:
          "Free posts cross-shared on Twitter/X can still be read by non-subscribers; gating happens at the Beehiiv-hosted URL. Plan content distribution accordingly.",
      },
      {
        title: "Set up the customer portal",
        description:
          "Beehiiv provides a subscriber-facing portal for managing subscriptions (cancel, change tier, update card). Test the flow before publicly launching paid.",
        gotcha:
          "The portal is Beehiiv-hosted at a specific URL; if you have a custom domain, the portal is on a beehiiv.com subdomain unless you configure the custom domain explicitly.",
      },
      {
        title: "Decide on free-to-paid conversion strategy",
        description:
          "Free subscribers can be converted via in-newsletter CTAs, free-post paywalls (read 3 free, then paywall), or limited-time-free posts that become paywalled. Pick one initial strategy.",
        gotcha:
          "Aggressive paywalling on early-stage paid newsletters loses free subscribers faster than it converts. Start permissive; tighten over time.",
      },
    ],
    commonGotchas: [
      "Stripe Connect (the Beehiiv-OAuth pattern) charges an additional 0.25-2% on top of standard processing. Factor this into your subscription pricing.",
      "Migrating between newsletter platforms with active paid subscribers is complex. Pick the platform with conviction; switching costs are real.",
      "Custom domain on Beehiiv affects subscriber emails (from-address) and portal URL. Configure before launching paid.",
      "Beehiiv's tax handling is via Stripe Tax (if you enable it) — they do not handle VAT/sales tax compliance independently.",
    ],
    whenNotToBuild:
      "If you need full control over the billing experience (custom checkout flow, custom paywall UX, complex tier interactions), Beehiiv's native flow is too constrained. Roll your own with Stripe + a database for high-customization needs. For 95% of indie newsletter operators, native Beehiiv + Stripe is the right answer.",
    toolATeardownSlug: "stripe",
    toolBTeardownSlug: "beehiiv",
    faqs: [
      {
        q: "Can I run Beehiiv free tier without Stripe?",
        a: "Yes — free newsletter is the default. Stripe connection is required only for paid tiers. Many operators run free for months before adding paid; the Stripe connection is a settings change.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "stripe-loops",
    toolA: "Stripe",
    toolB: "Loops",
    displayName: "Stripe + Loops integration (event-driven email)",
    metaTitle: "Stripe + Loops Integration Pattern (Email Automation)",
    metaDescription:
      "How indie SaaS founders use Stripe events to trigger Loops email sequences. The webhook bridge pattern, the sync flow, and the common gotchas.",
    intro:
      "Stripe + Loops is the event-driven indie SaaS email pattern. Stripe fires events (customer created, subscription updated, payment failed); a webhook bridge syncs the events into Loops as contact properties; Loops triggers email sequences based on the properties.",
    toolAOwns:
      "Source of truth for payment + subscription events, customer payment methods, billing lifecycle.",
    toolBOwns:
      "Email sequences (drip campaigns), broadcast sends, transactional email templates, contact properties + segmentation, automation logic.",
    integrationShape:
      "Webhook bridge. Stripe sends events to your webhook; your code transforms each event into a Loops API call (createContact, updateContact, sendEvent). Loops sequences read contact properties to decide what to send.",
    steps: [
      {
        title: "Set up the Stripe webhook endpoint",
        description:
          "Single endpoint in your Next.js app that receives all Stripe events. Verify signature; route by event type.",
        gotcha:
          "Same idempotency requirement as Stripe+Supabase: tolerate webhook replays.",
      },
      {
        title: "Define the Loops contact-property schema",
        description:
          "Decide which Stripe-side data lives on the Loops contact. Typical: subscription_status, plan_name, current_period_end, has_paid_lifetime, churn_risk.",
        gotcha:
          "Too many properties become hard to maintain. Pick 5-10 that drive segmentation; let everything else live in Stripe.",
      },
      {
        title: "Map Stripe events to Loops API calls",
        description:
          "customer.subscription.created → Loops createContact with plan_name. customer.subscription.deleted → Loops updateContact with subscription_status='churned'. invoice.payment_failed → Loops sendEvent (triggers dunning sequence).",
        gotcha:
          "Map all relevant events upfront; missing one means a sequence fires on stale data later.",
      },
      {
        title: "Build the Loops sequences",
        description:
          "Welcome sequence (triggers on contact creation). Trial-end sequence (triggers on subscription.trial_will_end). Dunning sequence (triggers on payment.failed). Win-back sequence (triggers on subscription deleted).",
        gotcha:
          "Loops sequences run independently — make sure they do not overlap (a subscribed customer should not get the trial-end sequence after their first paid charge).",
      },
      {
        title: "Test each sequence end-to-end",
        description:
          "For each Stripe event you trigger on, simulate the event (Stripe CLI works), verify Loops contact updates, verify the sequence fires.",
        gotcha:
          "Sequences that fire in test mode but not production usually trace back to webhook event mapping differences between modes.",
      },
    ],
    commonGotchas: [
      "Loops contact-update API has rate limits. Batch updates during high-volume Stripe event spikes (e.g. mass renewals).",
      "Multi-product SaaS needs Loops contact properties that distinguish products. 'plan_name' might be 'Product A Pro' or 'Product B Starter'; design accordingly.",
      "Email sequences that fire on every plan change can overwhelm customers. Throttle: most plan changes should not trigger sequences, only specific transitions (free→paid, paid→churned).",
      "The webhook bridge is mostly fire-and-forget, but Loops API failures need handling. Log Loops API errors; retry on transient failures.",
    ],
    whenNotToBuild:
      "If your email logic is simple (just welcome + receipts + occasional broadcasts), Resend + Stripe webhooks is simpler. The Stripe + Loops pattern shines once you have 4+ sequences and segmentation needs.",
    toolATeardownSlug: "stripe",
    toolBTeardownSlug: undefined,
    faqs: [
      {
        q: "Should I use Loops or Customer.io for this?",
        a: "Loops for indie SaaS up to about 5,000 customers — better DX, simpler model, lower price. Customer.io once you need more advanced segmentation, multi-channel (SMS), or enterprise features.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "tally-supabase",
    toolA: "Tally",
    toolB: "Supabase",
    displayName: "Tally + Supabase integration (form responses)",
    metaTitle: "Tally + Supabase Integration Pattern (Form Responses)",
    metaDescription:
      "How indie SaaS founders pipe Tally form responses into Supabase. The webhook pattern, schema mapping, and the common gotchas.",
    intro:
      "Tally + Supabase is the pattern for capturing form data into your application database. Tally hosts the form; Supabase stores the responses. The bridge is a Tally webhook that fires on submission and writes a row to Supabase.",
    toolAOwns:
      "Form UI, conditional logic, file uploads, response storage (as a backup), conditional emails, embed widgets.",
    toolBOwns:
      "Long-term response storage, querying + reporting, integration with the rest of the application's data model, row-level security on responses.",
    integrationShape:
      "Webhook to Supabase. Tally fires a JSON payload on every submission; your endpoint receives it, validates, and inserts a row into a Supabase responses table.",
    steps: [
      {
        title: "Design the Supabase responses table",
        description:
          "Columns: id, form_id, submitted_at, response_data (JSONB), user_id (if authenticated submission), source. Use JSONB for response_data to preserve schema flexibility.",
        gotcha:
          "Flattening Tally responses into normalized columns ties your schema to the form structure. If form fields change, the schema breaks. Keep JSONB.",
      },
      {
        title: "Add a Tally webhook to your Supabase project",
        description:
          "In Tally form settings, add a webhook pointing to your Next.js Route Handler. Tally signs the webhook payload; verify the signature server-side.",
        gotcha:
          "Tally's webhook signature mechanism is documented; do not skip verification. Webhook endpoints without verification can be spammed by anyone.",
      },
      {
        title: "Build the Route Handler that receives Tally webhooks",
        description:
          "Next.js Route Handler at /api/tally-webhook. Verify signature, parse payload, insert row to Supabase responses table.",
        gotcha:
          "Idempotency: Tally retries failed webhooks. Use the Tally submission ID as the idempotency key.",
      },
      {
        title: "Handle authenticated vs anonymous submissions",
        description:
          "If your form is for logged-in users, pass the user_id in the URL or hidden field. The webhook handler reads it and associates the response with the user in Supabase.",
        gotcha:
          "Anonymous form submissions with no user context can lose context. Always include at least an email or session ID for traceability.",
      },
      {
        title: "Test the full pipeline",
        description:
          "Submit a real test response via the live Tally form. Confirm webhook fires, Supabase row appears, signature verification passes.",
        gotcha:
          "Skipping this means the first production submission silently fails. Test before launching.",
      },
    ],
    commonGotchas: [
      "Tally's free tier limits monthly submissions; if you scale forms, check the plan ceiling before launching.",
      "Webhook latency means there's a 1-3 second gap between form submission and Supabase row. Plan downstream logic to tolerate this.",
      "Email notifications can come from Tally OR from Supabase trigger. Pick one to avoid duplicate notifications.",
      "Tally allows file uploads; the webhook payload includes URLs to files hosted by Tally, not the files themselves. Long-term storage requires you to download to your own storage.",
    ],
    whenNotToBuild:
      "If you need real-time form validation against your own database (e.g., 'is this email already a customer?'), Tally's hosted form is too constrained. Build the form natively in Next.js + Supabase for that case.",
    toolATeardownSlug: "tally",
    toolBTeardownSlug: undefined,
    faqs: [
      {
        q: "Can I use Tally's response storage instead of Supabase?",
        a: "For low-volume forms (under 100/month) where you do not need to integrate with the rest of your app's data — yes. Tally's response storage is fine for standalone surveys. Once responses need to inform application behavior, route to Supabase.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const INTEGRATION_SLUGS: ReadonlyArray<string> = INTEGRATION_ENTRIES.map(
  (e) => e.slug,
);

export function getIntegrationBySlug(
  slug: string,
): IntegrationEntry | undefined {
  return INTEGRATION_ENTRIES.find((e) => e.slug === slug);
}

export type TeardownKind = "funnel" | "pricing";

export function resolveIntegrationTeardown(
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

// Build-time guard: every teardownSlug, if set, must resolve.
{
  for (const entry of INTEGRATION_ENTRIES) {
    for (const slug of [entry.toolATeardownSlug, entry.toolBTeardownSlug]) {
      if (slug && !resolveIntegrationTeardown(slug)) {
        throw new Error(
          `integrations.ts: entry "${entry.slug}" references unknown teardown slug "${slug}".`,
        );
      }
    }
  }
}
