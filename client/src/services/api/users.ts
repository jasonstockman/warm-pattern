/**
 * User service module that handles all user-related API requests.
 * This module provides a clean interface for working with user data.
 */
import api, { ApiResponse } from './index';
import { UserType } from '../../types/user';

/**
 * Interface for create user request body
 */
export interface CreateUserRequest {
  /** Username for the new user */
  username: string;
}

/**
 * Interface for user login request body
 */
export interface LoginUserRequest {
  /** Username for login */
  username: string;
}

/**
 * UserService class provides methods for managing users
 */
export class UserService {
  private baseUrl = '/users';

  /**
   * Fetches all users in the system
   * 
   * @returns Promise that resolves to all users
   */
  async getUsers(): Promise<UserType[]> {
    try {
      const response = await api.get<any>(this.baseUrl);
      // Handle both array and object responses
      const users = Array.isArray(response.data) ? response.data : response.data?.users || [];
      
      return users.map((user: any) => ({
        id: Number(user.id),
        username: user.username || '',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || user.created_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Fetches a specific user by ID
   * 
   * @param userId - The ID of the user to fetch
   * @returns Promise that resolves to the user
   */
  async getUserById(userId: number): Promise<UserType | null> {
    try {
      const response = await api.get<UserType>(`${this.baseUrl}/${userId}`);
      if (!response.data || typeof response.data !== 'object') {
        return null;
      }
      return {
        ...response.data,
        id: Number(response.data.id),
        created_at: response.data.created_at || new Date().toISOString(),
        updated_at: response.data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      return null;
    }
  }

  /**
   * Creates a new user
   * 
   * @param data - The user data to create
   * @returns Promise that resolves to the created user
   */
  async createUser(data: CreateUserRequest): Promise<UserType> {
    try {
      const response = await api.post<UserType>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Updates an existing user
   * 
   * @param userId - The ID of the user to update
   * @param data - The user data to update
   * @returns Promise that resolves to the updated user
   */
  async updateUser(userId: number, data: Partial<UserType>): Promise<UserType> {
    try {
      const response = await api.put<UserType>(`${this.baseUrl}/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a user
   * 
   * @param userId - The ID of the user to delete
   * @returns Promise that resolves when the user is deleted
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${userId}`);
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Logs in a user
   * 
   * @param data - Login credentials
   * @returns Promise that resolves to the logged-in user
   */
  async loginUser(data: LoginUserRequest): Promise<UserType> {
    try {
      const response = await api.post<UserType>('/sessions', data);
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const userService = new UserService();
export default userService; 