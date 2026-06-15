export const REVIEW_NOTIFICATION_TITLES = {
  rateVisit: "Rate your visit",
} as const;

export const buildReviewNotificationPath = (
  actionUrl: string | null | undefined,
  title: string | null | undefined,
) => {
  if (!actionUrl) return null;

  const normalizedTitle = title?.trim().toLowerCase() ?? "";
  const rateVisitTitle = REVIEW_NOTIFICATION_TITLES.rateVisit.toLowerCase();

  if (normalizedTitle === rateVisitTitle) {
    const separator = actionUrl.includes("?") ? "&" : "?";
    return `${actionUrl}${separator}openReview=true`;
  }

  return actionUrl;
};

export const shouldAutoOpenReviewModal = (searchParams: URLSearchParams) =>
  searchParams.get("openReview") === "true";
