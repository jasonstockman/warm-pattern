import React from 'react';
import { Card } from '../src/components/ui';

/**
 * Assets Page
 * 
 * Displays and manages user assets.
 */
const AssetsPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Assets</h1>
        <p className="page-description">
          View and manage your financial assets
        </p>
      </div>
      
      <div className="page-content">
        <div className="assets-summary mb-6">
          <Card>
            <div className="card-header">
              <h2>Asset Summary</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="asset-summary-card p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
                
                <div className="asset-summary-card p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Liabilities</h3>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
                
                <div className="asset-summary-card p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Net Worth</h3>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="assets-list mb-6">
          <Card>
            <div className="card-header">
              <h2>Your Assets</h2>
            </div>
            <div className="card-body p-0">
              <div className="assets-empty text-center py-8">
                <p className="text-lg mb-2">No assets found</p>
                <p className="text-sm text-gray-500">
                  Assets will appear here once you link your accounts or add them manually.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="add-asset-section">
          <Card>
            <div className="card-header">
              <h2>Add New Asset</h2>
            </div>
            <div className="card-body">
              <p className="mb-4">You can manually add assets that are not automatically tracked through linked accounts:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="asset-name" className="block mb-1">Asset Name</label>
                  <input type="text" id="asset-name" className="form-input w-full" placeholder="e.g., Investment Property" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="asset-value" className="block mb-1">Current Value</label>
                  <input type="text" id="asset-value" className="form-input w-full" placeholder="e.g., 250000" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="asset-type" className="block mb-1">Asset Type</label>
                  <select id="asset-type" className="form-select w-full">
                    <option value="">Select Asset Type</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="investment">Investment</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="asset-date" className="block mb-1">Acquisition Date</label>
                  <input type="date" id="asset-date" className="form-input w-full" />
                </div>
              </div>
              
              <div className="mt-4">
                <button type="button" className="btn btn-primary">Add Asset</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage; 