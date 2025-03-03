/**
 * Mock implementation of the Supabase plugin for testing
 */
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createMockSupabaseClient } from '../helpers';

/**
 * Mock Supabase responses for testing
 */
export let mockSupabaseClient = createMockSupabaseClient();
export let mockGetClient = jest.fn().mockReturnValue(mockSupabaseClient);

/**
 * Reset all mocks between tests
 */
export function resetMocks(): void {
  mockSupabaseClient = createMockSupabaseClient();
  mockGetClient = jest.fn().mockReturnValue(mockSupabaseClient);
}

/**
 * Mock implementation of the Supabase plugin
 */
const mockSupabasePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate('supabase', mockSupabaseClient);
  fastify.decorate('getSupabaseClient', mockGetClient);
  
  fastify.decorateRequest('getSupabaseClient', function() {
    return mockGetClient();
  });
  
  fastify.log.info('Mock Supabase client initialized');
};

/**
 * Export the plugin
 */
export default fp(mockSupabasePlugin, {
  name: 'supabase',
}); 