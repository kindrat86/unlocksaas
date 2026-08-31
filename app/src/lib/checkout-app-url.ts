const CANONICAL_CHECKOUT_APP_URL = "https://unlocksaas.com";

export function checkoutAppUrl(explicit = process.env.NEXT_PUBLIC_APP_URL): string {
  const normalized = explicit?.trim().replace(/\/+$/, "");
  return normalized || CANONICAL_CHECKOUT_APP_URL;
}
