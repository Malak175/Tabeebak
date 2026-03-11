import { AlertCircle, LoaderCircle, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthBootstrapFeedbackProps {
  mode: "loading" | "error";
  message?: string;
  onRetry?: () => void;
  onLogout?: () => void;
}

const AuthBootstrapFeedback = ({
  mode,
  message,
  onRetry,
  onLogout,
}: AuthBootstrapFeedbackProps) => (
  <div className="flex min-h-[50vh] items-center justify-center px-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {mode === "loading" ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : (
            <AlertCircle className="h-6 w-6" />
          )}
        </div>
        <CardTitle>
          {mode === "loading" ? "Loading your account" : "Unable to load your account"}
        </CardTitle>
        <CardDescription>
          {message ??
            (mode === "loading"
              ? "Fetching your authenticated profile and permissions."
              : "We could not complete auth bootstrap for this session.")}
        </CardDescription>
      </CardHeader>
      {mode === "error" && (
        <CardContent className="flex gap-3">
          <Button className="flex-1 gap-2" onClick={onRetry} type="button">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button className="flex-1 gap-2" onClick={onLogout} type="button" variant="outline">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      )}
    </Card>
  </div>
);

export default AuthBootstrapFeedback;
