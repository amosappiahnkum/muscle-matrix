// Admin Dashboard Component - Main Admin Interface

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Package, 
  BarChart3, 
  LogOut, 
  Dumbbell,
  AlertTriangle,
  Download,
  FileText,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  KeyRound,
  Zap
} from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';
import ProductManagement from './ProductManagement';
import SalesReport from './SalesReport';
import TransactionHistory from './TransactionHistory';
import BackupRestore from './BackupRestore';
import ChangeAdminCredentials from './ChangeAdminCredentials';
import { getProducts, getLowStockProducts, getDailySalesReport } from '../../utils/database';
import { format } from 'date-fns';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'employees' | 'products' | 'reports' | 'transactions' | 'backup' | 'credentials';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    todaySales: 0,
    todayTransactions: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const loadStats = () => {
    const products = getProducts();
    const lowStock = getLowStockProducts(10);
    const today = format(new Date(), 'yyyy-MM-dd');
    const dailyReport = getDailySalesReport(today);

    setStats({
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      todaySales: dailyReport.totalSales,
      todayTransactions: dailyReport.transactionCount,
    });
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'reports', label: 'Sales Reports', icon: FileText },
    { id: 'transactions', label: 'Transactions', icon: ShoppingCart },
    { id: 'backup', label: 'Backup & Restore', icon: Download },
    { id: 'credentials', label: 'Change Credentials', icon: KeyRound },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeManagement />;
      case 'products':
        return <ProductManagement />;
      case 'reports':
        return <SalesReport />;
      case 'transactions':
        return <TransactionHistory />;
      case 'backup':
        return <BackupRestore />;
      case 'credentials':
        return <ChangeAdminCredentials />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    const lowStockProducts = getLowStockProducts(10);
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Products</p>
                <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
              </div>
              <Package className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Today's Sales</p>
                <p className="text-3xl font-bold mt-1">GH₵{stats.todaySales.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Today's Transactions</p>
                <p className="text-3xl font-bold mt-1">{stats.todayTransactions}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </div>

          <div className={`bg-gradient-to-br ${stats.lowStockCount > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'} rounded-xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${stats.lowStockCount > 0 ? 'text-red-100' : 'text-gray-100'} text-sm`}>Low Stock Items</p>
                <p className="text-3xl font-bold mt-1">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className={`w-10 h-10 ${stats.lowStockCount > 0 ? 'text-red-200' : 'text-gray-200'}`} />
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-400">Low Stock Alert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.map(product => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-white">{product.name}</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('employees')}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors"
            >
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <span className="text-white text-sm">Manage Employees</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors"
            >
              <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <span className="text-white text-sm">Manage Products</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <span className="text-white text-sm">View Reports</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors"
            >
              <Download className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <span className="text-white text-sm">Backup Data</span>
            </button>
          </div>
        </div>

        {/* Change Credentials Quick Access */}
        <div
          onClick={() => setActiveTab('credentials')}
          className="bg-gradient-to-r from-purple-600/10 to-purple-800/10 border border-purple-600/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-purple-500/50 transition-colors"
        >
          <div className="bg-purple-600/20 p-3 rounded-lg">
            <KeyRound className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Change Admin Name &amp; Password</p>
            <p className="text-gray-400 text-sm">Update your admin login credentials securely</p>
          </div>
          <span className="text-purple-400 text-sm font-medium">Update →</span>
        </div>
      </div>
    );
  };

  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'overview': return 'Dashboard Overview';
      case 'employees': return 'Employee Management';
      case 'products': return 'Product Management';
      case 'reports': return 'Sales Reports';
      case 'transactions': return 'Transaction History';
      case 'backup': return 'Backup & Restore';
      case 'credentials': return 'Change Admin Credentials';
      default: return tab;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-white font-black text-sm tracking-wider">MUSCLE MATRIX</h1>
                <p className="text-gray-400 text-xs">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? item.id === 'credentials'
                    ? 'bg-purple-600 text-white'
                    : 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-700">
          {sidebarOpen && (
            <div className="bg-gray-700/50 rounded-lg p-3 mb-2">
              <p className="text-white font-medium text-sm truncate">{user?.username}</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-800/50 border-b border-gray-700 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">
              {getTabLabel(activeTab)}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Welcome back, <span className="text-orange-400 font-medium">{user?.username}</span>! — {format(new Date(), 'EEEE, MMMM dd yyyy')}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-black tracking-wider text-sm">MUSCLE MATRIX</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
