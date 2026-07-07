import { NextRequest, NextResponse } from "next/server";

const SITE_CONFIG = {
  name: "UnlockSaaS Agent",
  description:
    "UnlockSaaS is a SaaS launch toolkit and community. Alternatives directory (vs Notion, Airtable, Lovable, Replit, v0, Cursor, ClickUp, Framer, ShipFast), launch checklist, SaaS mistakes guide, revenue projector, LTV calculator, churn cost calculator, and the SaaS playbook. Founder stories and a press kit.",
  url: "https://unlocksaas.com",
  version: "1.0.0",
  capabilities: { streaming: false, pushNotifications: false },
  authentication: { type: "none" },
  content: [
    {
      title: "UnlockSaaS — Ship Your SaaS Faster",
      url: "https://unlocksaas.com/",
      description:
        "SaaS launch toolkit: alternatives directory, launch checklist, revenue/LTV/churn calculators.",
      type: "homepage",
    },
    {
      title: "Pricing Teardown",
      url: "https://unlocksaas.com/pricing-teardown",
      description: "UnlockSaaS pricing — founder-friendly plans.",
      type: "pricing",
    },
    {
      title: "Alternatives Directory",
      url: "https://unlocksaas.com/alternatives-to",
      description:
        "Compare SaaS tools vs Notion, Airtable, Lovable, Replit, v0, Cursor, and more.",
      type: "directory",
    },
    {
      title: "SaaS Launch Checklist",
      url: "https://unlocksaas.com/starter",
      description: "Step-by-step checklist to launch your SaaS.",
      type: "guide",
    },
  ],
};

export async function GET() {
  return NextResponse.json(SITE_CONFIG);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { jsonrpc, method, params, id } = body;

  if (jsonrpc !== "2.0") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request" },
        id: id ?? null,
      },
      { status: 200 }
    );
  }

  switch (method) {
    case "agent/info":
    case "agent.describe":
      return NextResponse.json({
        jsonrpc: "2.0",
        result: {
          name: SITE_CONFIG.name,
          description: SITE_CONFIG.description,
          url: SITE_CONFIG.url,
          capabilities: SITE_CONFIG.capabilities,
          version: SITE_CONFIG.version,
          authentication: SITE_CONFIG.authentication,
        },
        id,
      });

    case "agent/capabilities":
    case "agent/query":
    case "agent/search": {
      const query = params?.query || params?.q || "";
      const content = (SITE_CONFIG.content || []).filter((item) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          (item.title || "").toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q)
        );
      });
      return NextResponse.json({
        jsonrpc: "2.0",
        result: { query, results: content, total: content.length },
        id,
      });
    }

    default:
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32601, message: `Method not found: ${method}` },
        id,
      });
  }
}
