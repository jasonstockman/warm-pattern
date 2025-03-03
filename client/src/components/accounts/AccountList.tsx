import React from 'react';
import { Account } from '../../types/account';
import AccountCard from './AccountCard';
import Loader from '../ui/Loader';
import Alert from '../ui/Alert';

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  emptyMessage?: string;
  className?: string;
}

const AccountList: React.FC<AccountListProps> = ({
  accounts,
  isLoading,
  error,
  emptyMessage = 'No accounts found.',
  className = '',
}) => {
  if (isLoading) {
    return <Loader label="Loading accounts..." />;
  }
  
  if (error) {
    return <Alert variant="danger" message={error} />;
  }
  
  if (accounts.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }
  
  // Group accounts by type
  const groupedAccounts: Record<string, Account[]> = accounts.reduce(
    (groups, account) => {
      const type = account.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(account);
      return groups;
    },
    {} as Record<string, Account[]>
  );
  
  // Get total balance across all accounts
  const totalBalance = accounts.reduce(
    (total, account) => total + account.current_balance,
    0
  );
  
  // Format balance with currency symbol and 2 decimal places
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format account type for display
  const formatAccountType = (type: string): string => {
    switch (type) {
      case 'depository':
        return 'Bank Accounts';
      case 'credit':
        return 'Credit Cards';
      case 'loan':
        return 'Loans';
      case 'investment':
        return 'Investments';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className={`account-list ${className}`}>
      <div className="account-list-header">
        <h2>Your Accounts</h2>
        <div className="total-balance">
          <span>Total Balance:</span> {formatCurrency(totalBalance)}
        </div>
      </div>
      
      {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
        <div key={type} className="account-group">
          <h3 className="account-group-title">{formatAccountType(type)}</h3>
          <div className="account-grid">
            {typeAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountList; 