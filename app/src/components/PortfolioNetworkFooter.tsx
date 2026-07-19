/**
 * Cross-Portfolio Network Footer — rendered on every page across all
 * portfolio sites. Extracted from inline dangerouslySetInnerHTML in the
 * root layout to reduce per-page HTML payload (~3KB → ~1.5KB).
 *
 * CSS rules previously duplicated inline are now expected in /ux.css
 * under the .portfolio-network class namespace.
 *
 * AEO 2026-07-19: page-weight audit — inline CSS moved to ux.css.
 */
export function PortfolioNetworkFooter() {
  return (
    <section className="portfolio-network">
      <h3>🚀 Explore Our Network</h3>
      <nav className="network-grid" aria-label="Portfolio network">
        <a
          href="https://gitdealflow.com"
          className="network-card"
          title="GitDealFlow: Track startup acquisitions & funding rounds"
        >
          <span className="network-dot" style={{ background: "#10B981" }} />
          <span className="network-name">GitDealFlow</span>
          <span className="network-tagline">Data & Analytics</span>
        </a>
        <a
          href="https://signals.gitdealflow.com"
          className="network-card"
          title="Signals by GitDealFlow: AI-powered startup investment signals"
        >
          <span className="network-dot" style={{ background: "#3B82F6" }} />
          <span className="network-name">Signals by GitDealFlow</span>
          <span className="network-tagline">AI & Investing</span>
        </a>
        <a
          href="https://invisibleexit.com"
          className="network-card"
          title="Invisible Exit: Acquisition readiness for bootstrapped SaaS"
        >
          <span className="network-dot" style={{ background: "#8B5CF6" }} />
          <span className="network-name">Invisible Exit</span>
          <span className="network-tagline">SaaS & M&A</span>
        </a>
        <a
          href="https://sipiteno.com"
          className="network-card"
          title="SipiTeno: AI Agents for SaaS Operations"
        >
          <span className="network-dot" style={{ background: "#F59E0B" }} />
          <span className="network-name">SipiTeno</span>
          <span className="network-tagline">AI Agents & Automation</span>
        </a>
        <a
          href="https://unlocksaas.com"
          className="network-card"
          title="UnlockSaaS: Launch your SaaS in 60 days"
        >
          <span className="network-dot" style={{ background: "#EC4899" }} />
          <span className="network-name">UnlockSaaS</span>
          <span className="network-tagline">SaaS Building</span>
        </a>
        <a
          href="https://voicelogpro.com"
          className="network-card"
          title="VoiceLogPro: Voice-to-insight for field teams"
        >
          <span className="network-dot" style={{ background: "#06B6D4" }} />
          <span className="network-name">VoiceLogPro</span>
          <span className="network-tagline">Voice AI & Field Ops</span>
        </a>
        <a
          href="https://carshake.online"
          className="network-card"
          title="CarShake: Valet-damage-proof vehicle handover"
        >
          <span className="network-dot" style={{ background: "#EF4444" }} />
          <span className="network-name">CarShake</span>
          <span className="network-tagline">Automotive & Insurance</span>
        </a>
        <a
          href="https://churnlens.site"
          className="network-card"
          title="ChurnLens: Churn analytics that predict, not just report"
        >
          <span className="network-dot" style={{ background: "#6366F1" }} />
          <span className="network-name">ChurnLens</span>
          <span className="network-tagline">SaaS Analytics</span>
        </a>
        <a
          href="https://sanctionsai.dev"
          className="network-card"
          title="SanctionsAI: AI agent payment compliance"
        >
          <span className="network-dot" style={{ background: "#DC2626" }} />
          <span className="network-name">SanctionsAI</span>
          <span className="network-tagline">Compliance & Fintech</span>
        </a>
        <a
          href="https://sipi.bot"
          className="network-card"
          title="Sipi.bot: AI spend firewall for agent payments"
        >
          <span className="network-dot" style={{ background: "#14B8A6" }} />
          <span className="network-name">Sipi.bot</span>
          <span className="network-tagline">AI Infrastructure</span>
        </a>
      </nav>
    </section>
  );
}
