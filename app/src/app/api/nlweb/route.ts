import { NextRequest, NextResponse } from "next/server";

const SITE_CONFIG = {
  name: "UnlockSaaS",
  description:
    "UnlockSaaS is a SaaS launch toolkit and community. Alternatives directory, launch checklist, revenue projector, LTV calculator, churn cost calculator, and the SaaS playbook.",
  url: "https://unlocksaas.com",
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
      description: "Compare SaaS tools vs Notion, Airtable, Lovable, Replit, v0, Cursor.",
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

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

  const results = (SITE_CONFIG.content || [])
    .filter((item) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (item.title || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      );
    })
    .slice(0, limit);

  return NextResponse.json({
    query,
    results: results.map((c) => ({
      url: c.url,
      name: c.title,
      description: c.description,
      site_name: SITE_CONFIG.name,
      site_url: SITE_CONFIG.url,
      type: c.type || "webpage",
      score: 1.0,
    })),
    total: results.length,
    ai_answer: query
      ? `${SITE_CONFIG.name}: ${SITE_CONFIG.description}`
      : undefined,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
