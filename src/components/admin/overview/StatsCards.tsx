import React from 'react';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
    totalProducts: number;
    todaySales: number;
    todayTransactions: number;
    lowStockCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
                                                   totalProducts,
                                                   todaySales,
                                                   todayTransactions,
                                                   lowStockCount,
                                               }) => {
    const cards = [
        {
            label:   'Total Products',
            value:   totalProducts,
            icon:    <Package className="w-10 h-10 text-blue-200" />,
            gradient: 'from-blue-500 to-blue-600',
            textMuted: 'text-blue-100',
        },
        {
            label:   "Today's Sales",
            value:   `GH₵${todaySales.toFixed(2)}`,
            icon:    <DollarSign className="w-10 h-10 text-green-200" />,
            gradient: 'from-green-500 to-green-600',
            textMuted: 'text-green-100',
        },
        {
            label:   "Today's Transactions",
            value:   todayTransactions,
            icon:    <TrendingUp className="w-10 h-10 text-purple-200" />,
            gradient: 'from-purple-500 to-purple-600',
            textMuted: 'text-purple-100',
        },
        {
            label:   'Low Stock Items',
            value:   lowStockCount,
            icon:    <AlertTriangle className={`w-10 h-10 ${lowStockCount > 0 ? 'text-red-200' : 'text-gray-200'}`} />,
            gradient: lowStockCount > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600',
            textMuted: lowStockCount > 0 ? 'text-red-100' : 'text-gray-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${card.textMuted} text-sm`}>{card.label}</p>
                            <p className="text-3xl font-bold mt-1">{card.value}</p>
                        </div>
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;