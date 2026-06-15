import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export const CancelAppointmentDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: CancelAppointmentDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Cancel appointment</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Keep appointment</AlertDialogCancel>
        <AlertDialogAction
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          disabled={isPending}
        >
          {isPending ? "Cancelling…" : "Cancel appointment"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
