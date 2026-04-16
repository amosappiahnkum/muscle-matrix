// Authentication Context for managing user sessions — MUSCLE MATRIX

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, UserRole } from '@/types';
import { authenticateUser, initializeDatabase } from '../utils/database';

const SESSION_KEY = 'muscle_matrix_session';

interface AuthContextType extends AuthState {
  login: (username: string, password: string, expectedRole?: UserRole) => { success: boolean; message: string };
  logout: () => void;
  checkAccess: (requiredRole: UserRole) => boolean;
  refreshSession: (updatedUser: import('../types').User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    // Initialize database with default admin on first run
    initializeDatabase();

    // Restore existing session from localStorage
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setAuthState({ isAuthenticated: true, user: session });
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const login = (username: string, password: string, expectedRole?: UserRole) => {
    const user = authenticateUser(username, password);

    if (!user) {
      return { success: false, message: 'Invalid username or password. Please try again.' };
    }

    // Role-based access control
    if (expectedRole && user.role !== 'admin') {
      if (expectedRole === 'wholesale' && user.role !== 'wholesale') {
        return {
          success: false,
          message: 'Access denied. Your account is not authorized for the Wholesale Portal.',
        };
      }
      if (expectedRole === 'retail' && user.role !== 'retail') {
        return {
          success: false,
          message: 'Access denied. Your account is not authorized for the Retail Portal.',
        };
      }
    }

    setAuthState({ isAuthenticated: true, user });
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem(SESSION_KEY);
  };

  const checkAccess = (requiredRole: UserRole): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'admin') return true;
    return authState.user.role === requiredRole;
  };

  /**
   * Called after admin updates their own credentials so the session stays in sync
   * without forcing a logout.
   */
  const refreshSession = (updatedUser: import('../types').User) => {
    setAuthState({ isAuthenticated: true, user: updatedUser });
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, checkAccess, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
