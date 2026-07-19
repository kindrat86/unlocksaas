/**
 * MCP Server — UnlockSaaS
 *
 * Implements Model Context Protocol (MCP) JSON-RPC over Streamable HTTP.
 * Read-only tools wrapping the same canonical SaaS-finance math the
 * /tools calculators and the $49 Playbook walk through. No auth, no
 * state, no PII.
 *
 * Transport: Streamable HTTP (single POST endpoint).
 * Protocol: JSON-RPC 2.0.
 *
 * Discovery:
 *   - GET  /api/mcp           → server manifest (tools, install hints)
 *   - POST /api/mcp           → JSON-RPC request
 *   - /.well-known/mcp.json   → discovery manifest
 *
 * Install in Claude Desktop / Cursor / Windsurf:
 *   https://unlocksaas.com/mcp
 *
 * Tools mirror /src/lib/tools-catalog.ts. The three calculators exposed
 * here are the same three already declared on /.well-known/mcp.json —
 * get_churn_cost, get_ltv, project_revenue. Do NOT gate them: the
 * Brunson Hard-Rule (honest claims) + the editorial-backlink thesis
 * require these to stay free forever.
 */

import { NextRequest, NextResponse } from "next/server";

const SERVER_INFO = {
  name: "unlocksaas-mcp",
  version: "1.0.0",
} as const;

const CAPABILITIES = {
  tools: { listChanged: false },
  resources: {},
  prompts: {},
} as const;

const PROTOCOL_VERSION = "2024-11-05";

const HOME_URL = "https://unlocksaas.com";
const TOOLS_URL = `${HOME_URL}/tools`;
const CONTACT = "hello@unlocksaas.com";

/** Canonical tools. Names + summaries MUST match /.well-known/mcp.json. */
const TOOLS = [
  {
    name: "get_churn_cost",
    description:
      "Calculate the monthly revenue cost of SaaS churn from MRR, churn rate, and customer count. Returns the dollar value leaking out each month.",
    inputSchema: {
      type: "object" as const,
      properties: {
        mrr: { type: "number", description: "Monthly recurring revenue (USD)." },
        churn_rate: {
          type: "number",
          description: "Monthly churn rate as a decimal (0.05 = 5%).",
        },
        customers: {
          type: "number",
          description: "Active customer count (optional, for per-customer view).",
        },
      },
      required: ["mrr", "churn_rate"],
    },
  },
  {
    name: "get_ltv",
    description:
      "Calculate customer lifetime value (LTV) for a SaaS business from ARPU, gross margin, and monthly churn. Uses the canonical David Skok formula.",
    inputSchema: {
      type: "object" as const,
      properties: {
        arpu: { type: "number", description: "Average revenue per user per month (USD)." },
        gross_margin: {
          type: "number",
          description: "Gross margin as a decimal (0.85 = 85%).",
        },
        monthly_churn: {
          type: "number",
          description: "Monthly churn rate as a decimal (0.05 = 5%).",
        },
      },
      required: ["arpu", "gross_margin", "monthly_churn"],
    },
  },
  {
    name: "project_revenue",
    description:
      "Project SaaS revenue 12 months forward from current MRR and a monthly growth assumption. Returns month-by-month MRR.",
    inputSchema: {
      type: "object" as const,
      properties: {
        current_mrr: { type: "number", description: "Starting monthly recurring revenue (USD)." },
        monthly_growth: {
          type: "number",
          description: "Net monthly growth rate as a decimal (0.08 = 8%/month).",
        },
        months: {
          type: "number",
          description: "Projection horizon in months (default 12).",
        },
      },
      required: ["current_mrr", "monthly_growth"],
    },
  },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0" as const, id, result };
}

function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

function cta(tool: string) {
  return `${TOOLS_URL}?utm_source=mcp&utm_medium=agent&utm_campaign=${tool}`;
}

/** Pure implementations — same math as the /tools calculators. */
function computeLtv(arpu: number, grossMargin: number, monthlyChurn: number) {
  if (monthlyChurn <= 0) return null;
  const lifetimeMonths = 1 / monthlyChurn;
  const ltv = arpu * grossMargin * lifetimeMonths;
  return { lifetimeMonths, ltv };
}

function computeChurnCost(mrr: number, churnRate: number, customers?: number) {
  const lostMrr = mrr * churnRate;
  const lostAnnual = lostMrr * 12;
  const perCustomer = customers && customers > 0 ? lostMrr / customers : undefined;
  return { lostMrr, lostAnnual, perCustomer };
}

function projectRevenue(currentMrr: number, monthlyGrowth: number, months = 12) {
  const series: { month: number; mrr: number }[] = [];
  let mrr = currentMrr;
  for (let m = 0; m <= months; m++) {
    series.push({ month: m, mrr: Math.round(mrr * 100) / 100 });
    mrr *= 1 + monthlyGrowth;
  }
  return {
    start_mrr: currentMrr,
    end_mrr: Math.round(series[series.length - 1].mrr * 100) / 100,
    total_new_mrr: Math.round((series[series.length - 1].mrr - currentMrr) * 100) / 100,
    series,
  };
}

