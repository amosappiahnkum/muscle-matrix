// Change Admin Credentials Component
// Allows admin to update their username and password securely

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, saveUser, authenticateUser } from '../../utils/database';
import { KeyRound, User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, Mail, Phone } from 'lucide-react';

const ChangeAdminCredentials: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Short delay for UX feedback
    setTimeout(() => {
      // Verify current password
      if (!user) {
        setError('Session error. Please log out and log back in.');
        setIsLoading(false);
        return;
      }

      const verified = authenticateUser(user.username, currentPassword);
      if (!verified) {
        setError('Current password is incorrect. Please try again.');
        setIsLoading(false);
        return;
      }

      // Validate new username
      const targetUsername = newUsername.trim() || user.username;
      if (newUsername.trim() && newUsername.trim().length < 3) {
        setError('New username must be at least 3 characters long.');
        setIsLoading(false);
        return;
      }

      // Check username not taken by another user
      if (newUsername.trim() && newUsername.trim() !== user.username) {
        const allUsers = getUsers();
        const taken = allUsers.find(u => u.username.toLowerCase() === newUsername.trim().toLowerCase() && u.id !== user.id);
        if (taken) {
          setError('That username is already taken. Choose a different one.');
          setIsLoading(false);
          return;
        }
      }

      // Validate new password if provided
      let targetPassword = user.password;
      if (newPassword) {
        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('New password and confirm password do not match.');
          setIsLoading(false);
          return;
        }
        targetPassword = newPassword;
      }

      // At least one field must change
      if (targetUsername === user.username && targetPassword === user.password) {
        setError('No changes detected. Please update at least one field.');
        setIsLoading(false);
        return;
      }

      // Save updated admin to database
      const updatedAdmin = {
        ...user,
        username: targetUsername,
        password: targetPassword,
      };
      saveUser(updatedAdmin);

      // Update auth context + localStorage session so UI reflects new credentials immediately
      refreshSession(updatedAdmin);

      setSuccess(
        `✅ Credentials updated successfully! ` +
        (targetUsername !== user.username ? `New username: "${targetUsername}". ` : '') +
        (targetPassword !== user.password ? 'Password changed. ' : '') +
        'Please remember your new credentials.'
      );

      // Clear form fields
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, 600);
  };

  const passwordStrength = (pwd: string): { level: string; color: string; width: string } => {
    if (!pwd) return { level: '', color: '', width: '0%' };
    if (pwd.length < 6) return { level: 'Weak', color: 'bg-red-500', width: '25%' };
    if (pwd.length < 8) return { level: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (pwd.length < 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { level: 'Good', color: 'bg-blue-500', width: '75%' };
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      return { level: 'Strong', color: 'bg-green-500', width: '100%' };
    }
    return { level: 'Fair', color: 'bg-yellow-500', width: '50%' };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-600/20 p-2 rounded-lg">
          <KeyRound className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Change Admin Credentials</h3>
          <p className="text-gray-400 text-sm">Update your admin username and/or password securely</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-yellow-300 font-semibold mb-1">Security Notice</p>
          <p className="text-yellow-200/80">
            You must verify your current password before making any changes.
            Keep your credentials confidential and never share them.
            After updating, use your new credentials for all future logins.
          </p>
        </div>
      </div>

      {/* Current Admin Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Current Admin Account</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold">{user?.username}</p>
            <p className="text-gray-400 text-sm capitalize">{user?.role} account</p>
          </div>
        </div>
      </div>

      {/* Reset to Default */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-300 font-semibold mb-1">Forgot Credentials?</h4>
            <p className="text-red-200/80 text-sm mb-2">
              If you forgot your admin username or password, contact support to reset to default.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> emmanueleshun558@gmail.com
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> 0245349937
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/40 rounded-xl text-green-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Change Credentials Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-5">
        {/* Current Password — Required */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Current Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showCurrentPwd ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPwd(!showCurrentPwd)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showCurrentPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">New Credentials (leave blank to keep current)</p>

          {/* New Username */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              New Username <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder={`Current: ${user?.username}`}
                autoComplete="off"
                minLength={3}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">Minimum 3 characters. Leave blank to keep current username.</p>
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              New Password <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="Enter new password (min 6 chars)"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password Strength Meter */}
            {newPassword && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="text-xs mt-1" style={{
                  color: strength.level === 'Weak' ? '#ef4444' :
                         strength.level === 'Fair' ? '#eab308' :
                         strength.level === 'Good' ? '#3b82f6' : '#22c55e'
                }}>
                  Password strength: {strength.level}
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          {newPassword && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-600 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-1 ${confirmPassword === newPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating Credentials...
            </>
          ) : (
            <>
              <KeyRound className="w-5 h-5" />
              Update Credentials
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangeAdminCredentials;
