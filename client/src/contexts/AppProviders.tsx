import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { PlaidLinkProvider } from './PlaidLinkContext';
import { RouteProvider } from './RouteContext';

/**
 * Combined provider component that wraps all context providers
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <RouteProvider>
            <PlaidLinkProvider>
              {children}
            </PlaidLinkProvider>
          </RouteProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppProviders; 