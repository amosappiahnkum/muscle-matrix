import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getProducts, getLowStockProducts, getDailySalesReport } from '@/api/api';
import { Product } from '@/types';
import StatsCards    from './StatsCards';
import LowStockAlert from './LowStockAlert';
import SalesBarChart from './SalesBarChart';
import GymHeroBanner from './GymHeroBanner';
import { TabType }   from '../AdminDashboard';

interface OverviewTabProps {
  onNavigate: (tab: TabType) => void;
}

interface Stats {
  totalProducts:     number;
  lowStockCount:     number;
  todaySales:        number;
  todayTransactions: number;
  expiryProducts:    number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats>({
    totalProducts:     0,
    lowStockCount:     0,
    todaySales:        0,
    todayTransactions: 0,
    expiryProducts:    0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const [products, lowStock, dailyReport] = await Promise.all([
        getProducts(),
        getLowStockProducts(10),
        getDailySalesReport(today),
      ]);

      const expiryProducts = products.filter(
        (p) => p.isExpired || p.isExpiringSoon
      ).length;

      setStats({
        totalProducts:     products.length,
        lowStockCount:     lowStock.length,
        todaySales:        dailyReport.totalSales,
        todayTransactions: dailyReport.transactionCount,
        expiryProducts,
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
      <div className="flex items-center justify-center gap-3 py-16 text-gray-400 text-sm">
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Banner + overlapping stat cards */}
      <div className="relative">
        <GymHeroBanner storeName="Muscle Matrix" />

        {/* Cards pulled up to sit on the banner's bottom edge */}
        <div className="relative -mt-10 z-10 px-4">
          <StatsCards
            totalProducts={stats.totalProducts}
            todaySales={stats.todaySales}
            todayTransactions={stats.todayTransactions}
            lowStockCount={stats.lowStockCount}
            expiryProducts={stats.expiryProducts}
          />
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SalesBarChart />

        <LowStockAlert products={lowStockProducts} />
      </div>

    </div>
  );
};

export default OverviewTab;