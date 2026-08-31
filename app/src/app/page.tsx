import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/**
 * Unlock SaaS — Brunson direct-response landing (RSC).
 *
 * Replaces the previous component-composed funnel with a single, fast,
 * server-rendered sales page using the app's own emerald design system.
 * Every other route (/login, /playbook-sales, /api/*, /diagnostic, the
 * [locale] and .well-known surfaces) and the global layout (Geist fonts,
 * CSP, PostHog, SiteHeader, footer) are untouched.
 *
 * Brunson stack: announcement -> hook -> epiphany -> how -> stack -> price ->
 * proof -> guarantee -> urgency -> FAQ -> close.
 */

const STACK = [
  {
    n: "01",
    title: "The 60-day playbook, day by day",
    body: "One task a day, two hours a day. From product audit to first dollar in the bank, mapped out.",
    value: "$2,400",
  },
  {
    n: "02",
    title: "Buyer-friction audit of your product",
    body: "A real pass through your live product, flagging every silent conversion killer a buyer would bounce on.",
    value: "$1,200",
  },
  {
    n: "03",
    title: "The offer template that converts",
    body: "The exact structure for outcome, timeline, price, and risk reversal, filled in for your specific product.",
    value: "$900",
  },
  {
    n: "04",
    title: "Scripts for all 7 direct channels",
    body: "Cold outreach, communities, directories, partners, search, intent, referral. Word for word, no audience required.",
    value: "$1,500",
  },
  {
    n: "05",
    title: "Verification-call script + objection map",
    body: "The call structure and the 14 most likely objections, with a tested response for each one.",
    value: "$800",
  },
  {
    n: "06",
    title: "Code-enforced money-back guarantee",
    body: "Finish 60 days with no paying customer and the refund fires automatically. No support ticket, no negotiation.",
    value: "$600",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Audit the product for buyer friction",
    body: "Days 1 to 7. Walk through your product as a buyer would and flag every place a real customer would bounce. Most shipped SaaS has 3 to 5 silent conversion killers nobody noticed.",
  },
  {
    n: "2",
    title: "Define the one customer it serves",
    body: 'Days 8 to 14. "Anyone who needs X" is why you have no customers. Force the product down to a single, specific buyer with a name, a job, and a budget. Then sell to them.',
  },
  {
    n: "3",
    title: "Write the offer that converts",
    body: "Days 15 to 24. The offer is not the product. It is the specific outcome, the timeline, the price, and the risk reversal. Write the one offer your one customer cannot say no to.",
  },
  {
    n: "4",
    title: "Open the 7 direct channels",
    body: "Days 25 to 38. No audience required. Open seven channels that do not depend on a following: cold outreach, communities, directories, partners, search, intent, and direct referral.",
  },
  {
    n: "5",
    title: "Run the verification calls",
    body: "Days 39 to 50. Real conversations with real prospects. Script the call, track the objections, and refine the offer against what buyers actually say, not what you assumed.",
  },
  {
    n: "6",
    title: "Close the first paying customer",
    body: "Days 51 to 60. The offer, the channel, and the call come together. Handle the close, the payment link, the onboarding. First verified dollar lands in your account.",
  },
  {
    n: "7",
    title: "Hand you the system, not a dependency",
    body: "Day 60 onward. You own the playbook, the offer, the channel mix, and the scripts. The next 10 customers use the same system, without us.",
  },
];

