import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getProducts, getLowStockProducts, getDailySalesReport } from '@/api/api.ts';
import { Product } from '@/types';
import StatsCards from './StatsCards';
import LowStockAlert from './LowStockAlert';
import QuickActions from './QuickActions';
import { TabType } from '../AdminDashboard';

interface OverviewTabProps {
    onNavigate: (tab: TabType) => void;
}

interface Stats {
    totalProducts: number;
    lowStockCount: number;
    todaySales: number;
    todayTransactions: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        lowStockCount: 0,
        todaySales: 0,
        todayTransactions: 0,
    });
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            const [products, lowStock, dailyReport] = await Promise.all([
                getProducts(),
                getLowStockProducts(10),
                getDailySalesReport(today),
            ]);

            setStats({
                totalProducts:    products.length,
                lowStockCount:    lowStock.length,
                todaySales:       dailyReport.totalSales,
                todayTransactions: dailyReport.transactionCount,
            });
            setLowStockProducts(lowStock);
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500">
                <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading dashboard…
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <StatsCards
                totalProducts={stats.totalProducts}
                todaySales={stats.todaySales}
                todayTransactions={stats.todayTransactions}
                lowStockCount={stats.lowStockCount}
            />
            <LowStockAlert products={lowStockProducts} />
            <QuickActions onNavigate={onNavigate} />
        </div>
    );
};

export default OverviewTab;