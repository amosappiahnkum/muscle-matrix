import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import AdminSidebar        from './AdminSidebar';
import AdminHeader         from './AdminHeader';
import OverviewTab         from './overview/OverviewTab';
import EmployeeManagement  from './EmployeeManagement';
import ProductManagement   from './ProductManagement';
import SalesReport         from './SalesReport';
import TransactionHistory  from './TransactionHistory';
import BackupRestore       from './BackupRestore';
import ChangeAdminCredentials from './ChangeAdminCredentials';

// Exported so sibling components (QuickActions, AdminSidebar) can import it
export type TabType =
    | 'overview'
    | 'employees'
    | 'products'
    | 'reports'
    | 'transactions'
    | 'backup'
    | 'credentials';

const AdminDashboard: React.FC = () => {
  const navigate              = useNavigate();
  const { user, logout }      = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':    return <EmployeeManagement />;
      case 'products':     return <ProductManagement />;
      case 'reports':      return <SalesReport />;
      case 'transactions': return <TransactionHistory />;
      case 'backup':       return <BackupRestore />;
      case 'credentials':  return <ChangeAdminCredentials />;
      default:             return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
      <div className="min-h-screen bg-gray-900 flex">
        <AdminSidebar
            activeTab={activeTab}
            open={sidebarOpen}
            user={user}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto flex flex-col min-h-screen">
          <AdminHeader
              activeTab={activeTab}
              username={user?.username ?? ''}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
          <div className="p-6 flex-1">
            {renderContent()}
          </div>
        </main>
      </div>
  );
};

export default AdminDashboard;