"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type LoginState = {
  ok: boolean;
  message: string;
};

/**
 * Send a magic-link email via Supabase Auth.
 *
 * Reluctant Hero voice: no "Check your email!" exclamation marks, no "Yay!"
 * — flat plain English. We tell the user what happens next and stop.
 */
export async function sendMagicLink(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const emailRaw = formData.get("email");
  const next = (formData.get("next") as string) || "/playbook";

  if (typeof emailRaw !== "string" || emailRaw.trim() === "") {
    return { ok: false, message: "Enter an email address." };
  }

  const email = emailRaw.trim().toLowerCase();

  // Basic sanity check; Supabase will do the real validation.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "That does not look like an email address." };
  }

  // Build the absolute origin from the incoming request so previews work
  // without hard-coding NEXT_PUBLIC_APP_URL.
  const host = headers().get("host");
  const proto = headers().get("x-forwarded-proto") ?? "https";
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // After clicking the link, Supabase redirects here. We exchange the
      // code for a session in /auth/callback and then forward to `next`.
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    // Don't leak whether the email is registered or not.
    console.error("signInWithOtp error:", error.message);
    return {
      ok: false,
      message: "Something went wrong sending the link. Try again in a minute.",
    };
  }

  return {
    ok: true,
    message: `Link sent to ${email}. Click it from your inbox to sign in. The link is good for one hour.`,
  };
}
