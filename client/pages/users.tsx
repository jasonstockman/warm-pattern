import React from 'react';
import UserList from '../src/components/UserList';
import { Card } from '../src/components/ui';

/**
 * Users Page
 * 
 * Displays a list of users and provides user management functionality.
 */
const UsersPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-description">
          View and manage users in the system
        </p>
      </div>
      
      <div className="page-content">
        <UserList />
        
        <Card className="mt-6">
          <div className="card-header">
            <h2>User Management Guide</h2>
          </div>
          <div className="card-body">
            <p>This page allows administrators to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>View all registered users</li>
              <li>Delete users from the system</li>
              <li>Link bank accounts to users</li>
              <li>View detailed user information</li>
            </ul>
            <p className="mt-4">
              For more advanced user management options, please use the Admin dashboard.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage; 