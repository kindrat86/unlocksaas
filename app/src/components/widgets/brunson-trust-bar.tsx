/**
 * Brunson Trust Bar — Dotcom Secrets Chapter 7 trust-building block.
 *
 * Previously inlined as dangerouslySetInnerHTML in layout.tsx with all styles
 * as inline HTML attributes. Converted to a proper React component with CSS
 * extracted to globals.css, saving ~1.5KB of inline HTML per page.
 *
 * The trust bar ships on every page of the site — it's a persistent
 * credibility anchor per Brunson's "trust bar on every page" rule.
 */

export function BrunsonTrustBar() {
  return (
    <section className="brunson-trust-bar">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 28,
            marginBottom: 28,
          }}
        >
          <div>
            <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00d4aa" }}>
              60 days
            </span>
            <br />
            <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
              To First Paying Customer
            </span>
          </div>
          <div>
            <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00d4aa" }}>
              7 steps
            </span>
            <br />
            <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
              Proven Playbook
            </span>
          </div>
          <div>
            <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00d4aa" }}>
              100%
            </span>
            <br />
            <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
              Money-Back Guarantee
            </span>
          </div>
          <div>
            <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00d4aa" }}>
              $49
            </span>
            <br />
            <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
              Founding Price /mo
            </span>
          </div>
        </div>
        <p style={{ fontSize: "1.05rem", marginBottom: 24, color: "#cbd5e1" }}>
          You shipped. Nobody paid. The playbook breaks the pattern or the code
          refunds you automatically.
        </p>
        <a
          href="https://unlocksaas.com/diagnostic"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg,#00d4aa,#2deec0)",
            color: "#04130e",
            padding: "14px 32px",
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: "none",
            fontSize: ".95rem",
            boxShadow: "0 8px 24px -10px rgba(0,212,170,.5)",
          }}
        >
          Get Free Diagnosis
        </a>
        <p style={{ marginTop: 18, fontSize: ".78rem", color: "#6b7178" }}>
          Refund enforced by Stripe webhook, not a support ticket. 100% automated.
        </p>
      </div>
    </section>
  );
}
