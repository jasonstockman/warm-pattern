import React, { useState, useMemo } from 'react';
import { 
  useTransactionSelector, 
  useLoadUserTransactions,
  useTransactionActions
} from '../store';
import { UserId, Transaction } from '../types';
import { Card, Button } from './ui';

interface Props {
  userId: UserId;
}

/**
 * TransactionList component displays a list of transactions for a user
 * with filtering capabilities
 */
export const TransactionList: React.FC<Props> = ({ userId }) => {
  const { loading, error } = useLoadUserTransactions(userId);
  
  // Use individual selectors for transactions and filters
  const transactions = useTransactionSelector(state => state.transactions);
  const filters = useTransactionSelector(state => state.filters);
  const { setFilters, resetFilters } = useTransactionActions();
  
  // Use useMemo to convert transactions record to array for rendering
  const transactionArray = useMemo(() => {
    return Object.values(transactions);
  }, [transactions]);
  
  const [amountFilter, setAmountFilter] = useState<string>(
    filters.minAmount ? filters.minAmount.toString() : ''
  );
  
  const handleFilterChange = () => {
    const minAmount = amountFilter ? parseFloat(amountFilter) : undefined;
    setFilters({ ...filters, minAmount });
  };
  
  const handleResetFilters = () => {
    resetFilters();
    setAmountFilter('');
  };
  
  if (loading) {
    return (
      <Card>
        <div className="card-header">
          <h2>Transactions</h2>
        </div>
        <div className="card-body">
          <p>Loading transactions...</p>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <div className="card-header">
          <h2>Transactions</h2>
        </div>
        <div className="card-body">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Transactions</h2>
          <div className="flex space-x-2 items-center">
            <input
              type="number"
              placeholder="Min Amount"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <Button onClick={handleFilterChange} variant="primary" size="sm">
              Apply Filter
            </Button>
            <Button onClick={handleResetFilters} variant="secondary" size="sm">
              Reset
            </Button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {transactionArray.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div className="space-y-4">
            {transactionArray.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const amount = parseFloat(transaction.amount.toString());
  const isNegative = amount < 0;
  
  return (
    <div className="p-3 border rounded shadow-sm hover:bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{transaction.name}</h3>
          <p className="text-sm text-gray-600">{transaction.date}</p>
        </div>
        <div className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
          {isNegative ? '-' : '+'}${Math.abs(amount).toFixed(2)}
        </div>
      </div>
      {transaction.category && (
        <div className="mt-1">
          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
            {transaction.category}
          </span>
        </div>
      )}
    </div>
  );
}; 