function handleToolCall(name: string, args: Record<string, unknown> | undefined) {
  const a = args || {};
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Unknown tool: ${name}. Available: ${TOOLS.map((t) => t.name).join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  const link = cta(name);
  const footer = `\n\nInteractive calculator: ${link}\nUnlockSaaS — SaaS launch toolkit. Contact: ${CONTACT}`;

  try {
    if (name === "get_ltv") {
      const r = computeLtv(
        Number(a.arpu),
        Number(a.gross_margin),
        Number(a.monthly_churn),
      );
      if (!r) {
        return {
          content: [{ type: "text" as const, text: "monthly_churn must be > 0." }],
          isError: true,
        };
      }
      const text =
        `LTV = ARPU × gross margin ÷ monthly churn\n` +
        `LTV = ${a.arpu} × ${a.gross_margin} ÷ ${a.monthly_churn}\n` +
        `= ${r.ltv.toFixed(2)} USD (lifetime ${r.lifetimeMonths.toFixed(1)} months)${footer}`;
      return {
        content: [{ type: "text" as const, text }],
        _meta: { tool: name, ltv: r.ltv, lifetime_months: r.lifetimeMonths, cta: link },
      };
    }
    if (name === "get_churn_cost") {
      const r = computeChurnCost(Number(a.mrr), Number(a.churn_rate), Number(a.customers));
      const perCust = r.perCustomer !== undefined ? `\nLost per churned customer: ${r.perCustomer.toFixed(2)} USD` : "";
      const text =
        `Monthly churn cost = MRR × churn rate\n` +
        `= ${a.mrr} × ${a.churn_rate}\n` +
        `= ${r.lostMrr.toFixed(2)} USD/month (${r.lostAnnual.toFixed(2)} USD/year)${perCust}${footer}`;
      return {
        content: [{ type: "text" as const, text }],
        _meta: {
          tool: name,
          lost_mrr: r.lostMrr,
          lost_annual: r.lostAnnual,
          cta: link,
        },
      };
    }
    if (name === "project_revenue") {
      const months = typeof a.months === "number" ? a.months : 12;
      const r = projectRevenue(Number(a.current_mrr), Number(a.monthly_growth), months);
      const text =
        `Revenue projection (${months} months, ${a.monthly_growth}/month growth)\n` +
        `Start: ${r.start_mrr} USD → End: ${r.end_mrr} USD (+${r.total_new_mrr} USD)${footer}`;
      return {
        content: [{ type: "text" as const, text }],
        _meta: { tool: name, ...r, cta: link },
      };
    }
    return {
      content: [{ type: "text" as const, text: `Tool ${name} has no handler.` }],
      isError: true,
    };
  } catch (e) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error computing ${name}: ${(e as Error).message}. Check numeric inputs.`,
        },
      ],
      isError: true,
    };
  }
}

function handleSingle(req: {
  id?: unknown;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
}): unknown | null {
  const { id, method, params } = req;
  if (method === "initialize") {
    return ok(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: CAPABILITIES,
      serverInfo: SERVER_INFO,
    });
  }
  if (method === "notifications/initialized") return null; // notification — no response
  if (method === "tools/list") {
    return ok(id, { tools: TOOLS });
  }
  if (method === "tools/call") {
    const { name, arguments: args } = params || {};
    return ok(id, handleToolCall(name || "", args));
  }
  if (method === "resources/list") return ok(id, { resources: [] });
  if (method === "prompts/list") return ok(id, { prompts: [] });
  if (method === "ping") return ok(id, {});
  return err(id, -32601, `Method not found: ${method}`);
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
  // MCP Streamable HTTP transport advertises this content type.
  "Content-Type": "application/json",
} as const;

/** GET — server manifest + install hints. */
export function GET() {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      serverInfo: SERVER_INFO,
      capabilities: CAPABILITIES,
      protocolVersion: PROTOCOL_VERSION,
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      _meta: {
        homepage: HOME_URL,
        tools_hub: TOOLS_URL,
        contact: CONTACT,
        install: {
          claude_desktop: `npx mcp-remote ${HOME_URL}/api/mcp`,
          cursor: `${HOME_URL}/api/mcp`,
          manifest: `${HOME_URL}/.well-known/mcp.json`,
        },
      },
    },
    { headers: CORS },
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400, headers: CORS },
    );
  }

  // Batch request (array of JSON-RPC calls).
  if (Array.isArray(body)) {
    const results = body
      .map((r) => (typeof r === "object" && r ? handleSingle(r as Parameters<typeof handleSingle>[0]) : null))
      .filter((r) => r !== null);
    return NextResponse.json(results, { headers: CORS });
  }

  const result = handleSingle(body as Parameters<typeof handleSingle>[0]);
  if (result === null) {
    // Notification (no id) — acknowledge silently per JSON-RPC.
    return new NextResponse(null, { status: 202, headers: CORS });
  }
  return NextResponse.json(result, { headers: CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
