"use client";

/**
 * CAC payback period calculator widget.
 *
 * Formula: Payback (months) = CAC / (ARPU × Gross Margin %)
 *
 * Zone semantics (rendered as a caption):
 *   < 12 months : healthy – channel scales
 *   12–18       : workable but constrained
 *   > 18        : unprofitable – channel bleeds
 */

import { useState } from "react";

import {
  CalculatorShell,
  NumberField,
  ResultRow,
} from "@/components/tools/calculator-shell";
import { formatCurrency, formatMonths } from "@/lib/tools-format";

const DEFAULT_CAC = 100;
const DEFAULT_ARPU = 49;
const DEFAULT_MARGIN_PCT = 90;

type PaybackZone = "healthy" | "yellow" | "red" | "invalid";

function zoneFor(paybackMonths: number | null): PaybackZone {
  if (paybackMonths === null || !Number.isFinite(paybackMonths)) {
    return "invalid";
  }
  if (paybackMonths < 12) return "healthy";
  if (paybackMonths <= 18) return "yellow";
  return "red";
}

const ZONE_COPY: Record<PaybackZone, string> = {
  healthy:
    "Healthy. Under 12 months: the channel can scale without running out of cash.",
  yellow:
    "Workable but constrained. 12–18 months limits how fast you can scale paid channels before the burn outpaces revenue.",
  red: "Bleeds. Above 18 months and the channel is likely unprofitable. Lower CAC, raise price, or improve margin – or stop spending on this channel.",
  invalid: "Enter positive values for ARPU and gross margin to see a result.",
};

export function CacPaybackWidget() {
  const [cac, setCac] = useState(DEFAULT_CAC);
  const [arpu, setArpu] = useState(DEFAULT_ARPU);
  const [marginPct, setMarginPct] = useState(DEFAULT_MARGIN_PCT);

  const margin = marginPct / 100;
  const monthlyGrossProfit = arpu * margin;
  const payback =
    arpu > 0 && margin > 0 && cac >= 0 ? cac / monthlyGrossProfit : null;
  const zone = zoneFor(payback);

  return (
    <CalculatorShell
      inputs={
        <>
          <NumberField
            id="cac-cac"
            label="Customer acquisition cost (CAC)"
            suffix="$"
            value={cac}
            onChange={setCac}
            min={0}
            step={1}
            hint="Fully-loaded: ad spend plus sales-rep compensation plus marketing salaries, divided by customers acquired in the same window."
          />
          <NumberField
            id="cac-arpu"
            label="ARPU (monthly revenue per customer)"
            suffix="$"
            value={arpu}
            onChange={setArpu}
            min={0}
            step={1}
          />
          <NumberField
            id="cac-margin"
            label="Gross margin"
            suffix="%"
            value={marginPct}
            onChange={setMarginPct}
            min={0}
            max={100}
            step={1}
          />
        </>
      }
      results={
        <>
          <ResultRow
            label="CAC payback period"
            value={payback === null ? "–" : formatMonths(payback)}
            emphasis
          />
          <ResultRow
            label="Monthly gross profit per customer"
            value={formatCurrency(monthlyGrossProfit)}
          />
        </>
      }
      resultsCaption={<>{ZONE_COPY[zone]}</>}
    />
  );
}
