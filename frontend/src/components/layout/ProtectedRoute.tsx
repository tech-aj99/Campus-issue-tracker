import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types/user';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user && !allowedRoles.includes(user.role)) {
    const redirects: Record<Role, string> = {
      STUDENT: '/student',
      STAFF: '/staff',
      ADMIN: '/admin',
    };
    return <Navigate to={redirects[user.role]} replace />;
  }

  return <>{children}</>;
}
