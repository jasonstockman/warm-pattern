import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component for debugging authentication issues
 */
const AuthDebugger: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;
  const session = auth?.session;
  
  const [testResponse, setTestResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showTokenDetails, setShowTokenDetails] = useState(false);
  const [manualToken, setManualToken] = useState<string>('');
  
  // Format date for display
  const formatDate = (date: string | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };
  
  // Make a test request with the current token
  const makeTestRequest = async () => {
    try {
      setError('');
      setLoading(true);
      setTestResponse('Making request...');
      
      // Create a test request to a protected endpoint
      const response = await axios.get('/api/users/me');
      
      setTestResponse(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setError(err.message || 'Request failed');
      setTestResponse(JSON.stringify(err.response?.data || {}, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  // Set a manual token for testing (this is just for UI display, not actual usage)
  const handleSetToken = () => {
    // This would normally set a token, but we're just showing it for demo purposes
    // In reality, you shouldn't manually set tokens in production code
    alert('Setting tokens manually is not recommended. This is just for demonstration.');
  };
  
  // Format JWT token for display
  const formatToken = (token: string | undefined): string => {
    if (!token) return 'No token available';
    if (token.length > 30) {
      return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
    }
    return token;
  };
  
  return (
    <div className="auth-debugger space-y-8">
      <section className="user-info rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">User Information</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            {user.email && <p><strong>Email:</strong> {user.email}</p>}
            {user.created_at && <p><strong>Created:</strong> {formatDate(user.created_at)}</p>}
            {user.updated_at && <p><strong>Last Updated:</strong> {formatDate(user.updated_at)}</p>}
          </div>
        ) : (
          <p className="text-red-600">No user is currently logged in</p>
        )}
      </section>
      
      <section className="session-info rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Session Information</h2>
        {session ? (
          <div className="space-y-2">
            <p><strong>Status:</strong> Active</p>
            
            <div className="mt-4">
              <button 
                onClick={() => setShowTokenDetails(!showTokenDetails)}
                className="mb-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {showTokenDetails ? 'Hide Token Details' : 'Show Token Details'}
              </button>
              
              {showTokenDetails && (
                <div className="mt-2 overflow-x-auto rounded bg-gray-100 p-4">
                  <h3 className="mb-2 font-medium">Session ID</h3>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                    {formatToken(session.access_token)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-yellow-600">No active session found</p>
        )}
      </section>
      
      <section className="test-request rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Test Authentication</h2>
        <p className="mb-4">Make a test request to verify your authentication is working correctly</p>
        
        <button 
          onClick={makeTestRequest}
          disabled={loading}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
        
        {error && (
          <div className="mt-4 rounded bg-red-50 p-4 text-red-700">
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {testResponse && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Response</h3>
            <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-xs">
              {testResponse}
            </pre>
          </div>
        )}
      </section>
      
      <section className="manual-token rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Debug Tools</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            For advanced debugging only. Enter a JWT token to inspect (this will not modify your actual authentication).
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              placeholder="Paste JWT token for inspection"
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button 
              onClick={handleSetToken}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              disabled={!manualToken}
            >
              Inspect Token
            </button>
          </div>
        </div>
      </section>
      
      <section className="debug-tips rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Debug Tips</h2>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>Check that your token has not expired</li>
          <li>Verify the token is being correctly sent in API requests (Authorization header)</li>
          <li>Make sure your API routes are properly configured to validate tokens</li>
          <li>Check your browser console for any errors related to API requests</li>
          <li>You can decode and inspect JWT tokens at <a href="https://jwt.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">jwt.io</a></li>
        </ul>
      </section>
      
      <section className="actions rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Actions</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Try signing out and back in if you're experiencing authentication issues
          </p>
          <button 
            onClick={() => signOut && signOut()}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
};

export default AuthDebugger; 