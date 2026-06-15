import { addDays, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AvailableTimeSlotsPicker from "@/components/booking/AvailableTimeSlotsPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDoctorAvailableSlotsQuery } from "@/hooks/usePatientBooking";
import { useRescheduleAppointmentMutation } from "@/hooks/usePatientProfile";
import { formatAppointmentActionError, isSlotTakenError } from "@/lib/appointmentMutationErrors";
import { formatDisplayDateTime } from "@/lib/date-time";
import type { Appointment } from "@/types/patient-records.types";

interface RescheduleAppointmentModalProps {
  appointmentId: string;
  appointment: Pick<Appointment, "scheduledAt" | "doctor" | "doctorId">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const isSameSlot = (left?: string | null, right?: string | null) => {
  if (!left || !right) return false;
  return new Date(left).getTime() === new Date(right).getTime();
};

export const RescheduleAppointmentModal = ({
  appointmentId,
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: RescheduleAppointmentModalProps) => {
  const doctorId = appointment.doctor?.id ?? appointment.doctorId ?? "";
  const slotRange = useMemo(() => {
    const today = new Date();
    return {
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(addDays(today, 14), "yyyy-MM-dd"),
    };
  }, []);

  const slotsQuery = useDoctorAvailableSlotsQuery(doctorId, open && doctorId ? slotRange : undefined);
  const rescheduleMutation = useRescheduleAppointmentMutation(appointmentId);
  const [selectedSlotStart, setSelectedSlotStart] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedSlotStart("");
    }
  }, [open]);

  const selectableSlots = useMemo(
    () =>
      (slotsQuery.data?.slots ?? []).filter(
        (slot) => !isSameSlot(slot.startAt, appointment.scheduledAt),
      ),
    [appointment.scheduledAt, slotsQuery.data?.slots],
  );

  const handleSubmit = () => {
    if (!appointmentId.trim()) {
      toast.error("Appointment id is missing. Please reload the page and try again.");
      return;
    }

    if (!selectedSlotStart) {
      toast.error("Please select a new time slot.");
      return;
    }

    rescheduleMutation.mutate(
      { scheduledAt: selectedSlotStart },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: Error) => {
          if (isSlotTakenError(error)) {
            toast.error("Slot is already taken");
            void slotsQuery.refetch();
            return;
          }
          toast.error(formatAppointmentActionError(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-1.5 border-b px-6 py-4 pr-12 text-left">
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            Choose a new time for your visit
            {appointment.scheduledAt ? ` (currently ${formatDisplayDateTime(appointment.scheduledAt)})` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-4">
          <AvailableTimeSlotsPicker
            slots={selectableSlots}
            selectedSlotStart={selectedSlotStart}
            onSelect={setSelectedSlotStart}
            isLoading={slotsQuery.isLoading}
            isError={slotsQuery.isError}
            errorMessage={(slotsQuery.error as Error | undefined)?.message}
            emptyMessage="No alternative slots are available in the next 14 days."
          />
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={rescheduleMutation.isPending}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={rescheduleMutation.isPending || !selectedSlotStart || slotsQuery.isLoading}
          >
            {rescheduleMutation.isPending ? "Rescheduling…" : "Confirm reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
