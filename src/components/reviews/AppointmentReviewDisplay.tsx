import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/reviews/StarRating";
import { formatDisplayDate } from "@/lib/date-time";
import { normalizeAppointmentStatus } from "@/lib/appointmentStatus";
import type { Appointment, AppointmentReviewSummary } from "@/types/patient-records.types";

const MAX_COMMENT_PREVIEW = 200;

interface AppointmentReviewDisplayProps {
  appointment: Pick<Appointment, "status" | "review">;
  onRateVisit?: () => void;
  onEditReview?: () => void;
  compact?: boolean;
}

const canRateVisit = (appointment: Pick<Appointment, "status" | "review">) =>
  normalizeAppointmentStatus(appointment.status) === "COMPLETED" &&
  appointment?.review?.submitted === false;

const hasSubmittedReview = (review?: AppointmentReviewSummary | null) =>
  review?.submitted === true && review.rating != null;

export const AppointmentReviewDisplay = ({
  appointment,
  onRateVisit,
  onEditReview,
  compact = false,
}: AppointmentReviewDisplayProps) => {
  const review = appointment?.review ?? null;
  const showRateButton = canRateVisit(appointment);
  const showReview = hasSubmittedReview(review);

  if (!showRateButton && !showReview) {
    return null;
  }

  const content = (
    <div className="space-y-3">
      {showReview ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <StarRating rating={review?.rating ?? 0} size={compact ? "sm" : "md"} />
            {review?.createdAt ? (
              <Badge variant="outline">{formatDisplayDate(review.createdAt)}</Badge>
            ) : null}
          </div>
          {review?.comment ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {compact && review.comment.length > MAX_COMMENT_PREVIEW
                ? `${review.comment.slice(0, MAX_COMMENT_PREVIEW)}…`
                : review.comment}
            </p>
          ) : null}
          {review?.canEdit && onEditReview ? (
            <Button variant="outline" size="sm" onClick={onEditReview}>
              Edit Review
            </Button>
          ) : null}
        </>
      ) : null}
      {showRateButton && onRateVisit ? (
        <Button size={compact ? "sm" : "default"} onClick={onRateVisit}>
          Rate Visit
        </Button>
      ) : null}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Visit Review</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export { canRateVisit, hasSubmittedReview };
