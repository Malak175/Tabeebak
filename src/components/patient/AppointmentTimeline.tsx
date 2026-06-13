import ProgressTimeline from "@/components/shared/ProgressTimeline";
import {
  appointmentTimelineSteps,
  resolveAppointmentTimelineState,
} from "@/lib/appointmentStatus";

const AppointmentTimeline = ({
  status,
}: {
  status?: string | null;
}) => {
  const progress = resolveAppointmentTimelineState(status);

  return (
    <ProgressTimeline
      title="Appointment Progress"
      steps={appointmentTimelineSteps}
      completedIndex={progress.completedIndex}
      currentIndex={progress.currentIndex}
    />
  );
};

export default AppointmentTimeline;
