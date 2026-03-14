import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { hasRoleAccess, useAuth } from "@/hooks/useAuth";
import { routeByRole } from "@/lib/auth";
import { UserRole } from "@/types/auth.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const {
    authBootstrapError,
    hasToken,
    isAuthenticated,
    isBootstrappingAuth,
    logout,
    user,
  } = useAuth();
  const location = useLocation();

  if (hasToken && isBootstrappingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">Bootstrapping your account</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re verifying your authenticated profile and role from the server.
          </p>
        </div>
      </div>
    );
  }

  if (hasToken && authBootstrapError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication bootstrap failed</AlertTitle>
            <AlertDescription>{authBootstrapError.message}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => {
                logout();
              }}
            >
              Return to Login
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRoleAccess(user.role, allowedRoles)) {
    return <Navigate to={routeByRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
