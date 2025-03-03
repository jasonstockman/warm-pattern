import React, { createContext, useContext, ReactNode } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

interface RouteContextType {
  // Navigation helpers
  navigateTo: (path: string) => void;
  navigateBack: () => void;
  
  // Current route info
  currentPath: string;
  
  // Common route paths
  routes: {
    // Auth routes
    login: string;
    signup: string;
    forgotPassword: string;
    
    // Main app routes
    dashboard: string;
    accounts: string;
    accountDetails: (accountId: string) => string;
    transactions: string;
    settings: string;
    profile: string;
    
    // Link routes
    linkAccount: string;
  };
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

interface RouteProviderProps {
  children: ReactNode;
}

export const RouteProvider: React.FC<RouteProviderProps> = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  
  // Navigation helpers
  const navigateTo = (path: string) => {
    history.push(path);
  };
  
  const navigateBack = () => {
    history.goBack();
  };
  
  // Define application routes
  const routes = {
    // Auth routes
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    
    // Main app routes
    dashboard: '/',
    accounts: '/accounts',
    accountDetails: (accountId: string) => `/accounts/${accountId}`,
    transactions: '/transactions',
    settings: '/settings',
    profile: '/profile',
    
    // Link routes
    linkAccount: '/link-account',
  };
  
  const value: RouteContextType = {
    navigateTo,
    navigateBack,
    currentPath: location.pathname,
    routes,
  };
  
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};

export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  
  return context;
}; 