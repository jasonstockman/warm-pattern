/**
 * Authentication context module that provides authentication state and actions
 * throughout the application.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';
import { User, AuthResponse, SignInCredentials, SignUpCredentials } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        if (authService.isAuthenticated()) {
          const token = authService.getToken();
          if (token) {
            // TODO: Fetch user profile using token if needed
            // For now, we'll just set isAuthenticated to true
            setUser({ id: 0, username: 'User', created_at: '', updated_at: '' } as User); // Placeholder
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to verify authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const credentials: SignInCredentials = { email, password };
      const response = await authService.signIn(credentials);
      
      // Debug log the auth response
      console.log('Auth response structure:', JSON.stringify(response, null, 2));
      
      if (response && response.session) {
        // Save authentication tokens
        authService.storeTokens(response);
        
        // Debug log the token after storage
        console.log('Token saved in localStorage:', 
          localStorage.getItem('token') ? 'Yes' : 'No', 
          localStorage.getItem('access_token') ? 'Yes' : 'No'
        );
        
        // Convert AuthResponse user to our User type
        const userData: User = {
          id: Number(response.user.id),
          username: response.user.email.split('@')[0], // Use part of email as username
          created_at: '',
          updated_at: ''
        };
        
        setUser(userData);
        return true;
      } else {
        console.error('Login response missing session data:', response);
        setError('Invalid credentials');
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const credentials: SignUpCredentials = { email, password };
      const response = await authService.signUp(credentials);
      
      if (response && response.session) {
        // Save authentication tokens
        authService.storeTokens(response);
        
        // Convert AuthResponse user to our User type
        const userData: User = {
          id: Number(response.user.id),
          username: response.user.email.split('@')[0], // Use part of email as username
          created_at: '',
          updated_at: ''
        };
        
        setUser(userData);
        return true;
      } else {
        setError('Registration failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.signOut();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 