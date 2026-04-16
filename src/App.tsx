// Main App Component - MUSCLE MATRIX Sales Management System

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import SalesPortal from './components/sales/SalesPortal';
import { initializeDatabase } from './utils/database';

type AppView = 'home' | 'admin-login' | 'wholesale-login' | 'retail-login' | 'admin-dashboard' | 'wholesale-portal' | 'retail-portal';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('home');

  useEffect(() => {
    initializeDatabase();
  }, []);

  // Handle view changes based on authentication
  useEffect(() => {
    if (!isAuthenticated) {
      // If logged out and was in a protected view, go home
      if (['admin-dashboard', 'wholesale-portal', 'retail-portal'].includes(currentView)) {
        setCurrentView('home');
      }
    }
  }, [isAuthenticated, currentView]);

  const handleAdminLoginSuccess = () => {
    setCurrentView('admin-dashboard');
  };

  const handleWholesaleLoginSuccess = () => {
    setCurrentView('wholesale-portal');
  };

  const handleRetailLoginSuccess = () => {
    setCurrentView('retail-portal');
  };

  const handleLogout = () => {
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'admin-login':
        return (
          <Login 
            portalType="admin" 
            onSuccess={handleAdminLoginSuccess}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'wholesale-login':
        return (
          <Login 
            portalType="wholesale" 
            onSuccess={handleWholesaleLoginSuccess}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'retail-login':
        return (
          <Login 
            portalType="retail" 
            onSuccess={handleRetailLoginSuccess}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'admin-dashboard':
        if (!isAuthenticated || user?.role !== 'admin') {
          setCurrentView('admin-login');
          return null;
        }
        return <AdminDashboard onLogout={handleLogout} />;
      
      case 'wholesale-portal':
        if (!isAuthenticated || (user?.role !== 'wholesale' && user?.role !== 'admin')) {
          setCurrentView('wholesale-login');
          return null;
        }
        return <SalesPortal type="wholesale" onLogout={handleLogout} />;
      
      case 'retail-portal':
        if (!isAuthenticated || (user?.role !== 'retail' && user?.role !== 'admin')) {
          setCurrentView('retail-login');
          return null;
        }
        return <SalesPortal type="retail" onLogout={handleLogout} />;
      
      default:
        return (
          <Home 
            onAdminLogin={() => setCurrentView('admin-login')}
            onWholesaleLogin={() => setCurrentView('wholesale-login')}
            onRetailLogin={() => setCurrentView('retail-login')}
          />
        );
    }
  };

  return <>{renderView()}</>;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
