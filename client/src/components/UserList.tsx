import React from 'react';
import { useUserSelector, useLoadUsers } from '../store';
import UserCard from './UserCard';
import { User } from '../types';
import { Card } from './ui';
import { createId } from '../types/branded';
// This provides developers with a view of all users, and ability to delete a user.
// View at path: "/admin"

/**
 * UserList component
 * 
 * Displays a list of all users in the system with options to manage them.
 * Used in the admin page.
 */
const UserList = () => {
  // Load users on component mount
  const { loading, error } = useLoadUsers();
  
  // Get users from the store
  const users = useUserSelector(state => state.users);
  
  return (
    <Card className="user-list">
      <div className="card-header">
        <h2 className="user-list__title">User Management</h2>
        <p className="user-list__subtitle">For developer admin use</p>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="error-message">
            Error loading users: {error}
          </div>
        )}
        
        {loading && users.length === 0 ? (
          <div className="loading-message">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-message">No users found</div>
        ) : (
          <div className="user-list__items">
            {users.map(user => (
              <div key={user.id} className="user-list__item">
                <UserCard
                  user={user}
                  userId={createId.user(user.id)}
                  removeButton
                  linkButton={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserList;
