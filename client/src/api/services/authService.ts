import apiClient from '../apiClient';
import { AuthResponse, SignInCredentials, SignUpCredentials } from '../../types/user';
import { setAuthToken, clearAuthToken } from '../../services/api';

/**
 * Service for managing authentication and user sessions
 */
export const authService = {
  /**
   * Sign up a new user
   * @param credentials - The user's sign up information
   * @returns The authentication response with user and tokens
   */
  signUp: async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    return await apiClient.post<AuthResponse>('/auth/signup', credentials);
  },
  
  /**
   * Sign in an existing user
   * @param credentials - The user's sign in credentials
   * @returns The authentication response with user and tokens
   */
  signIn: async (credentials: SignInCredentials): Promise<AuthResponse> => {
    return await apiClient.post<AuthResponse>('/auth/signin', credentials);
  },
  
  /**
   * Manually set a token (useful for testing or debugging)
   * @param token - The token to store
   */
  setToken: (token: string): void => {
    setAuthToken(token);
  },
  
  /**
   * Sign out the current user by removing tokens
   */
  signOut: (): void => {
    clearAuthToken();
  },
  
  /**
   * Check if the user is authenticated
   * @returns True if the user has a valid access token
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('token') || !!localStorage.getItem('access_token');
  },
  
  /**
   * Get the current user's token
   * @returns The current access token or null if not authenticated
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    // First try 'token', then fall back to 'access_token'
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  },
  
  /**
   * Store authentication tokens in local storage
   * @param response - The authentication response containing tokens
   */
  storeTokens: (response: AuthResponse): void => {
    if (typeof window !== 'undefined' && response.session?.access_token) {
      setAuthToken(response.session.access_token);
      
      // Also store refresh token if available
      if (response.session.refresh_token) {
        localStorage.setItem('refresh_token', response.session.refresh_token);
      }
    }
  }
};

export default authService; 