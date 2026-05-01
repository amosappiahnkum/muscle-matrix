import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface StatusMessageProps {
  message: { type: 'success' | 'error'; text: string } | null;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-2 p-4 rounded-lg ${
        message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
      }`}
    >
      {message.type === 'success' ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span className="text-sm font-medium">{message.text}</span>
    </div>
  );
};

export default StatusMessage;