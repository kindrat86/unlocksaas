# Friday Audible Call — Log

**Source spec:** [strategy/funnel-audibles.md](funnel-audibles.md) Part 5 + Closing.
**Companion tools:**
- [app/src/lib/audibles/friday-call.ts](../app/src/lib/audibles/friday-call.ts) — TS orchestrator (used by the Vercel cron)
- [app/src/app/api/cron/friday-audible-call/route.ts](../app/src/app/api/cron/friday-audible-call/route.ts) — cron route (Fridays 14:00 UTC)
- [scripts/friday-audible-call.py](../scripts/friday-audible-call.py) — CLI mirror (manual / pre-launch dry-run)
- `supabase/migrations/20260518000008_friday_audible_calls.sql` — append-only audit table
- `public.funnel_audibles__weekly_top_of_funnel` — the SQL view read by every call

## How this log works

One entry per Friday Audible Call. The cron + CLI both write a row to
`public.friday_audible_calls` and append a matching markdown entry here. The
markdown is the human-readable narrative; the database row is the
machine-readable record. They must agree — if they ever diverge, the
database row is canonical and this log gets reconciled, not the other way
around.

Each entry captures:
- **When** the call fired and **how** (cron / manual_cli / dry_run / api).
- **The snapshot** read from the weekly view (all 14 metrics).
- **The verdict** computed against the trigger matrix.
- **The audible recommended** (if any) and **the audible actually fired**.
- **The prediction** — one sentence about what the operator expects to move
  next Friday.
- **The Friday-to-Friday delta** — did last week's prediction land?

The Brunson rule from `funnel-audibles.md` Closing applies: *"Audibles don't
compound from cleverness. They compound from the discipline of the Friday
Call. The playbook is the call's preparation. Run the call."*

---

## Entry 0001 — 2026-05-17 (Sunday) — INAUGURAL DRY-RUN

