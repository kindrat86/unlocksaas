import Anthropic from '@anthropic-ai/sdk'

/**
 * Anthropic client singleton.
 *
 * Routes through Vercel AI Gateway when AI_GATEWAY_API_KEY is set.
 * AI Gateway provides:
 *   - Token observability in the Vercel dashboard (AI > Observability)
 *   - Unified billing across providers
 *   - Automatic retry across providers on failure (~3.5% of requests rescued)
 *   - Multi-provider failover (Anthropic direct --> Bedrock Anthropic --> Vertex Anthropic)
 *
 * Model strings use the gateway format: "anthropic/<model-name>".
 * The gateway passes these through to Anthropic's native API unchanged.
 *
 * When AI_GATEWAY_API_KEY is absent, falls back to direct Anthropic
 * (ANTHROPIC_API_KEY) so local dev without a gateway key still works.
 *
 * Docs: https://vercel.com/docs/ai-gateway/sdks-and-apis/anthropic-messages-api
 */

let _anthropic: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const gatewayKey = process.env.AI_GATEWAY_API_KEY
    if (gatewayKey) {
      _anthropic = new Anthropic({
        apiKey: gatewayKey,
        baseURL: 'https://ai-gateway.vercel.sh',
      })
    } else {
      _anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
      })
    }
  }
  return _anthropic
}

/**
 * Primary model for all LLM calls -- Claude Sonnet 4.6 via AI Gateway.
 * Gateway format: "anthropic/<model-name>" (not "claude-sonnet-4-6").
 * When running without AI Gateway, use the bare model name instead.
 */
export function primaryModel(): string {
  return process.env.AI_GATEWAY_API_KEY
    ? 'anthropic/claude-sonnet-4-6'
    : 'claude-sonnet-4-6'
}

/**
 * Fallback model -- Claude Haiku 4.5, cheaper and faster.
 * Used by routes that can tolerate slightly reduced output quality.
 * Returned as a gateway model string; ignored when not using the gateway.
 */
export const FALLBACK_MODEL = 'anthropic/claude-haiku-4.5'
