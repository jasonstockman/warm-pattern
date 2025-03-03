import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts';
import { Transaction } from '../../types/account';

interface TransactionsListProps {
  accountId?: number; // Optional: Filter by account
  limit?: number; // Optional: Limit the number of transactions
  showFilters?: boolean; // Optional: Show filter controls
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  accountId,
  limit,
  showFilters = true,
}) => {
  const { transactions, accounts, isLoadingTransactions, errors } = useUser();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>(
    accountId ? [accountId] : []
  );
  
  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date values
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Filter by account ID if provided or selected
    if (accountId) {
      filtered = filtered.filter(transaction => transaction.account_id === accountId);
    } else if (selectedAccountIds.length > 0) {
      filtered = filtered.filter(transaction => 
        selectedAccountIds.includes(transaction.account_id)
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.name.toLowerCase().includes(query) ||
        (transaction.category && transaction.category.some(cat => 
          cat.toLowerCase().includes(query)
        ))
      );
    }
    
    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(dateRange.from)
      );
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(dateRange.to)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply limit if provided
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [
    transactions,
    accountId,
    selectedAccountIds,
    searchQuery,
    dateRange,
    limit
  ]);
  
  // Handle account filter changes
  const handleAccountFilterChange = (id: number) => {
    setSelectedAccountIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(prevId => prevId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return grouped;
  }, [filteredTransactions]);
  
  // Show loading state
  if (isLoadingTransactions) {
    return (
      <div className="transactions-loading">
        <p>Loading your transactions...</p>
      </div>
    );
  }
  
  // Show error state
  if (errors.transactions) {
    return (
      <div className="transactions-error">
        <h2>Transactions</h2>
        <div className="error-message">{errors.transactions}</div>
      </div>
    );
  }
  
  // Show empty state
  if (transactions.length === 0) {
    return (
      <div className="transactions-empty">
        <h2>Transactions</h2>
        <p>No transactions found.</p>
      </div>
    );
  }
  
  // Show filtered empty state
  if (filteredTransactions.length === 0) {
    return (
      <div className="transactions-empty">
        <h2>Transactions</h2>
        <p>No transactions match your filters.</p>
        {showFilters && (
          <button 
            className="clear-filters-button"
            onClick={() => {
              setSearchQuery('');
              setDateRange({ from: '', to: '' });
              setSelectedAccountIds([]);
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="transactions-list">
      <h2>Transactions</h2>
      
      {showFilters && (
        <div className="transactions-filters">
          <div className="filter-row">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="date-filter">
              <input
                type="date"
                placeholder="From"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
              <span>to</span>
              <input
                type="date"
                placeholder="To"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>
          
          {!accountId && (
            <div className="account-filter">
              <div className="account-filter-label">Filter by account:</div>
              <div className="account-filter-options">
                {accounts.map(account => (
                  <label key={account.id} className="account-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedAccountIds.includes(account.id)}
                      onChange={() => handleAccountFilterChange(account.id)}
                    />
                    <span>{account.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="transactions-content">
        {Object.entries(transactionsByDate).map(([date, dateTransactions]) => (
          <div key={date} className="transactions-date-group">
            <h3 className="date-heading">{formatDate(date)}</h3>
            
            <ul className="transactions-items">
              {dateTransactions.map(transaction => {
                // Find the account for this transaction
                const account = accounts.find(a => a.id === transaction.account_id);
                
                return (
                  <li key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-name">{transaction.name}</div>
                      {account && (
                        <div className="transaction-account">
                          <Link to={`/accounts/${account.id}`}>
                            {account.name}
                          </Link>
                        </div>
                      )}
                      {transaction.category && transaction.category.length > 0 && (
                        <div className="transaction-category">
                          {transaction.category.join(' > ')}
                        </div>
                      )}
                    </div>
                    
                    <div className={`transaction-amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList; 