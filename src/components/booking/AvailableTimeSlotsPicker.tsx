import { isValid, parseISO } from "date-fns";
import { ErrorCard } from "@/components/patient/BookingFlowSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDisplayDateTime, formatDisplayTime } from "@/lib/date-time";
import { groupAvailableSlots, type AvailableSlotLike } from "@/lib/groupAvailableSlots";

type AvailableTimeSlotsPickerProps<T extends AvailableSlotLike> = {
  label?: string;
  slots: T[];
  selectedSlotStart: string;
  onSelect: (startAt: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
};

const AvailableTimeSlotsPicker = <T extends AvailableSlotLike>({
  label = "Available times",
  slots,
  selectedSlotStart,
  onSelect,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyMessage = "No times are available right now. Check back soon.",
}: AvailableTimeSlotsPickerProps<T>) => {
  const groupedSlots = groupAvailableSlots(slots);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-lg border p-4">
        {isLoading ? (
          <div className="mt-3 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ) : isError ? (
          <div className="mt-3">
            <ErrorCard
              title="Unable to load available slots"
              message={errorMessage ?? "Please try again."}
            />
          </div>
        ) : groupedSlots.length ? (
          <div className="mt-4 space-y-4">
            {groupedSlots.map((group) => (
              <div key={group.dateKey} className="space-y-2">
                <p className="text-sm font-medium">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.slots.map((slot) => {
                    const parsed = parseISO(slot.startAt);
                    const timeLabel = slot.time?.trim()
                      ? formatDisplayTime(slot.time)
                      : isValid(parsed)
                        ? formatDisplayTime(slot.startAt)
                        : "Time";
                    const isSelected = selectedSlotStart === slot.startAt;

                    return (
                      <Button
                        key={slot.startAt}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={isSelected ? "shadow-sm" : undefined}
                        onClick={() => onSelect(slot.startAt)}
                      >
                        {timeLabel}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
        )}
        {selectedSlotStart ? (
          <p className="mt-4 text-sm text-foreground">
            Selected time: {formatDisplayDateTime(selectedSlotStart)}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default AvailableTimeSlotsPicker;
