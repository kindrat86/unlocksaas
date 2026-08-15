/**
 * Cross-Portfolio Network Footer — web ring across all 10 portfolio sites.
 *
 * Previously inlined as dangerouslySetInnerHTML HTML string in layout.tsx,
 * which forced the raw HTML (including a full <style> block) into the RSC
 * flight payload on every page. Converted to a proper React component with
 * the CSS extracted to globals.css, saving ~2KB inline CSS + ~500 bytes of
 * serialized HTML wrapper per page × 800+ pages.
 *
 * The component accepts no props — the link list is deterministic and stable.
 */

const SITES = [
  {
    href: "https://gitdealflow.com",
    label: "GitDealFlow",
    tagline: "Data & Analytics",
    dot: "#10B981",
    title: "GitDealFlow: Track startup acquisitions & funding rounds",
  },
  {
    href: "https://signals.gitdealflow.com",
    label: "Signals by GitDealFlow",
    tagline: "AI & Investing",
    dot: "#3B82F6",
    title: "Signals by GitDealFlow: AI-powered startup investment signals",
  },
  {
    href: "https://invisibleexit.com",
    label: "Invisible Exit",
    tagline: "SaaS & M&A",
    dot: "#8B5CF6",
    title: "Invisible Exit: Acquisition readiness for bootstrapped SaaS",
  },
  {
    href: "https://sipiteno.com",
    label: "SipiTeno",
    tagline: "AI Agents & Automation",
    dot: "#F59E0B",
    title: "SipiTeno: AI Agents for SaaS Operations",
  },
  {
    href: "https://unlocksaas.com",
    label: "UnlockSaaS",
    tagline: "SaaS Building",
    dot: "#EC4899",
    title: "UnlockSaaS: Launch your SaaS in 60 days",
  },
  {
    href: "https://voicelogpro.com",
    label: "VoiceLogPro",
    tagline: "Voice AI & Field Ops",
    dot: "#06B6D4",
    title: "VoiceLogPro: Voice-to-insight for field teams",
  },
  {
    href: "https://carshake.online",
    label: "CarShake",
    tagline: "Automotive & Insurance",
    dot: "#EF4444",
    title: "CarShake: Valet-damage-proof vehicle handover",
  },
  {
    href: "https://churnlens.site",
    label: "ChurnLens",
    tagline: "SaaS Analytics",
    dot: "#6366F1",
    title: "ChurnLens: Churn analytics that predict, not just report",
  },
  {
    href: "https://sanctionsai.dev",
    label: "SanctionsAI",
    tagline: "Compliance & Fintech",
    dot: "#DC2626",
    title: "SanctionsAI: AI agent payment compliance",
  },
  {
    href: "https://hirenika.com",
    label: "HireNika",
    tagline: "AI Employees",
    dot: "#EAB308",
    title: "HireNika: AI employees for small business. Bookkeeping, admin, calls from $0.40/task",
  },
  {
    href: "https://sipi.bot",
    label: "Sipi.bot",
    tagline: "AI Infrastructure",
    dot: "#14B8A6",
    title: "Sipi.bot: AI spend firewall for agent payments",
  },
] as const;

export function PortfolioNetworkFooter() {
  return (
    <section className="portfolio-network">
      <h3>🚀 Explore Our Network</h3>
      <p className="network-note">
        Full disclosure: UnlockSaaS is one of ten small products built and run by one
        independent operator. These are the other nine.
      </p>
      <nav className="network-grid" aria-label="Portfolio network">
        {SITES.map((site) => (
          <a
            key={site.href}
            href={site.href}
            className="network-card"
            title={site.title}
          >
            <span
              className="network-dot"
              style={{ background: site.dot }}
            />
            <span className="network-name">{site.label}</span>
            <span className="network-tagline">{site.tagline}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
