import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  createProfile, 
  updateProfile, 
  getProfile, 
  getAllProfiles, 
  deleteProfile 
} from '../controllers/profile';
import { 
  createProfileJsonSchema,
  updateProfileJsonSchema,
  profileParamsJsonSchema,
  profileQueryJsonSchema,
  profileResponseJsonSchema,
  profilesResponseJsonSchema
} from '../types/profile';
import profileServicePlugin from '../services/profile';

/**
 * Profile API routes
 */
const profileRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register the profile service plugin
  fastify.register(profileServicePlugin);

  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /profiles - Get all profiles
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      summary: 'Get all profiles',
      description: 'Retrieves a list of profiles with optional pagination and filtering',
      tags: ['profiles'],
      querystring: profileQueryJsonSchema,
      response: {
        200: profilesResponseJsonSchema,
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
    handler: getAllProfiles,
  });

  // GET /profiles/:id - Get profile by ID
  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      summary: 'Get profile by ID',
      description: 'Retrieves a profile by its unique identifier',
      tags: ['profiles'],
      params: profileParamsJsonSchema,
      response: {
        200: profileResponseJsonSchema,
        404: {
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
    handler: getProfile,
  });

  // POST /profiles - Create a new profile
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      summary: 'Create a new profile',
      description: 'Creates a new user profile',
      tags: ['profiles'],
      body: createProfileJsonSchema,
      response: {
        201: profileResponseJsonSchema,
        400: {
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
      // For signup, we'll allow unauthenticated access, but can change if needed
      security: []
    },
    handler: createProfile,
  });

  // PUT /profiles/:id - Update profile
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      summary: 'Update profile',
      description: 'Updates an existing profile by ID',
      tags: ['profiles'],
      params: profileParamsJsonSchema,
      body: updateProfileJsonSchema,
      response: {
        200: profileResponseJsonSchema,
        404: {
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
    handler: updateProfile,
  });

  // DELETE /profiles/:id - Delete profile
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      summary: 'Delete profile',
      description: 'Deletes a profile by ID',
      tags: ['profiles'],
      params: profileParamsJsonSchema,
      response: {
        204: {
          type: 'null'
        },
        404: {
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
    handler: deleteProfile,
  });
};

export default profileRoutes; 