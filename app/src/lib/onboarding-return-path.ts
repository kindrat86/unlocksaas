const ONBOARDING_CONTEXT_KEYS = [
  "session_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
  "connect",
  "community",
  "error",
] as const;

type QueryValue = string | string[] | undefined;
export type OnboardingSearchParams = Record<string, QueryValue>;

export function buildOnboardingDestination(
  searchParams: OnboardingSearchParams,
): string {
  const query = new URLSearchParams();

  for (const key of ONBOARDING_CONTEXT_KEYS) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string" && value.trim() !== "") {
      query.set(key, value);
    }
  }

  const encoded = query.toString();
  return encoded ? `/onboarding?${encoded}` : "/onboarding";
}

export function buildOnboardingLoginUrl(
  searchParams: OnboardingSearchParams,
): string {
  return `/login?next=${encodeURIComponent(
    buildOnboardingDestination(searchParams),
  )}`;
}
