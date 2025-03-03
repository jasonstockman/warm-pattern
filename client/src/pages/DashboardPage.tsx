import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import AccountsList from '../components/accounts/AccountsList';
import TransactionsList from '../components/transactions/TransactionsList';
import AssetsList from '../components/assets/AssetsList';

const DashboardPage: React.FC = () => {
  const auth = useAuth();
  const user = auth.user;
  const isAuthenticated = auth.isAuthenticated;
  
  const userContext = useUser();
  const accounts = userContext.accounts;
  const transactions = userContext.transactions;
  const assets = userContext.assets;
  const isLoadingItems = userContext.isLoadingItems;
  const isLoadingAccounts = userContext.isLoadingAccounts;
  const isLoadingTransactions = userContext.isLoadingTransactions;
  const isLoadingAssets = userContext.isLoadingAssets;
  const errors = userContext.errors;
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  
  // Redirect to auth page if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  const isLoading = isLoadingItems || isLoadingAccounts || isLoadingTransactions || isLoadingAssets;
  const error = errors?.accounts || errors?.transactions || errors?.assets || errors?.items;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <DashboardSummary />;
      case 'accounts':
        return <AccountsList />;
      case 'transactions':
        return <TransactionsList />;
      case 'assets':
        return <AssetsList />;
      default:
        return <div>Select a tab to view your financial information</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="primary-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p>Welcome back, {user?.username || 'User'}!</p>
      </header>

      <nav className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Accounts
        </button>
        <button 
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab-button ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
      </nav>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardPage; 