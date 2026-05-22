/**
 * Shared visual chrome for every /tools/* calculator widget.
 *
 * The five calculator widgets each implement their own state +
 * formula; this shell just standardises the surrounding layout so
 * they read as one product on the hub page and on share previews.
 *
 * Visual contract: light shadcn theme + Geist (per the locked visual
 * style on this project). No purple / yellow / orange chrome. Border-
 * subtle Card with a "Result" section that updates as inputs change.
 *
 * Performance note: this is a pure presentational shell – no state,
 * no effects. The widget that wraps `<CalculatorShell>` owns the
 * state. Pre-baked `aria-live="polite"` on the result region so
 * screen readers announce updates without stealing focus.
 */

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CalculatorShellProps {
  /** Inputs column – the form fields. */
  inputs: ReactNode;
  /** Results column – the computed outputs. Updates live. */
  results: ReactNode;
  /** Optional caption rendered under the results column (zone/colour). */
  resultsCaption?: ReactNode;
}

export function CalculatorShell({
  inputs,
  results,
  resultsCaption,
}: CalculatorShellProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{inputs}</CardContent>
      </Card>

      <Card className="border-border/60 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Result</CardTitle>
        </CardHeader>
        <CardContent
          className="space-y-3"
          aria-live="polite"
        >
          {results}
          {resultsCaption ? (
            <div className="pt-2 text-xs text-muted-foreground border-t border-border/40">
              {resultsCaption}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Standard labelled numeric input. Browser-native `<input type="number">`
 * stays accessible + mobile-keyboard-friendly. `inputMode="decimal"`
 * surfaces the numeric keypad on iOS without the up/down arrows that
 * fight the formula.
 */
export interface NumberFieldProps {
  id: string;
  label: string;
  /** Optional unit suffix shown after the input (e.g. "$", "%", "mo"). */
  suffix?: string;
  /** Optional helper text shown below the input. */
  hint?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  id,
  label,
  suffix,
  hint,
  value,
  onChange,
  min,
  max,
  step,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-foreground"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const parsed = e.target.valueAsNumber;
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
          min={min}
          max={max}
          step={step}
        />
        {suffix ? (
          <span className="text-xs text-muted-foreground min-w-[2ch]">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Result row – a label/value pair rendered consistently across all
 * five calculators. `emphasis` lifts the canonical headline number
 * (the LTV, the payback months, the projected MRR) into a larger
 * size so the answer is unmistakable.
 */
export interface ResultRowProps {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}

export function ResultRow({ label, value, emphasis }: ResultRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={
          emphasis
            ? "text-2xl font-bold tabular-nums tracking-tight"
            : "text-sm font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}
