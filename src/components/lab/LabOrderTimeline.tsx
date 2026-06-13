import ProgressTimeline from "@/components/shared/ProgressTimeline";
import { LAB_ORDER_PROGRESS_STEPS, resolveLabOrderTimelineState } from "@/lib/labOrderTimeline";

const LabOrderTimeline = ({ status }: { status?: string | null }) => {
  const { completedIndex, currentIndex, terminal } = resolveLabOrderTimelineState(status);

  return (
    <ProgressTimeline
      title="Workflow progress"
      steps={LAB_ORDER_PROGRESS_STEPS}
      completedIndex={completedIndex}
      currentIndex={currentIndex}
      terminalLabel={terminal?.label ?? null}
      terminalMessage={terminal?.message ?? null}
    />
  );
};

export default LabOrderTimeline;