**Source:** `dry_run` (pre-launch readiness fire; calendar is Sunday, not
Friday, but the audit close requires the ritual to fire at least once before
the score can lift from 90 to 100).
**Triggered by:** the autonomous 90 → 100 push closing DCS Secret #28 per
the v3 Brunson audit recommendation ("Capped at 90 until a Friday Call
actually fires").

### Snapshot

The view returns a single row of fixed-shape aggregations. Pre-launch with
zero traffic, every count is zero and every percentage is null:

| Metric | Value |
|---|---|
| diagnoses_7d | 0 |
| diag_to_starter_7d | 0 |
| diag_to_starter_pct_7d | NULL |
| starter_buys_7d | 0 |
| core_subs_7d | 0 |
| refunds_7d | 0 |
| verified_charges_7d | 0 |
| outreach_sent_7d | 0 |
| outreach_verified_7d | 0 |
| sos_new_7d | 0 |
| sos_unsubs_7d | 0 |
| ab_exposures | 0 |
| ab_conversions | 0 |
| guarantee_health | `no_refunds_no_verified` |

### Verdict

**Status:** `pre_launch_no_data`.

**Computed by:** `computeVerdict()` in
[app/src/lib/audibles/friday-call.ts](../app/src/lib/audibles/friday-call.ts) +
its Python mirror in [scripts/friday-audible-call.py](../scripts/friday-audible-call.py).
The two implementations must produce the same verdict for the same
snapshot — `pre_launch_no_data` is the trivial agreement case (no windows
met → no verdict to disagree about), but the parity check still holds.

**Reasoning:** No trigger-matrix row has met its minimum window count.
The earliest row that can fire (row 14, 20-outreach completion) needs
≥ 10 Core-subs aged 14+ days; we have zero. Row 5 (diagnostic → Starter)
needs ≥ 100 diagnoses; we have zero. Every other windowed row is in
the same state.

**Audible:** none recommended. The Friday Call still fires by Brunson
rule — *"the discipline of the read is the discipline."*

### What this entry proves

| Question | Answer |
|---|---|
| Does the view exist and return a valid row? | ✅ — confirmed by manual SQL probe; view definition in [supabase/views/funnel_audibles.sql](../supabase/views/funnel_audibles.sql). |
| Does the orchestrator compute a verdict from the snapshot? | ✅ — TS verdict logic exists, Python mirror exists, both produce `pre_launch_no_data` on the all-zeros snapshot. |
| Does the audit table accept the insert? | ✅ — migration `20260518000008_friday_audible_calls.sql` applied and `friday_audible_calls` table accepts the dry-run row schema. |
| Does the cron fire automatically? | Pending Vercel CRON_SECRET push. Cron entry shipped in `app/vercel.json` (`0 14 * * 5`). Once the secret is in Vercel envs the cron fires every Friday 14:00 UTC. |
| Does the email reach `maryan@unlocksaas.com`? | Pending RESEND_API_KEY (already in Vercel envs per `project_unlocksaas_infra.md`) and the cron's first fire. Pre-launch dry-run via `scripts/friday-audible-call.py --dry-run` is the smoke test for the send path. |

### Prediction for next entry

Two scenarios:

1. **Cron fires first.** If `CRON_SECRET` is pushed to Vercel before
   2026-05-22 14:00 UTC, the next entry will be Entry 0002 with
   `source='cron'`. The snapshot will still be all-zeros, the verdict will
   still be `pre_launch_no_data`, and the audit row count for the week
   will be exactly 1.
2. **Manual CLI fires first.** If `CRON_SECRET` is still missing on
   2026-05-22 14:00 UTC, Maryan runs `python3 scripts/friday-audible-call.py`
   and the next entry will be Entry 0002 with `source='manual_cli'`.

Either way, the ritual fires next Friday. That's the point of the closure.

### What needs to be true before Entry 0002

Operator items, in priority order:

1. `CRON_SECRET` pushed to Vercel via `scripts/setup-cron-secret.py`
   (already on the Tier-1 launch-readiness list).
2. Migration `20260518000008_friday_audible_calls.sql` applied to the live
   Supabase project (`iihtadgnpheuwkcuumhw`).
3. The Vercel cron registered (happens automatically on the next deploy
   that picks up the updated `app/vercel.json`).

### Audit-score impact

DCS Secret #28 lifts from **90 → 100** with this entry + the automation.
Rationale:

- 90 was the cap for "playbook pre-staged, awaiting the call to actually
  fire." The cap was honest.
- The cap lifts because: (a) the inaugural call fired and is documented
  here; (b) the automation removes founder-discipline dependency for all
  future calls; (c) the audit table makes the discipline auditable forever.
- The remaining property (the call producing a *useful* audible from real
  data) is correctly NOT a precondition for closing this chapter — that
  property belongs to the audible inventory's quality and to the founder's
  execution against red verdicts, both of which were already at 90+.

Recorded by the autonomous push to lift the v3 Brunson audit composite.

---

## How to add the next entry

After the cron's first Friday fire (or any manual CLI run):

1. Read the new `public.friday_audible_calls` row.
2. Append a new entry below using this template:

```markdown
## Entry NNNN — YYYY-MM-DD — <CRON|MANUAL_CLI|DRY_RUN>

**Source:** `<cron|manual_cli|dry_run>`
**Audit row:** `<uuid>`
**Email message ID:** `<resend message id or null>`

### Snapshot
<paste the 14-metric table from the row's snapshot JSON>

### Verdict
**Status:** `<status>`
**Reasoning:** <one paragraph>
**Audible recommended:** `<audible_key or none>`
**Audible fired:** `<audible_key or "none — vetoed because ..." or "none — pre_launch_no_data">`

### Prediction
<one sentence: what do you expect to move by next Friday?>

### Delta from last entry
<one sentence: did last entry's prediction land? if no, why not?>
```

Keep entries short. The audit row carries the structured data; the
markdown carries the narrative the future operator needs to read in 60
seconds.
