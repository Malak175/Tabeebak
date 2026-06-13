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
  /** Last fully completed step index, or -1 when nothing is complete (e.g. terminal states). */
  completedIndex: number;
  currentIndex: number | null;
  terminalLabel?: string | null;
  terminalMessage?: string | null;
}) => (
  <div className="rounded-lg border border-border bg-muted/20 p-4 shadow-sm transition-colors">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <p className="text-sm font-semibold tracking-tight">{title}</p>
      {terminalLabel ? (
        <Badge variant="destructive" className="font-medium">
          {terminalLabel}
        </Badge>
      ) : null}
    </div>
    {terminalMessage ? (
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{terminalMessage}</p>
    ) : null}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-flow-col md:auto-cols-fr md:gap-4">
      {steps.map((step, index) => {
        const isCompleted = completedIndex >= 0 && index <= completedIndex;
        const isCurrent = currentIndex !== null && index === currentIndex;

        return (
          <div
            key={step.key}
            className="flex min-w-0 items-start gap-2.5 rounded-md py-0.5 transition-colors md:items-center"
          >
            <span
              className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 transition-all md:mt-0 ${
                isCompleted
                  ? "border-green-600 bg-green-600 shadow-sm shadow-green-600/20"
                  : isCurrent
                    ? "border-primary bg-primary shadow-sm shadow-primary/25 ring-2 ring-primary/20"
                    : "border-muted-foreground/30 bg-background"
              }`}
              aria-hidden
            />
            <span
              className={`min-w-0 text-xs leading-snug transition-colors ${
                isCompleted
                  ? "font-medium text-green-800 dark:text-green-600"
                  : isCurrent
                    ? "font-semibold text-primary"
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
