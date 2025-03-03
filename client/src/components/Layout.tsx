import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SocketStatus from './SocketStatus';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './ui';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getUserDisplayName } from '../utils/userUtils';

/**
 * Layout component
 * 
 * Main layout wrapper for the application with navigation.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-bold text-blue-600">
                <Link href="/">
                  <span className="text-xl">Finance App</span>
                </Link>
              </div>
              
              <div className="ml-10 hidden space-x-4 md:flex">
                <Link 
                  href="/" 
                  className={`px-3 py-2 text-sm font-medium ${
                    router.pathname === '/' 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Home
                </Link>
                
                {isAuthenticated ? (
                  // Navigation links for authenticated users
                  <>
                    <Link 
                      href="/dashboard" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/dashboard' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/accounts" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/accounts' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Accounts
                    </Link>
                    <Link 
                      href="/transactions" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/transactions' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Transactions
                    </Link>
                    <Link 
                      href="/assets" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/assets' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Assets
                    </Link>
                    <Link 
                      href="/institutions" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/institutions' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Institutions
                    </Link>
                    <Link 
                      href="/users" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/users' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Users
                    </Link>
                    <Link 
                      href="/developer-tools" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/developer-tools' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Dev Tools
                    </Link>
                    <Link 
                      href="/auth-debug" 
                      className={`px-3 py-2 text-sm font-medium ${
                        router.pathname === '/auth-debug' 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Auth Debug
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden text-sm font-medium text-gray-700 md:inline-block">
                    Hello, {getUserDisplayName(user)}
                  </span>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      <footer className="bg-gray-800 py-6 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div>
              <p className="text-sm">© 2023 Finance App. All rights reserved.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <SocketStatus />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 