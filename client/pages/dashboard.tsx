import React, { useEffect, useState } from 'react';
import { TransactionList } from '../src/components/TransactionList';
import { AssetList } from '../src/components/AssetList';
import { useLoadItems, useItemSelector, 
  useLoadUserTransactions, useTransactionSelector, useLoadUserAssets, useAssetSelector, useLinkActions } from '../src/store';
import ProtectedRoute from '../components/ProtectedRoute';
import { Transaction, Asset, UserId } from '../src/types';
import { createId } from '../src/types/branded';
import { Button, Card } from '../src/components/ui';
import LaunchLink from '../src/components/LaunchLink';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getNumericUserId } from '../src/utils/userUtils';

// Import ItemType from components (which has the accounts property)
import { ItemType as ComponentItemType } from '../src/components/types';

export default function Dashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const userId = getNumericUserId(user);
  
  // Link token state
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { generateLinkToken } = useLinkActions();
  
  // Always call hooks, but only perform operations if userId exists
  const { loading: itemsLoading } = useLoadItems(userId as UserId);
  const { loading: transactionsLoading } = useLoadUserTransactions(userId as UserId);
  const { loading: assetsLoading } = useLoadUserAssets(userId as UserId);
  
  // Get data from stores - using individual selectors
  const items = useItemSelector(state => state.items) || {};
  const transactions = useTransactionSelector(state => state.transactions) || {};
  const assets = useAssetSelector(state => state.assets) || {};
  
  // Convert record objects to arrays for processing with proper type assertion
  const itemsArray = Object.values(items || {}) as Array<ComponentItemType & { accounts: Array<{ id: string; name: string; mask: string; balances: { current: string }; subtype: string }> }>;
  const transactionsArray = Object.values(transactions || {}) as Transaction[];
  const assetsArray = Object.values(assets || {}) as Asset[];
  
  // Calculate financial summary
  const totalAssets = assetsArray?.reduce((sum, asset) => sum + (asset?.value || 0), 0) || 0;
  const totalBalance = itemsArray?.reduce((sum, item) => {
    const itemAccounts = item?.accounts || [];
    return sum + (itemAccounts.reduce((accSum: number, acc) => 
      accSum + parseFloat(acc?.balances?.current || '0'), 0) || 0);
  }, 0) || 0;
  
  // Recent transactions (last 5)
  const recentTransactions = [...(transactionsArray || [])]
    .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const handleLinkAccount = async () => {
    if (userId) {
      try {
        await generateLinkToken(userId, null);
        // Get the link token from localStorage - this is set by the generateLinkToken function
        const oauthConfig = localStorage.getItem('oauthConfig');
        if (oauthConfig) {
          const { token } = JSON.parse(oauthConfig);
          setLinkToken(token);
        }
      } catch (error) {
        console.error('Error generating link token:', error);
      }
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
  
  // Only render the dashboard if userId is defined
  if (!userId) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4">
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
            Please log in to view your dashboard.
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="danger"
            size="md"
          >
            Sign Out
          </Button>
        </header>
        
        {/* Financial Summary */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <div className="card-header">
              <h2 className="text-lg font-semibold">Total Balance</h2>
            </div>
            <div className="card-body">
              <p className="text-2xl font-bold text-blue-600">
                ${Number(totalBalance).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Across {itemsArray.length} connected accounts</p>
            </div>
          </Card>
          
          <Card>
            <div className="card-header">
              <h2 className="text-lg font-semibold">Total Assets</h2>
            </div>
            <div className="card-body">
              <p className="text-2xl font-bold text-green-600">
                ${totalAssets.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">{assetsArray.length} tracked assets</p>
            </div>
          </Card>
          
          <Card>
            <div className="card-header">
              <h2 className="text-lg font-semibold">Net Worth</h2>
            </div>
            <div className="card-body">
              <p className="text-2xl font-bold text-purple-600">
                ${(totalBalance + totalAssets).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Total Balance + Assets</p>
            </div>
          </Card>
        </div>
        
        {/* Accounts Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Your Accounts</h2>
          
          {itemsLoading ? (
            <div className="text-gray-600">Loading accounts...</div>
          ) : itemsArray.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
              You don't have any accounts yet. Connect a bank to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {itemsArray.map(item => (
                <React.Fragment key={item.id}>
                  {/* Safely access accounts using typecasting */}
                  {((item as any).accounts || []).map((account: any) => (
                    <Card key={account.id}>
                      <div className="card-header">
                        <h3 className="text-lg font-medium">{account.name}</h3>
                        <p className="text-gray-500">**** {account.mask}</p>
                      </div>
                      <div className="card-body">
                        <p className="mt-2 text-xl font-semibold">
                          ${parseFloat(account.balances?.current || '0').toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.subtype} - {(item as any).institution_name || 'Bank'}
                        </p>
                      </div>
                    </Card>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Glance - Recent Transactions */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Recent Transactions</h2>
          
          {transactionsLoading ? (
            <div className="text-gray-600">Loading transactions...</div>
          ) : recentTransactions.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
              No recent transactions.
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map(transaction => {
                const amount = parseFloat(transaction.amount.toString());
                const isNegative = amount < 0;
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div>
                      <h3 className="font-medium">{transaction.name}</h3>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                    </div>
                    <div className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                      {isNegative ? '-' : '+'}${Math.abs(amount).toFixed(2)}
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-4 text-right">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/transactions'}
                >
                  View All Transactions
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Full Transaction and Asset Lists */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Transactions</h2>
            <TransactionList userId={userId} />
          </div>
          
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Assets</h2>
            <AssetList userId={userId} />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLinkAccount}
            variant="primary"
            size="md"
            className="btn-link-account px-6 py-3 text-lg"
          >
            Link New Bank Account
          </Button>
        </div>
        
        {/* This component will open the Plaid Link when linkToken is available */}
        {linkToken && userId && (
          <LaunchLink token={linkToken} userId={userId} itemId={null} />
        )}

        <Card className="mb-6">
          <div className="card-header">
            <h2>Accounts Overview</h2>
          </div>
          <div className="card-body">
            {/* Accounts content */}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 