"use client";

/**
 * LTV calculator widget.
 *
 * Formula: LTV = (ARPU × Gross Margin %) / Monthly Churn %
 *
 * Pure client-side computation. State lives in this component;
 * results are derived during render (no useEffect anti-pattern).
 */

import { useState } from "react";

import {
  CalculatorShell,
  NumberField,
  ResultRow,
} from "@/components/tools/calculator-shell";
import { formatCurrency, formatMonths } from "@/lib/tools-format";

const DEFAULT_ARPU = 49;
const DEFAULT_MARGIN_PCT = 90;
const DEFAULT_CHURN_PCT = 5;

export function LtvWidget() {
  const [arpu, setArpu] = useState(DEFAULT_ARPU);
  const [marginPct, setMarginPct] = useState(DEFAULT_MARGIN_PCT);
  const [churnPct, setChurnPct] = useState(DEFAULT_CHURN_PCT);

  const margin = marginPct / 100;
  const churn = churnPct / 100;

  // Guard against divide-by-zero and negative inputs. When inputs are
  // out of range we surface `null` and the result row renders a dash,
  // not NaN. Honest UI: no fake answer for invalid input.
  const lifetimeMonths = churn > 0 ? 1 / churn : null;
  const monthlyGrossProfit = arpu > 0 && margin > 0 ? arpu * margin : 0;
  const ltv =
    churn > 0 && arpu > 0 && margin > 0
      ? (arpu * margin) / churn
      : null;

  return (
    <CalculatorShell
      inputs={
        <>
          <NumberField
            id="ltv-arpu"
            label="ARPU (monthly revenue per customer)"
            suffix="$"
            value={arpu}
            onChange={setArpu}
            min={0}
            step={1}
          />
          <NumberField
            id="ltv-margin"
            label="Gross margin"
            suffix="%"
            value={marginPct}
            onChange={setMarginPct}
            min={0}
            max={100}
            step={1}
            hint="Revenue minus cost of goods sold (hosting, AI inference, payment fees), as a percentage of revenue."
          />
          <NumberField
            id="ltv-churn"
            label="Monthly churn"
            suffix="%"
            value={churnPct}
            onChange={setChurnPct}
            min={0}
            max={100}
            step={0.1}
            hint="Customers who fully cancel, as a percentage of your base each month. Use gross churn, not net."
          />
        </>
      }
      results={
        <>
          <ResultRow
            label="Customer LTV"
            value={ltv === null ? "–" : formatCurrency(ltv)}
            emphasis
          />
          <ResultRow
            label="Average lifetime"
            value={
              lifetimeMonths === null ? "–" : formatMonths(lifetimeMonths)
            }
          />
          <ResultRow
            label="Monthly gross profit per customer"
            value={formatCurrency(monthlyGrossProfit)}
          />
        </>
      }
      resultsCaption={
        <>
          Healthy LTV is context-dependent. The useful test is the
          LTV-to-CAC ratio: divide this LTV by your customer
          acquisition cost. 3-to-1 or better is sustainable.
        </>
      }
    />
  );
}
