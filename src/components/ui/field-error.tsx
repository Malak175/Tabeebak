import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  message?: string;
}

const FieldError = ({ message }: FieldErrorProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1.5 animate-fade-in">
      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
      <p className="text-xs font-medium text-destructive">{message}</p>
    </div>
  );
};

export { FieldError };
