import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { getTransactionsByAccountId } from '../../services/api';

interface Transaction {
  id: string;
  account_id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category: string[];
}

interface AccountTransactionsViewProps {
  accountId: string;
  accountName?: string;
}

const AccountTransactionsView: React.FC<AccountTransactionsViewProps> = ({ 
  accountId,
  accountName = 'Account' 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [amountFilter, setAmountFilter] = useState<string>('all');
  const [categoryFilter, setcategoryFilter] = useState<string>('all');
  
  const pageSize = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await getTransactionsByAccountId(Number(accountId));
        if (response.status === 200) {
          setTransactions(response.data);
          setError(null);
        } else {
          setError(response.data.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId]);

  // Calculate total amounts
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    // Date filter
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      
      if (dateFilter === '30days' && transactionDate < thirtyDaysAgo) {
        return false;
      }
      if (dateFilter === '90days' && transactionDate < ninetyDaysAgo) {
        return false;
      }
    }

    // Amount filter
    if (amountFilter !== 'all') {
      const amount = Math.abs(transaction.amount);
      if (amountFilter === 'under50' && amount >= 50) {
        return false;
      }
      if (amountFilter === '50to100' && (amount < 50 || amount > 100)) {
        return false;
      }
      if (amountFilter === '100to500' && (amount < 100 || amount > 500)) {
        return false;
      }
      if (amountFilter === 'over500' && amount <= 500) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter !== 'all' && !transaction.category?.includes(categoryFilter)) {
      return false;
    }

    return true;
  });

  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      transactions
        .flatMap(transaction => transaction.category || [])
        .filter(Boolean)
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="account-transactions">
      <div className="page-header mb-6">
        <h1 className="page-title text-2xl font-bold">{accountName} Transactions</h1>
        <p className="page-description text-gray-600">
          {filteredTransactions.length} transactions found
        </p>
      </div>

      <div className="summary-cards mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold">Total Income</h3>
          </div>
          <div className="card-body">
            <p className="text-2xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold">Total Expenses</h3>
          </div>
          <div className="card-body">
            <p className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold">Net</h3>
          </div>
          <div className="card-body">
            <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpenses).toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      <div className="filters mb-6">
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold">Filter Transactions</h3>
          </div>
          <div className="card-body">
            <div className="filter-controls grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="filter-group">
                <label className="mb-2 block font-medium">Date Range</label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="mb-2 block font-medium">Amount</label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={amountFilter}
                  onChange={(e) => {
                    setAmountFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Amounts</option>
                  <option value="under50">Under $50</option>
                  <option value="50to100">$50 - $100</option>
                  <option value="100to500">$100 - $500</option>
                  <option value="over500">Over $500</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="mb-2 block font-medium">Category</label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={categoryFilter}
                  onChange={(e) => {
                    setcategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="empty-state py-8 text-center">
          <p className="mb-2 text-lg font-semibold">No Transactions Found</p>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {!loading && !error && filteredTransactions.length > 0 && (
        <>
          <div className="transactions-table-container mb-6 overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.name}
                      {transaction.pending && (
                        <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.category?.[0] || 'Uncategorized'}
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination mb-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredTransactions.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredTransactions.length}</span> transactions
                </span>
              </div>
              <div className="flex">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`mr-2 ${currentPage === 1 ? 'opacity-50' : ''}`}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`${currentPage === totalPages ? 'opacity-50' : ''}`}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccountTransactionsView; 