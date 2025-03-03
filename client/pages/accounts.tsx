import React, { useState } from 'react';
import { Card } from '../src/components/ui';
import { Button } from '../src/components/ui';
import { useLinkActions } from '../src/store';
import { createId } from '../src/types/branded';
import LaunchLink from '../src/components/LaunchLink';
import AccountsManagement from '../src/components/accounts/AccountsManagement';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { getNumericUserId } from '../src/utils/userUtils';

/**
 * Accounts Page
 * 
 * Displays a list of accounts and provides account management functionality.
 */
const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Get numeric user ID using utility function
  const userId = getNumericUserId(user);
  
  // Link token state
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { generateLinkToken } = useLinkActions();
  
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

  return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Accounts</h1>
          <p className="page-description">
            View and manage linked financial accounts
          </p>
        </div>
        
        <div className="page-content">
          <div className="accounts-list">
            <Card className="mb-6">
              <div className="card-header">
                <h2>Your Linked Accounts</h2>
              </div>
              <div className="card-body">
                <p className="text-center py-6">
                  No accounts linked yet. Use the "Link Account" button to connect your financial institutions.
                </p>
              </div>
            </Card>
          </div>
          
          <div className="mt-8 mb-8 flex justify-center">
            <Button
              onClick={handleLinkAccount}
              variant="primary"
              size="md"
              className="px-6 py-3 text-lg"
            >
              Link New Bank Account
            </Button>
          </div>
          
          {/* This component will open the Plaid Link when linkToken is available */}
          {linkToken && userId && (
            <LaunchLink token={linkToken} userId={userId} itemId={null} />
          )}
          
          {userId && (
            <div className="mb-8">
              <AccountsManagement userId={Number(userId)} />
            </div>
          )}
          
          <Card>
            <div className="card-header">
              <h2>Account Management Guide</h2>
            </div>
            <div className="card-body">
              <p>This page allows you to:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>View all your linked financial accounts</li>
                <li>Connect new accounts using Plaid</li>
                <li>View account balances</li>
                <li>Filter accounts by type</li>
                <li>Sort accounts by name or balance</li>
              </ul>
              <p className="mt-4">
                For security purposes, you cannot directly modify account details.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AccountsPage; 