import { useEffect, useState } from 'react';
// Auth is now handled by Supabase via AuthContext
// import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';
import { useItemStore } from './itemStore';
import { useLinkStore } from './linkStore';
import { useTransactionStore } from './transactionStore';
import { useAssetStore } from './assetStore';
import { StoreState } from './createStore';
// import type { AuthState } from './authStore';
import type { UserState } from './userStore';
import type { ItemState } from './itemStore';
import type { LinkState } from './linkStore';
import type { TransactionState } from './transactionStore';
import type { AssetState } from './assetStore';
import { UserId, ItemId, AccountId } from '../types';

/**
 * Typed selector for extracting state from stores
 */
type Selector<T, U> = (state: T) => U;

/**
 * @deprecated - Use useAuth() from AuthContext instead
 * Hook to select a specific slice of auth state with memoization
 * 
 * @example
 * // Get only the user from auth state
 * const user = useAuthSelector(state => state.user);
 */
// export function useAuthSelector<SelectedState>(
//   selector: Selector<AuthState, SelectedState>
// ): SelectedState {
//   return useAuthStore(selector);
// }

/**
 * Hook to select a specific slice of user state with memoization
 * 
 * @example
 * // Get only the users array
 * const users = useUserSelector(state => state.users);
 */
export function useUserSelector<SelectedState>(
  selector: Selector<UserState, SelectedState>
): SelectedState {
  return useUserStore(selector);
}

/**
 * Hook to select a specific slice of item state with memoization
 * 
 * @example
 * // Get an item by its ID
 * const item = useItemSelector(state => state.items[itemId]);
 */
export function useItemSelector<SelectedState>(
  selector: Selector<ItemState, SelectedState>
): SelectedState {
  return useItemStore(selector);
}

/**
 * Hook to select a specific slice of link state with memoization
 * 
 * @example
 * // Get a link token by user ID
 * const token = useLinkSelector(state => state.byUser[userId]);
 */
export function useLinkSelector<SelectedState>(
  selector: Selector<LinkState, SelectedState>
): SelectedState {
  return useLinkStore(selector);
}

/**
 * Hook to select a specific slice of transaction state with memoization
 * 
 * @example
 * // Get transactions for a specific account
 * const accountTransactions = useTransactionSelector(state => state.byAccount[accountId]);
 */
export function useTransactionSelector<SelectedState>(
  selector: Selector<TransactionState, SelectedState>
): SelectedState {
  return useTransactionStore(selector);
}

/**
 * Hook to select a specific slice of asset state with memoization
 * 
 * @example
 * // Get assets for a specific user
 * const userAssets = useAssetSelector(state => state.byUser[userId]);
 */
export function useAssetSelector<SelectedState>(
  selector: Selector<AssetState, SelectedState>
): SelectedState {
  return useAssetStore(selector);
}

/**
 * @deprecated - Use AuthContext's built-in auth checking instead
 * Hook that checks authentication on component mount
 * Convenient wrapper around authStore.checkAuth()
 */
// export function useCheckAuth() {
//   const checkAuth = useAuthStore((state: AuthState) => state.checkAuth);
//   
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);
// }

/**
 * Hook that loads users on component mount
 * Convenient wrapper around userStore.getUsers()
 */
export function useLoadUsers(forceRefresh = false) {
  const getUsers = useUserStore((state: UserState) => state.getUsers);
  const loading = useUserStore((state: UserState) => state.loading);
  const error = useUserStore((state: UserState) => state.error);
  
  useEffect(() => {
    getUsers(forceRefresh);
  }, [getUsers, forceRefresh]);
  
  return { loading, error };
}

/**
 * Hook that loads items for a user on component mount
 * Convenient wrapper around itemStore.getItemsByUser()
 */
export function useLoadItems(userId: UserId, forceRefresh = false) {
  const getItemsByUser = useItemStore((state: ItemState) => state.getItemsByUser);
  const loading = useItemStore((state: ItemState) => state.loading);
  const error = useItemStore((state: ItemState) => state.error);
  
  useEffect(() => {
    if (userId) {
      getItemsByUser(userId, forceRefresh);
    }
  }, [getItemsByUser, userId, forceRefresh]);
  
  return { loading, error };
}

/**
 * @deprecated - Use useAuth() from AuthContext instead
 * Hook that provides auth actions
 * Returns login and logout functions from the auth store
 */
// export function useAuthActions() {
//   const login = useAuthStore((state: AuthState) => state.login);
//   const logout = useAuthStore((state: AuthState) => state.logout);
//   const clearError = useAuthStore((state: AuthState) => state.clearError);
//   const error = useAuthStore((state: AuthState) => state.error);
//   const loading = useAuthStore((state: AuthState) => state.loading);
//   
//   return { login, logout, clearError, error, loading };
// }

/**
 * Hook that provides user management actions
 * Returns user CRUD functions from the user store
 */
export function useUserActions() {
  const addUser = useUserStore((state: UserState) => state.addUser);
  const updateUser = useUserStore((state: UserState) => state.updateUser);
  const removeUser = useUserStore((state: UserState) => state.removeUser);
  const error = useUserStore((state: UserState) => state.error);
  const loading = useUserStore((state: UserState) => state.loading);
  
  return { addUser, updateUser, removeUser, error, loading };
}

/**
 * Hook that provides item management actions
 * Returns item CRUD functions from the item store
 */
