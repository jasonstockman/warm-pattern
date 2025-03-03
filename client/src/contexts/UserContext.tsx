import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../api/services';
import { useAuth } from './AuthContext';
import { User } from '../types/user';
import { Item } from '../types/item';
import { Account } from '../types/account';
import { Asset } from '../types/asset';
import { Transaction } from '../types/account';

interface UserContextType {
  // User data
  userData: User | null;
  
  // Related data
  items: Item[];
  accounts: Account[];
  transactions: Transaction[];
  assets: Asset[];
  
  // Loading states
  isLoadingItems: boolean;
  isLoadingAccounts: boolean;
  isLoadingTransactions: boolean;
  isLoadingAssets: boolean;
  
  // Refetch methods
  refreshItems: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  
  // Error states
  errors: {
    items: string | null;
    accounts: string | null;
    transactions: string | null;
    assets: string | null;
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // User's data
  const [userData, setUserData] = useState<User | null>(null);
  
  // Related data
  const [items, setItems] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Loading states
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState({
    items: null as string | null,
    accounts: null as string | null,
    transactions: null as string | null,
    assets: null as string | null,
  });
  
  // Load initial data when user is authenticated
  const [retryAttempts, setRetryAttempts] = useState({
    items: 0,
    accounts: 0,
    transactions: 0,
    assets: 0,
  });
  
  // Set user data when auth status changes
  useEffect(() => {
    setUserData(user);
  }, [user]);
  
  // Load user's items when authenticated
  const refreshItems = async () => {
    if (!isAuthenticated || !user) return;
    
    // Limit retry attempts
    if (retryAttempts.items >= 3) {
      console.warn('Exceeded maximum retry attempts for items');
      return;
    }
    
    try {
      setIsLoadingItems(true);
      setErrors(prev => ({ ...prev, items: null }));
      const userId = user.id;
      const fetchedItems = await userService.getItems(userId);
      setItems(fetchedItems);
      // Reset retry counter on success
      setRetryAttempts(prev => ({ ...prev, items: 0 }));
    } catch (err: any) {
      console.error('Failed to fetch items:', err);
      setErrors(prev => ({ ...prev, items: err.message || 'Failed to load items' }));
      // Increment retry counter
      setRetryAttempts(prev => ({ ...prev, items: prev.items + 1 }));
    } finally {
      setIsLoadingItems(false);
    }
  };
  
  // Load user's accounts
  const refreshAccounts = async () => {
    if (!isAuthenticated || !user) return;
    
    // Limit retry attempts
    if (retryAttempts.accounts >= 3) {
      console.warn('Exceeded maximum retry attempts for accounts');
      return;
    }
    
    try {
      setIsLoadingAccounts(true);
      setErrors(prev => ({ ...prev, accounts: null }));
      const userId = user.id;
      const fetchedAccounts = await userService.getAccounts(userId);
      setAccounts(fetchedAccounts);
      // Reset retry counter on success
      setRetryAttempts(prev => ({ ...prev, accounts: 0 }));
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      setErrors(prev => ({ ...prev, accounts: err.message || 'Failed to load accounts' }));
      // Increment retry counter
      setRetryAttempts(prev => ({ ...prev, accounts: prev.accounts + 1 }));
    } finally {
      setIsLoadingAccounts(false);
    }
  };
  
  // Load user's transactions
  const refreshTransactions = async () => {
    if (!isAuthenticated || !user) return;
    
    // Limit retry attempts
    if (retryAttempts.transactions >= 3) {
      console.warn('Exceeded maximum retry attempts for transactions');
      return;
    }
    
    try {
      setIsLoadingTransactions(true);
      setErrors(prev => ({ ...prev, transactions: null }));
      const userId = user.id;
      const fetchedTransactions = await userService.getTransactions(userId);
      setTransactions(fetchedTransactions);
      // Reset retry counter on success
      setRetryAttempts(prev => ({ ...prev, transactions: 0 }));
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setErrors(prev => ({ ...prev, transactions: err.message || 'Failed to load transactions' }));
      // Increment retry counter
      setRetryAttempts(prev => ({ ...prev, transactions: prev.transactions + 1 }));
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  // Load user's assets
  const refreshAssets = async () => {
    if (!isAuthenticated || !user) return;
    
    // Limit retry attempts
    if (retryAttempts.assets >= 3) {
      console.warn('Exceeded maximum retry attempts for assets');
      return;
    }
    
    try {
      setIsLoadingAssets(true);
      setErrors(prev => ({ ...prev, assets: null }));
      const userId = user.id;
      const fetchedAssets = await userService.getItems(userId); // TODO: Replace with actual assetService.getByUserId when available
      setAssets([]); // Placeholder until we have proper assets
      // Reset retry counter on success
      setRetryAttempts(prev => ({ ...prev, assets: 0 }));
    } catch (err: any) {
      console.error('Failed to fetch assets:', err);
      setErrors(prev => ({ ...prev, assets: err.message || 'Failed to load assets' }));
      // Increment retry counter
      setRetryAttempts(prev => ({ ...prev, assets: prev.assets + 1 }));
    } finally {
      setIsLoadingAssets(false);
    }
  };
  
  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Reset retry counters when user changes
      setRetryAttempts({
        items: 0,
        accounts: 0,
        transactions: 0,
        assets: 0,
      });
      
      refreshItems();
      refreshAccounts();
      refreshTransactions();
      refreshAssets();
    } else {
      // Reset data when user logs out
      setItems([]);
      setAccounts([]);
      setTransactions([]);
      setAssets([]);
    }
  }, [isAuthenticated, user?.id]);
  
  const value = {
    userData,
    items,
    accounts,
    transactions,
    assets,
    isLoadingItems,
    isLoadingAccounts,
    isLoadingTransactions,
    isLoadingAssets,
    refreshItems,
    refreshAccounts,
    refreshTransactions,
    refreshAssets,
    errors
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 