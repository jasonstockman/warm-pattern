import React from 'react';
import SandboxTesting from '../src/components/sandbox/SandboxTesting';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * Developer Tools Page
 * 
 * Provides sandbox testing tools for developers.
 */
const DeveloperToolsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <div className="page-header mb-6">
          <h1 className="page-title text-3xl font-bold">Developer Tools</h1>
          <p className="page-description text-gray-600">
            Tools for testing and debugging your Plaid integration
          </p>
        </div>
        
        <div className="page-content">
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
            <h3 className="mb-2 font-semibold">Sandbox Environment Notice</h3>
            <p>
              These tools are only for use in the sandbox environment. They will not work in production.
            </p>
          </div>
          
          <SandboxTesting />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DeveloperToolsPage; 