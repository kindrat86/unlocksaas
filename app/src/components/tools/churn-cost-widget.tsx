"use client";

/**
 * Monthly churn cost widget.
 *
 * Formula: Monthly $ lost = Customers × Monthly Churn % × ARPU
 *
 * Output: customers lost per month, $ lost per month, $ lost per year.
 */

import { useState } from "react";

import {
  CalculatorShell,
  NumberField,
  ResultRow,
} from "@/components/tools/calculator-shell";
import { formatCurrency, formatNumber } from "@/lib/tools-format";

const DEFAULT_CUSTOMERS = 100;
const DEFAULT_CHURN_PCT = 5;
const DEFAULT_ARPU = 49;

export function ChurnCostWidget() {
  const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS);
  const [churnPct, setChurnPct] = useState(DEFAULT_CHURN_PCT);
  const [arpu, setArpu] = useState(DEFAULT_ARPU);

  const churn = churnPct / 100;
  const customersLostPerMonth = customers > 0 && churn > 0
    ? customers * churn
    : 0;
  const monthlyLoss = customersLostPerMonth * Math.max(arpu, 0);
  const annualLoss = monthlyLoss * 12;

  return (
    <CalculatorShell
      inputs={
        <>
          <NumberField
            id="churn-customers"
            label="Current customer count"
            value={customers}
            onChange={setCustomers}
            min={0}
            step={1}
          />
          <NumberField
            id="churn-rate"
            label="Monthly churn"
            suffix="%"
            value={churnPct}
            onChange={setChurnPct}
            min={0}
            max={100}
            step={0.1}
          />
          <NumberField
            id="churn-arpu"
            label="ARPU (monthly revenue per customer)"
            suffix="$"
            value={arpu}
            onChange={setArpu}
            min={0}
            step={1}
          />
        </>
      }
      results={
        <>
          <ResultRow
            label="Customers lost per month"
            value={formatNumber(customersLostPerMonth, 1)}
          />
          <ResultRow
            label="Monthly revenue lost"
            value={formatCurrency(monthlyLoss)}
            emphasis
          />
          <ResultRow
            label="Annual revenue lost"
            value={formatCurrency(annualLoss)}
          />
        </>
      }
      resultsCaption={
        <>
          This is the floor your acquisition has to clear every month
          just to stay flat. Halving churn doubles the floor.
        </>
      }
    />
  );
}
