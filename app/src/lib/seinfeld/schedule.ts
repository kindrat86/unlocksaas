/**
 * Seinfeld cadence helpers.
 *
 * Cadence: 3 sends per UTC week on Mon/Wed/Fri (workbook 08 §6).
 * Cron runs daily; this module decides whether today is a send day, what the
 * day's content pool is, and how to compute "next send" for a given moment.
 *
 * Why UTC: every server timestamp in the system is UTC. Anchoring cadence to
 * UTC makes "is today a send day" deterministic regardless of the server
 * region Vercel happens to schedule the cron in.
 */

/** UTC day-of-week numbers per JS Date.getUTCDay(): Sun=0, Mon=1, …, Sat=6 */
export const SEND_WEEKDAYS = [1, 3, 5] as const; // Mon, Wed, Fri
export type SendWeekday = (typeof SEND_WEEKDAYS)[number];

export function isSendDay(date: Date): boolean {
  return (SEND_WEEKDAYS as readonly number[]).includes(date.getUTCDay());
}

/**
 * Next UTC midnight that lands on a Mon/Wed/Fri. Used by /api/seinfeld/subscribe
 * to compute a human-readable "next_send_at" hint for the response.
 *
 * If today is already a send day AND the cron hour has not passed, the
 * earliest possible next-send is today at the cron hour. Callers don't need
 * that precision — a same-day or next-cycle date is enough.
 */
export function nextSendAt(from: Date = new Date()): Date {
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(from);
    candidate.setUTCDate(candidate.getUTCDate() + offset);
    candidate.setUTCHours(15, 0, 0, 0); // matches the cron schedule (15:00 UTC)
    if (isSendDay(candidate) && candidate.getTime() > from.getTime()) {
      return candidate;
    }
  }
  // Unreachable: any 7-day window contains 3 send days.
  return from;
}
