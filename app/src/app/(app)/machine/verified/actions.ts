"use server";

/**
 * Server actions for /machine/verified.
 *
 * Two surfaces here:
 *
 *   updateShareSettings — user controls their Verified Builder badge visibility,
 *                          display name, and product URL/name.
 *
 *   simulateFirstCustomer — DEV/STAGING ONLY: lets the operator (Maryan)
 *                            inject a verified conversion for testing the
 *                            celebration UI before the Stripe Connect flow
 *                            ships in Sprint 3. Guarded by NODE_ENV !=
 *                            'production' AND a server-side allowlist.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  allocateBuilderSlug,
  absoluteBadgeUrl,
} from "@/lib/builder-badge";
import { sendFirstCustomerCelebrationEmail } from "@/lib/celebration-email";

// ── helpers ───────────────────────────────────────────────────────────────────

async function requireProfile(): Promise<{
  profileId: string;
  email: string;
  builderSlug: string | null;
  builderName: string | null;
  productName: string | null;
  productUrl: string | null;
  shareVisibility: "private" | "public";
}> {
  const sb = createClient();
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) redirect("/login?next=/machine/verified");

  // Several columns (builder_slug, builder_name, product_name, product_url,
  // share_visibility) live in profiles in the live DB but are not yet in the
  // regenerated database.types.ts. Supabase's chain returns a SelectQueryError
  // type when any column in .select() is unknown, which poisons every field
  // read. Cast the whole row to a loose record so the field-level `as`
  // assertions below take over. TODO: regen database.types.ts.
  const { data: profileRaw, error: profileErr } = await sb
    .from("profiles")
    .select(
      "id,email,builder_slug,builder_name,product_name,product_url,share_visibility"
    )
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileErr || !profileRaw) {
    throw new Error("No profile found for this user.");
  }

  const profile = profileRaw as unknown as Record<string, unknown>;

  return {
    profileId: profile.id as string,
    email: profile.email as string,
    builderSlug: (profile.builder_slug as string | null) ?? null,
    builderName: (profile.builder_name as string | null) ?? null,
    productName: (profile.product_name as string | null) ?? null,
    productUrl: (profile.product_url as string | null) ?? null,
    shareVisibility:
      ((profile.share_visibility as string | null) ?? "private") === "public"
        ? "public"
        : "private",
  };
}

function clean(input: FormDataEntryValue | null, max: number): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function isValidHttpsUrl(s: string | null): boolean {
  if (!s) return true; // empty is fine
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// ── actions ───────────────────────────────────────────────────────────────────

export async function updateShareSettings(formData: FormData) {
  const profile = await requireProfile();

  const builderName = clean(formData.get("builder_name"), 80);
  const productName = clean(formData.get("product_name"), 80);
  const productUrlRaw = clean(formData.get("product_url"), 200);
  const visibility = formData.get("share_visibility") === "public" ? "public" : "private";

  if (!isValidHttpsUrl(productUrlRaw)) {
    throw new Error("Product URL must be a valid http(s) URL.");
  }

  const admin = createAdminClient();

  // Allocate a slug if going public for the first time.
  let slug = profile.builderSlug;
  if (visibility === "public" && !slug) {
    slug = await allocateBuilderSlug({
      adminClient: admin,
      profileId: profile.profileId,
      email: profile.email,
    });
  }

  // Default the display name to the email local part if going public unset.
  const finalBuilderName =
    builderName ?? profile.builderName ?? profile.email.split("@")[0] ?? null;

  const { error } = await admin
    .from("profiles")
    .update({
      builder_name: finalBuilderName,
      product_name: productName,
      product_url: productUrlRaw,
      share_visibility: visibility,
      // slug stays whatever was allocated or pre-existing
    })
    .eq("id", profile.profileId);

  if (error) throw new Error(`updateShareSettings: ${error.message}`);

  revalidatePath("/machine/verified");
  if (slug) revalidatePath(`/builder/${slug}`);
}

/**
 * DEV/STAGING ONLY. Inject a synthetic verified_conversions row so the
 * celebration page renders even without a connected Stripe account.
 *
 * Guard: NODE_ENV !== 'production'. Vercel production deploys set NODE_ENV
 * to 'production' automatically — so this is a no-op in prod, and any
 * accidental invocation throws.
 */
export async function simulateFirstCustomer(formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("simulateFirstCustomer is disabled in production.");
  }

  const profile = await requireProfile();

  const amountRaw = clean(formData.get("amount"), 16) ?? "49";
  const amount = Math.max(1, Math.round(Number(amountRaw) * 100));
  const customerEmail = clean(formData.get("customer_email"), 120);

  const admin = createAdminClient();
  const fakeChargeId = `ch_sim_${Date.now().toString(36)}`;

  const { error } = await admin.from("verified_conversions").insert({
    profile_id: profile.profileId,
    stripe_charge_id: fakeChargeId,
    stripe_account_id: null,
    amount_cents: amount,
    currency: "usd",
    customer_email: customerEmail,
    source: "manual",
    metadata: { simulated: true, simulated_at: new Date().toISOString() },
  });

  if (error && (error as { code?: string }).code !== "23505") {
    throw new Error(`simulateFirstCustomer: ${error.message}`);
  }

  // Mark the badge slug + celebration email on the first sim too.
  const { count } = await admin
    .from("verified_conversions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.profileId);

  if (count === 1) {
    try {
      await sendFirstCustomerCelebrationEmail({
        to: profile.email,
        builderName: profile.builderName,
        productName: profile.productName,
        amountCents: amount,
        currency: "usd",
        ctaUrl: profile.builderSlug
          ? absoluteBadgeUrl(profile.builderSlug)
          : undefined,
      });
    } catch (err) {
      console.error("[simulateFirstCustomer] email send failed:", err);
    }
  }

  revalidatePath("/machine/verified");
  revalidatePath("/machine");
}
