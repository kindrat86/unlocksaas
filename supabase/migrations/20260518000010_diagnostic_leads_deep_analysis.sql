-- Deep Analysis upgrade for the Free Diagnostic — Brunson "Best Bait" 10x.
--
-- The v1 diagnostic returned ONE label (wrong_person | weak_offer | weak_belief)
-- plus ~100 words of explanation, one evidence quote, and a next-step CTA. The
-- v2 deep analyzer keeps those fields for backward compat AND adds a single
-- JSONB payload that carries:
--
--   - a three-axis scorecard (1-10 per axis, with evidence quotes)
--   - product/audience/pricing snapshot
--   - concrete rewrites (hero headline, primary CTA, value props — current
--     vs. 3 alternates each, with rationale)
--   - a 30-day action plan (4 weeks, keyed to the lead's bucket)
--   - 2 competitor pulls (named from Claude's training; what they do better,
--     what you do better)
--   - 2-3 strengths (positive signals on the page)
--
-- The result page renders the rich sections when this is non-null and falls
-- back to the v1 label-only render when null. Old rows stay readable.

alter table public.diagnostic_leads
  add column if not exists analysis_detail jsonb;

comment on column public.diagnostic_leads.analysis_detail is
  'Deep Analysis v2 payload — three-axis scorecard, rewrites, 30-day plan, competitors, strengths. Null = v1 row (label only).';
