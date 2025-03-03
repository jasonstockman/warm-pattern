/**
 * Users context module that provides user management functionality
 * throughout the application.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createContextFactory, BaseContextState } from './createContext';
import { UserType } from '../types/user';
import { UserId } from '../types/branded';
import userService from '../services/api/users';

/**
 * State interface for the users context
 */
interface UsersState extends BaseContextState {
  /** List of all users */
  users: UserType[];
  /** All users in the system */
  allUsers: UserType[];
  /** Currently selected user */
  currentUser: UserType | null;
  /** Newly created user */
  newUser: UserType | null;
  /** Lookup table of users by ID */
  usersById: { [key: string]: UserType };
}

/**
 * Actions interface for the users context
 */
interface UsersActions {
  /**
   * Fetches all users in the system
   * 
   * @param refresh - Whether to force a refresh from the API
   * @returns Promise that resolves when users are fetched
   */
  getUsers: (refresh?: boolean) => Promise<void>;
  
  /**
   * Fetches a specific user by ID
   * 
   * @param id - The ID of the user to fetch
   * @param refresh - Whether to force a refresh from the API
   * @returns Promise that resolves when the user is fetched
   */
  getUserById: (id: number, refresh?: boolean) => Promise<void>;
  
  /**
   * Creates a new user
   * 
   * @param username - The username for the new user
   * @returns Promise that resolves to the created user
   */
  addNewUser: (username: string) => Promise<UserType>;
  
  /**
   * Deletes a user by ID
   * 
   * @param id - The ID of the user to delete
   * @returns Promise that resolves when the user is deleted
   */
  deleteUserById: (id: number) => Promise<void>;
}

// Create the users context using our factory
const UsersContext = createContextFactory<UsersState, UsersActions>({
  displayName: 'Users',
  initialState: {
    users: [],
    allUsers: [],
    currentUser: null,
    newUser: null,
    usersById: {},
    loading: false,
    error: null,
  },
  initialActions: {
    getUsers: async () => {},
    getUserById: async () => {},
    addNewUser: async () => ({ id: 0 as unknown as UserId, username: '', created_at: '', updated_at: '' }),
    deleteUserById: async () => {},
  },
});

/**
 * Users provider component that manages users state
 */
