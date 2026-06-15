import { StarRating } from "@/components/reviews/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/date-time";
import type { DoctorPublicReview } from "@/types/patient-booking.types";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";

interface DoctorRecentReviewsSectionProps {
  reviews: DoctorPublicReview[];
}

export const DoctorRecentReviewsSection = ({ reviews = [] }: DoctorRecentReviewsSectionProps) => {
  if (!reviews?.length) {
    return (
      <p className="text-sm text-muted-foreground">No patient reviews have been published yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => {
        if (!review) return null;

        return (
        <div key={review.id ?? `review-${index}`} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              {review.patientAvatarUrl ? (
                <AvatarImage src={review.patientAvatarUrl} alt={review.patientName} />
              ) : null}
              <AvatarFallback>{getInitials(review.patientName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{review.patientName}</p>
                <StarRating rating={review.rating} size="sm" />
                {review.createdAt ? (
                  <Badge variant="outline">{formatDisplayDate(review.createdAt)}</Badge>
                ) : null}
              </div>
              {review.comment ? (
                <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
              ) : null}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};
