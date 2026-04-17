import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface BannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<BannerProps> = ({ message, onDismiss }) => (
  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <span className="flex-1 text-sm">{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="ml-auto hover:text-red-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

export const SuccessBanner: React.FC<BannerProps> = ({ message, onDismiss }) => (
  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
    <CheckCircle className="w-5 h-5 flex-shrink-0" />
    <span className="flex-1 text-sm">{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="ml-auto hover:text-green-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);
