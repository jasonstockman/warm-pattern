import apiClient from '../apiClient';
import { User, CreateUserRequest } from '../../types/user';
import { Item } from '../../types/item';
import { Account } from '../../types/account';
import { Transaction } from '../../types/account';

/**
 * Service for managing users and their related data
 */
export const userService = {
  /**
   * Get all users
   * @returns Array of users
   */
  getAll: async (): Promise<User[]> => {
    return await apiClient.get<User[]>('/users');
  },
  
  /**
   * Get a user by ID
   * @param userId - ID of the user to fetch
   * @returns The user with the specified ID
   */
  getById: async (userId: number): Promise<User> => {
    const users = await apiClient.get<User[]>(`/users/${userId}`);
    return users[0]; // API returns an array with a single user
  },
  
  /**
   * Create a new user
   * @param userData - Data for the new user
   * @returns The newly created user
   */
  create: async (userData: CreateUserRequest): Promise<User> => {
    const users = await apiClient.post<User[]>('/users', userData);
    return users[0]; // API returns an array with the new user
  },
  
  /**
   * Delete a user
   * @param userId - ID of the user to delete
   */
  delete: async (userId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
  
  /**
   * Get all items for a user
   * @param userId - ID of the user
   * @returns Items belonging to the user
   */
  getItems: async (userId: number): Promise<Item[]> => {
    return await apiClient.get<Item[]>(`/users/${userId}/items`);
  },
  
  /**
   * Get all accounts for a user
   * @param userId - ID of the user
   * @returns Accounts belonging to the user
   */
  getAccounts: async (userId: number): Promise<Account[]> => {
    return await apiClient.get<Account[]>(`/users/${userId}/accounts`);
  },
  
  /**
   * Get all transactions for a user
   * @param userId - ID of the user
   * @returns Transactions belonging to the user
   */
  getTransactions: async (userId: number): Promise<Transaction[]> => {
    return await apiClient.get<Transaction[]>(`/users/${userId}/transactions`);
  },
  
  /**
   * Get a session by username (login)
   * @param username - Username to login with
   * @returns The user if found
   */
  getSession: async (username: string): Promise<User | null> => {
    const response = await apiClient.post<User[]>('/sessions', { username });
    return response.length > 0 ? response[0] : null;
  }
};

export default userService; 