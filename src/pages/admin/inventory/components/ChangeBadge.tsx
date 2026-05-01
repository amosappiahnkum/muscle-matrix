import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const ChangeBadge: React.FC<{ change: number }> = ({ change }) => {
  const pos = change > 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${pos ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
      {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {pos ? '+' : ''}{change}
    </span>
  );
};