import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login/${requiredRole}`} state={{ from: location }} replace />;
  }

  // Admin can access every portal
  if (user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;