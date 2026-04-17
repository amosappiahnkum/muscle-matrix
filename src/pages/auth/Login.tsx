// src/components/Login.tsx
// Single login component — reads the role from the URL param (:role)
// /login/admin-layouts      → Admin Login
// /login/wholesale  → Wholesale Portal Login
// /login/retail     → Retail Portal Login
// Any unknown role  → redirects to /
import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '@/types';
import { Lock, User, AlertCircle, Dumbbell, Eye, EyeOff } from 'lucide-react';

type PortalRole = 'admin' | 'wholesale' | 'retail';

const portalConfig: Record<PortalRole, {
  title: string;
  subtitle: string;
  gradient: string;
  focusColor: string;
  successPath: string;
}> = {
  admin: {
    title:       'Admin Login',
    subtitle:    'Management Portal',
    gradient:    'from-purple-600 to-purple-800',
    focusColor:  'focus:border-purple-500 focus:ring-purple-500',
    successPath: '/admin-layouts',
  },
  wholesale: {
    title:       'Wholesale Portal',
    subtitle:    'Wholesale Employee Login',
    gradient:    'from-blue-600 to-blue-700',
    focusColor:  'focus:border-blue-500 focus:ring-blue-500',
    successPath: '/wholesale',
  },
  retail: {
    title:       'Retail Portal',
    subtitle:    'Retail Employee Login',
    gradient:    'from-green-600 to-green-700',
    focusColor:  'focus:border-green-500 focus:ring-green-500',
    successPath: '/retail',
  },
};

const Login: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  // Guard — unknown role param → send home
  if (!role || !(role in portalConfig)) {
    return <Navigate to="/" replace />;
  }

  const portalRole = role as PortalRole;
  const config     = portalConfig[portalRole];

  // The expected role to validate against.
  // Admin login has no expectedRole restriction — any admin-layouts can log in there.
  const expectedRole: UserRole | undefined =
      portalRole !== 'admin' ? portalRole : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password, expectedRole);

      if (result.success) {
        navigate(config.successPath, { replace: true });
      } else {
        setError(result.message);
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">

            {/* Header — colour changes per role */}
            <div className={`bg-gradient-to-r ${config.gradient} p-6 text-center`}>
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">{config.title}</h1>
              <p className="text-white/70 text-xs mt-1 tracking-widest uppercase">
                MUSCLE MATRIX — {config.subtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Error banner */}
              {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="username"
                      placeholder="Enter username"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${config.focusColor} transition-all disabled:opacity-50`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className={`w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${config.focusColor} transition-all disabled:opacity-50`}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
                      tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 bg-gradient-to-r ${config.gradient} text-white font-semibold rounded-lg hover:opacity-90 active:opacity-80 transition-opacity shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Logging in…
                    </>
                ) : (
                    `Login to ${config.title}`
                )}
              </button>

              {/* Back */}
              <button
                  type="button"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  className="w-full py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to Home
              </button>

            </form>
          </div>

          {portalRole !== 'admin' && (
              <p className="text-center text-gray-600 text-xs mt-4">
                Contact your admin if you have trouble logging in.
              </p>
          )}
        </div>
      </div>
  );
};

export default Login;