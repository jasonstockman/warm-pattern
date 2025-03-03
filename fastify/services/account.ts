// Declare type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    accountService: AccountService;
  }
}

import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, withRetry } from '../db/client';
import {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  AccountService,
} from '../types/account';

/**
 * Implementation of the account service
 */
export class AccountServiceImpl implements AccountService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Create a new account
   * @param account Account data to create
   * @returns The created account
   * @throws DatabaseError if creation fails
   */
  async create(account: CreateAccountInput): Promise<Account> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const now = new Date().toISOString();
      const newAccount = {
        ...account,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('accounts').insert(newAccount).select().single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to create account: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Account;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Update an existing account
   * @param id Account ID to update
   * @param account Account data to update
   * @returns The updated account
   * @throws DatabaseError if update fails or account not found
   */
  async update(id: string, account: UpdateAccountInput): Promise<Account> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const updateData = {
        ...account,
        updated_at: new Date().toISOString(),
      };
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('accounts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to update account: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Account not found', 404);
      }
      
      return result.data as Account;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get an account by ID
   * @param id Account ID to retrieve
   * @returns The account
   * @throws DatabaseError if retrieval fails or account not found
   */
  async getById(id: string): Promise<Account> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('accounts')
            .select()
            .eq('id', id)
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get account: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Account not found', 404);
      }
      
      return result.data as Account;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get all accounts with optional filtering
   * @param options Optional filtering and pagination options
   * @returns Array of accounts
   * @throws DatabaseError if retrieval fails
   */
  async getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    itemId?: string;
  }): Promise<Account[]> {
    try {
      const client = this.fastify.getSupabaseClient();
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      let query = client.from('accounts').select().range(offset, offset + limit - 1);
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.itemId) {
        query = query.eq('item_id', options.itemId);
      }
      
      const result = await withRetry(() => Promise.resolve(query));
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get accounts: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Account[];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Delete an account
   * @param id Account ID to delete
   * @throws DatabaseError if deletion fails
   */
  async delete(id: string): Promise<void> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('accounts')
            .delete()
            .eq('id', id)
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to delete account: ${result.error.message}`,
          500,
          result.error
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

/**
 * Account service plugin to register with Fastify
 */
export default async function accountServicePlugin(fastify: FastifyInstance) {
  const accountService = new AccountServiceImpl(fastify);
  
  // Decorate Fastify instance with account service
  fastify.decorate('accountService', accountService);
} 