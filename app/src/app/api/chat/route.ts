/**
 * /api/chat — Streaming chat endpoint for the Playbook Coach sidebar.
 *
 * Requires a valid Supabase session (cookie-based). Returns 401 for anonymous
 * visitors. Loads the founder's latest diagnostic from diagnostic_leads and
 * injects it alongside all 10 Brunson workbooks into the system prompt so the
 * model can answer questions grounded in their specific situation.
 *
 * Uses AI SDK v6 + Vercel AI Gateway:
 *   - Vercel deployments: OIDC is automatic via the platform -- zero config.
 *   - Local dev: run `vercel env pull` to sync gateway credentials.
 *
 * Model: latest Sonnet via gateway (verified 2026-05-21 -- see MODEL constant).
 */

import { convertToModelMessages, gateway, streamText, UIMessage } from 'ai'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { WORKBOOKS_SYSTEM_CONTEXT } from '@/lib/workbooks-bundle'

// Vercel Fluid Compute: allow up to 60s for a streaming chat response.
export const maxDuration = 60

// Verified against https://ai-gateway.vercel.sh/v1/models on 2026-05-21.
const MODEL = gateway('anthropic/claude-sonnet-4.6')

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(diagnosticContext: string): string {
  return `You are the UnlockSaaS Playbook Coach — a direct, honest advisor grounded in Russell Brunson's frameworks. You help post-launch, pre-revenue founders get their first paying customer.

VOICE:
- Reluctant Hero. Short sentences. No exclamation marks. No guru energy.
- You sound like a founder who has been where they are, not a marketer pitching them.
- Never start with "Hey there", "Great question!", or any filler greeting.
- No em dashes. Use en dashes (--) or rewrite the sentence.

FOUNDER CONTEXT:
${diagnosticContext}

CITATION RULES:
- When you reference a specific workbook, include a markdown link inline: [Workbook N: Short Title](/playbook/workbook/slug)
- Example: [Workbook 04: Building Your Funnels](/playbook/workbook/04-building-your-funnels)
- Cite only workbooks you actually used in the answer. 1-2 citations per response maximum.
- Do NOT append a "Sources:" footer. Cite inline only.

SCOPE:
- Answer questions about the Playbook steps, the founder's diagnostic, Brunson frameworks, copywriting, offer construction, and distribution.
- If asked about something outside this scope, acknowledge it briefly and redirect to what you can help with.
- Keep answers under 250 words unless a step-by-step walkthrough is genuinely needed.

KNOWLEDGE BASE -- 10 Brunson strategy workbooks:

${WORKBOOKS_SYSTEM_CONTEXT}`
}

// ---------------------------------------------------------------------------
// Diagnostic context block
// ---------------------------------------------------------------------------

type DiagnosticRow = {
  label: string
  headline: string
  explanation: string
  product_url: string
}

function buildDiagnosticContext(row: DiagnosticRow | null): string {
  if (!row) {
    return `No diagnostic on file yet for this founder. If they mention their product or ask about their specific situation, suggest they run the free diagnostic at /diagnostic to get a personalised label and scorecard.`
  }

  const labelMap: Record<string, string> = {
    wrong_person: 'Wrong Person (Vehicle/Avatar problem -- page speaks to a category, not one specific person)',
    weak_offer:   'Weak Offer (External Belief problem -- page describes features, not a guaranteed result)',
    weak_belief:  'Weak Belief (Internal Belief problem -- page assumes the visitor already cares)',
  }

  return `This founder has run the UnlockSaaS diagnostic.
Product URL: ${row.product_url}
Primary diagnosis: ${labelMap[row.label] ?? row.label}
Diagnostic headline: "${row.headline}"
Explanation on file: ${row.explanation}

When answering, connect advice to their specific diagnosis where relevant. Reference their diagnosis to make answers concrete.`
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const start = Date.now()

  // Auth gate -- require a valid Supabase session.
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Load the founder's latest diagnostic (non-blocking -- proceed without if it fails).
  let diagnosticRow: DiagnosticRow | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('diagnostic_leads')
      .select('label, headline, explanation, product_url')
      .ilike('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    diagnosticRow = data as DiagnosticRow | null
  } catch (err) {
    // Non-fatal -- the coach still works without diagnostic context.
    console.error('[chat] diagnostic_leads fetch failed:', err)
  }

  let messages: UIMessage[]
  try {
    const body = await req.json()
    messages = body.messages
  } catch (err) {
    console.error('[chat] failed to parse request body:', err)
    return new Response('Bad Request', { status: 400 })
  }

  console.log(`[chat] user=${user.email} diagnostic=${diagnosticRow?.label ?? 'none'} msgs=${messages.length} setup_ms=${Date.now() - start}`)

  try {
    const result = streamText({
      model: MODEL,
      system: buildSystemPrompt(buildDiagnosticContext(diagnosticRow)),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 600,
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[chat] streamText failed:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
