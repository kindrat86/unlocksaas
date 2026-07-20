"use client";

import dynamic from "next/dynamic";

const PostHogPageViewInner = dynamic(
  () =>
    import("@/components/analytics/posthog-pageview").then((m) => ({
      default: m.PostHogPageView,
    })),
  { ssr: false }
);

export function PostHogPageViewClient() {
  return <PostHogPageViewInner />;
}
