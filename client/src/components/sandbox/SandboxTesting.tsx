import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { resetItemLogin } from '../../services/api';
import { useItemSelector, useLinkActions } from '../../store';
import { useAuth } from '../../../contexts/AuthContext';
import { createId } from '../../types/branded';
import LaunchLink from '../LaunchLink';
import { getNumericUserId } from '../../utils/userUtils';

interface Item {
  id: number;
  institution_name?: string;
  status: string;
}

const SandboxTesting: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetError, setResetError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  
  const { user } = useAuth();
  const userId = getNumericUserId(user);
  const items = useItemSelector(state => state.items);
  const { generateLinkToken } = useLinkActions();
  
  // Convert items object to array
  const itemsArray = Object.values(items) as unknown as Item[];
  
  // Reset when changing selectedItemId
  useEffect(() => {
    setResetStatus('idle');
    setResetError(null);
  }, [selectedItemId]);
  
  const handleResetLogin = async () => {
    if (!selectedItemId) return;
    
    setResetStatus('loading');
    setResetError(null);
    
    try {
      const response = await resetItemLogin(Number(selectedItemId));
      if (response.status === 200) {
        setResetStatus('success');
      } else {
        setResetStatus('error');
        setResetError(response.data.error || 'Failed to reset item login state');
      }
    } catch (err) {
      setResetStatus('error');
      setResetError('An unexpected error occurred');
      console.error(err);
    }
  };
  
  const handleUpdateMode = async () => {
    if (!selectedItemId || !userId) return;
    
    try {
      const itemId = createId.item(Number(selectedItemId));
      await generateLinkToken(userId, itemId);
      // Get the link token from localStorage
      const oauthConfig = localStorage.getItem('oauthConfig');
      if (oauthConfig) {
        const { token } = JSON.parse(oauthConfig);
        setLinkToken(token);
      }
    } catch (error) {
      console.error('Error generating link token:', error);
    }
  };
  
  return (
    <div className="sandbox-testing">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sandbox Testing Tools</h1>
        <p className="text-gray-600">
          Tools for testing and debugging the Plaid integration in sandbox mode
        </p>
      </div>
      
      <div className="mb-6">
        <Card>
          <div className="card-header">
            <h2 className="text-lg font-semibold">Test Item Login Required</h2>
          </div>
          <div className="card-body">
            <p className="mb-4 text-gray-600">
              This tool simulates a login error state for a connected item. This will trigger the 
              ITEM_LOGIN_REQUIRED webhook, allowing you to test your error handling and update mode flows.
            </p>
            
            <div className="mb-4">
              <label htmlFor="item-select" className="mb-2 block font-medium">
                Select Item
              </label>
              <select
                id="item-select"
                className="w-full rounded border border-gray-300 px-3 py-2"
                value={selectedItemId || ''}
                onChange={(e) => setSelectedItemId(e.target.value || null)}
              >
                <option value="">-- Select an item --</option>
                {itemsArray.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.institution_name || 'Unknown'} ({item.status})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                size="md"
                onClick={handleResetLogin}
                disabled={!selectedItemId || resetStatus === 'loading'}
              >
                {resetStatus === 'loading' ? 'Resetting...' : 'Reset Login State'}
              </Button>
              
              <Button
                variant="primary"
                size="md"
                onClick={handleUpdateMode}
                disabled={!selectedItemId || resetStatus !== 'success'}
              >
                Fix in Update Mode
              </Button>
            </div>
            
            {resetStatus === 'success' && (
              <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
                <p>
                  Item login state has been reset. The item now has an 
                  ITEM_LOGIN_REQUIRED error and needs to be updated.
                </p>
              </div>
            )}
            
            {resetStatus === 'error' && resetError && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                <p>{resetError}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <div className="card-header">
            <h2 className="text-lg font-semibold">Webhook Testing Guide</h2>
          </div>
          <div className="card-body">
            <p className="mb-2">
              Common webhooks you can test in sandbox mode:
            </p>
            <ul className="list-disc pl-5">
              <li className="mb-1">
                <span className="font-medium">ITEM_LOGIN_REQUIRED</span> - 
                Use the tool above to test this webhook
              </li>
              <li className="mb-1">
                <span className="font-medium">NEW_ACCOUNTS_AVAILABLE</span> - 
                Add a new account in the Plaid sandbox environment
              </li>
              <li className="mb-1">
                <span className="font-medium">SYNC_UPDATES_AVAILABLE</span> - 
                Triggered automatically when new transactions are available
              </li>
            </ul>
            
            <p className="mt-4 text-sm text-gray-500">
              For more information, refer to the{' '}
              <a
                href="https://plaid.com/docs/api/webhooks/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Plaid Webhooks Documentation
              </a>
            </p>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <div className="card-header">
            <h2 className="text-lg font-semibold">Testing Credentials</h2>
          </div>
          <div className="card-body">
            <p className="mb-4 text-gray-600">
              When connecting to a bank in sandbox mode, you can use these credentials:
            </p>
            
            <div className="mb-2 rounded-lg bg-gray-50 p-4">
              <p className="mb-1 font-medium">Username:</p>
              <code className="block rounded bg-gray-200 p-2 font-mono">user_good</code>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 font-medium">Password:</p>
              <code className="block rounded bg-gray-200 p-2 font-mono">pass_good</code>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              For more testing credentials and scenarios, see the{' '}
              <a
                href="https://plaid.com/docs/sandbox/test-credentials/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Plaid Sandbox Test Credentials
              </a>
            </p>
          </div>
        </Card>
      </div>
      
      {linkToken && userId && selectedItemId && (
        <LaunchLink 
          token={linkToken} 
          userId={userId} 
          itemId={createId.item(Number(selectedItemId))} 
        />
      )}
    </div>
  );
};

export default SandboxTesting; 