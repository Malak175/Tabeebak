import { useMemo, useState } from "react";
import { MessageSquareQuote, Star, Stethoscope, ThumbsUp } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { StarRating } from "@/components/reviews/StarRating";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorReviewsQuery,
  useDoctorReviewsSummaryQuery,
} from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/date-time";

const formatDateValue = (value?: string | null) => formatDisplayDate(value);

const DoctorReviews = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const userName = getDisplayName(user ?? {});

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search,
      rating: rating === "all" ? undefined : Number(rating),
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, search, rating],
  );

  const enabled = Boolean(user);
  const summaryQuery = useDoctorReviewsSummaryQuery(enabled);
  const reviewsQuery = useDoctorReviewsQuery(filters, enabled);

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Reviews</h1>
        <p className="text-muted-foreground">
          Review patient feedback and aggregated review metrics.
        </p>
      </div>

      {summaryQuery.isLoading ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : summaryQuery.isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Unable to load review summary</AlertTitle>
          <AlertDescription>{(summaryQuery.error as Error).message}</AlertDescription>
        </Alert>
      ) : summaryQuery.data ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Average rating</p>
              <div className="mt-2 flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold">{summaryQuery.data.averageRating.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total reviews</p>
              <p className="mt-2 text-3xl font-bold">{summaryQuery.data.totalReviews}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Recommendation rate</p>
              <div className="mt-2 flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">
                  {summaryQuery.data.recommendationRate != null
                    ? `${summaryQuery.data.recommendationRate}%`
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search patient or review"
          />
          <Select
            value={rating}
            onValueChange={(value) => {
              setPage(1);
              setRating(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              setSearch("");
              setRating("all");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      {reviewsQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : reviewsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load reviews</AlertTitle>
          <AlertDescription>{(reviewsQuery.error as Error).message}</AlertDescription>
        </Alert>
      ) : reviewsQuery.data?.data.length ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {reviewsQuery.data.data.map((review) => (
              <Card key={review.id}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{review.patientName}</h3>
                        <Badge variant="outline">{formatDateValue(review.createdAt)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.title || "Patient feedback"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {review.comment || "No written review text was returned for this entry."}
                  </p>
                  {review.wouldRecommend != null ? (
                    <p className="text-sm text-muted-foreground">
                      Recommendation: {review.wouldRecommend ? "Recommended" : "Not recommended"}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {reviewsQuery.data.page} of {reviewsQuery.data.totalPages} with{" "}
              {reviewsQuery.data.total} total reviews
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!reviewsQuery.data.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!reviewsQuery.data.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
            <MessageSquareQuote className="h-10 w-10" />
            <p>No reviews matched your current filters.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorReviews;
