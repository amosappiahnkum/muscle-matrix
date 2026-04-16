// Login Component for authentication

import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Dumbbell, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  portalType?: 'admin' | 'wholesale' | 'retail';
  onSuccess: () => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ portalType = 'admin', onSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const getExpectedRole = (): UserRole | undefined => {
    if (portalType === 'wholesale') return 'wholesale';
    if (portalType === 'retail') return 'retail';
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const result = login(username, password, getExpectedRole());
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
  };

  const getPortalTitle = () => {
    switch (portalType) {
      case 'wholesale': return 'Wholesale Portal Login';
      case 'retail': return 'Retail Portal Login';
      default: return 'Admin Login';
    }
  };

  const getPortalColor = () => {
    switch (portalType) {
      case 'wholesale': return 'from-blue-600 to-blue-700';
      case 'retail': return 'from-green-600 to-green-700';
      default: return 'from-purple-600 to-purple-800';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getPortalColor()} p-6 text-center`}>
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">{getPortalTitle()}</h1>
            {/* Business name — MUSCLE MATRIX shown, no default credentials hint */}
            <p className="text-white/80 text-sm mt-1 font-semibold tracking-widest">MUSCLE MATRIX</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Enter username"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 bg-gradient-to-r ${getPortalColor()} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg`}
            >
              Login
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Home
              </button>
            )}
          </form>
        </div>

        {/* 
          ═══════════════════════════════════════════
          DEFAULT ADMIN CREDENTIALS (CONFIDENTIAL)
          Username : admin
          Password : admin123
          Change via Admin Dashboard → Change Credentials
          ═══════════════════════════════════════════
          NOTE: This comment is intentionally hidden
          from the UI. Only admins who have code access
          can see these defaults.
        */}
        {/* No visible credentials hint shown for admin — security policy */}
        {portalType !== 'admin' && (
          <p className="text-center text-gray-600 text-xs mt-4">
            Contact admin if you have trouble logging in.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
