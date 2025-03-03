import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';

/**
 * User API routes
 */
const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /users - Get all users (placeholder for future implementation)
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      summary: 'Get all users',
      description: 'Retrieves a list of users with optional pagination and filtering',
      tags: ['users'],
      response: {
        200: {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'email'],
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true }
                }
              }
            }
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
        // Get all users from database
        const { data: users, error } = await fastify.supabase
          .from('profiles')
          .select('id, email, name, avatar_url')
          .limit(100);
        
        if (error) {
          fastify.log.error(error);
          return reply.status(500).send({
            error: 'Internal Server Error',
            message: error.message
          });
        }
        
        return {
          data: users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatar_url
          }))
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