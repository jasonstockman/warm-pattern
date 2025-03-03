import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { getAccountsByUserId } from '../../services/api';
import { createId } from '../../types/branded';

interface Account {
  id: string;
  item_id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  current_balance: number;
  available_balance: number;
}

interface AccountsManagementProps {
  userId: number;
}

const AccountsManagement: React.FC<AccountsManagementProps> = ({ userId }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await getAccountsByUserId(userId);
        if (response.status === 200) {
          setAccounts(response.data);
          setError(null);
        } else {
          setError(response.data.error || 'Failed to fetch accounts');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [userId]);

  const filteredAccounts = accounts.filter(account => {
    if (filter === 'all') return true;
    return account.type === filter;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'balance') {
      return b.current_balance - a.current_balance;
    }
    return 0;
  });

  const accountTypes = [
    { value: 'all', label: 'All Accounts' },
    { value: 'depository', label: 'Depository' },
    { value: 'credit', label: 'Credit' },
    { value: 'loan', label: 'Loan' },
    { value: 'investment', label: 'Investment' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Account Name' },
    { value: 'balance', label: 'Balance' },
  ];

  return (
    <div className="accounts-management">
      <div className="filter-controls mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="filter-group">
          <label htmlFor="account-type-filter" className="mr-2 font-medium">
            Account Type:
          </label>
          <select
            id="account-type-filter"
            className="rounded border border-gray-300 p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {accountTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-group">
          <label htmlFor="sort-by" className="mr-2 font-medium">
            Sort By:
          </label>
          <select
            id="sort-by"
            className="rounded border border-gray-300 p-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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

      {!loading && !error && sortedAccounts.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-6 text-center text-yellow-700">
          <p className="mb-2 text-lg font-medium">No accounts found</p>
          <p>You don't have any linked accounts yet.</p>
        </div>
      )}

      <div className="accounts-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedAccounts.map((account) => (
          <Card key={account.id} className="account-card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-medium">{account.name}</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {account.type} - {account.subtype}
              </span>
            </div>
            <div className="card-body">
              <div className="mb-4 mt-2">
                <p className="text-sm text-gray-500">Account ending in **** {account.mask}</p>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${account.current_balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-xl font-bold text-green-600">
                    ${account.available_balance.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => window.location.href = `/accounts/${account.id}/transactions`}
              >
                View Transactions
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountsManagement; 