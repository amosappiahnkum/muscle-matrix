import React from 'react';

interface StockBadgeProps {
  qty: number;
}

const StockBadge: React.FC<StockBadgeProps> = ({ qty }) => {
  const style =
    qty <= 10 ? 'bg-red-50 text-red-600 border border-red-200' :
    qty <= 50 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-green-50 text-green-700 border border-green-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {qty}
    </span>
  );
};

export default StockBadge;