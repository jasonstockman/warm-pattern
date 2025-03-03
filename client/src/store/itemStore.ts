import { createAppStore } from './createStore';
import { ItemId, UserId } from '../types';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types';
import { ItemType } from '../components/types';
import groupBy from 'lodash/groupBy';

export interface ItemState {
  // State
  items: Record<number, ItemType>;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Getters (computed)
  itemsByUser: Record<string, ItemType[]>;
  
  // Actions
  getItemsByUser: (userId: UserId, forceRefresh?: boolean) => Promise<void>;
  getItemById: (id: ItemId, forceRefresh?: boolean) => Promise<void>;
  deleteItemById: (id: ItemId, userId: UserId) => Promise<void>;
  deleteItemsByUserId: (userId: UserId) => void;
  setItemState: (itemId: ItemId, status: string) => Promise<void>;
  resetItems: () => void;
}

export const useItemStore = createAppStore<ItemState>(
  (set, get) => ({
    // Initial state
    items: {},
    loading: false,
    error: null,
    initialized: false,
    
    // Computed properties
    get itemsByUser() {
      return groupBy(Object.values(get().items), 'user_id') as Record<string, ItemType[]>;
    },
    
    // Actions
    getItemsByUser: async (userId, forceRefresh = false) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.userSpecific.items(userId));
        const data: ApiResponse<ItemType[]> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch items');
        }
        
        // Convert array to record with id as key
        const itemsRecord = data.data.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as Record<number, ItemType>);
        
        set((state) => ({ 
          items: { ...state.items, ...itemsRecord },
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
    
    getItemById: async (id, forceRefresh = false) => {
      // Skip if already loaded and not forcing refresh
      if (get().items[id] && !forceRefresh) return;
      
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.ITEMS}/${id}`);
        const data: ApiResponse<ItemType> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch item');
        }
        
        set((state) => ({
          items: { ...state.items, [id]: data.data },
          loading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    deleteItemById: async (id, userId) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.ITEMS}/${id}`, {
          method: 'DELETE',
        });
        
        const data: ApiResponse<null> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete item');
        }
        
        // First remove the item from state
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[id];
          return { items: newItems, loading: false };
        });
        
        // Then refresh the user's items
        await get().getItemsByUser(userId, true);
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    deleteItemsByUserId: (userId) => {
      set((state) => {
        const newItems = { ...state.items };
        // Remove all items belonging to this user
        Object.values(newItems).forEach((item: ItemType) => {
          if (item.user_id === userId) {
            delete newItems[item.id];
          }
        });
        return { items: newItems };
      });
    },
    
    setItemState: async (itemId, status) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.ITEMS}/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        
        const data: ApiResponse<ItemType> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update item state');
        }
        
        set((state) => ({
          items: { ...state.items, [itemId]: data.data },
          loading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    resetItems: () => {
      set({ items: {}, loading: false, error: null, initialized: false });
    },
  }),
  { 
    name: 'itemStore',
    persistOptions: {
      name: 'item-storage',
      partialize: (state) => ({ 
        items: state.items,
        initialized: state.initialized
      }),
      // Don't persist loading or error states
    }
  }
); 