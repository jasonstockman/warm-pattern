import React from 'react';
import { Card } from '../src/components/ui';

/**
 * Transactions Page
 * 
 * Displays financial transactions from linked accounts.
 */
const TransactionsPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-description">
          View and manage your financial transactions
        </p>
      </div>
      
      <div className="page-content">
        <div className="transactions-filter mb-6">
          <Card>
            <div className="card-header">
              <h2>Filter Transactions</h2>
            </div>
            <div className="card-body">
              <div className="filter-controls grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="filter-control">
                  <label htmlFor="account-filter" className="block mb-1">Account</label>
                  <select id="account-filter" className="form-select w-full">
                    <option value="all">All Accounts</option>
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                  </select>
                </div>
                
                <div className="filter-control">
                  <label htmlFor="date-filter" className="block mb-1">Date Range</label>
                  <select id="date-filter" className="form-select w-full">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div className="filter-control">
                  <label htmlFor="amount-filter" className="block mb-1">Amount</label>
                  <select id="amount-filter" className="form-select w-full">
                    <option value="all">All Amounts</option>
                    <option value="under-50">Under $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="over-500">Over $500</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="transactions-list">
          <Card>
            <div className="card-header">
              <h2>Recent Transactions</h2>
            </div>
            <div className="card-body p-0">
              <div className="transactions-empty text-center py-8">
                <p className="text-lg mb-2">No transactions found</p>
                <p className="text-sm text-gray-500">
                  Transactions will appear here once you link your bank accounts.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage; 