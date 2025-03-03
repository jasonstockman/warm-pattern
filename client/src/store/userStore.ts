import { createAppStore } from './createStore';
import { User, UserId } from '../types';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types';

export interface UserState {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  getUsers: (forceRefresh?: boolean) => Promise<void>;
  addUser: (username: string) => Promise<User | null>;
  updateUser: (user: User) => Promise<void>;
  removeUser: (userId: UserId) => Promise<void>;
  resetUsers: () => void;
}

export const useUserStore = createAppStore<UserState>(
  (set, get) => ({
    // Initial state
    users: [],
    loading: false,
    error: null,
    initialized: false,
    
    // Get all users
    getUsers: async (forceRefresh = false) => {
      // Skip if already initialized and no force refresh
      if (get().initialized && !forceRefresh) return;
      
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.USERS);
        const data: ApiResponse<User[]> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch users');
        }
        
        set({ users: data.data, loading: false, initialized: true });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    // Add a new user
    addUser: async (username: string) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.USERS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });
        
        const data: ApiResponse<User> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to create user');
        }
        
        const newUser = data.data;
        
        set((state) => ({
          users: [...state.users, newUser],
          loading: false,
        }));
        
        return newUser;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
        return null;
      }
    },
    
    // Update an existing user
    updateUser: async (updatedUser: User) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${updatedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
        
        const data: ApiResponse<User> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to update user');
        }
        
        set((state) => ({
          users: state.users.map((user) => 
            user.id === updatedUser.id ? data.data : user
          ),
          loading: false,
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    // Remove a user
    removeUser: async (userId: UserId) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
          method: 'DELETE',
        });
        
        const data: ApiResponse<null> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete user');
        }
        
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
          loading: false,
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          loading: false 
        });
      }
    },
    
    // Reset the store
    resetUsers: () => {
      set({ users: [], loading: false, error: null, initialized: false });
    },
  }),
  { 
    name: 'userStore',
    persistOptions: {
      name: 'user-storage',
      partialize: (state) => ({ 
        users: state.users,
        initialized: state.initialized
      }),
      // Don't persist loading or error states
    }
  }
); 