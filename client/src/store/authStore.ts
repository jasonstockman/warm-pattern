import { createAppStore } from './createStore';
import { User } from '../types';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types';

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication store using Zustand
 * Handles user authentication state and actions
 */
export const useAuthStore = createAppStore<AuthState>(
  (set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    
    /**
     * Login a user
     * @param username - The username
     * @param password - The password
     * @returns True if login was successful
     */
    login: async (username: string, password: string) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          credentials: 'include', // Include cookies
        });
        
        const data: ApiResponse<User> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Login failed');
        }
        
        set({ 
          user: data.data,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        
        return true;
      } catch (error) {
        set({ 
          loading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
          isAuthenticated: false,
          user: null,
        });
        return false;
      }
    },
    
    /**
     * Sign up a new user
     * @param email - The user's email
     * @param password - The password
     * @returns True if signup was successful
     */
    signup: async (email: string, password: string) => {
      set({ loading: true, error: null });
      
      try {
        const response = await fetch(API_ENDPOINTS.SIGNUP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // Include cookies
        });
        
        const data: ApiResponse<User> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Signup failed');
        }
        
        // Don't set user and isAuthenticated here, as most signup flows
        // require email verification before allowing login
        set({ 
          loading: false,
          error: null,
        });
        
        return true;
      } catch (error) {
        set({ 
          loading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
        return false;
      }
    },
    
    /**
     * Logout the current user
     */
    logout: async () => {
      set({ loading: true });
      
      try {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          credentials: 'include', // Include cookies
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      // Clear auth state regardless of API response
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    },
    
    /**
     * Check if user is authenticated
     * Called during app initialization
     */
    checkAuth: async () => {
      // Skip if already authenticated
      if (get().isAuthenticated) return;
      
      set({ loading: true });
      
      try {
        // Make API call to validate session
        const response = await fetch(`${API_ENDPOINTS.USERS}/me`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Session expired');
        }
        
        const data: ApiResponse<User> = await response.json();
        
        set({
          user: data.data,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    },
    
    /**
     * Clear any authentication errors
     */
    clearError: () => {
      set({ error: null });
    },
  }),
  { 
    name: 'authStore',
    persistOptions: {
      name: 'auth-storage', // name of the item in storage
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Don't persist loading or error states
    }
  }
); 