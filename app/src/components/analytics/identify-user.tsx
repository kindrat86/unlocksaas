"use client";

/**
 * Identifies the current Supabase user with PostHog.
 *
 * Mounted inside the authenticated `/playbook` layout so it only fires when
 * we know who the user is. On sign-out, the sign-out route handler reloads
 * the page — the next pageview won't have this component, so the previous
 * identity stops attaching to new events.
 *
 * Why a separate component instead of doing this inside the provider:
 * the provider runs in the root layout, where we don't have access to the
 * Supabase session. Composing it here keeps each layer's concerns clean.
 */

import { useEffect } from "react";
import { identify } from "@/lib/analytics/client";

export function IdentifyUser({
  userId,
  email,
}: {
  userId: string;
  email?: string | null;
}) {
  useEffect(() => {
    if (!userId) return;
    identify(userId, email ? { email } : undefined);
  }, [userId, email]);

  return null;
}
