import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useVieweoAuth } from "@/contexts/VieweoAuthContext";

interface VieweoProtectedRouteProps {
  children: ReactNode;
}

export function VieweoProtectedRoute({ children }: VieweoProtectedRouteProps) {
  const { isAuthenticated } = useVieweoAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
