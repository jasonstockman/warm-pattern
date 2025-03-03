import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AccountTransactionsView from '../src/components/accounts/AccountTransactionsView';

interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
}

const AccountTransactionsPage: React.FC = () => {
  const router = useRouter();
  const { accountId } = router.query;
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, we would fetch the account details here
    // For now, we'll just simulate it
    if (accountId) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAccount({
          id: accountId as string,
          name: 'Account ' + accountId,
          type: 'Checking',
          subtype: 'Personal',
        });
        setLoading(false);
      }, 500);
    }
  }, [accountId]);

  if (!accountId) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
          No account ID provided.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
      </div>

      <AccountTransactionsView 
        accountId={accountId as string} 
        accountName={account?.name || 'Account'} 
      />
    </div>
  );
};

export default AccountTransactionsPage; 