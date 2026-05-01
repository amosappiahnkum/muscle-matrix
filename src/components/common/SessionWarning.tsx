import React from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0
        ? `${m}m ${s.toString().padStart(2, '0')}s`
        : `${s}s`;
};

const SessionWarning: React.FC = () => {
    const { showWarning, secondsRemaining, extendSession, logout } = useAuth();

    if (!showWarning || secondsRemaining === null) return null;

    const isUrgent = secondsRemaining <= 60;

    return (
        // Full-screen overlay
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-sm bg-gray-800 rounded-2xl border shadow-2xl overflow-hidden ${
                isUrgent ? 'border-red-500/60' : 'border-yellow-500/60'
            }`}>
                {/* Coloured top bar */}
                <div className={`h-1.5 w-full ${isUrgent ? 'bg-red-500' : 'bg-yellow-500'}`} />

                <div className="p-6 space-y-5">
                    {/* Icon + title */}
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isUrgent ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                            <Clock className={`w-6 h-6 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Session Expiring</h3>
                            <p className="text-gray-400 text-sm">You have been inactive</p>
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className={`rounded-xl p-4 text-center ${isUrgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                        <p className="text-gray-400 text-sm mb-1">Logging out in</p>
                        <p className={`text-4xl font-black tabular-nums ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}>
                            {formatTime(secondsRemaining)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Any activity will also keep you logged in</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            size="md"
                            fullWidth
                            icon={<LogOut className="w-4 h-4" />}
                            onClick={() => logout()}
                        >
                            Logout Now
                        </Button>
                        <Button
                            variant="primary"
                            color={isUrgent ? 'red' : 'orange'}
                            size="md"
                            fullWidth
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={extendSession}
                        >
                            Stay Logged In
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionWarning;