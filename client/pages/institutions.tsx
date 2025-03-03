import React from 'react';
import InstitutionBrowser from '../src/components/institutions/InstitutionBrowser';

/**
 * Institutions Page
 * 
 * Allows users to browse and search financial institutions that can be connected.
 */
const InstitutionsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="page-header mb-6">
        <h1 className="page-title text-3xl font-bold">Banking Institutions</h1>
        <p className="page-description text-gray-600">
          Browse and connect to supported financial institutions
        </p>
      </div>
      
      <div className="page-content">
        <InstitutionBrowser />
      </div>
    </div>
  );
};

export default InstitutionsPage; 