// src/routes/GuestRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

const roleToPortal: Record<string, string> = {
  admin:     '/admin-layouts',
  wholesale: '/wholesale',
  retail:    '/retail',
};

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={roleToPortal[user.role] ?? '/'} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;