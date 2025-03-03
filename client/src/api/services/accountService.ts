import apiClient from '../apiClient';
import { Account, Transaction } from '../../types/account';

/**
 * Service for managing bank accounts and transactions
 */
export const accountService = {
  /**
   * Get all accounts
   * @returns Array of accounts
   */
  getAll: async (): Promise<Account[]> => {
    return await apiClient.get<Account[]>('/accounts');
  },
  
  /**
   * Get an account by ID
   * @param accountId - ID of the account to fetch
   * @returns The account with the specified ID
   */
  getById: async (accountId: number): Promise<Account> => {
    const accounts = await apiClient.get<Account[]>(`/accounts/${accountId}`);
    return accounts[0];
  },
  
  /**
   * Get accounts by item ID
   * @param itemId - ID of the item
   * @returns Accounts associated with the item
   */
  getByItemId: async (itemId: number): Promise<Account[]> => {
    return await apiClient.get<Account[]>(`/accounts?item_id=${itemId}`);
  },
  
  /**
   * Get accounts by user ID
   * @param userId - ID of the user
   * @returns Accounts belonging to the user
   */
  getByUserId: async (userId: number): Promise<Account[]> => {
    return await apiClient.get<Account[]>(`/accounts?user_id=${userId}`);
  },
  
  /**
   * Get all transactions
   * @returns Array of transactions
   */
  getAllTransactions: async (): Promise<Transaction[]> => {
    return await apiClient.get<Transaction[]>('/transactions');
  },
  
  /**
   * Get transactions for an account
   * @param accountId - ID of the account
   * @returns Transactions for the account
   */
  getTransactionsByAccount: async (accountId: number): Promise<Transaction[]> => {
    return await apiClient.get<Transaction[]>(`/transactions?account_id=${accountId}`);
  },
  
  /**
   * Get transactions for a user
   * @param userId - ID of the user
   * @returns Transactions for the user
   */
  getTransactionsByUser: async (userId: number): Promise<Transaction[]> => {
    return await apiClient.get<Transaction[]>(`/transactions?user_id=${userId}`);
  },
  
  /**
   * Get transactions for an item
   * @param itemId - ID of the item
   * @returns Transactions for the item
   */
  getTransactionsByItem: async (itemId: number): Promise<Transaction[]> => {
    return await apiClient.get<Transaction[]>(`/transactions?item_id=${itemId}`);
  }
};

export default accountService; 