/**
 * Canonical AI model for this project — routes through Vercel AI Gateway.
 *
 * Auth: VERCEL_OIDC_TOKEN (auto-injected on Vercel; run `vercel env pull`
 * for local dev). Fallback: AI_GATEWAY_API_KEY for non-Vercel environments.
 *
 * Model ID uses dots for version numbers per Gateway spec:
 *   https://vercel.com/docs/ai-gateway
 *
 * `model` is a typed LanguageModel instance (via gateway() wrapper) so that
 * generateText/streamText call-sites accept maxOutputTokens and other CallSettings
 * without TypeScript TS2353 errors.
 */
import { gateway } from 'ai'

export const MODEL_ID = 'anthropic/claude-sonnet-4.6'

/** Typed LanguageModel — use this as the `model` param in generateText calls. */
export const model = gateway(MODEL_ID)
