import React from 'react';
import { useUser } from '../../contexts';

const DashboardSummary: React.FC = () => {
  const { 
    accounts, 
    transactions, 
    assets,
    isLoadingAccounts,
    isLoadingTransactions,
    isLoadingAssets,
    errors
  } = useUser();

  // Calculate total balances
  const totalBalance = accounts.reduce((sum, account) => 
    sum + (account.current_balance || 0), 0);
  
  const totalAssets = assets.reduce((sum, asset) => 
    sum + (asset.value || 0), 0);
  
  // Calculate net worth
  const netWorth = totalBalance + totalAssets;
  
  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const isLoading = isLoadingAccounts || isLoadingTransactions || isLoadingAssets;
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-summary loading">
        <p>Loading your financial overview...</p>
      </div>
    );
  }
  
  // Show error state if any errors exist
  if (errors.accounts || errors.transactions || errors.assets) {
    return (
      <div className="dashboard-summary error">
        <h2>Dashboard Summary</h2>
        <div className="error-message">
          {errors.accounts || errors.transactions || errors.assets}
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-summary">
      <h2>Financial Overview</h2>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Bank Accounts</h3>
          <div className="card-value">{formatCurrency(totalBalance)}</div>
          <div className="card-meta">{accounts.length} accounts</div>
        </div>
        
        <div className="summary-card">
          <h3>Assets</h3>
          <div className="card-value">{formatCurrency(totalAssets)}</div>
          <div className="card-meta">{assets.length} assets</div>
        </div>
        
        <div className="summary-card">
          <h3>Net Worth</h3>
          <div className="card-value">{formatCurrency(netWorth)}</div>
          <div className="card-meta">Total financial value</div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Transactions</h3>
        
        {recentTransactions.length > 0 ? (
          <ul className="transaction-list">
            {recentTransactions.map(transaction => (
              <li key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-name">{transaction.name}</div>
                  <div className="transaction-date">{transaction.date}</div>
                </div>
                <div className={`transaction-amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-transactions">No recent transactions</p>
        )}
      </div>
    </div>
  );
};

export default DashboardSummary; 