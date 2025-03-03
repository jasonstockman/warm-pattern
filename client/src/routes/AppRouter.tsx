import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts';

// Import pages (to be created)
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import AccountsPage from '../pages/AccountsPage';
import AccountDetailPage from '../pages/AccountDetailPage';
import TransactionsPage from '../pages/TransactionsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import AuthDebugPage from '../pages/AuthDebugPage';

// Protected route wrapper component
const ProtectedRoute: React.FC = () => {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const isLoading = auth.isLoading;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute: React.FC = () => {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const isLoading = auth.isLoading;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Main router component
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth-debug" element={<AuthDebugPage />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 