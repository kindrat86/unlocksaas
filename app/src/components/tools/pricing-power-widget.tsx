"use client";

/**
 * Pricing-power side-by-side calculator widget.
 *
 * Two prices share churn / margin / CAC. For each price we compute
 *   LTV       = (Price × Margin) / Churn
 *   Payback   = CAC / (Price × Margin)
 *   LTV / CAC = LTV / CAC
 *
 * Output: side-by-side comparison + the delta on each row so the
 * "what does doubling my price actually do" answer is right there.
 */

import { useState } from "react";

import {
  CalculatorShell,
  NumberField,
  ResultRow,
} from "@/components/tools/calculator-shell";
import {
  formatCurrency,
  formatMonths,
  formatRatio,
} from "@/lib/tools-format";

const DEFAULT_PRICE_A = 19;
const DEFAULT_PRICE_B = 49;
const DEFAULT_MARGIN_PCT = 90;
const DEFAULT_CHURN_PCT = 5;
const DEFAULT_CAC = 100;

interface PriceRow {
  ltv: number | null;
  payback: number | null;
  ltvToCac: number | null;
}

function computeRow(
  price: number,
  marginPct: number,
  churnPct: number,
  cac: number,
): PriceRow {
  const margin = marginPct / 100;
  const churn = churnPct / 100;
  if (price <= 0 || margin <= 0) {
    return { ltv: null, payback: null, ltvToCac: null };
  }
  const monthlyGp = price * margin;
  const ltv = churn > 0 ? monthlyGp / churn : null;
  const payback = monthlyGp > 0 ? cac / monthlyGp : null;
  const ltvToCac = ltv !== null && cac > 0 ? ltv / cac : null;
  return { ltv, payback, ltvToCac };
}

export function PricingPowerWidget() {
  const [priceA, setPriceA] = useState(DEFAULT_PRICE_A);
  const [priceB, setPriceB] = useState(DEFAULT_PRICE_B);
  const [marginPct, setMarginPct] = useState(DEFAULT_MARGIN_PCT);
  const [churnPct, setChurnPct] = useState(DEFAULT_CHURN_PCT);
  const [cac, setCac] = useState(DEFAULT_CAC);

  const rowA = computeRow(priceA, marginPct, churnPct, cac);
  const rowB = computeRow(priceB, marginPct, churnPct, cac);

  return (
    <CalculatorShell
      inputs={
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="pp-price-a"
              label="Price A"
              suffix="$"
              value={priceA}
              onChange={setPriceA}
              min={0}
              step={1}
            />
            <NumberField
              id="pp-price-b"
              label="Price B"
              suffix="$"
              value={priceB}
              onChange={setPriceB}
              min={0}
              step={1}
            />
          </div>
          <NumberField
            id="pp-margin"
            label="Gross margin"
            suffix="%"
            value={marginPct}
            onChange={setMarginPct}
            min={0}
            max={100}
            step={1}
          />
          <NumberField
            id="pp-churn"
            label="Monthly churn"
            suffix="%"
            value={churnPct}
            onChange={setChurnPct}
            min={0}
            max={100}
            step={0.1}
          />
          <NumberField
            id="pp-cac"
            label="Customer acquisition cost (CAC)"
            suffix="$"
            value={cac}
            onChange={setCac}
            min={0}
            step={1}
          />
        </>
      }
      results={
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left font-medium pb-2">Metric</th>
                <th className="text-right font-medium pb-2">
                  Price A ({formatCurrency(priceA)})
                </th>
                <th className="text-right font-medium pb-2">
                  Price B ({formatCurrency(priceB)})
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-t border-border/40">
                <td className="py-1.5 text-xs text-muted-foreground">LTV</td>
                <td className="text-right py-1.5">
                  {rowA.ltv === null ? "–" : formatCurrency(rowA.ltv)}
                </td>
                <td className="text-right py-1.5 font-semibold">
                  {rowB.ltv === null ? "–" : formatCurrency(rowB.ltv)}
                </td>
              </tr>
              <tr className="border-t border-border/40">
                <td className="py-1.5 text-xs text-muted-foreground">
                  CAC payback
                </td>
                <td className="text-right py-1.5">
                  {rowA.payback === null ? "–" : formatMonths(rowA.payback)}
                </td>
                <td className="text-right py-1.5 font-semibold">
                  {rowB.payback === null ? "–" : formatMonths(rowB.payback)}
                </td>
              </tr>
              <tr className="border-t border-border/40">
                <td className="py-1.5 text-xs text-muted-foreground">
                  LTV / CAC
                </td>
                <td className="text-right py-1.5">
                  {rowA.ltvToCac === null ? "–" : formatRatio(rowA.ltvToCac)}
                </td>
                <td className="text-right py-1.5 font-semibold">
                  {rowB.ltvToCac === null ? "–" : formatRatio(rowB.ltvToCac)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      }
      resultsCaption={
        <>
          3-to-1 LTV-to-CAC is the canonical threshold for a scaling
          SaaS. Raising price shrinks payback and widens the LTV-to-CAC
          gap – often more than the conversion drop costs you.
        </>
      }
    />
  );
}
