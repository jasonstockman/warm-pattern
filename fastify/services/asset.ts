// Declare type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    assetService: AssetService;
  }
}

import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, withRetry } from '../db/client';
import {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
  AssetService,
} from '../types/asset';

/**
 * Implementation of the asset service
 */
export class AssetServiceImpl implements AssetService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Create a new asset
   * @param asset Asset data to create
   * @returns The created asset
   * @throws DatabaseError if creation fails
   */
  async create(asset: CreateAssetInput): Promise<Asset> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const now = new Date().toISOString();
      const newAsset = {
        ...asset,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('assets').insert(newAsset).select().single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to create asset: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Asset;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Update an existing asset
   * @param id Asset ID to update
   * @param asset Asset data to update
   * @returns The updated asset
   * @throws DatabaseError if update fails or asset not found
   */
  async update(id: string, asset: UpdateAssetInput): Promise<Asset> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const updateData = {
        ...asset,
        updated_at: new Date().toISOString(),
      };
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('assets')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to update asset: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Asset not found', 404);
      }
      
      return result.data as Asset;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to update asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get an asset by ID
   * @param id Asset ID to retrieve
   * @returns The asset
   * @throws DatabaseError if retrieval fails or asset not found
   */
  async getById(id: string): Promise<Asset> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('assets')
            .select()
            .eq('id', id)
            .single()
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get asset: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Asset not found', 404);
      }
      
      return result.data as Asset;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get all assets with optional filtering
   * @param options Optional filtering and pagination options
   * @returns Array of assets
   * @throws DatabaseError if retrieval fails
   */
  async getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    type?: string;
  }): Promise<Asset[]> {
    try {
      const client = this.fastify.getSupabaseClient();
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      let query = client.from('assets').select().range(offset, offset + limit - 1);
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }
      
      const result = await withRetry(() => Promise.resolve(query));
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get assets: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Asset[];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Delete an asset
   * @param id Asset ID to delete
   * @throws DatabaseError if deletion fails
   */
  async delete(id: string): Promise<void> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(
          client.from('assets')
            .delete()
            .eq('id', id)
        )
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to delete asset: ${result.error.message}`,
          500,
          result.error
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

/**
 * Asset service plugin to register with Fastify
 */
export default async function assetServicePlugin(fastify: FastifyInstance) {
  const assetService = new AssetServiceImpl(fastify);
  
  // Decorate Fastify instance with asset service
  fastify.decorate('assetService', assetService);
} 