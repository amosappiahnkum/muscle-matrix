import React from 'react';
import { CalendarX, CalendarClock } from 'lucide-react';

export const ExpiryBadge: React.FC<{ expiryDate: string | null; isExpired: boolean; isExpiringSoon: boolean }> = ({
  expiryDate,
  isExpired,
  isExpiringSoon,
}) => {
  if (!expiryDate) {
    return <span className="text-gray-300 text-xs">—</span>;
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <CalendarX size={10} />
        Expired · {expiryDate}
      </span>
    );
  }

  if (isExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
        <CalendarClock size={10} />
        Soon · {expiryDate}
      </span>
    );
  }

  return (
    <span className="text-gray-400 text-xs tabular-nums">{expiryDate}</span>
  );
};