#!/usr/bin/env bash
# LEGACY / OPTIONAL — cloud-DB restore for the unlocksaas Vercel env.
#
# DECISION 2026-07-14 (owner): no Supabase, local-first. The live
# architecture is: subscribes -> shared email-engine -> Resend (SOS days
# 0/2/4/6/8), with the durable local record in ~/.unlocksaas/funnel.db
# (hourly launchd sync `com.unlocksaas.funnel-db-sync` pulling Resend +
# Stripe). Paid checkout stays as founding-waitlist capture until a
# Vercel-reachable DB exists for the member area.
#
# Run this ONLY if you later reintroduce a cloud DB for /playbook.
set -euo pipefail
read -rp "Local-first is the current architecture (no cloud DB needed). Continue anyway? (y/N): " CONT
[[ "$CONT" == "y" || "$CONT" == "Y" ]] || { echo "Aborted — nothing to do in local-first mode."; exit 0; }
cd "$(dirname "$0")/../app"

echo "== unlocksaas production env restore =="
read -rp "Supabase project URL (https://<ref>.supabase.co): " SB_URL
read -rp "Supabase ANON key: " SB_ANON
read -rsp "Supabase SERVICE ROLE key: " SB_SERVICE; echo

case "$SB_URL" in
  *placeholder*|*your-project-ref*|"") echo "That looks like a placeholder — aborting."; exit 1;;
esac

# --- Supabase (replace the placeholders) ---
for ENV in production preview; do
  vercel env rm NEXT_PUBLIC_SUPABASE_URL $ENV --yes 2>/dev/null || true
  vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY $ENV --yes 2>/dev/null || true
  vercel env rm SUPABASE_SERVICE_ROLE_KEY $ENV --yes 2>/dev/null || true
  printf '%s' "$SB_URL"     | vercel env add NEXT_PUBLIC_SUPABASE_URL $ENV
  printf '%s' "$SB_ANON"    | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY $ENV
  printf '%s' "$SB_SERVICE" | vercel env add SUPABASE_SERVICE_ROLE_KEY $ENV
done

# --- Email + cron secrets ---
RESEND_KEY=$(grep -oE 'RESEND_API_KEY=\S+' ~/email-engine/.env | cut -d= -f2)
CRON_SECRET=$(openssl rand -hex 32)
UNSUB_SECRET=$(openssl rand -hex 32)
for ENV in production preview; do
  printf '%s' "$RESEND_KEY"  | vercel env add RESEND_API_KEY $ENV 2>/dev/null || true
  printf '%s' "$CRON_SECRET" | vercel env add CRON_SECRET $ENV 2>/dev/null || true
  printf '%s' "$UNSUB_SECRET"| vercel env add UNSUBSCRIBE_SECRET $ENV 2>/dev/null || true
  printf '%s' "https://unlocksaas.com" | vercel env add NEXT_PUBLIC_APP_URL $ENV 2>/dev/null || true
done

# --- Stripe (existing live prices, discovered 2026-07-14) ---
# STRIPE_STARTER_PRICE_ID  = price_1TXpnmCwGoUDklRePhZmxviJ  ($1 one-time)
# STRIPE_MACHINE_PRICE_ID  = price_1TXpnoCwGoUDklReXiTaUUCi  ($49/mo)
# The bump/vault/downsell/lifetime prices don't exist yet — offers stay
# hidden (env-gated) until you create them.
read -rp "Enable Stripe checkout now? Only say yes if Supabase above is the REAL project (y/N): " GO
if [[ "$GO" == "y" || "$GO" == "Y" ]]; then
  read -rsp "STRIPE_SECRET_KEY (sk_live_...): " SK; echo
  for ENV in production preview; do
    printf '%s' "$SK" | vercel env add STRIPE_SECRET_KEY $ENV 2>/dev/null || true
    printf '%s' "price_1TXpnmCwGoUDklRePhZmxviJ" | vercel env add STRIPE_STARTER_PRICE_ID $ENV 2>/dev/null || true
    printf '%s' "price_1TXpnoCwGoUDklReXiTaUUCi" | vercel env add STRIPE_MACHINE_PRICE_ID $ENV 2>/dev/null || true
  done
  echo "NOTE: also create a Stripe webhook endpoint https://unlocksaas.com/api/webhooks/stripe"
  echo "      (dashboard -> Developers -> Webhooks) and set STRIPE_WEBHOOK_SECRET the same way."
fi

echo "Redeploying production..."
vercel redeploy --prod 2>/dev/null || vercel deploy --prod
echo "Done. Smoke test: curl -X POST https://unlocksaas.com/api/soap-opera/subscribe \\"
echo "  -H 'Content-Type: application/json' -d '{\"email\":\"<your-test-address>\"}'"
