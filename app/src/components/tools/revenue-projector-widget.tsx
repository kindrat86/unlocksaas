"use client";

/**
 * Post-launch revenue projector widget.
 *
 * Formula (per month, recursive):
 *   Customers[n+1] = Customers[n] × (1 - Churn) + NewCustomers
 *   MRR[n+1]       = Customers[n+1] × ARPU
 *
 * Produces a 12-month table + a steady-state cap (where new = lost).
 */

import { useMemo, useState } from "react";

import {
  CalculatorShell,
  NumberField,
  ResultRow,
} from "@/components/tools/calculator-shell";
import { formatCurrency, formatNumber } from "@/lib/tools-format";

const PROJECTION_MONTHS = 12;
const DEFAULT_STARTING_CUSTOMERS = 0;
const DEFAULT_NEW_PER_MONTH = 10;
const DEFAULT_CHURN_PCT = 5;
const DEFAULT_ARPU = 49;

interface MonthRow {
  month: number;
  customers: number;
  mrr: number;
}

function projectMonths(
  startingCustomers: number,
  newPerMonth: number,
  churn: number,
  arpu: number,
): ReadonlyArray<MonthRow> {
  const rows: MonthRow[] = [];
  let customers = Math.max(startingCustomers, 0);
  for (let i = 1; i <= PROJECTION_MONTHS; i++) {
    customers = customers * (1 - churn) + Math.max(newPerMonth, 0);
    rows.push({
      month: i,
      customers,
      mrr: customers * Math.max(arpu, 0),
    });
  }
  return rows;
}

export function RevenueProjectorWidget() {
  const [startingCustomers, setStartingCustomers] = useState(
    DEFAULT_STARTING_CUSTOMERS,
  );
  const [newPerMonth, setNewPerMonth] = useState(DEFAULT_NEW_PER_MONTH);
  const [churnPct, setChurnPct] = useState(DEFAULT_CHURN_PCT);
  const [arpu, setArpu] = useState(DEFAULT_ARPU);

  const churn = churnPct / 100;

  // useMemo is the right primitive here: the projection is the only
  // expensive computation in this widget, and it only changes when
  // one of the four input primitives changes.
  const projection = useMemo(
    () => projectMonths(startingCustomers, newPerMonth, churn, arpu),
    [startingCustomers, newPerMonth, churn, arpu],
  );

  const endRow = projection[projection.length - 1];
  const endingMrr = endRow?.mrr ?? 0;
  const endingCustomers = endRow?.customers ?? 0;

  // Steady-state cap: customers acquired = customers lost, so the
  // base stops growing. Cap = newPerMonth / churn. Honest output:
  // when churn is zero we surface `null` (no asymptote exists).
  const steadyStateCustomers =
    churn > 0 ? newPerMonth / churn : null;
  const steadyStateMrr =
    steadyStateCustomers === null
      ? null
      : steadyStateCustomers * Math.max(arpu, 0);

  return (
    <CalculatorShell
      inputs={
        <>
          <NumberField
            id="proj-starting"
            label="Starting customer count"
            value={startingCustomers}
            onChange={setStartingCustomers}
            min={0}
            step={1}
          />
          <NumberField
            id="proj-new"
            label="New customers added per month"
            value={newPerMonth}
            onChange={setNewPerMonth}
            min={0}
            step={1}
          />
          <NumberField
            id="proj-churn"
            label="Monthly churn"
            suffix="%"
            value={churnPct}
            onChange={setChurnPct}
            min={0}
            max={100}
            step={0.1}
          />
          <NumberField
            id="proj-arpu"
            label="ARPU"
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
            label={`Month ${PROJECTION_MONTHS} MRR`}
            value={formatCurrency(endingMrr)}
            emphasis
          />
          <ResultRow
            label={`Month ${PROJECTION_MONTHS} customers`}
            value={formatNumber(endingCustomers, 0)}
          />
          <ResultRow
            label="Steady-state cap (MRR)"
            value={
              steadyStateMrr === null
                ? "no cap (zero churn)"
                : formatCurrency(steadyStateMrr)
            }
          />
          <ResultRow
            label="Steady-state cap (customers)"
            value={
              steadyStateCustomers === null
                ? "–"
                : formatNumber(steadyStateCustomers, 0)
            }
          />
          <div className="pt-3 border-t border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium pb-1">Month</th>
                  <th className="text-right font-medium pb-1">Customers</th>
                  <th className="text-right font-medium pb-1">MRR</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {projection.map((row) => (
                  <tr key={row.month}>
                    <td className="py-0.5">{row.month}</td>
                    <td className="text-right py-0.5">
                      {formatNumber(row.customers, 0)}
                    </td>
                    <td className="text-right py-0.5">
                      {formatCurrency(row.mrr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
      resultsCaption={
        <>
          The steady-state cap is where new acquisitions equal customers
          lost. To break through it, fix churn or grow acquisition.
        </>
      }
    />
  );
}
