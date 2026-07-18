#!/usr/bin/env python3
"""Expand thin unlocksaas.com pages using template generators."""
import re
from pathlib import Path

ROOT = Path("/Users/sipi/unlocksaas/app")


def word_count(s):
    text = re.sub(r"<script[^>]*>.*?</script>", "", s, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return len(re.sub(r"\s+", " ", text).strip().split())


def inject(content, new_html):
    patterns = [
        r'(<section[^>]*>\s*<h2[^>]*>\s*(?:Get |Start|Ship|Launch|Try))',
        r'(class="[^"]*cta[^"]*")',
        r'(<footer)',
        r'(<a[^>]*href="[^"]*app[^"]*"[^>]*>[^<]*(?:Get Started|Start|Ship|Launch))',
        r'(</main>)',
        r'(</body>)',
    ]
    for pat in patterns:
        m = re.search(pat, content, re.IGNORECASE | re.DOTALL)
        if m:
            return content[: m.start()] + new_html + "\n" + content[m.start() :]
    if "</body>" in content:
        return content.replace("</body>", new_html + "\n</body>", 1)
    return content + new_html


# === ALTERNATIVES-TO CONTENT ===
ALTERNATIVES = {
    "buildspace": {
        "name": "Buildspace",
        "category": "builder community and weekend project accelerator",
        "focus": "helping builders ship projects in structured sprints (Nights & Weekends program)",
        "description": "Buildspace runs structured builder programs like Nights & Weekends, where participants commit to shipping a project over several weeks. It excels at community motivation, peer accountability, and showcasing work through demo events.",
        "limitations": "Buildspace does not provide a structured SaaS launch curriculum, customer acquisition playbooks, pricing strategy guidance, or revenue projection tools. It is community-first, not business-outcome-first. Builders graduate with shipped projects but often lack the next-step playbook for finding paying customers.",
        "migration": "If you started in Buildspace and have a project but no revenue, UnlockSaaS picks up where Buildspace leaves off. The 12-week curriculum takes you from shipped prototype to first paying customers, with specific modules on pricing, distribution, and customer acquisition.",
    },
    "makerpad": {
        "name": "Makerpad",
        "category": "no-code education community acquired by Zapier",
        "focus": "teaching people to build tools and automations without code using Zapier, Airtable, Webflow, and similar platforms",
        "description": "Makerpad teaches no-code and automation skills through tutorials, templates, and a community of makers. It is excellent for learning no-code tools and building internal automations or MVPs quickly.",
        "limitations": "Makerpad focuses on building rather than launching and monetizing. There is limited content on SaaS pricing, customer acquisition, revenue modeling, or the business mechanics of turning a no-code project into a sustainable SaaS. The community skews toward hobby builders rather than revenue-focused founders.",
        "migration": "If you built a product using no-code tools learned from Makerpad, UnlockSaaS helps you commercialize it. The toolkit covers pricing strategy, customer acquisition, and revenue projection that Makerpad does not address.",
    },
    "nocode-mba": {
        "name": "NoCode MBA",
        "category": "no-code course platform",
        "focus": "teaching people to build web and mobile apps without code using Bubble, Webflow, and similar platforms",
        "description": "NoCode MBA offers structured courses on building applications with no-code tools. It covers app construction, database design, and user flows with project-based learning.",
        "limitations": "NoCode MBA is a learning platform focused on building skills. It does not provide SaaS launch playbooks, customer acquisition strategies, revenue calculators, or the business frameworks needed to turn an app into a revenue-generating SaaS business.",
        "migration": "After learning to build with NoCode MBA, UnlockSaaS provides the business layer: pricing, distribution, customer acquisition, and revenue modeling.",
    },
    "product-hunt-launch": {
        "name": "Product Hunt Launch",
        "category": "launch event platform",
        "focus": "providing a one-time launch event on Product Hunt to generate initial visibility",
        "description": "A Product Hunt launch generates a spike of traffic and early adopters for your SaaS. It is an important distribution channel and can validate demand quickly.",
        "limitations": "Product Hunt is a single launch event, not a sustained customer acquisition strategy. After launch day, traffic drops to near-zero and you still need ongoing distribution, SEO, content marketing, and sales processes. Many founders treat Product Hunt as their entire go-to-market, which leads to the launch spike followed by a revenue plateau.",
        "migration": "UnlockSaaS treats Product Hunt as one channel within a broader 12-week launch curriculum. The toolkit covers pre-launch positioning, launch day execution, and post-launch sustained acquisition including SEO, content, and direct sales.",
    },
    "small-bets": {
        "name": "Small Bets",
        "category": "indie maker community focused on building a portfolio of small revenue-generating projects",
        "focus": "creating multiple small income streams through independent projects rather than one big bet",
        "description": "Small Bets, run by Daniel Vassallo, is a community and philosophy around building multiple small revenue-generating projects rather than pursuing a single startup. It emphasizes optionality, independence, and diversification.",
        "limitations": "Small Bets is a community and mindset framework, not a tactical SaaS launch toolkit. It does not provide pricing calculators, customer acquisition playbooks, or the step-by-step mechanics of launching and growing a specific SaaS product.",
        "migration": "If you are building a portfolio of small bets and want tactical execution help for your SaaS projects, UnlockSaaS provides the launch playbook, calculators, and community accountability.",
    },
    "startup-school": {
        "name": "Startup School",
        "category": "free online accelerator program by Y Combinator",
        "focus": "providing video lectures, weekly updates, and a community for early-stage founders",
        "description": "Startup School by Y Combinator is a free 10-week program with video lectures from YC partners, weekly progress updates, and a global founder community. It is excellent for learning startup fundamentals and getting exposure to YC's framework.",
        "limitations": "Startup School is broad and startup-stage focused. It covers all startup types (marketplaces, consumer, hardware, enterprise) and does not drill into SaaS-specific mechanics like pricing strategy, churn reduction, MRR modeling, or SaaS-specific customer acquisition. The curriculum is video-first, which some founders find slow.",
        "migration": "If you completed Startup School and want SaaS-specific depth, UnlockSaaS provides focused modules on SaaS pricing, churn, revenue projection, and the mechanics of building a profitable SaaS without raising venture capital.",
    },
}


def gen_alternatives(slug):
    d = ALTERNATIVES.get(slug)
    if not d:
        return None
    return f"""
<section>
<h2>What {d["name"]} does well</h2>
<p>{d["description"]}</p>

<h2>Where {d["name"]} falls short for SaaS founders</h2>
<p>{d["limitations"]}</p>

<h2>How UnlockSaaS compares</h2>
<p>UnlockSaaS is a {("12-week SaaS launch curriculum" if "curriculum" not in d["focus"] else "comprehensive launch toolkit")} designed specifically for indie hackers and solo founders building revenue-generating SaaS products. Where {d["name"]} focuses on {d["focus"]}, UnlockSaaS provides the business mechanics: pricing strategy, customer acquisition, revenue projection, churn management, and the complete launch process from idea to paying customers.</p>
<table>
<thead><tr><th>Capability</th><th>{d["name"]}</th><th>UnlockSaaS</th></tr></thead>
<tbody>
<tr><td>SaaS-specific launch curriculum</td><td>No</td><td>Yes (12 weeks)</td></tr>
<tr><td>Pricing strategy tools</td><td>No</td><td>Yes (calculator + guide)</td></tr>
<tr><td>Revenue projection (MRR modeling)</td><td>No</td><td>Yes</td></tr>
<tr><td>Churn cost calculator</td><td>No</td><td>Yes</td></tr>
<tr><td>LTV calculator</td><td>No</td><td>Yes</td></tr>
<tr><td>Customer acquisition playbook</td><td>Limited</td><td>Yes (multi-channel)</td></tr>
<tr><td>Launch checklist</td><td>No</td><td>Yes</td></tr>
<tr><td>Founder community</td><td>{"Yes" if "community" in d["category"] else "Limited"}</td><td>Yes</td></tr>
</tbody>
</table>

<h2>Should you switch from {d["name"]} to UnlockSaaS?</h2>
<p>{d["migration"]}</p>

<h2>Frequently asked questions</h2>
<details>
<summary>Can I use both {d["name"]} and UnlockSaaS?</summary>
<p>Yes. Many founders use {d["name"]} for {d["focus"].split(",")[0]} while using UnlockSaaS for SaaS-specific business execution. The tools are complementary rather than competitive.</p>
</details>
<details>
<summary>Is UnlockSaaS free?</summary>
<p>UnlockSaaS offers free tools including the pricing calculator, LTV calculator, churn cost calculator, and the SaaS launch checklist. The full 12-week curriculum and premium resources are available with a subscription.</p>
</details>
<details>
<summary>What if I already have a product built?</summary>
<p>UnlockSaaS is designed for founders at any stage, but the core curriculum assumes you have an idea or prototype and need to get it to paying customers. If you already have revenue, the pricing and churn tools are immediately useful.</p>
</details>
</section>
"""


# === VS CONTENT ===
VS_DATA = {
    "unlocksaas-vs-microconf": {
        "name": "MicroConf",
        "category": "community and conference for bootstrapped SaaS founders",
        "focus": "running events, a Slack community, and accelerator programs (Starter, Growth) for self-funded SaaS founders",
        "carshake_wins": ["affordable entry point", "self-paced curriculum", "built-in calculators and tools", "founder-focused launch checklist"],
        "competitor_wins": ["established conference and events", "large alumni network", "accelerator programs with funding", "robust Slack community"],
    },
    "unlocksaas-vs-indie-hackers": {
        "name": "Indie Hackers",
        "category": "community platform for indie founders, owned by Foreable",
        "focus": "forum discussions, founder interviews, milestone tracking, and community-driven knowledge sharing",
        "carshake_wins": ["structured launch curriculum", "calculators and tools", "step-by-step playbooks", "action-oriented framework"],
        "competitor_wins": ["large active community", "free access", "founder interview archive", "milestone feed for motivation"],
    },
}


def gen_vs(slug):
    d = VS_DATA.get(slug)
    if not d:
        return None
    return f"""
<section>
<h2>Feature comparison: UnlockSaaS vs {d["name"]}</h2>
<p>{d["name"]} is a {d["category"]} focused on {d["focus"]}. UnlockSaaS is a SaaS launch toolkit with a structured curriculum, built-in calculators, and actionable playbooks designed to take you from idea to paying customers.</p>
<table>
<thead><tr><th>Feature</th><th>UnlockSaaS</th><th>{d["name"]}</th></tr></thead>
<tbody>
<tr><td>Structured launch curriculum</td><td>Yes (12 weeks)</td><td>{"Partial" if "accelerator" in d["focus"] else "No"}</td></tr>
<tr><td>Pricing calculator</td><td>Yes</td><td>No</td></tr>
<tr><td>Revenue projector</td><td>Yes</td><td>No</td></tr>
<tr><td>Churn cost calculator</td><td>Yes</td><td>No</td></tr>
<tr><td>Community</td><td>{"Yes" if "Yes" in d["carshake_wins"] else "Growing"}</td><td>{"Yes (large)" if "large" in str(d["competitor_wins"]) else "Yes"}</td></tr>
<tr><td>Founder stories</td><td>Yes</td><td>{"Yes (extensive)" if "interview" in d["focus"] else "Yes"}</td></tr>
<tr><td>Action checklists</td><td>Yes</td><td>No</td></tr>
<tr><td>Self-paced learning</td><td>Yes</td><td>{"Varies" if "accelerator" in d["focus"] else "Yes"}</td></tr>
</tbody>
</table>

<h2>When UnlockSaaS is the better choice</h2>
<p>If you are looking for a tactical, step-by-step toolkit to launch your SaaS with built-in calculators, pricing guidance, and a structured curriculum, UnlockSaaS is built for exactly that. The 12-week curriculum, revenue projection tools, and launch checklist give you a concrete execution path rather than relying solely on community knowledge.</p>

<h2>When {d["name"]} might be the better fit</h2>
<p>If your priority is community connection, {d["name"]} has a {("large established" if "large" in str(d["competitor_wins"]) else "strong")} community of founders sharing experiences. The {("interview archive" if "interview" in d["focus"] else "events")} are valuable for inspiration and networking. Many founders use both: {d["name"]} for community and UnlockSaaS for structured execution.</p>

<h2>Frequently asked questions</h2>
<details>
<summary>Can I use both UnlockSaaS and {d["name"]}?</summary>
<p>Yes, they complement each other well. Use {d["name"]} for community, networking, and inspiration. Use UnlockSaaS for structured curriculum, calculators, and the step-by-step launch playbook.</p>
</details>
<details>
<summary>Which is more affordable?</summary>
<p>UnlockSaaS offers free tools including calculators and checklists. The full curriculum is subscription-based. {d["name"]}'s pricing varies depending on whether you are accessing community features or accelerator programs.</p>
</details>
<details>
<summary>Do I need both if I am just starting out?</summary>
<p>If you are just starting, UnlockSaaS gives you the structured path. {d["name"]} adds community value once you want to connect with other founders and share progress.</p>
</details>
</section>
"""


# === GENERIC CONTENT FOR USE-CASES, LEARN, FREE TOOLS ===
def gen_use_case(slug, filepath):
    """Generate use-case content based on the audience in the filename."""
    slug_clean = slug.rstrip("/")
    audiences = {
        "indie-hackers": ("indie hackers", "building and launching small SaaS products independently",
            "Indie hackers juggle building, marketing, sales, and operations simultaneously. Without a structured approach, it is easy to spend months building features no one pays for while neglecting the distribution and pricing work that actually generates revenue.",
            "UnlockSaaS gives indie hackers a structured 12-week launch curriculum that prioritizes revenue-generating activities. Instead of guessing at pricing, use the pricing calculator. Instead of hoping customers appear, follow the customer acquisition playbook. Instead of ignoring churn, model it with the churn calculator."),
        "solo-founders": ("solo founders", "running every aspect of a SaaS business alone",
            "Solo founders wear every hat: product, marketing, sales, support, and finance. The challenge is prioritization and avoiding the trap of working on low-impact tasks while high-impact growth activities go undone.",
            "UnlockSaaS gives solo founders a clear execution path. The 12-week curriculum tells you what to work on each week. The calculators handle the math. The checklists ensure nothing critical is missed. This frees you to focus on building and selling."),
        "serial-entrepreneurs": ("serial entrepreneurs", "launching multiple SaaS products over time",
            "Serial entrepreneurs benefit from repeatable systems. Each new SaaS launch should be faster and more efficient than the last, but only if you have a documented process to follow.",
            "UnlockSaaS provides that repeatable system. The curriculum, calculators, and checklists become your launch template. Apply it to each new product to compress the time from idea to revenue."),
        "agency-owners": ("agency owners", "building SaaS products alongside or transitioning from client services",
            "Agency owners transitioning to SaaS face a mindset shift from project-based revenue to recurring revenue. The mechanics of SaaS pricing, churn management, and MRR growth are fundamentally different from client work.",
            "UnlockSaaS bridges this gap with SaaS-specific tools. The pricing calculator helps you model subscription pricing. The revenue projector shows MRR growth trajectories. The curriculum covers the transition from one-time project revenue to recurring SaaS revenue."),
    }
    d = audiences.get(slug_clean)
    if not d:
        return None
    audience, focus, problem, solution = d
    return f"""
<section>
<h2>Why {audience} use UnlockSaaS</h2>
<p>{problem}</p>
<p>{solution}</p>

<h2>What {audience} get from the toolkit</h2>
<ul>
<li><strong>Structured launch curriculum:</strong> A 12-week path from idea to paying customers, with specific weekly objectives.</li>
<li><strong>Pricing calculator:</strong> Model subscription pricing based on value delivered, competitor pricing, and customer willingness to pay.</li>
<li><strong>Revenue projector:</strong> Forecast MRR growth over 12 months based on your assumptions about acquisition and churn.</li>
<li><strong>Churn cost calculator:</strong> Quantify the revenue impact of churn to prioritize retention work.</li>
<li><strong>LTV calculator:</strong> Understand customer lifetime value to guide acquisition spend decisions.</li>
<li><strong>Launch checklist:</strong> Ensure nothing critical is missed before, during, and after launch.</li>
<li><strong>SaaS mistakes guide:</strong> Learn from common pitfalls that kill early-stage SaaS products.</li>
<li><strong>Founder community:</strong> Connect with other {audience} for accountability, feedback, and support.</li>
</ul>

<h2>How {audience} typically use UnlockSaaS</h2>
<ol>
<li><strong>Start with the curriculum:</strong> Work through the 12-week modules to establish a structured launch process.</li>
<li><strong>Use the calculators weekly:</strong> Run pricing, revenue, and churn models as your business evolves.</li>
<li><strong>Follow the launch checklist:</strong> Use it as a pre-flight check before going live and as an audit tool post-launch.</li>
<li><strong>Read the mistakes guide:</strong> Identify which common SaaS mistakes you are currently at risk of making.</li>
<li><strong>Engage with the community:</strong> Share progress, ask questions, and learn from other founders on the same path.</li>
</ol>

<h2>Frequently asked questions</h2>
<details>
<summary>I am a {audience.replace("s", "")} with no SaaS experience. Is this for me?</summary>
<p>Yes. UnlockSaaS is designed for founders at all stages. The curriculum starts from the fundamentals and builds up to advanced SaaS mechanics like churn modeling and pricing strategy.</p>
</details>
<details>
<summary>I already have a SaaS product. Can UnlockSaaS still help?</summary>
<p>Absolutely. The calculators, mistakes guide, and customer acquisition playbook are useful at any stage. Many founders use the launch checklist as a post-launch audit to identify gaps in their current go-to-market.</p>
</details>
<details>
<summary>How much time does it require per week?</summary>
<p>The curriculum is designed for 5-10 hours per week. You can move faster or slower depending on your schedule. The calculators and tools can be used independently of the curriculum at any time.</p>
</details>
</section>
"""


def gen_learn(slug, filepath):
    """Generate learn content based on the topic in the filename."""
    topics = {
        "saas-launch-checklist": ("SaaS launch checklist", "A comprehensive SaaS launch checklist covers positioning, pricing, technical readiness, distribution, and post-launch iteration. Most failed launches skip critical steps in at least one of these areas.",
            ["Validate the problem with 10+ customer interviews", "Define your positioning and unique value proposition", "Set initial pricing using the pricing calculator", "Build the minimum viable product (not less)", "Set up analytics from day one", "Prepare your launch channels (email list, social, community)", "Create support documentation", "Test the signup and payment flow end-to-end", "Plan your launch day content", "Have a post-launch iteration plan ready"]),
        "saas-pricing-strategies": ("SaaS pricing strategies", "SaaS pricing is one of the highest-leverage decisions a founder makes. Pricing too low leaves revenue on the table and attracts low-value customers. Pricing too high stalls acquisition. The right strategy depends on your value metric, audience, and competitive landscape.",
            ["Identify your value metric (what customers are paying for)", "Research competitor pricing ranges", "Choose a pricing model (flat, tiered, per-seat, usage-based)", "Set your initial price at the high end of acceptable range", "Build a pricing page that communicates value, not just cost", "Test pricing with real customers", "Review and adjust quarterly"]),
        "saas-mistakes-that-kill-startups": ("SaaS mistakes that kill startups", "Most SaaS failures are preventable. Founders repeat the same mistakes: building before validating, pricing too low, ignoring churn, and treating launch day as the finish line instead of the starting line.",
            ["Building before validating the problem", "Pricing too low to attract customers", "Ignoring churn until it is critical", "Focusing on features instead of distribution", "Treating launch day as the end goal", "Not talking to customers regularly", "Copying competitor features without understanding why", "Underinvesting in onboarding"]),
        "how-to-get-first-saas-customer": ("how to get your first SaaS customer", "Getting the first SaaS customer is fundamentally different from getting the 100th. Early customers come from direct outreach, personal networks, and niche communities, not from SEO or paid ads.",
            ["Identify 20 potential customers in your target persona", "Reach out personally via email or LinkedIn", "Offer free early access in exchange for feedback", "Schedule discovery calls to understand their problem", "Manually onboard the first 5-10 customers", "Ask for testimonials and referrals", "Document what works for repeatable acquisition"]),
        "saas-metrics-that-matter": ("SaaS metrics that matter", "SaaS metrics fall into acquisition (MRR, conversion rate), retention (churn, LTV), and efficiency (CAC payback, gross margin) categories. Founders often track vanity metrics like signups while ignoring the metrics that predict revenue.",
            ["MRR (Monthly Recurring Revenue)", "Churn rate (logo and revenue)", "Customer Lifetime Value (LTV)", "Customer Acquisition Cost (CAC)", "LTV:CAC ratio (aim for 3:1 or better)", "Gross margin", "Net Revenue Retention"]),
    }
    d = topics.get(slug.rstrip("/"))
    if not d:
        return None
    title, intro, points = d
    points_html = "\n".join([f"<li>{p}</li>" for p in points])
    return f"""
<section>
<h2>Understanding {title}</h2>
<p>{intro}</p>

<h2>Key elements</h2>
<ol>
{points_html}
</ol>

<h2>Why this matters for your SaaS</h2>
<p>Founders who follow a structured approach to {title} consistently outperform those who improvise. The difference between a successful launch and a stalled product often comes down to whether you followed a proven process or tried to figure it out as you went.</p>
<p>UnlockSaaS provides the tools and curriculum to execute {title} systematically. The calculators handle the quantitative work, the checklists ensure completeness, and the curriculum provides the strategic framework.</p>

<h2>Common pitfalls</h2>
<ul>
<li><strong>Rushing:</strong> Trying to launch before the fundamentals are in place.</li>
<li><strong>Copying without understanding:</strong> Replicating what competitors do without knowing why.</li>
<li><strong>Optimizing prematurely:</strong> Tweaking details before validating the core approach.</li>
<li><strong>Ignoring feedback:</strong> Sticking to a plan that is not working.</li>
</ul>

<h2>Frequently asked questions</h2>
<details>
<summary>How long should I spend on {title}?</summary>
<p>It depends on your stage, but plan for focused work over 1-2 weeks. Rushing through critical setup work leads to expensive mistakes later.</p>
</details>
<details>
<summary>Can I get help with {title}?</summary>
<p>Yes. The UnlockSaaS community includes founders who have been through this process. The curriculum covers {title} in depth with actionable frameworks.</p>
</details>
<details>
<summary>What tools does UnlockSaaS provide for {title}?</summary>
<p>The toolkit includes calculators, checklists, and curriculum modules directly relevant to {title}. See the homepage for the current feature set.</p>
</details>
</section>
"""


def gen_free_tool(slug, filepath):
    """Generate content for free tool pages."""
    tools = {
        "pricing-calculator": ("SaaS Pricing Calculator", "The SaaS Pricing Calculator helps you determine the optimal price point for your SaaS product based on value delivered, competitor pricing, and customer willingness to pay.",
            "Enter your product's value metric, target customer segment, and competitor pricing data. The calculator outputs a recommended price range and helps you model different pricing scenarios.",
            "annual_revenue = monthly_price * 12 * customers"),
        "landing-page-roaster": ("Landing Page Roaster", "The Landing Page Roaster analyzes your SaaS landing page for positioning clarity, conversion optimization, and common mistakes that drive visitors away without signing up.",
            "Enter your landing page URL. The tool evaluates headline clarity, value proposition, call-to-action effectiveness, social proof, and common conversion killers.",
            "conversion_rate = signups / visitors * 100"),
        "saas-idea-validator": ("SaaS Idea Validator", "The SaaS Idea Validator helps you assess whether your SaaS idea has market potential before you invest months building a product nobody wants.",
            "Enter your idea, target audience, and problem statement. The tool evaluates market size, competition, willingness to pay, and problem severity.",
            "idea_score = (market_size * problem_severity) / (competition + build_cost)"),
    }
    d = tools.get(slug.rstrip("/"))
    if not d:
        return None
    name, what_it_does, how_it_works, formula = d
    return f"""
<section>
<h2>What the {name} does</h2>
<p>{what_it_does}</p>

<h2>How to use it</h2>
<p>{how_it_works}</p>

<h2>Why this matters</h2>
<p>Getting pricing, positioning, and idea validation right before you build is the highest-leverage work you can do as a SaaS founder. These tools help you make data-informed decisions instead of guessing.</p>

<h2>Related tools and resources</h2>
<ul>
<li><strong>Pricing Calculator:</strong> Model subscription pricing scenarios.</li>
<li><strong>Revenue Projector:</strong> Forecast MRR growth over 12 months.</li>
<li><strong>Churn Cost Calculator:</strong> Quantify the impact of customer churn.</li>
<li><strong>LTV Calculator:</strong> Understand customer lifetime value.</li>
<li><strong>Launch Checklist:</strong> Ensure you are ready to go live.</li>
</ul>

<h2>Frequently asked questions</h2>
<details>
<summary>Is this tool free?</summary>
<p>Yes. All UnlockSaaS calculators and tools are free to use. The full 12-week SaaS launch curriculum is available with a subscription.</p>
</details>
<details>
<summary>Do I need to create an account?</summary>
<p>The free tools can be used without an account. Creating an account lets you save your results and access the full curriculum.</p>
</details>
<details>
<summary>How accurate are the calculations?</summary>
<p>The tools use standard SaaS financial formulas. The accuracy depends on the quality of your inputs. Use them as directional guidance, not precise predictions.</p>
</details>
</section>
"""


def gen_integration(slug, filepath):
    """Generate integration page content."""
    integrations = {
        "vercel": ("Vercel", "frontend deployment and hosting", "deploy and host your SaaS frontend with automatic CI/CD, preview deployments, and global CDN distribution"),
        "stripe": ("Stripe", "payment processing", "accept subscription payments, manage billing, handle trials and upgrades, and track MRR through Stripe's billing system"),
        "supabase": ("Supabase", "backend-as-a-service", "use Supabase for authentication, database, real-time subscriptions, and file storage without managing infrastructure"),
    }
    d = integrations.get(slug.rstrip("/"))
    if not d:
        return None
    name, category, purpose = d
    return f"""
<section>
<h2>How UnlockSaaS integrates with {name}</h2>
<p>{name} is a {category} that {purpose}. The UnlockSaaS curriculum and tools are designed to work alongside {name}, helping you set up and optimize your {category} as part of your SaaS launch.</p>

<h2>What you get from the integration</h2>
<ul>
<li><strong>Setup guidance:</strong> Step-by-step instructions for configuring {name} for a SaaS product.</li>
<li><strong>Best practices:</strong> Architecture patterns that scale from your first customer to thousands.</li>
<li><strong>Launch checklist alignment:</strong> {name} setup tasks integrated into the broader launch checklist.</li>
<li><strong>Revenue tracking:</strong> How to connect {name} metrics to your MRR, churn, and LTV calculations.</li>
</ul>

<h2>Common {name} setup scenarios</h2>
<ol>
<li><strong>New SaaS setup:</strong> Configure {name} from scratch with optimal settings for subscription billing and growth tracking.</li>
<li><strong>Migrating from another platform:</strong> Transfer existing customers, billing data, and configurations to {name}.</li>
<li><strong>Scaling existing setup:</strong> Optimize your current {name} configuration for higher volume and more complex pricing models.</li>
</ol>

<h2>Frequently asked questions</h2>
<details>
<summary>Do I need {name} to use UnlockSaaS?</summary>
<p>No. UnlockSaaS is platform-agnostic and works with any {category} provider. {name} is one of several recommended options covered in the curriculum.</p>
</details>
<details>
<summary>Is the integration guide free?</summary>
<p>The basic setup guidance is available in the free launch checklist. Detailed {name}-specific walkthroughs are part of the premium curriculum.</p>
</details>
<details>
<summary>What if I already use a different {category}?</summary>
<p>The principles in the curriculum apply to any provider. The {name}-specific content is supplemental and focuses on provider-specific optimizations.</p>
</details>
</section>
"""


# === PROCESS ALL THIN PAGES ===
def main():
    stats = {"patched": 0, "ok": 0, "skip": 0}
    details = []

    thin_files = []
    for fp in ROOT.rglob("*.html"):
        if any(x in str(fp) for x in [".next", ".vercel", "node_modules", "/embed.html", "googlea", "googlee"]):
            continue
        try:
            content = fp.read_text(encoding="utf-8")
        except Exception:
            continue
        if word_count(content) >= 300:
            stats["ok"] += 1
            continue
        thin_files.append(fp)

    print(f"Found {len(thin_files)} thin pages to process")
    print()

    for fp in sorted(thin_files):
        rel = fp.relative_to(ROOT)
        rel_str = str(rel).replace("/index.html", "").replace(".html", "")
        parts = rel_str.split("/")
        
        # Determine content generator based on path
        new_html = None
        if "alternatives-to" in parts:
            slug = parts[-1] if parts[-1] != "alternatives-to" else (parts[-2] if len(parts) > 1 else "")
            new_html = gen_alternatives(slug)
        elif "vs" in parts:
            slug = parts[-1] if parts[-1] != "vs" else ""
            new_html = gen_vs(slug)
        elif "use-cases" in parts:
            slug = parts[-1]
            new_html = gen_use_case(slug, str(fp))
        elif "learn" in parts:
            slug = parts[-1]
            new_html = gen_learn(slug, str(fp))
        elif "free" in parts:
            slug = parts[-1]
            new_html = gen_free_tool(slug, str(fp))
        elif "integrations" in parts:
            slug = parts[-1]
            new_html = gen_integration(slug, str(fp))
        
        if not new_html:
            stats["skip"] += 1
            details.append((str(rel), "no template", ""))
            continue
        
        content = fp.read_text(encoding="utf-8")
        before = word_count(content)
        new_content = inject(content, new_html)
        after = word_count(new_content)
        
        if after <= before:
            stats["skip"] += 1
            details.append((str(rel), f"no growth ({before}->{after})", ""))
            continue
        
        fp.write_text(new_content, encoding="utf-8")
        stats["patched"] += 1
        details.append((str(rel), before, after))

    print(f"=== RESULTS ===")
    print(f"Patched: {stats['patched']}")
    print(f"Already OK: {stats['ok']}")
    print(f"Skipped (no template/no growth): {stats['skip']}")
    print()
    if details:
        print("=== DETAILS ===")
        for d in sorted(details):
            if len(d) == 3 and isinstance(d[1], int):
                print(f"  {d[0]}: {d[1]} -> {d[2]}")
            else:
                print(f"  {d[0]}: {d[1]}")


if __name__ == "__main__":
    main()
