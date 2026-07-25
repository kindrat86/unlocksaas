export { buildIds } from "./ids.js";
export type { EntityIds } from "./ids.js";

export { buildOrganization } from "./organization.js";
export type { OrganizationInput } from "./organization.js";

export { buildPerson } from "./person.js";
export type { PersonInput } from "./person.js";

export { buildWebSite } from "./website.js";
export type {
  WebSiteInput,
  SearchActionInput,
  AskActionInput,
  PotentialAction,
} from "./website.js";

export { buildArticle } from "./article.js";
export type { ArticleInput } from "./article.js";

export { buildFaqPage } from "./faq.js";
export type { FaqEntry, FaqPageInput } from "./faq.js";

export { buildBreadcrumbList } from "./breadcrumb.js";
export type { BreadcrumbItem } from "./breadcrumb.js";

export { buildHowTo } from "./howto.js";
export type { HowToInput, HowToStep } from "./howto.js";

export { buildProduct } from "./product.js";
export type {
  ProductInput,
  OfferInput,
  AggregateRatingInput,
} from "./product.js";

export { buildSoftwareApplication } from "./softwareapplication.js";
export type { SoftwareApplicationInput } from "./softwareapplication.js";

export { buildClaimReview } from "./claimreview.js";
export type { ClaimReviewInput, ClaimReviewRatingInput } from "./claimreview.js";

// buildQAPage removed 2026-07-25: it emitted QAPage (invalid for
// publisher-authored Q&A — Google requires user-submitted answers) and
// hardcoded `upvoteCount: 1` on every Answer, a fabricated engagement signal.
// It had no callers. Use buildFAQPage instead.

export { buildReview } from "./review.js";
export type { ReviewInput } from "./review.js";

export { speakableFromClass, speakableFromXpath } from "./speakable.js";
