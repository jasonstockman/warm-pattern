import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../src/components/ui';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // If checking authentication or already authenticated, show a loading state
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // For unauthenticated users, show the homepage with login/signup buttons
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-bold text-center">Welcome to Warm Pattern</h1>
        <p className="text-xl text-center text-gray-600 max-w-2xl">
          Manage your financial accounts, track transactions, and monitor your assets all in one place.
        </p>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link href="/login" passHref>
            <Button variant="primary" size="lg">
              Log In
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="secondary" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-6xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Connect Accounts</h2>
            <p className="text-gray-600">
              Securely link your bank accounts using Plaid integration to automatically sync your transactions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Track Finances</h2>
            <p className="text-gray-600">
              Monitor your spending, income, and account balances in real-time with intuitive dashboards.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Assets</h2>
            <p className="text-gray-600">
              Keep track of your assets and calculate your total net worth with our comprehensive tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 