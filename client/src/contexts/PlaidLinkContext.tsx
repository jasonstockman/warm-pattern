import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiClient from '../api/apiClient';

// Define the context types
interface PlaidLinkContextType {
  // Link token for Plaid Link
  linkToken: string | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Functions
  generateLinkToken: () => Promise<string>;
  exchangePublicToken: (publicToken: string) => Promise<boolean>;
  
  // Clear the context state
  resetState: () => void;
}

const PlaidLinkContext = createContext<PlaidLinkContextType | undefined>(undefined);

interface PlaidLinkProviderProps {
  children: ReactNode;
}

export const PlaidLinkProvider: React.FC<PlaidLinkProviderProps> = ({ children }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a link token from the server
  const generateLinkToken = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<{ link_token: string }>('/api/plaid/create_link_token', {});
      const linkToken = response.link_token;
      setLinkToken(linkToken);
      setIsLoading(false);
      return linkToken;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate link token';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Exchange the public token for an access token
  const exchangePublicToken = async (publicToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.post('/api/plaid/exchange_public_token', { public_token: publicToken });
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to exchange public token';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Reset the state
  const resetState = () => {
    setLinkToken(null);
    setIsLoading(false);
    setError(null);
  };

  const value = {
    linkToken,
    isLoading,
    error,
    generateLinkToken,
    exchangePublicToken,
    resetState,
  };

  return (
    <PlaidLinkContext.Provider value={value}>
      {children}
    </PlaidLinkContext.Provider>
  );
};

export const usePlaidLink = (): PlaidLinkContextType => {
  const context = useContext(PlaidLinkContext);
  
  if (context === undefined) {
    throw new Error('usePlaidLink must be used within a PlaidLinkProvider');
  }
  
  return context;
};

export default PlaidLinkContext; 