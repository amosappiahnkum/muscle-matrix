// src/context/AuthContext.tsx
import React, {
  createContext, useContext, useState, useEffect,
  useRef, useCallback, ReactNode,
} from 'react';
import { AuthState, LoginResult, UserRole } from '../types';
import { authenticateUser, restoreSession, logout as apiLogout } from '../api/api';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000;
const WARNING_BEFORE_MS   =  5 * 60 * 1000;
const TICK_INTERVAL_MS    = 10 * 1000;

interface AuthContextType extends AuthState {
  login:            (username: string, password: string, expectedRole?: UserRole) => Promise<LoginResult>;
  logout:           () => Promise<void>;
  extendSession:    () => void;
  checkAccess:      (requiredRole: UserRole) => boolean;
  refreshSession:   (updatedUser: import('../types').User) => void;
  secondsRemaining: number | null;
  showWarning:      boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState,        setAuthState]        = useState<AuthState>({ isAuthenticated: false, user: null });
  const [appLoading,       setAppLoading]       = useState(true);
  const [showWarning,      setShowWarning]      = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const tickRef         = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setShowWarning(false);
    setSecondsRemaining(null);
    await apiLogout();
    setAuthState({ isAuthenticated: false, user: null });
  }, []);

  // ── Extend session ─────────────────────────────────────────────────────────
  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(null);
  }, []);

  // ── Record activity ────────────────────────────────────────────────────────
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) { setShowWarning(false); setSecondsRemaining(null); }
  }, [showWarning]);

  // ── Ticker ─────────────────────────────────────────────────────────────────
  const startTicker = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const idle      = Date.now() - lastActivityRef.current;
      const remaining = INACTIVITY_LIMIT_MS - idle;
      if (remaining <= 0) { logout(); return; }
      if (remaining <= WARNING_BEFORE_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(remaining / 1000));
      } else {
        setShowWarning(false);
        setSecondsRemaining(null);
      }
    }, TICK_INTERVAL_MS);
  }, [logout]);

  // ── Activity listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, recordActivity, { passive: true }));
    lastActivityRef.current = Date.now();
    startTicker();
    return () => {
      events.forEach((e) => window.removeEventListener(e, recordActivity));
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [authState.isAuthenticated, recordActivity, startTicker]);

  // ── Restore session ────────────────────────────────────────────────────────
  useEffect(() => {
    restoreSession()
      .then((user) => { if (user) setAuthState({ isAuthenticated: true, user }); })
      .catch(() => {})
      .finally(() => setAppLoading(false));
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  // authenticateUser now THROWS on failure so we catch and return the real message.
  // Previously it returned null and we showed a generic "Invalid username or password"
  // even when the real error was something else (network down, server error, etc).
  const login = async (
    username: string,
    password: string,
    expectedRole?: UserRole,
  ): Promise<LoginResult> => {
    try {
      const user = await authenticateUser(username, password);

      if (expectedRole && user.role !== expectedRole && user.role !== 'admin') {
        await apiLogout();
        return {
          success: false,
          message: `Access denied. This portal is for ${expectedRole} users only.`,
        };
      }

      lastActivityRef.current = Date.now();
      setAuthState({ isAuthenticated: true, user });
      return { success: true, message: '' };

    } catch (err: unknown) {
      // Surface the real error from the API (wrong password, server down, etc.)
      return {
        success: false,
        message: err instanceof Error
          ? err.message
          : 'Login failed. Please try again.',
      };
    }
  };

  const checkAccess = (requiredRole: UserRole): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'admin') return true;
    return authState.user.role === requiredRole;
  };

  const refreshSession = (updatedUser: import('../types').User) =>
    setAuthState({ isAuthenticated: true, user: updatedUser });

  if (appLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      ...authState, login, logout, extendSession,
      checkAccess, refreshSession, secondsRemaining, showWarning,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};