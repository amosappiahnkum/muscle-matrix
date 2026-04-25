import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { saveUser, resetUserPassword } from '../../api/api.ts';
import {
  KeyRound, User, Lock, Eye, EyeOff,
  ShieldCheck, Mail, Phone, AlertCircle,
} from 'lucide-react';
import Button from '../../components/common/Button.tsx';
import { ErrorBanner, SuccessBanner } from '../../components/common/Banner.tsx';

// ─── Password strength meter ──────────────────────────────────────────────────
const getStrength = (pwd: string) => {
  if (!pwd) return null;
  if (pwd.length < 6)  return { label: 'Weak',   color: 'bg-red-400',    text: 'text-red-500',    width: '25%' };
  if (pwd.length < 8)  return { label: 'Fair',   color: 'bg-yellow-400', text: 'text-yellow-600', width: '50%' };
  if (pwd.length < 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
    return             { label: 'Good',   color: 'bg-blue-400',   text: 'text-blue-600',   width: '75%' };
  if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
    return             { label: 'Strong', color: 'bg-green-500',  text: 'text-green-600',  width: '100%' };
  return               { label: 'Fair',   color: 'bg-yellow-400', text: 'text-yellow-600', width: '50%' };
};

// ─── Reusable password input ──────────────────────────────────────────────────
interface PasswordInputProps {
  value:          string;
  onChange:       (v: string) => void;
  placeholder:    string;
  disabled?:      boolean;
  borderClass?:   string;
  autoComplete?:  string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value, onChange, placeholder, disabled, borderClass, autoComplete,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-xl text-gray-900
          placeholder-gray-400 text-sm focus:outline-none focus:bg-white
          transition-all disabled:opacity-50
          ${borderClass ?? 'border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ChangeAdminCredentials: React.FC = () => {
  const { user, refreshSession } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername,     setNewUsername]      = useState('');
  const [newPassword,     setNewPassword]      = useState('');
  const [confirmPassword, setConfirmPassword]  = useState('');
  const [loading,         setLoading]          = useState(false);
  const [error,           setError]            = useState('');
  const [success,         setSuccess]          = useState('');

  const strength = getStrength(newPassword);

  const confirmBorder = !confirmPassword
    ? 'border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
    : confirmPassword === newPassword
      ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100'
      : 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) { setError('Session error. Please log out and log back in.'); return; }
    if (!currentPassword) { setError('Current password is required.'); return; }

    const targetUsername = newUsername.trim() || user.username;

    if (newUsername.trim() && newUsername.trim().length < 3) { setError('New username must be at least 3 characters.'); return; }
    if (newPassword && newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword && newPassword !== confirmPassword) { setError('New password and confirm password do not match.'); return; }
    if (!newUsername.trim() && !newPassword) { setError('No changes detected. Update at least one field.'); return; }

    setLoading(true);
    try {
      const { authenticateUser } = await import('../../api/api.ts');
      const verified = await authenticateUser(user.username, currentPassword);
      if (!verified) { setError('Current password is incorrect.'); return; }

      if (newUsername.trim() && newUsername.trim() !== user.username)
        await saveUser({ id: user.id, username: newUsername.trim() });

      if (newPassword)
        await resetUserPassword(user.id, newPassword);

      refreshSession({ ...user, username: targetUsername });

      const changes: string[] = [];
      if (newUsername.trim() && newUsername.trim() !== user.username) changes.push(`username changed to "${newUsername.trim()}"`);
      if (newPassword) changes.push('password updated');

      setSuccess(`Credentials updated — ${changes.join(' and ')}. Use your new credentials next time you log in.`);
      setCurrentPassword(''); setNewUsername(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl">
          <KeyRound size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Change Admin Credentials</h3>
          <p className="text-gray-500 text-sm">Update your admin username and/or password securely</p>
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-yellow-800 font-semibold mb-0.5">Security Notice</p>
          <p className="text-yellow-700">
            You must verify your current password before making changes.
            Keep your credentials confidential and never share them.
          </p>
        </div>
      </div>

      {/* Current account card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-base">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm">{user?.username}</p>
          <p className="text-gray-400 text-xs capitalize">{user?.role} account</p>
        </div>
      </div>

      {/* Forgot credentials */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-700 font-semibold text-sm mb-0.5">Forgot Credentials?</p>
          <p className="text-red-600 text-sm mb-2">
            Contact support to reset to default credentials.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Mail size={13} /> emmanueleshun558@gmail.com
            </span>
            <span className="flex items-center gap-1">
              <Phone size={13} /> 0245349937
            </span>
          </div>
        </div>
      </div>

      {/* Banners */}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}
      {error   && <ErrorBanner   message={error}   onDismiss={() => setError('')}   />}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm"
      >
        {/* Current password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Current Password <span className="text-red-500">*</span>
          </label>
          <PasswordInput
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter your current password"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            New Credentials — leave blank to keep current
          </p>

          {/* New username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              New Username <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={loading}
                placeholder={`Current: ${user?.username}`}
                autoComplete="off"
                minLength={3}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                  text-gray-900 placeholder-gray-400 text-sm
                  focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100
                  focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-gray-400 text-xs mt-1">Minimum 3 characters.</p>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              New Password <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password (min 6 chars)"
              disabled={loading}
              autoComplete="new-password"
            />
            {/* Strength meter */}
            {strength && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className={`text-xs mt-1 ${strength.text}`}>
                  Password strength: {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          {newPassword && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                disabled={loading}
                borderClass={confirmBorder}
                autoComplete="new-password"
              />
              {confirmPassword && (
                <p className={`text-xs mt-1 ${
                  confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'
                }`}>
                  {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          color="blue"
          fullWidth
          loading={loading}
          icon={<KeyRound size={18} />}
          className="login-btn--admin"
        >
          Update Credentials
        </Button>
      </form>

    </div>
  );
};

export default ChangeAdminCredentials;