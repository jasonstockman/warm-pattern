// Declare type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    itemService: ItemService;
  }
}

import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, withRetry } from '../db/client';
import {
  Item,
  CreateItemInput,
  UpdateItemInput,
  ItemService,
} from '../types/item';

/**
 * Implementation of the item service
 */
export class ItemServiceImpl implements ItemService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Create a new item
   * @param item Item data to create
   * @returns The created item
   * @throws DatabaseError if creation fails
   */
  async create(item: CreateItemInput): Promise<Item> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const now = new Date().toISOString();
      const newItem = {
        ...item,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('items').insert(newItem).select().single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to create item: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Item;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Update an existing item
   * @param id Item ID to update
   * @param item Item data to update
   * @returns The updated item
   * @throws DatabaseError if update fails or item not found
   */
  async update(id: string, item: UpdateItemInput): Promise<Item> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const updateData = {
        ...item,
        updated_at: new Date().toISOString(),
      };
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('items')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to update item: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Item not found', 404);
      }
      
      return result.data as Item;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get an item by ID
   * @param id Item ID to retrieve
   * @returns The item
   * @throws DatabaseError if retrieval fails or item not found
   */
  async getById(id: string): Promise<Item> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('items')
            .select()
            .eq('id', id)
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get item: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Item not found', 404);
      }
      
      return result.data as Item;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get an item by Plaid Item ID
   * @param plaidItemId Plaid Item ID to retrieve
   * @returns The item
   * @throws DatabaseError if retrieval fails or item not found
   */
  async getByPlaidItemId(plaidItemId: string): Promise<Item> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('items')
            .select()
            .eq('plaid_item_id', plaidItemId)
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get item by Plaid Item ID: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Item not found', 404);
      }
      
      return result.data as Item;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get item by Plaid Item ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get all items with optional filtering
   * @param options Optional filtering and pagination options
   * @returns Array of items
   * @throws DatabaseError if retrieval fails
   */
  async getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    status?: string;
  }): Promise<Item[]> {
    try {
      const client = this.fastify.getSupabaseClient();
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      let query = client.from('items').select().range(offset, offset + limit - 1);
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      const result = await withRetry(() => Promise.resolve(query));
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get items: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Item[];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Delete an item
   * @param id Item ID to delete
   * @throws DatabaseError if deletion fails
   */
  async delete(id: string): Promise<void> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('items')
            .delete()
            .eq('id', id)
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to delete item: ${result.error.message}`,
          500,
          result.error
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

/**
 * Item service plugin to register with Fastify
 */
export default async function itemServicePlugin(fastify: FastifyInstance) {
  const itemService = new ItemServiceImpl(fastify);
  
  // Decorate Fastify instance with item service
  fastify.decorate('itemService', itemService);
} 