export function useItemActions() {
  const getItemById = useItemStore((state: ItemState) => state.getItemById);
  const getItemsByUser = useItemStore((state: ItemState) => state.getItemsByUser);
  const deleteItemById = useItemStore((state: ItemState) => state.deleteItemById);
  const setItemState = useItemStore((state: ItemState) => state.setItemState);
  const error = useItemStore((state: ItemState) => state.error);
  const loading = useItemStore((state: ItemState) => state.loading);
  
  return { 
    getItemById, 
    getItemsByUser, 
    deleteItemById, 
    setItemState, 
    error, 
    loading 
  };
}

/**
 * Hook that provides link token management actions
 * Returns link token functions from the link store
 * @deprecated Use the useLinkActions from linkStore.ts directly instead
 */
export function useLinkStoreActions() {
  const generateLinkToken = useLinkStore((state: LinkState) => state.generateLinkToken);
  const deleteLinkToken = useLinkStore((state: LinkState) => state.deleteLinkToken);
  const resetError = useLinkStore((state: LinkState) => state.resetError);
  const error = useLinkStore((state: LinkState) => state.error);
  const loading = useLinkStore((state: LinkState) => state.loading);
  
  return { generateLinkToken, deleteLinkToken, resetError, error, loading };
}

/**
 * Hook for safely accessing browser storage
 * Handles SSR environments where window is not available
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Hook that loads transactions for an account on component mount
 * Convenient wrapper around transactionStore.getTransactionsByAccount()
 */
export function useLoadAccountTransactions(accountId: AccountId, forceRefresh = false) {
  const getTransactionsByAccount = useTransactionStore((state: TransactionState) => state.getTransactionsByAccount);
  const loading = useTransactionStore((state: TransactionState) => state.loading);
  const error = useTransactionStore((state: TransactionState) => state.error);
  
  useEffect(() => {
    if (accountId) {
      getTransactionsByAccount(accountId, forceRefresh);
    }
  }, [getTransactionsByAccount, accountId, forceRefresh]);
  
  return { loading, error };
}

/**
 * Hook that loads transactions for an item on component mount
 * Convenient wrapper around transactionStore.getTransactionsByItem()
 */
export function useLoadItemTransactions(itemId: ItemId, forceRefresh = false) {
  const getTransactionsByItem = useTransactionStore((state: TransactionState) => state.getTransactionsByItem);
  const loading = useTransactionStore((state: TransactionState) => state.loading);
  const error = useTransactionStore((state: TransactionState) => state.error);
  
  useEffect(() => {
    if (itemId) {
      getTransactionsByItem(itemId, forceRefresh);
    }
  }, [getTransactionsByItem, itemId, forceRefresh]);
  
  return { loading, error };
}

/**
 * Hook that loads transactions for a user on component mount
 * Convenient wrapper around transactionStore.getTransactionsByUser()
 */
export function useLoadUserTransactions(userId: UserId, forceRefresh = false) {
  const getTransactionsByUser = useTransactionStore((state: TransactionState) => state.getTransactionsByUser);
  const loading = useTransactionStore((state: TransactionState) => state.loading);
  const error = useTransactionStore((state: TransactionState) => state.error);
  
  useEffect(() => {
    if (userId) {
      getTransactionsByUser(userId, forceRefresh);
    }
  }, [getTransactionsByUser, userId, forceRefresh]);
  
  return { loading, error };
}

/**
 * Hook that loads assets for a user on component mount
 * Convenient wrapper around assetStore.getAssetsByUser()
 */
export function useLoadUserAssets(userId: UserId, forceRefresh = false) {
  const getAssetsByUser = useAssetStore((state: AssetState) => state.getAssetsByUser);
  const loading = useAssetStore((state: AssetState) => state.loading);
  const error = useAssetStore((state: AssetState) => state.error);
  
  useEffect(() => {
    if (userId) {
      getAssetsByUser(userId, forceRefresh);
    }
  }, [getAssetsByUser, userId, forceRefresh]);
  
  return { loading, error };
}

/**
 * Hook that provides transaction management actions
 * Returns transaction functions from the transaction store
 */
export function useTransactionActions() {
  const getTransactionsByAccount = useTransactionStore((state: TransactionState) => state.getTransactionsByAccount);
  const getTransactionsByItem = useTransactionStore((state: TransactionState) => state.getTransactionsByItem);
  const getTransactionsByUser = useTransactionStore((state: TransactionState) => state.getTransactionsByUser);
  const setFilters = useTransactionStore((state: TransactionState) => state.setFilters);
  const resetFilters = useTransactionStore((state: TransactionState) => state.resetFilters);
  const resetTransactions = useTransactionStore((state: TransactionState) => state.resetTransactions);
  const error = useTransactionStore((state: TransactionState) => state.error);
  const loading = useTransactionStore((state: TransactionState) => state.loading);
  
  return { 
    getTransactionsByAccount,
    getTransactionsByItem,
    getTransactionsByUser,
    setFilters,
    resetFilters,
    resetTransactions,
    error,
    loading
  };
}

/**
 * Hook that provides asset management actions
 * Returns asset functions from the asset store
 */
export function useAssetActions() {
  const getAssetsByUser = useAssetStore((state: AssetState) => state.getAssetsByUser);
  const addAsset = useAssetStore((state: AssetState) => state.addAsset);
  const deleteAsset = useAssetStore((state: AssetState) => state.deleteAsset);
  const resetAssets = useAssetStore((state: AssetState) => state.resetAssets);
  const error = useAssetStore((state: AssetState) => state.error);
  const loading = useAssetStore((state: AssetState) => state.loading);
  
  return { 
    getAssetsByUser,
    addAsset,
    deleteAsset,
    resetAssets,
    error,
    loading
  };
} 