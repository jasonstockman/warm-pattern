import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, withRetry } from '../db/client';
import {
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
  ProfileService,
} from '../types/profile';

/**
 * Implementation of the profile service
 */
export class ProfileServiceImpl implements ProfileService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Create a new profile
   * @param profile Profile data to create
   * @returns The created profile
   * @throws DatabaseError if creation fails
   */
  async create(profile: CreateProfileInput): Promise<Profile> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const now = new Date().toISOString();
      const newProfile = {
        ...profile,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
      };
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('profiles').insert(newProfile).select().single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to create profile: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Profile;
    } catch (error: any) {
      this.fastify.log.error(error, 'Profile creation failed');
      throw error instanceof DatabaseError
        ? error
        : new DatabaseError('Failed to create profile', 500, error);
    }
  }

  /**
   * Update an existing profile
   * @param id Profile ID to update
   * @param profile Profile data to update
   * @returns The updated profile
   * @throws DatabaseError if update fails or profile not found
   */
  async update(id: string, profile: UpdateProfileInput): Promise<Profile> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      // Add updated timestamp
      const updateData = {
        ...profile,
        updated_at: new Date().toISOString(),
      };
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('profiles')
          .update(updateData)
          .eq('id', id)
          .select()
          .single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to update profile: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Profile not found', 404);
      }
      
      return result.data as Profile;
    } catch (error: any) {
      this.fastify.log.error(error, `Profile update failed for id: ${id}`);
      throw error instanceof DatabaseError
        ? error
        : new DatabaseError('Failed to update profile', 500, error);
    }
  }

  /**
   * Get a profile by ID
   * @param id Profile ID to retrieve
   * @returns The profile data
   * @throws DatabaseError if profile not found or retrieval fails
   */
  async getById(id: string): Promise<Profile> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('profiles')
          .select()
          .eq('id', id)
          .single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get profile: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Profile not found', 404);
      }
      
      return result.data as Profile;
    } catch (error: any) {
      this.fastify.log.error(error, `Failed to get profile with id: ${id}`);
      throw error instanceof DatabaseError
        ? error
        : new DatabaseError('Failed to get profile', 500, error);
    }
  }

  /**
   * Get a profile by user ID
   * @param userId User ID associated with the profile
   * @returns The profile data
   * @throws DatabaseError if profile not found or retrieval fails
   */
  async getByUserId(userId: string): Promise<Profile> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      const result = await withRetry(() =>
        Promise.resolve(client.from('profiles')
          .select()
          .eq('user_id', userId)
          .single())
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get profile by user ID: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      if (!result.data) {
        throw new DatabaseError('Profile not found for this user', 404);
      }
      
      return result.data as Profile;
    } catch (error: any) {
      this.fastify.log.error(error, `Failed to get profile for user: ${userId}`);
      throw error instanceof DatabaseError
        ? error
        : new DatabaseError('Failed to get profile for user', 500, error);
    }
  }

  /**
   * Get all profiles with optional filtering
   * @param options Query options for pagination and filtering
   * @returns List of profiles
   * @throws DatabaseError if retrieval fails
   */
  async getAll(options?: { limit?: number; offset?: number; userId?: string }): Promise<Profile[]> {
    try {
      const client = this.fastify.getSupabaseClient();
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      let query = client.from('profiles').select();
      
      // Add user ID filter if provided
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      
      // Add pagination
      query = query.range(offset, offset + limit - 1);
      
      const result = await withRetry(() => Promise.resolve(query));
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to get profiles: ${result.error.message}`,
          500,
          result.error
        );
      }
      
      return result.data as Profile[];
    } catch (error: any) {
      this.fastify.log.error(error, 'Failed to get profiles');
      throw error instanceof DatabaseError
        ? error
        : new DatabaseError('Failed to get profiles', 500, error);
    }
  }

  /**
   * Delete a profile
   * @param id Profile ID to delete
   * @throws DatabaseError if deletion fails or profile not found
   */
  async delete(id: string): Promise<void> {
    try {
      const client = this.fastify.getSupabaseClient();
      
      // First, check if the profile exists
      const checkResult = await withRetry(() =>
        Promise.resolve(client.from('profiles')
          .select('id')
          .eq('id', id)
          .single())
      );
      
      if (checkResult.error || !checkResult.data) {
        throw new DatabaseError('Profile not found', 404);
      }
      
      // Delete the profile
      const result = await withRetry(() =>
        Promise.resolve(client.from('profiles').delete().eq('id', id))
      );
      
      if (result.error) {
        throw new DatabaseError(
          `Failed to delete profile: ${result.error.message}`,
          500,
          result.error
        );
      }
    } catch (error: any) {
      this.fastify.log.error(error, `Failed to delete profile with id: ${id}`);
      throw error instanceof DatabaseError
        ? error
        : new DatabaseError('Failed to delete profile', 500, error);
    }
  }
}

/**
 * Create a profile service plugin for Fastify
 */
export default async function profileServicePlugin(fastify: FastifyInstance) {
  const profileService = new ProfileServiceImpl(fastify);
  
  // Add service to Fastify instance
  fastify.decorate('profileService', profileService);
  
  fastify.log.info('Profile service registered');
}

// Add type definitions for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    profileService: ProfileService;
  }
} 