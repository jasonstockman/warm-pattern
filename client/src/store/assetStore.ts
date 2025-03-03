import { createAppStore } from './createStore';
import { Asset, AssetId, UserId, CreateAssetRequest } from '../types';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types';
import { groupBy } from 'lodash';

export interface AssetState {
  // State
  assets: Record<number, Asset>;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Computed properties
  assetsByUser: Record<string, Asset[]>;
  
  // Actions
  getAssetsByUser: (userId: UserId, forceRefresh?: boolean) => Promise<void>;
  addAsset: (data: CreateAssetRequest) => Promise<Asset | null>;
  deleteAsset: (assetId: AssetId) => Promise<void>;
  resetAssets: () => void;
}

export const useAssetStore = createAppStore<AssetState>(
  (set, get) => ({
    // Initial state
    assets: {},
    loading: false,
    error: null,
    initialized: false,
    
    // Computed properties
    get assetsByUser() {
      return groupBy(Object.values(get().assets), 'user_id') as Record<string, Asset[]>;
    },
    
    // Actions
    getAssetsByUser: async (userId, forceRefresh = false) => {
      // Skip if we already have assets for this user and no force refresh
      const existingAssets = get().assetsByUser[userId] || [];
      if (existingAssets.length > 0 && !forceRefresh) return;
      
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.userSpecific.assets(userId));
        const data: ApiResponse<Asset[]> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch assets');
        }
        
        // Convert array to record with id as key
        const assetsRecord = data.data.reduce((acc, asset) => {
          acc[asset.id] = asset;
          return acc;
        }, {} as Record<number, Asset>);
        
        set((state) => ({ 
          assets: { ...state.assets, ...assetsRecord },
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
    
    addAsset: async ({ userId, value, description }) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.ASSETS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, value, description }),
        });
        
        const data: ApiResponse<Asset> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to create asset');
        }
        
        const newAsset = data.data;
        
        set((state) => ({
          assets: { ...state.assets, [newAsset.id]: newAsset },
          loading: false,
        }));
        
        return newAsset;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
        return null;
      }
    },
    
    deleteAsset: async (assetId) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.ASSETS}/${assetId}`, {
          method: 'DELETE',
        });
        
        const data: ApiResponse<null> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete asset');
        }
        
        set((state) => {
          const newAssets = { ...state.assets };
          delete newAssets[assetId];
          return { assets: newAssets, loading: false };
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    resetAssets: () => {
      set({ assets: {}, loading: false, error: null, initialized: false });
    },
  }),
  { 
    name: 'assetStore',
    persistOptions: {
      name: 'asset-storage',
      partialize: (state) => ({ 
        assets: state.assets,
        initialized: state.initialized
      }),
      // Don't persist loading or error states
    }
  }
); 