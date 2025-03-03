import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';

/**
 * User API routes
 */
const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /users/me - Get current user's profile
  server.route({
    method: 'GET',
    url: '/me',
    schema: {
      summary: 'Get current user',
      description: 'Retrieves the profile of the currently authenticated user',
      tags: ['users'],
      response: {
        200: {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              required: ['id', 'email'],
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                name: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        401: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: async (request, reply) => {
      try {
        const user = request.user;
        
        if (!user || !user.id) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'User not authenticated'
          });
        }
        
        // Get user profile from database
        const { data: profile, error } = await fastify.supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error || !profile) {
          fastify.log.error(error || new Error('User profile not found'));
          return reply.status(404).send({
            error: 'Not Found',
            message: 'User profile not found'
          });
        }
        
        return {
          data: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          }
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: err instanceof Error ? err.message : 'An unexpected error occurred'
        });
      }
    }
  });
};

export default fp(userRoutes); 