import React from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../../types/account';
import Card from '../ui/Card';

interface AccountCardProps {
  account: Account;
  className?: string;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, className = '' }) => {
  // Format balance with currency symbol and 2 decimal places
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get the appropriate icon based on account type
  const getAccountIcon = (type: string, subtype: string): string => {
    if (type === 'credit') return '💳';
    if (type === 'investment') return '📈';
    if (subtype === 'checking') return '🏦';
    if (subtype === 'savings') return '💰';
    return '🏦';
  };
  
  // Get appropriate CSS class based on account type
  const getAccountTypeClass = (type: string): string => {
    switch (type) {
      case 'depository': return 'account-depository';
      case 'credit': return 'account-credit';
      case 'loan': return 'account-loan';
      case 'investment': return 'account-investment';
      default: return '';
    }
  };
  
  const accountIcon = getAccountIcon(account.type, account.subtype);
  const accountTypeClass = getAccountTypeClass(account.type);
  
  return (
    <Card 
      className={`account-card ${accountTypeClass} ${className}`}
      title={
        <div className="account-title">
          <span className="account-icon">{accountIcon}</span>
          <span>{account.name}</span>
          {account.mask && <span className="account-mask">•••• {account.mask}</span>}
        </div>
      }
    >
      <div className="account-details">
        <div className="account-balance">
          <div className="balance-label">Current Balance</div>
          <div className="balance-amount">{formatCurrency(account.current_balance)}</div>
          
          {account.available_balance !== undefined && (
            <div className="available-balance">
              <span>Available:</span> {formatCurrency(account.available_balance)}
            </div>
          )}
        </div>
        
        <div className="account-meta">
          <div className="account-type">
            <span className="meta-label">Type:</span>
            <span className="meta-value">
              {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
            </span>
          </div>
        </div>
        
        <Link to={`/accounts/${account.id}`} className="account-link">
          View Details
        </Link>
      </div>
    </Card>
  );
};

export default AccountCard; 