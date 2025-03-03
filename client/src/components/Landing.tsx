import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUsers } from '../contexts/UsersContext';

const Landing: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const { addNewUser, currentUser } = useUsers();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    try {
      const user = await addNewUser(username.trim());
      router.push(`/user/${user.id}`);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    }
  };
  
  const goToCurrentUser = () => {
    if (currentUser) {
      router.push(`/user/${currentUser.id}`);
    } else {
      alert('No user found. Please create a new user first.');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Plaid Pattern</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Create a new user
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create User
          </button>
        </form>
        
        {currentUser && (
          <div className="mt-6">
            <button
              onClick={goToCurrentUser}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to Current User: {currentUser.username}
            </button>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            This is a sample application to demonstrate Plaid integration.
          </p>
          <p className="mt-2">
            Users created here will not persist if the application is restarted.
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Socket Connection Status</h2>
        <div className="flex justify-center">
          <div className="bg-white shadow rounded-lg p-4 inline-flex items-center">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
              <span>Connected to server</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