export const UsersProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // State to track users
  const [state, setState] = useState<UsersState>({
    users: [],
    allUsers: [],
    currentUser: null,
    newUser: null,
    usersById: {},
    loading: false,
    error: null,
  });

  // Use a ref to track initialization to avoid re-renders
  const hasInitializedRef = useRef(false);
  
  // Use a ref to store usersById to avoid dependency cycles
  const usersByIdRef = useRef(state.usersById);
  
  // Use a ref to track pending requests to prevent duplicates
  const pendingRequestsRef = useRef<{[key: string]: boolean}>({});
  
  // Update the ref whenever state.usersById changes
  useEffect(() => {
    usersByIdRef.current = state.usersById;
  }, [state.usersById]);

  /**
   * Fetches all users from the API
   */
  const getUsers = useCallback(async (refresh?: boolean) => {
    // If we already have users and don't need to refresh, skip
    if (state.users.length > 0 && !refresh) {
      console.log('Users already loaded, skipping fetch');
      return;
    }

    // Create a request key
    const requestKey = 'getAllUsers';
    
    // Check if this request is already pending
    if (pendingRequestsRef.current[requestKey]) {
      console.log('Request already pending for getAllUsers, skipping duplicate');
      return;
    }

    // Mark this request as pending
    pendingRequestsRef.current[requestKey] = true;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Fetching users, refresh:', refresh);
      
      const users = await userService.getUsers();
      
      // Create a lookup table for users by ID
      const usersById: {[key: string]: UserType} = {};
      users.forEach(user => {
        if (user?.id) {
          usersById[user.id] = user;
        }
      });
      
      setState(prev => ({
        ...prev,
        users,
        allUsers: users,
        usersById,
        loading: false,
        error: null
      }));
      
      hasInitializedRef.current = true;
    } catch (error) {
      console.error('Error fetching users:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      }));
    } finally {
      // Clear the pending request flag
      pendingRequestsRef.current[requestKey] = false;
    }
  }, []); // Remove all dependencies since we're using refs and don't need them

  /**
   * Fetches a specific user by ID
   */
  const getUserById = useCallback(async (id: number, refresh?: boolean) => {
    // Add safety check - prevent duplicate requests
    if (state.loading && !refresh) {
      console.log('Already loading user data, skipping request');
      return;
    }

    // Create a request key
    const requestKey = `getUser_${id}`;
    
    // Check if this request is already pending
    if (pendingRequestsRef.current[requestKey] && !refresh) {
      console.log(`Request already pending for user ${id}, skipping duplicate`);
      return;
    }

    // Mark this request as pending
    pendingRequestsRef.current[requestKey] = true;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Getting user by ID:', id, 'refresh:', refresh);
      
      // Use the ref instead of state directly to avoid dependency cycle
      if (refresh || !usersByIdRef.current[id]) {
        const user = await userService.getUserById(id);
        
        setState(prev => ({
          ...prev,
          currentUser: user,
          usersById: { ...prev.usersById, [user.id]: user },
          loading: false,
        }));
      } else {
        // Access from the ref to avoid dependency on state
        const existingUser = usersByIdRef.current[id];
        setState(prev => ({
          ...prev,
          currentUser: existingUser,
          loading: false,
        }));
      }
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to fetch user ${id}`,
      }));
      throw error;
    } finally {
      // Clear the pending request flag
      pendingRequestsRef.current[requestKey] = false;
    }
  }, [state.loading]); // Only depends on loading state

  /**
   * Creates a new user
   */
  const addNewUser = useCallback(async (username: string) => {
    // Add safety check - prevent duplicate requests
    if (state.loading) {
      console.log('Already processing a request, skipping');
      throw new Error('A request is already in progress');
    }

    // Create a request key
    const requestKey = `addUser_${username}`;
    
    // Check if this request is already pending
    if (pendingRequestsRef.current[requestKey]) {
      console.log(`Request already pending for adding user ${username}, skipping duplicate`);
      throw new Error('This request is already in progress');
    }

    // Mark this request as pending
    pendingRequestsRef.current[requestKey] = true;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Adding new user:', username);
      
      // In a real app, this would call the API service
      const newUser = await userService.createUser({ username });
      
      setState(prev => ({
        ...prev,
        allUsers: [...prev.allUsers, newUser],
        usersById: { ...prev.usersById, [newUser.id]: newUser },
        newUser,
        loading: false,
      }));
      
      return newUser;
    } catch (error) {
      console.error('Error adding new user:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to add user',
      }));
      throw error;
    } finally {
      // Clear the pending request flag
      pendingRequestsRef.current[requestKey] = false;
    }
  }, [state.loading]); // Only depends on loading state

  /**
   * Deletes a user by ID
   */
  const deleteUserById = useCallback(async (id: number) => {
    // Add safety check - prevent duplicate requests
    if (state.loading) {
      console.log('Already processing a request, skipping');
      throw new Error('A request is already in progress');
    }

    // Create a request key
    const requestKey = `deleteUser_${id}`;
    
    // Check if this request is already pending
    if (pendingRequestsRef.current[requestKey]) {
      console.log(`Request already pending for deleting user ${id}, skipping duplicate`);
      throw new Error('This request is already in progress');
    }

    // Mark this request as pending
    pendingRequestsRef.current[requestKey] = true;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Deleting user by ID:', id);
      
      // In a real app, this would call the API service
      await userService.deleteUser(id);
      
      setState(prev => {
        // Create a new usersById object without the deleted user
        const newUsersById = { ...prev.usersById };
        delete newUsersById[id];
        
        return {
          ...prev,
          allUsers: prev.allUsers.filter(user => user.id !== id),
          usersById: newUsersById,
          // If we're deleting the current user, clear it
          currentUser: prev.currentUser?.id === id ? null : prev.currentUser,
          loading: false,
        };
      });
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to delete user ${id}`,
      }));
      throw error;
    } finally {
      // Clear the pending request flag
      pendingRequestsRef.current[requestKey] = false;
    }
  }, [state.loading]); // Only depends on loading state

  // Initialize users on first render
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const initUsers = async () => {
      try {
        if (!mounted) return;
        await getUsers();
      } catch (error) {
        console.error('Failed to initialize users:', error);
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          setTimeout(initUsers, 1000 * retryCount); // Exponential backoff
        }
      }
    };

    initUsers();

    return () => {
      mounted = false;
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    getUsers,
    getUserById,
    addNewUser,
    deleteUserById,
  }), [
    state,
    getUsers,
    getUserById,
    addNewUser,
    deleteUserById,
  ]);

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};

// Export the custom hook for using the users context
export const useUsers = UsersContext.useContext; 