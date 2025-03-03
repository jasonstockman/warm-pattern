import { createAppStore } from './createStore';
import { UserId, ItemId } from '../types';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types';
import { PlaidLinkError } from 'react-plaid-link';

interface LinkToken {
  [key: string]: string;
}

export interface LinkState {
  // State
  byUser: LinkToken;
  byItem: LinkToken;
  error: PlaidLinkError | null;
  loading: boolean;
  
  // Actions
  generateLinkToken: (userId: UserId, itemId: ItemId | null) => Promise<void>;
  deleteLinkToken: (userId: UserId | null, itemId: ItemId | null) => void;
  resetError: () => void;
}

export const useLinkStore = createAppStore<LinkState>(
  (set, get) => ({
    // Initial state
    byUser: {},
    byItem: {},
    error: null,
    loading: false,
    
    // Actions
    generateLinkToken: async (userId, itemId) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.LINK_TOKEN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, itemId }),
        });
        
        const data = await response.json();
        
        if (!data.success || !data.data?.link_token) {
          throw new Error(data.error || 'Failed to generate link token');
        }
        
        const token = data.data.link_token;
        
        if (itemId !== null) {
          // Update mode - store token by item
          set((state: LinkState) => ({
            byItem: { ...state.byItem, [itemId]: token },
            loading: false,
          }));
        } else {
          // Normal mode - store token by user
          set((state: LinkState) => ({
            byUser: { ...state.byUser, [userId]: token },
            loading: false,
          }));
        }
      } catch (error) {
        set({ 
          error: error instanceof Error 
            ? { error_type: 'API_ERROR', error_code: 'REQUEST_FAILED', error_message: error.message } as PlaidLinkError 
            : { error_type: 'API_ERROR', error_code: 'UNKNOWN_ERROR', error_message: 'An unknown error occurred' } as PlaidLinkError,
          loading: false 
        });
      }
    },
    
    deleteLinkToken: (userId, itemId) => {
      if (userId !== null) {
        set((state: LinkState) => ({
          byUser: { ...state.byUser, [userId]: '' },
        }));
      } else if (itemId !== null) {
        set((state: LinkState) => ({
          byItem: { ...state.byItem, [itemId]: '' },
        }));
      }
    },
    
    resetError: () => {
      set({ error: null });
    },
  }),
  { name: 'linkStore' }
);

// Helper functions to access link tokens and actions
export const getLinkTokenByUser = (userId: UserId): string => {
  return useLinkStore.getState().byUser[userId] || '';
};

export const getLinkTokenByItem = (itemId: ItemId): string => {
  return useLinkStore.getState().byItem[itemId] || '';
};

// Custom hooks for use in components
export const useLinkTokens = () => {
  const byUser = useLinkStore(state => state.byUser);
  const byItem = useLinkStore(state => state.byItem);
  return { byUser, byItem };
};

export const useLinkLoading = () => {
  return useLinkStore(state => state.loading);
};

export const useLinkError = () => {
  return useLinkStore(state => state.error);
};

export const useLinkActions = () => {
  const generateLinkToken = useLinkStore(state => state.generateLinkToken);
  const deleteLinkToken = useLinkStore(state => state.deleteLinkToken);
  const resetError = useLinkStore(state => state.resetError);
  
  return { generateLinkToken, deleteLinkToken, resetError };
}; 