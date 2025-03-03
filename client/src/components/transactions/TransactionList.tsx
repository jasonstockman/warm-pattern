import React, { useState } from 'react';
import { Transaction } from '../../types/account';
import Loader from '../ui/Loader';
import Alert from '../ui/Alert';
import Card from '../ui/Card';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  emptyMessage?: string;
  className?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  error,
  emptyMessage = 'No transactions found.',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  if (isLoading) {
    return <Loader label="Loading transactions..." />;
  }
  
  if (error) {
    return <Alert variant="danger" message={error} />;
  }
  
  if (transactions.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }
  
  // Filter transactions based on search query
  const filteredTransactions = searchQuery
    ? transactions.filter(transaction => 
        transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.category && transaction.category.some(cat => 
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : transactions;
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = sortedTransactions.reduce(
    (groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, Transaction[]>
  );
  
  // Get paginated groups of transactions
  const groupDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  const totalPages = Math.ceil(groupDates.length / itemsPerPage);
  
  const paginatedDates = groupDates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Format currency with symbol and 2 decimal places
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <div className={`transaction-list ${className}`}>
      <div className="transaction-list-header">
        <h2>Transactions</h2>
        <div className="transaction-search">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>
      
      {paginatedDates.map(date => (
        <Card key={date} className="transaction-group">
          <h3 className="transaction-date">{formatDate(date)}</h3>
          <div className="transaction-items">
            {groupedTransactions[date].map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-details">
                  <div className="transaction-name">{transaction.name}</div>
                  {transaction.category && (
                    <div className="transaction-category">
                      {transaction.category.join(' • ')}
                    </div>
                  )}
                </div>
                <div className={`transaction-amount ${transaction.amount < 0 ? 'negative' : ''}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-prev" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-next" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList; 