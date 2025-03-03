import apiClient from '../apiClient';
import { Item } from '../../types/item';
import { Account } from '../../types/account';

/**
 * Interface for creating a link token request
 */
interface LinkTokenCreateRequest {
  user_id: number;
  client_name: string;
  products: string[];
  language: string;
  country_codes: string[];
}

/**
 * Response from creating a link token
 */
interface LinkTokenCreateResponse {
  link_token: string;
  expiration: string;
}

/**
 * Service for managing Plaid items and related functionality
 */
export const itemService = {
  /**
   * Get all items
   * @returns Array of items
   */
  getAll: async (): Promise<Item[]> => {
    return await apiClient.get<Item[]>('/items');
  },
  
  /**
   * Get an item by ID
   * @param itemId - ID of the item to fetch
   * @returns The item with the specified ID
   */
  getById: async (itemId: number): Promise<Item> => {
    const items = await apiClient.get<Item[]>(`/items/${itemId}`);
    return items[0];
  },
  
  /**
   * Get items by user ID
   * @param userId - ID of the user
   * @returns Items belonging to the user
   */
  getByUserId: async (userId: number): Promise<Item[]> => {
    return await apiClient.get<Item[]>(`/users/${userId}/items`);
  },
  
  /**
   * Get accounts for an item
   * @param itemId - ID of the item
   * @returns Accounts associated with the item
   */
  getAccounts: async (itemId: number): Promise<Account[]> => {
    return await apiClient.get<Account[]>(`/items/${itemId}/accounts`);
  },
  
  /**
   * Create a link token for initializing Plaid Link
   * @param request - Link token creation parameters
   * @returns Link token response from Plaid
   */
  createLinkToken: async (request: LinkTokenCreateRequest): Promise<LinkTokenCreateResponse> => {
    return await apiClient.post<LinkTokenCreateResponse>('/link-token', request);
  },
  
  /**
   * Exchange a public token from Plaid Link for an access token
   * @param publicToken - Public token from Plaid Link
   * @param userId - ID of the user to associate with the new item
   * @returns The newly created item
   */
  exchangePublicToken: async (publicToken: string, userId: number): Promise<Item> => {
    const response = await apiClient.post<Item[]>('/items', {
      public_token: publicToken,
      user_id: userId
    });
    return response[0];
  },
  
  /**
   * Update an item's transactions
   * @param itemId - ID of the item
   * @returns Updated item
   */
  updateTransactions: async (itemId: number): Promise<Item> => {
    const items = await apiClient.post<Item[]>(`/items/${itemId}/transactions/update`, {});
    return items[0];
  },
  
  /**
   * Remove an item
   * @param itemId - ID of the item to remove
   */
  removeItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/items/${itemId}`);
  }
};

export default itemService; 