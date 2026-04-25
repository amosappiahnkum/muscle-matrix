import React from 'react';

export const StockLevel: React.FC<{ qty: number }> = ({ qty }) => {
  const style =
    qty <= 10 ? 'bg-red-50 text-red-600 border-red-200' :
    qty <= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-green-50 text-green-700 border-green-200';
  const label = qty <= 10 ? 'Low' : qty <= 50 ? 'Medium' : 'Good';
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-bold tabular-nums ${
        qty <= 10 ? 'text-red-600' : qty <= 50 ? 'text-yellow-700' : 'text-green-700'
      }`}>
        {qty}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style}`}>
        {label}
      </span>
    </div>
  );
};