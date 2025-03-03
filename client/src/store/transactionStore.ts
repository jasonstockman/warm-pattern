import { createAppStore } from './createStore';
import { Transaction, TransactionId, AccountId, ItemId, UserId, TransactionFilters } from '../types';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types';
import { groupBy } from 'lodash';

export interface TransactionState {
  // State
  transactions: Record<number, Transaction>;
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Computed properties
  transactionsByAccount: Record<string, Transaction[]>;
  transactionsByItem: Record<string, Transaction[]>;
  transactionsByUser: Record<string, Transaction[]>;
  
  // Actions
  getTransactionsByAccount: (accountId: AccountId, forceRefresh?: boolean) => Promise<void>;
  getTransactionsByItem: (itemId: ItemId, forceRefresh?: boolean) => Promise<void>;
  getTransactionsByUser: (userId: UserId, forceRefresh?: boolean) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  resetTransactions: () => void;
}

// Default filters
const defaultFilters: TransactionFilters = {
  startDate: undefined,
  endDate: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  category: undefined,
  includePending: true,
};

export const useTransactionStore = createAppStore<TransactionState>(
  (set, get) => ({
    // Initial state
    transactions: {},
    filters: { ...defaultFilters },
    loading: false,
    error: null,
    initialized: false,
    
    // Computed properties for grouping transactions
    get transactionsByAccount() {
      return groupBy(Object.values(get().transactions), 'account_id') as Record<string, Transaction[]>;
    },
    
    get transactionsByItem() {
      return groupBy(Object.values(get().transactions), 'item_id') as Record<string, Transaction[]>;
    },
    
    get transactionsByUser() {
      return groupBy(Object.values(get().transactions), 'user_id') as Record<string, Transaction[]>;
    },
    
    // Actions
    getTransactionsByAccount: async (accountId, forceRefresh = false) => {
      // Skip if we already have transactions for this account and no force refresh
      const existingTransactions = get().transactionsByAccount[accountId] || [];
      if (existingTransactions.length > 0 && !forceRefresh) return;
      
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}?account_id=${accountId}`);
        const data: ApiResponse<Transaction[]> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch transactions');
        }
        
        // Convert array to record with id as key
        const transactionsRecord = data.data.reduce((acc, transaction) => {
          acc[transaction.id] = transaction;
          return acc;
        }, {} as Record<number, Transaction>);
        
        set((state) => ({ 
          transactions: { ...state.transactions, ...transactionsRecord },
          loading: false,
          initialized: true
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    getTransactionsByItem: async (itemId, forceRefresh = false) => {
      // Skip if we already have transactions for this item and no force refresh
      const existingTransactions = get().transactionsByItem[itemId] || [];
      if (existingTransactions.length > 0 && !forceRefresh) return;
      
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}?item_id=${itemId}`);
        const data: ApiResponse<Transaction[]> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch transactions');
        }
        
        // Convert array to record with id as key
        const transactionsRecord = data.data.reduce((acc, transaction) => {
          acc[transaction.id] = transaction;
          return acc;
        }, {} as Record<number, Transaction>);
        
        set((state) => ({ 
          transactions: { ...state.transactions, ...transactionsRecord },
          loading: false,
          initialized: true
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    getTransactionsByUser: async (userId, forceRefresh = false) => {
      // Skip if we already have transactions for this user and no force refresh
      const existingTransactions = get().transactionsByUser[userId] || [];
      if (existingTransactions.length > 0 && !forceRefresh) return;
      
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.userSpecific.transactions(userId));
        const data: ApiResponse<Transaction[]> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch transactions');
        }
        
        // Convert array to record with id as key
        const transactionsRecord = data.data.reduce((acc, transaction) => {
          acc[transaction.id] = transaction;
          return acc;
        }, {} as Record<number, Transaction>);
        
        set((state) => ({ 
          transactions: { ...state.transactions, ...transactionsRecord },
          loading: false,
          initialized: true
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    setFilters: (filters) => {
      set((state) => ({
        filters: { ...state.filters, ...filters }
      }));
    },
    
    resetFilters: () => {
      set({ filters: { ...defaultFilters } });
    },
    
    resetTransactions: () => {
      set({ 
        transactions: {}, 
        filters: { ...defaultFilters },
        loading: false, 
        error: null, 
        initialized: false 
      });
    },
  }),
  { 
    name: 'transactionStore',
    persistOptions: {
      name: 'transaction-storage',
      partialize: (state) => ({ 
        transactions: state.transactions,
        filters: state.filters,
        initialized: state.initialized
      }),
      // Don't persist loading or error states
    }
  }
); 