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
    href: "https://gitdealflow.com/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "GitDealFlow",
    tagline: "Data & Analytics",
    dot: "#10B981",
    title: "GitDealFlow: Track startup acquisitions & funding rounds",
  },
  {
    href: "https://signals.gitdealflow.com/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "Signals by GitDealFlow",
    tagline: "AI & Investing",
    dot: "#3B82F6",
    title: "Signals by GitDealFlow: AI-powered startup investment signals",
  },
  {
    href: "https://invisibleexit.com/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "Invisible Exit",
    tagline: "SaaS & M&A",
    dot: "#8B5CF6",
    title: "Invisible Exit: Acquisition readiness for bootstrapped SaaS",
  },
  {
    href: "https://sipiteno.com/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "Sipiteno",
    tagline: "AI Agents & Automation",
    dot: "#F59E0B",
    title: "Sipiteno: AI business systems and automation",
  },
  {
    href: "https://voicelogpro.com/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "VoiceLogPro",
    tagline: "Voice AI & Field Ops",
    dot: "#06B6D4",
    title: "VoiceLogPro: Voice-to-insight for field teams",
  },
  {
    href: "https://carshake.online/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "CarShake",
    tagline: "Automotive & Insurance",
    dot: "#EF4444",
    title: "CarShake: Valet-damage-proof vehicle handover",
  },
  {
    href: "https://churnlens.site/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "ChurnLens",
    tagline: "SaaS Due Diligence",
    dot: "#6366F1",
    title: "ChurnLens: Buyer-side SaaS churn due diligence",
  },
  {
    href: "https://sanctionsai.dev/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "SanctionsAI",
    tagline: "Compliance & Fintech",
    dot: "#DC2626",
    title: "SanctionsAI: AI agent payment compliance",
  },
  {
    href: "https://sipi.bot/?utm_source=unlocksaas.com&utm_medium=referral&utm_campaign=portfolio_crosspromo&utm_content=footer",
    label: "sipi.bot",
    tagline: "AI Infrastructure",
    dot: "#14B8A6",
    title: "sipi.bot: AI spend firewall for agent payments",
  },
] as const;

export function PortfolioNetworkFooter() {
  return (
    <section
      className="portfolio-network"
      data-portfolio-cross-promo="v1"
      data-portfolio-origin="unlocksaas.com"
    >
      <h3>Explore the Sipiteno product network</h3>
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
