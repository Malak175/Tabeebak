import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { InteractiveStarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePatientAppointmentReviewMutation,
  usePatientAppointmentReviewQuery,
  useUpdatePatientAppointmentReviewMutation,
} from "@/hooks/usePatientProfile";

const MAX_COMMENT_LENGTH = 2000;

interface ReviewModalProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export const ReviewModal = ({
  appointmentId,
  open,
  onOpenChange,
  mode = "create",
  onSuccess,
}: ReviewModalProps) => {
  const isEdit = mode === "edit";
  const reviewQuery = usePatientAppointmentReviewQuery(appointmentId, open && isEdit);
  const createMutation = useCreatePatientAppointmentReviewMutation(appointmentId);
  const updateMutation = useUpdatePatientAppointmentReviewMutation(appointmentId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment("");
      return;
    }

    if (isEdit && reviewQuery.data) {
      setRating(reviewQuery.data.rating ?? 0);
      setComment(reviewQuery.data.comment ?? "");
    }
  }, [open, isEdit, reviewQuery.data]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    const payload = {
      rating,
      comment: comment.trim() || undefined,
    };

    const mutation = isEdit ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? "Review updated." : "Thank you for your review.");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Review" : "Rate Your Visit"}</DialogTitle>
          <DialogDescription>
            Share your experience to help other patients and improve care quality.
          </DialogDescription>
        </DialogHeader>

        {isEdit && reviewQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your review…</p>
        ) : isEdit && reviewQuery.isError ? (
          <p className="text-sm text-destructive">{(reviewQuery.error as Error).message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <InteractiveStarRating
                value={rating}
                onChange={setRating}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewComment">Comment (optional)</Label>
              <Textarea
                id="reviewComment"
                value={comment}
                onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                rows={4}
                disabled={isPending}
                placeholder="Tell us about your visit…"
              />
              <p className="text-xs text-muted-foreground">
                {comment.length}/{MAX_COMMENT_LENGTH} characters
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || rating < 1}>
                {isPending ? "Saving…" : isEdit ? "Save Changes" : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
