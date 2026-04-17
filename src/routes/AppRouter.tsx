// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import SessionWarning from '../components/common/SessionWarning';
import Home from '../pages/Home.tsx';
import Login from '../pages/auth/Login.tsx';
import AdminDashboard from '../pages/admin/AdminDashboard.tsx';
import SalesPortal from '@/pages/sales/SalesPortal';

const AppRouter: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <SessionWarning />

            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />

                <Route
                    path="/login/:role"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />

                {/* Protected portals */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
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

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRouter;