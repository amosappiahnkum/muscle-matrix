import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import AdminSidebar from '@/components/admin-layouts/AdminSidebar';
import AdminHeader  from '@/components/admin-layouts/AdminHeader';

export type TabType =
  | 'overview'
  | 'employees'
  | 'products'
  | 'suppliers'
  | 'categories'
  | 'inventory'
  | 'expenses'
  | 'reports'
  | 'transactions'
  | 'backup'
  | 'credentials';
   

// Map routes to tab keys
const routeToTab: Record<string, TabType> = {
  '/admin':             'overview',
  '/admin/employees':   'employees',
  '/admin/products':    'products',
  '/admin/suppliers':   'suppliers',
  '/admin/categories':  'categories',
  '/admin/inventory':   'inventory',
  '/admin/expenses':    'expenses',
  '/admin/reports':     'reports',
  '/admin/transactions':'transactions',
  '/admin/backup':      'backup',
  '/admin/credentials': 'credentials',
};

const tabToRoute: Record<TabType, string> = {
  overview:     '/admin',
  employees:    '/admin/employees',
  products:     '/admin/products',
  suppliers:    '/admin/suppliers',
  categories:   '/admin/categories',
  inventory:    '/admin/inventory',
  expenses:     '/admin/expenses',
  reports:      '/admin/reports',
  transactions: '/admin/transactions',
  backup:       '/admin/backup',
  credentials:  '/admin/credentials',
};

interface AdminDashboardProps {
  children: React.ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const navigate         = useNavigate();
  const location         = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeTab: TabType = routeToTab[location.pathname] ?? 'overview';

  const handleTabChange = (tab: TabType) => navigate(tabToRoute[tab]);
  const handleLogout    = async () => { await logout(); navigate('/', { replace: true }); };

  return (
<div className="min-h-screen bg-stone-100 flex">
          <AdminSidebar
        activeTab={activeTab}
        open={sidebarOpen}
        user={user}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      {/* Offset main content by sidebar width so fixed sidebar doesn't overlap it */}
      <main className={`flex-1 flex flex-col min-h-screen overflow-auto transition-all duration-300
        ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader
          activeTab={activeTab}
          username={user?.username ?? ''}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
