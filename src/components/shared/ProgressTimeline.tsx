import { Badge } from "@/components/ui/badge";

export type ProgressTimelineStep = {
  key: string;
  label: string;
};

const ProgressTimeline = ({
  title,
  steps,
  completedIndex,
  currentIndex,
  terminalLabel,
  terminalMessage,
}: {
  title: string;
  steps: ProgressTimelineStep[];
  completedIndex: number;
  currentIndex: number | null;
  terminalLabel?: string | null;
  terminalMessage?: string | null;
}) => (
  <div className="rounded-lg border bg-muted/20 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <p className="text-sm font-medium">{title}</p>
      {terminalLabel ? (
        <Badge className="bg-red-100 text-red-700 border-red-200">{terminalLabel}</Badge>
      ) : null}
    </div>
    {terminalMessage ? <p className="mb-3 text-xs text-muted-foreground">{terminalMessage}</p> : null}
    <div className="grid gap-3 md:grid-flow-col md:auto-cols-fr">
      {steps.map((step, index) => {
        const isCompleted = index <= completedIndex;
        const isCurrent = currentIndex !== null && index === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isCompleted ? "bg-green-600" : isCurrent ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            />
            <span
              className={`text-xs ${
                isCompleted
                  ? "font-medium text-green-700"
                  : isCurrent
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

export default ProgressTimeline;
