import React from 'react';
import { Package, DollarSign, TrendingUp, AlertTriangle, CalendarX } from 'lucide-react';

interface StatsCardsProps {
  totalProducts:     number;
  todaySales:        number;
  todayTransactions: number;
  lowStockCount:     number;
  expiryProducts:    number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalProducts,
  todaySales,
  todayTransactions,
  lowStockCount,
  expiryProducts,
}) => {
  const cards = [
    {
      label:   'Total Products',
      value:   totalProducts,
      sub:     'In inventory',
      icon:    Package,
      iconBg:  'bg-blue-50 text-blue-400',
    },
    {
      label:   "Today's Sales",
      value:   `GH₵${todaySales.toFixed(2)}`,
      sub:     'Revenue today',
      icon:    DollarSign,
      iconBg:  'bg-green-50 text-green-400',
    },
    {
      label:   'Transactions',
      value:   todayTransactions,
      sub:     'Today',
      icon:    TrendingUp,
      iconBg:  'bg-purple-50 text-purple-400',
    },
    {
      label:   'Low Stock',
      value:   lowStockCount,
      sub:     lowStockCount > 0 ? 'Needs restocking' : 'All good',
      icon:    AlertTriangle,
      iconBg:  lowStockCount > 0 ? 'bg-red-50 text-red-400' : 'bg-gray-50 text-gray-300',
    },
    {
      label:   'Expiring / Expired',
      value:   expiryProducts,
      sub:     expiryProducts > 0 ? 'Needs attention' : 'All valid',
      icon:    CalendarX,
      iconBg:  expiryProducts > 0 ? 'bg-amber-50 text-amber-400' : 'bg-gray-50 text-gray-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 px-4 py-3.5
              shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            {/* Icon + label row */}
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium leading-tight">{card.label}</p>
              <div className={`${card.iconBg} p-1.5 rounded-lg flex-shrink-0 ml-2`}>
                <Icon size={14} />
              </div>
            </div>

            {/* Value */}
            <p className="text-2xl font-bold text-gray-800 leading-none tabular-nums truncate">
              {card.value}
            </p>

            {/* Sub-label */}
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;