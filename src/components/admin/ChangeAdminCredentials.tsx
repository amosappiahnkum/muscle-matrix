// src/components/admin/ChangeAdminCredentials.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveUser, resetUserPassword } from '../../api/api';
import {
    KeyRound, User, Lock, Eye, EyeOff,
    ShieldCheck, Mail, Phone, AlertCircle,
} from 'lucide-react';
import Button from '../common/Button';
import { ErrorBanner, SuccessBanner } from '../common/Banner';

// ─── Password strength meter ──────────────────────────────────────────────────
const getStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6)  return { label: 'Weak',   color: 'bg-red-500',    text: 'text-red-400',    width: '25%' };
    if (pwd.length < 8)  return { label: 'Fair',   color: 'bg-yellow-500', text: 'text-yellow-400', width: '50%' };
    if (pwd.length < 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
        return { label: 'Good',   color: 'bg-blue-500',   text: 'text-blue-400',   width: '75%' };
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
        return { label: 'Strong', color: 'bg-green-500',  text: 'text-green-400',  width: '100%' };
    return               { label: 'Fair',   color: 'bg-yellow-500', text: 'text-yellow-400', width: '50%' };
};

// ─── Reusable password input ──────────────────────────────────────────────────
interface PasswordInputProps {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    disabled?: boolean;
    borderClass?: string;
    autoComplete?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
                                                         value, onChange, placeholder, disabled, borderClass, autoComplete,
                                                     }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
                    borderClass ?? 'border-gray-600 focus:border-purple-500 focus:ring-purple-500'
                }`}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((v) => !v)}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 disabled:opacity-50"
            >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

    // Confirm field border changes based on match state
    const confirmBorder = !confirmPassword
        ? 'border-gray-600 focus:border-purple-500 focus:ring-purple-500'
        : confirmPassword === newPassword
            ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
            : 'border-red-500 focus:border-red-500 focus:ring-red-500';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) {
            setError('Session error. Please log out and log back in.');
            return;
        }
        if (!currentPassword) {
            setError('Current password is required.');
            return;
        }

        const targetUsername = newUsername.trim() || user.username;

        if (newUsername.trim() && newUsername.trim().length < 3) {
            setError('New username must be at least 3 characters.');
            return;
        }
        if (newPassword && newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        if (newPassword && newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }
        if (!newUsername.trim() && !newPassword) {
            setError('No changes detected. Update at least one field.');
            return;
        }

        setLoading(true);
        try {
            // Verify current password via login endpoint
            const { authenticateUser } = await import('../../api/api');
            const verified = await authenticateUser(user.username, currentPassword);
            if (!verified) {
                setError('Current password is incorrect.');
                return;
            }

            // Apply username change
            if (newUsername.trim() && newUsername.trim() !== user.username) {
                await saveUser({ id: user.id, username: newUsername.trim() });
            }

            // Apply password change
            if (newPassword) {
                await resetUserPassword(user.id, newPassword);
            }

            // Refresh the session so the header reflects the new username immediately
            const updatedUser = {
                ...user,
                username: targetUsername,
            };
            refreshSession(updatedUser);

            const changes: string[] = [];
            if (newUsername.trim() && newUsername.trim() !== user.username)
                changes.push(`username changed to "${newUsername.trim()}"`);
            if (newPassword)
                changes.push('password updated');

            setSuccess(`Credentials updated — ${changes.join(' and ')}. Use your new credentials next time you log in.`);
            setCurrentPassword('');
            setNewUsername('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl space-y-6">
            {/* Page header */}
            <div className="flex items-center gap-3">
                <div className="bg-purple-600/20 p-2 rounded-lg">
                    <KeyRound className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Change Admin Credentials</h3>
                    <p className="text-gray-400 text-sm">Update your admin username and/or password securely</p>
                </div>
            </div>

            {/* Security notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="text-yellow-300 font-semibold mb-1">Security Notice</p>
                    <p className="text-yellow-200/80">
                        You must verify your current password before making changes.
                        Keep your credentials confidential and never share them.
                    </p>
                </div>
            </div>

            {/* Current account card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
                </div>
                <div>
                    <p className="text-white font-semibold">{user?.username}</p>
                    <p className="text-gray-400 text-xs capitalize">{user?.role} account</p>
                </div>
            </div>

            {/* Forgot credentials */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-red-300 font-semibold text-sm mb-1">Forgot Credentials?</p>
                    <p className="text-red-200/80 text-sm mb-2">
                        Contact support to reset to default credentials.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> emmanueleshun558@gmail.com
            </span>
                        <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> 0245349937
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
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-5"
            >
                {/* Current password */}
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        Current Password <span className="text-red-400">*</span>
                    </label>
                    <PasswordInput
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        placeholder="Enter your current password"
                        disabled={loading}
                        autoComplete="current-password"
                    />
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                        New Credentials — leave blank to keep current
                    </p>

                    {/* New username */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            New Username <span className="text-gray-500 text-xs">(optional)</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                disabled={loading}
                                placeholder={`Current: ${user?.username}`}
                                autoComplete="off"
                                minLength={3}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                            />
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Minimum 3 characters.</p>
                    </div>

                    {/* New password */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            New Password <span className="text-gray-500 text-xs">(optional)</span>
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
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
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

                    {/* Confirm password — only shows when new password has content */}
                    {newPassword && (
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Confirm New Password <span className="text-red-400">*</span>
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
                                    confirmPassword === newPassword ? 'text-green-400' : 'text-red-400'
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
                    fullWidth
                    loading={loading}
                    icon={<KeyRound className="w-5 h-5" />}
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700"
                >
                    Update Credentials
                </Button>
            </form>
        </div>
    );
};

export default ChangeAdminCredentials;