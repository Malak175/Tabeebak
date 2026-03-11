import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { hasRoleAccess, useAuth } from "@/hooks/useAuth";
import { routeByRole } from "@/services/auth.service";
import { UserRole } from "@/types/auth.types";
import AuthBootstrapFeedback from "@/components/auth/AuthBootstrapFeedback";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { bootstrapError, isAuthenticated, isBootstrapping, logout, retryBootstrap, token, user } =
    useAuth();
  const location = useLocation();

  if (token && isBootstrapping) {
    return <AuthBootstrapFeedback mode="loading" />;
  }

  if (token && bootstrapError) {
    return (
      <AuthBootstrapFeedback
        mode="error"
        message={bootstrapError.message}
        onLogout={logout}
        onRetry={() => {
          void retryBootstrap();
        }}
      />
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
