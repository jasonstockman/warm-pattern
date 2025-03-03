import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { getAccountsByItemId, getTransactionsByItemId } from '../../services/api';

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

interface Transaction {
  id: string;
  account_id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category: string[];
}

interface ItemDetailViewProps {
  itemId: number;
  institutionName: string;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({ itemId, institutionName }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [showTransactions, setShowTransactions] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch accounts for this item
        const accountsResponse = await getAccountsByItemId(itemId);
        if (accountsResponse.status === 200) {
          setAccounts(accountsResponse.data);
        } else {
          throw new Error(accountsResponse.data.error || 'Failed to fetch accounts');
        }

        // Fetch transactions for this item
        const transactionsResponse = await getTransactionsByItemId(itemId);
        if (transactionsResponse.status === 200) {
          setTransactions(transactionsResponse.data);
        } else {
          throw new Error(transactionsResponse.data.error || 'Failed to fetch transactions');
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  // Get recent transactions (last 10)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Calculate total balances
  const totalCurrentBalance = accounts.reduce(
    (sum, account) => sum + account.current_balance,
    0
  );
  const totalAvailableBalance = accounts.reduce(
    (sum, account) => sum + account.available_balance,
    0
  );

  return (
    <div className="item-detail">
      <div className="item-header mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{institutionName}</h2>
        <p className="text-gray-600">
          Connected accounts: {accounts.length} · Transactions: {transactions.length}
        </p>
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

      {!loading && !error && (
        <>
          <div className="summary-cards mb-6 grid gap-4 md:grid-cols-2">
            <Card className="balance-card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Current Balance</h3>
              </div>
              <div className="card-body">
                <p className="text-3xl font-bold text-blue-600">
                  ${totalCurrentBalance.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Total across {accounts.length} accounts
                </p>
              </div>
            </Card>

            <Card className="balance-card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Available Balance</h3>
              </div>
              <div className="card-body">
                <p className="text-3xl font-bold text-green-600">
                  ${totalAvailableBalance.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Total available funds
                </p>
              </div>
            </Card>
          </div>

          <div className="tabs mb-4 border-b">
            <div className="flex">
              <button
                className={`mr-4 border-b-2 px-4 py-2 ${
                  activeTab === 'accounts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('accounts')}
              >
                Accounts
              </button>
              <button
                className={`mr-4 border-b-2 px-4 py-2 ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
            </div>
          </div>

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="accounts-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card key={account.id} className="account-card">
                  <div className="card-header flex items-center justify-between">
                    <h3 className="text-lg font-medium">{account.name}</h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {account.type} - {account.subtype}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="mb-4 mt-2">
                      <p className="text-sm text-gray-500">
                        Account ending in **** {account.mask}
                      </p>
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
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="transactions-list">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTransactions(prev => !prev)}
                >
                  {showTransactions ? 'Show Recent' : 'Show All'}
                </Button>
              </div>

              {showTransactions ? (
                <div className="max-h-[600px] overflow-y-auto">
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
                      {transactions.map((transaction) => (
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
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border">
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
                      {recentTransactions.map((transaction) => (
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
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ItemDetailView; 