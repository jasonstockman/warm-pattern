import React from 'react';
import AuthDebugger from '../src/components/AuthDebugger';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

/**
 * Auth Debug Page
 * 
 * A utility page for debugging authentication issues.
 */
const AuthDebugPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const isAuthenticated = !!user;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="auth-debug-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Authentication Debugger</h1>
        <p className="text-gray-600">
          Use this page to diagnose and fix authentication issues
        </p>
      </div>
      
      <AuthDebugger />
    </div>
  );
};

export default AuthDebugPage; 