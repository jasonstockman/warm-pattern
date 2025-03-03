/**
 * Mock implementation of the profile service for testing
 */
import { FastifyInstance } from 'fastify';
import { Profile, CreateProfileInput, UpdateProfileInput, ProfileService } from '../../types/profile';
import fp from 'fastify-plugin';

// Mock functions
export const mockCreate = jest.fn();
export const mockUpdate = jest.fn();
export const mockGetById = jest.fn();
export const mockGetByUserId = jest.fn();
export const mockGetAll = jest.fn();
export const mockDelete = jest.fn();

/**
 * Reset all mocks between tests
 */
export function resetMocks(): void {
  mockCreate.mockClear();
  mockUpdate.mockClear();
  mockGetById.mockClear();
  mockGetByUserId.mockClear();
  mockGetAll.mockClear();
  mockDelete.mockClear();
}

/**
 * Mock implementation of the profile service
 */
class MockProfileService implements ProfileService {
  async create(profile: CreateProfileInput): Promise<Profile> {
    return mockCreate(profile);
  }

  async update(id: string, profile: UpdateProfileInput): Promise<Profile> {
    return mockUpdate(id, profile);
  }

  async getById(id: string): Promise<Profile> {
    return mockGetById(id);
  }

  async getByUserId(userId: string): Promise<Profile> {
    return mockGetByUserId(userId);
  }

  async getAll(options?: { limit?: number; offset?: number; userId?: string }): Promise<Profile[]> {
    return mockGetAll(options);
  }

  async delete(id: string): Promise<void> {
    return mockDelete(id);
  }
}

/**
 * Mock profile service plugin
 */
const mockProfileServicePlugin = async (fastify: FastifyInstance) => {
  const service = new MockProfileService();
  fastify.decorate('profileService', service);
  fastify.log.info('Mock Profile service initialized');
};

/**
 * Export the plugin
 */
export default fp(mockProfileServicePlugin, {
  name: 'profileService'
}); 