export const ENGINE_FALLBACK_SUBSCRIBER_ID = "engine-fallback";

/**
 * Return only IDs backed by the local soap_opera_subscribers table.
 *
 * The email-engine rescue path deliberately has no local subscriber row, so
 * its sentinel must never be persisted into diagnostic_leads.subscriber_id.
 */
export function localSubscriberId(id: string | undefined): string | null {
  if (!id || id === ENGINE_FALLBACK_SUBSCRIBER_ID) return null;
  return id;
}
