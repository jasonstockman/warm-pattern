/**
 * Mock implementation of the authentication plugin for testing
 */
import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Mock authentication functions
 */
export const mockRequireAuth = jest.fn().mockImplementation(
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Default implementation passes through
    // This can be overridden in tests to simulate auth failures
    return;
  }
);

export const mockOptionalAuth = jest.fn().mockImplementation(
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Default implementation passes through
    return;
  }
);

export const mockVerifyJWT = jest.fn().mockImplementation(
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Default implementation passes through
    return;
  }
);

/**
 * Reset all mocks between tests
 */
export function resetMocks(): void {
  mockRequireAuth.mockClear();
  mockOptionalAuth.mockClear();
  mockVerifyJWT.mockClear();
}

/**
 * Mock implementation of the auth plugin
 */
const mockAuthPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Add middleware
  fastify.decorate('requireAuth', mockRequireAuth);
  fastify.decorate('optionalAuth', mockOptionalAuth);
  fastify.decorate('verifyJWT', mockVerifyJWT);
  
  fastify.log.info('Mock Auth plugin initialized');
};

/**
 * Export the plugin
 */
export default fp(mockAuthPlugin, {
  name: 'auth'
}); 