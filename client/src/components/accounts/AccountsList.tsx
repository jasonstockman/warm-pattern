import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts';
import { Account } from '../../types/account';

const AccountsList: React.FC = () => {
  const { accounts, isLoadingAccounts, errors } = useUser();
  
  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Group accounts by type
  const accountsByType = accounts.reduce((grouped, account) => {
    const type = account.type || 'other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(account);
    return grouped;
  }, {} as Record<string, Account[]>);
  
  // Show loading state
  if (isLoadingAccounts) {
    return (
      <div className="accounts-loading">
        <p>Loading your accounts...</p>
      </div>
    );
  }
  
  // Show error state
  if (errors.accounts) {
    return (
      <div className="accounts-error">
        <h2>Accounts</h2>
        <div className="error-message">{errors.accounts}</div>
      </div>
    );
  }
  
  // Show empty state
  if (accounts.length === 0) {
    return (
      <div className="accounts-empty">
        <h2>Accounts</h2>
        <p>You haven't connected any bank accounts yet.</p>
      </div>
    );
  }
  
  return (
    <div className="accounts-list">
      <h2>Your Accounts</h2>
      
      {Object.entries(accountsByType).map(([type, typeAccounts]) => (
        <div key={type} className="account-group">
          <h3 className="account-type-heading">
            {type.charAt(0).toUpperCase() + type.slice(1)} Accounts
          </h3>
          
          <div className="account-cards">
            {typeAccounts.map(account => (
              <Link 
                key={account.id} 
                to={`/accounts/${account.id}`}
                className="account-card"
              >
                <div className="account-info">
                  <h4 className="account-name">{account.name}</h4>
                  <div className="account-mask">
                    {account.mask ? `•••• ${account.mask}` : ''}
                  </div>
                  <div className="account-subtype">
                    {account.subtype && account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
                  </div>
                </div>
                
                <div className="account-balance">
                  <div className="balance-current">
                    {formatCurrency(account.current_balance || 0)}
                  </div>
                  {account.available_balance !== undefined && (
                    <div className="balance-available">
                      <small>Available: {formatCurrency(account.available_balance)}</small>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountsList; 