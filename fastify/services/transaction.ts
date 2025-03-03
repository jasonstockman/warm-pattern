// Declare type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    transactionService: TransactionService;
  }
}

import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, withRetry } from '../db/client';
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionService,
} from '../types/transaction';

/**
 * Implementation of the transaction service
 */
export class TransactionServiceImpl implements TransactionService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Create a new transaction
   * @param transaction Transaction data to create
   * @returns The created transaction
   * @throws DatabaseError if creation fails
   */
  async create(transaction: CreateTransactionInput): Promise<Transaction> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const now = new Date().toISOString();
      const newTransaction = {
        ...transaction,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('transactions').insert(newTransaction).select().single())
      );
      
      if (result.error) {
        this.fastify.log.error(result.error, 'Failed to create transaction');
        // Using any type here as the PostgresError structure might vary
        const pgError = result.error as any;
        throw new DatabaseError(
          'Failed to create transaction',
          pgError.code === '23505' ? 409 : 500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError(
          'Failed to create transaction',
          500,
          new Error('No data returned from database')
        );
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.fastify.log.error(error, 'Unexpected error creating transaction');
      throw new DatabaseError(
        'Failed to create transaction',
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Update an existing transaction
   * @param id Transaction ID to update
   * @param transaction Transaction data to update
   * @returns The updated transaction
   * @throws DatabaseError if update fails
   */
  async update(id: string, transaction: UpdateTransactionInput): Promise<Transaction> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const now = new Date().toISOString();
      const updatedTransaction = {
        ...transaction,
        updated_at: now,
      };
      
      const result = await withRetry(() =>
        Promise.resolve(
          client
            .from('transactions')
            .update(updatedTransaction)
            .eq('id', id)
            .select()
            .single()
        )
      );
      
      if (result.error) {
        this.fastify.log.error(result.error, 'Failed to update transaction');
        // Using any type here as the PostgresError structure might vary
        const pgError = result.error as any;
        throw new DatabaseError(
          'Failed to update transaction',
          pgError.code === '23505' ? 409 : 500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError(
          'Transaction not found',
          404,
          new Error(`No transaction found with id ${id}`)
        );
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.fastify.log.error(error, 'Unexpected error updating transaction');
      throw new DatabaseError(
        'Failed to update transaction',
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get a transaction by ID
   * @param id Transaction ID to retrieve
   * @returns The transaction
   * @throws DatabaseError if transaction not found
   */
  async getById(id: string): Promise<Transaction> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single()
        )
      );
      
      if (result.error) {
        this.fastify.log.error(result.error, 'Failed to get transaction');
        throw new DatabaseError(
          'Failed to get transaction',
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError(
          'Transaction not found',
          404,
          new Error(`No transaction found with id ${id}`)
        );
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.fastify.log.error(error, 'Unexpected error getting transaction');
      throw new DatabaseError(
        'Failed to get transaction',
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get all transactions with optional filtering
   * @param options Optional filtering and pagination options
   * @returns Array of transactions
   * @throws DatabaseError if query fails
   */
  async getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<Transaction[]> {
    try {
      const client = this.fastify.getSupabaseClient();
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      let query = client
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      
      if (options?.accountId) {
        query = query.eq('account_id', options.accountId);
      }
      
      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }
      
      if (options?.category) {
        // Search for category in the array of categories
        query = query.contains('category', [options.category]);
      }
      
      const result = await withRetry(() => Promise.resolve(query));
      
      if (result.error) {
        this.fastify.log.error(result.error, 'Failed to get transactions');
        throw new DatabaseError(
          'Failed to get transactions',
          500,
          result.error
        );
      }
      
      return result.data || [];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.fastify.log.error(error, 'Unexpected error getting transactions');
      throw new DatabaseError(
        'Failed to get transactions',
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Delete a transaction by ID
   * @param id Transaction ID to delete
   * @throws DatabaseError if deletion fails
   */
  async delete(id: string): Promise<void> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      // First check if the transaction exists
      const checkResult = await withRetry(() =>
        Promise.resolve(
          client
            .from('transactions')
            .select('id')
            .eq('id', id)
            .single()
        )
      );
      
      if (checkResult.error || !checkResult.data) {
        throw new DatabaseError(
          'Transaction not found',
          404,
          new Error(`No transaction found with id ${id}`)
        );
      }
      
      const result = await withRetry(() =>
        Promise.resolve(
          client
            .from('transactions')
            .delete()
            .eq('id', id)
        )
      );
      
      if (result.error) {
        this.fastify.log.error(result.error, 'Failed to delete transaction');
        throw new DatabaseError(
          'Failed to delete transaction',
          500,
          result.error
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.fastify.log.error(error, 'Unexpected error deleting transaction');
      throw new DatabaseError(
        'Failed to delete transaction',
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

/**
 * Fastify plugin that registers the transaction service
 */
export default async function transactionServicePlugin(fastify: FastifyInstance) {
  const transactionService = new TransactionServiceImpl(fastify);
  fastify.decorate('transactionService', transactionService);
} 