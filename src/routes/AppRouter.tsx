import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from '../context/AuthContext';
import ProtectedRoute     from './ProtectedRoute';
import GuestRoute         from './GuestRoute';
import SessionWarning     from '../components/common/SessionWarning';

import Home               from '../pages/Home';
import Login              from '../pages/auth/Login';
import AdminDashboard     from '../pages/admin/AdminDashboard';
import SalesPortal        from '../pages/sales/SalesPortal';

import OverviewTab            from '../pages/admin/overview/OverviewTab';
import EmployeeManagement     from '../pages/admin/employees/index';
import ProductManagement      from '../pages/products';
import InventoryLog           from '../pages/admin/inventory/index';
import ExpensesPage           from '../pages/admin/expenses/index';
import SalesReport            from '../pages/admin/salesReport/index';
import TransactionHistory     from '../pages/admin/transactions/index';
import BackupRestore          from '../pages/admin/backup/BackupRestore';
import ChangeAdminCredentials from '../pages/admin/ChangeAdminCredentials';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard>{children}</AdminDashboard>
  </ProtectedRoute>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <SessionWarning />
      <Routes>

        {/* ── Public ───────────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />

        {/* ── Auth ─────────────────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route path="/admin" element={<AdminRoute><OverviewTab /></AdminRoute>} />
        <Route path="/admin/employees"   element={<AdminRoute><EmployeeManagement /></AdminRoute>} />
        <Route path="/admin/products"    element={<AdminRoute><ProductManagement /></AdminRoute>} />
        <Route path="/admin/inventory"   element={<AdminRoute><InventoryLog /></AdminRoute>} />
        <Route path="/admin/expenses"    element={<AdminRoute><ExpensesPage /></AdminRoute>} />
        <Route path="/admin/reports"     element={<AdminRoute><SalesReport /></AdminRoute>} />
        <Route path="/admin/transactions" element={<AdminRoute><TransactionHistory /></AdminRoute>} />
        <Route path="/admin/backup"      element={<AdminRoute><BackupRestore /></AdminRoute>} />
        <Route path="/admin/credentials" element={<AdminRoute><ChangeAdminCredentials /></AdminRoute>} />

        {/* ── Sales portals ────────────────────────────────────────── */}
        <Route
          path="/wholesale"
          element={
            <ProtectedRoute requiredRole="wholesale">
              <SalesPortal type="wholesale" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retail"
          element={
            <ProtectedRoute requiredRole="retail">
              <SalesPortal type="retail" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;