const FAQS = [
  {
    q: "What if I don't have an audience?",
    a: "You do not need one. The playbook opens seven direct channels that do not depend on a following: cold outreach, communities, directories, partners, search, intent signals, and referrals.",
  },
  {
    q: "What if my product is barely shipped?",
    a: "That is fine and common. The first step is the buyer-friction audit, which works whether your product is polished or a rough MVP. Many founders adjust the product based on what step 2 surfaces about the one customer it serves.",
  },
  {
    q: "How does the code-enforced refund actually work?",
    a: "You complete the day-by-day playbook and log the work in the system. At day 60, if no paying customer has landed, the refund fires automatically against the logged completion. No support ticket, no back-and-forth. The enforcement is in the software, not in a human's discretion.",
  },
  {
    q: "Is this coaching or a product?",
    a: "It is a system, not coaching. You get the playbook, the templates, the scripts, the audit, and the tracking that drives the guarantee. You execute it. Hands-on help is a separate, more expensive engagement, not this one.",
  },
  {
    q: "How much time per day?",
    a: "Roughly two hours a day for 60 days. Some days are lighter, the channel-opening stretch in the middle is heavier. It is designed to fit around a job, which is the reality for most people shipping a SaaS on the side.",
  },
  {
    q: "What if I want a refund before day 60?",
    a: "You can request one at any point within the first 14 days, no questions. After day 14, the code-enforced guarantee kicks in and pays out automatically at day 60 if the condition is met. Either path, the money comes back if the system does not deliver.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background">
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-primary text-primary-foreground text-center text-xs sm:text-sm font-medium tracking-wide px-4 py-2.5">
        Shipped a SaaS, no customers? The 60-day playbook, money back enforced by code.
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-5 text-primary border-primary/30 bg-primary/5">
              Money back enforced by code, not a support ticket
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Land your <span className="text-primary">first paying customer</span> in 60 days.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              The 7-step playbook turns the SaaS you already shipped into a verified first
              customer. If it does not land within 60 days, the refund fires without asking.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="/diagnostic"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
              >
                Get my free 2-minute diagnosis
              </a>
              <a
                href="#steps"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md border border-input bg-background text-foreground font-semibold text-base hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                See the 7 steps
              </a>
            </div>
          </div>

          {/* CALENDAR MOCK */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <span className="font-semibold text-foreground">Your 60-day path</span>
              <span className="text-xs text-muted-foreground font-medium">Day 21 of 60</span>
            </div>
            <ol className="flex flex-col gap-2.5">
              {[
                { label: "Audit the product for buyer friction", day: "D1-7", state: "done" },
                { label: "Define the one customer it serves", day: "D8-14", state: "done" },
                { label: "Write the offer that converts", day: "D15-24", state: "now" },
                { label: "Open the 7 direct channels", day: "D25-38", state: "todo" },
                { label: "Run the verification calls", day: "D39-50", state: "todo" },
                { label: "Close the first paying customer", day: "D51-60", state: "todo" },
              ].map((s) => (
                <li
                  key={s.day}
                  className={[
                    "flex items-center gap-3 rounded-md p-3 bg-secondary/40",
                    s.state === "now" ? "ring-1 ring-primary bg-primary/5" : "",
                    s.state === "todo" ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold flex-shrink-0",
                      s.state === "done"
                        ? "bg-primary text-primary-foreground"
                        : s.state === "now"
                          ? "bg-primary text-primary-foreground"
                          : "border border-input text-transparent",
                    ].join(" ")}
                  >
                    {s.state === "done" ? "\u2713" : s.state === "now" ? "\u2192" : ""}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{s.label}</span>
                  <span
                    className={[
                      "text-[11px] font-semibold uppercase tracking-wide",
                      s.state === "done" || s.state === "now"
                        ? "text-primary"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {s.day}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                34% complete
              </span>
              <div className="h-2 w-28 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "34%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            The problem
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-3xl text-foreground">
            Shipping was the easy part. Selling is the wall.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Most founders hit the same wall the week after launch. The product works. The launch tweet got likes. The dashboard shows zero revenue.
          </p>
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {[
              {
                big: "92%",
                desc: "of SaaS products that ship never reach $1,000 in monthly revenue. Not because the product is bad, because the founder stops at the build.",
              },
              {
                big: "1",
                desc: "customer is all it takes to change the trajectory. The playbook is built to land that one customer inside the 60-day window.",
              },
              {
                big: "60d",
                desc: "is the window most founders give themselves before giving up. The playbook is built to fit inside that exact window, day by day.",
              },
            ].map((p) => (
              <div
                key={p.big}
                className="bg-card border border-border rounded-lg p-8 border-t-2 border-t-primary"
              >
                <div className="text-4xl font-bold text-primary tracking-tight">{p.big}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* THE 7 STEPS */}
      <section id="steps" className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            The playbook
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Seven steps. Sixty days. One paying customer.
          </h2>
          <ol className="mt-10">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-[64px_1fr] gap-6 py-7 border-b border-border last:border-b-0"
              >
                <div className="text-5xl font-bold leading-none tracking-tighter text-primary/30">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* STACK */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            What&apos;s included
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            The full 60-day customer-acquisition system.
          </h2>
          <div className="mt-10 border border-border rounded-lg overflow-hidden bg-card">
            {STACK.map((item, i) => (
              <div
                key={item.n}
                className={[
                  "grid grid-cols-[40px_1fr_auto] sm:grid-cols-[56px_1fr_140px] gap-4 sm:gap-5 px-5 sm:px-7 py-5 items-center",
                  i !== STACK.length - 1 ? "border-b border-border" : "",
                ].join(" ")}
              >
                <span className="font-bold text-primary">{item.n}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
                <span className="font-semibold text-foreground text-right whitespace-nowrap text-sm sm:text-base">
                  {item.value} value
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 sm:px-7 py-6 bg-secondary border-t-2 border-t-primary">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Total system value
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-foreground">$7,400</span>
            </div>
          </div>
          <div className="mt-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
              Your price
            </p>
            <div className="text-5xl sm:text-6xl font-bold text-primary tracking-tight">$49/mo</div>
            <p className="mt-3 text-muted-foreground">
              Full system. 60-day money back, enforced by code. Cancel anytime.
            </p>
            <a
              href="/starter"
              className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
            >
              Get the 60-day playbook
            </a>
          </div>
        </div>
      </section>

      {/* HONEST POSITION */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            Where this product stands
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            No customer stories yet. Here is exactly what that means.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            UnlockSaaS is accepting its first founding customers now. There are no
            published customer outcomes yet, so there are no testimonials, success
            rates, or median timelines on this page. We will not invent them.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            What exists today: the full day-by-day playbook, the audit templates, the
            channel scripts, and the code-enforced refund. The guarantee is the proof
            we can make honestly: if you complete the 60 days with no paying customer,
            your money comes back automatically.
          </p>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            Risk reversal
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-3xl text-foreground">
            Finish the 60 days with no customer? Refund fires automatically.
          </h2>
          <div className="mt-10 bg-card border-2 border-primary rounded-lg p-8 sm:p-10 grid sm:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="w-36 h-36 rounded-full border-2 border-primary grid place-items-center text-center font-bold text-primary p-4 leading-tight">
              60-DAY
              <br />
              CUSTOMER
              <br />
              OR REFUND
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                The &ldquo;code-enforced&rdquo; guarantee.
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Most money-back guarantees depend on you filling out a ticket and hoping. This one
                does not. Here is the mechanism, step by step:
              </p>
              <ol className="mt-4 space-y-2 text-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>
                    <strong className="font-semibold">Log the work.</strong> Each day&apos;s task
                    gets marked done in the system. The log, not a claim, is the record.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>
                    <strong className="font-semibold">Day 60 checks itself.</strong> The system
                    looks for one verified paying customer against your logged completion.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>
                    <strong className="font-semibold">No customer, refund fires.</strong>{" "}
                    Automatically, against the log. No support ticket, no awkward email, no
                    negotiation. If the playbook does not land your first customer, you do
                    not pay for it.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY / FINAL CTA */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your shipped SaaS deserves a paying customer. Not another month at zero.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            $49/month. Sixty days from today you either have a real customer or a full refund.
            Both outcomes are fine. Staying at zero is not.
          </p>
          <a
            href="/diagnostic"
            className="mt-8 inline-flex items-center justify-center h-14 px-10 rounded-md bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Get my free 2-minute diagnosis
          </a>
          <p className="mt-5 text-sm text-muted-foreground">
            $49/month · 60-day code-enforced refund · Cancel anytime
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-4 text-center">
            Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center text-foreground">
            What founders ask before they start.
          </h2>
          <div className="mt-10">
            {FAQS.map((f, i) => (
              <details
                key={f.q}
                className="border-b border-border group"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary className="py-5 text-lg font-semibold text-foreground cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-primary text-2xl font-light transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-6 text-muted-foreground leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CLOSE */}
      <section className="py-24 text-center bg-card">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Sixty days. One customer. Or your money back, automatically.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            $49/month. The first paying customer is closer than another month at zero.
          </p>
          <a
            href="/starter"
            className="mt-8 inline-flex items-center justify-center h-14 px-10 rounded-md bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Get the 60-day playbook
          </a>
        </div>
      </section>
    </div>
  );
}
