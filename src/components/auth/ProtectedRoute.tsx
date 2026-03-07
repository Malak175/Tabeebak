import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { hasRoleAccess, useAuth } from "@/hooks/useAuth";
import { routeByRole } from "@/services/auth.service";
import { UserRole } from "@/types/auth.types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRoleAccess(user.role, allowedRoles)) {
    return <Navigate to={routeByRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
