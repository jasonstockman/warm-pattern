import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  createAsset, 
  updateAsset, 
  getAsset, 
  getAllAssets, 
  deleteAsset 
} from '../controllers/asset';
import assetServicePlugin from '../services/asset';

// Error response schema
const errorResponseJsonSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  },
  required: ['error', 'message']
};

// JSON Schema definitions
const assetJsonSchemas = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  query: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, default: 100 },
      offset: { type: 'integer', minimum: 0, default: 0 },
      user_id: { type: 'string', format: 'uuid' }
    }
  },
  create: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      type: { type: 'string', minLength: 1, maxLength: 50 },
      value: { type: 'number' },
      currency: { type: 'string', minLength: 1, maxLength: 3 },
      institution: { type: 'string', maxLength: 100, nullable: true },
      notes: { type: 'string', maxLength: 500, nullable: true }
    },
    required: ['name', 'type', 'value', 'currency']
  },
  update: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      type: { type: 'string', minLength: 1, maxLength: 50 },
      value: { type: 'number' },
      currency: { type: 'string', minLength: 1, maxLength: 3 },
      institution: { type: 'string', maxLength: 100, nullable: true },
      notes: { type: 'string', maxLength: 500, nullable: true }
    }
  },
  response: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      type: { type: 'string' },
      value: { type: 'number' },
      currency: { type: 'string' },
      institution: { type: 'string', nullable: true },
      notes: { type: 'string', nullable: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'user_id', 'name', 'type', 'value', 'currency']
  },
  responses: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        type: { type: 'string' },
        value: { type: 'number' },
        currency: { type: 'string' },
        institution: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'user_id', 'name', 'type', 'value', 'currency']
    }
  }
};

/**
 * Asset API routes
 */
const assetRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register the asset service plugin
  fastify.register(assetServicePlugin);

  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /assets - Get all assets
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      summary: 'Get all assets',
      description: 'Retrieves a list of assets with optional pagination and filtering',
      tags: ['assets'],
      querystring: assetJsonSchemas.query,
      response: {
        200: assetJsonSchemas.responses,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: getAllAssets,
  });

  // GET /assets/:id - Get asset by ID
  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      summary: 'Get asset by ID',
      description: 'Retrieves a single asset by its ID',
      tags: ['assets'],
      params: assetJsonSchemas.params,
      response: {
        200: assetJsonSchemas.response,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: getAsset,
  });

  // POST /assets - Create a new asset
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      summary: 'Create a new asset',
      description: 'Creates a new asset and returns the created asset data',
      tags: ['assets'],
      body: assetJsonSchemas.create,
      response: {
        201: assetJsonSchemas.response,
        400: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: createAsset,
  });

  // PUT /assets/:id - Update an asset
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      summary: 'Update an asset',
      description: 'Updates an existing asset and returns the updated asset data',
      tags: ['assets'],
      params: assetJsonSchemas.params,
      body: assetJsonSchemas.update,
      response: {
        200: assetJsonSchemas.response,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: updateAsset,
  });

  // DELETE /assets/:id - Delete an asset
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      summary: 'Delete an asset',
      description: 'Deletes an asset by its ID',
      tags: ['assets'],
      params: assetJsonSchemas.params,
      response: {
        204: { type: 'null' },
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: deleteAsset,
  });
};

export default assetRoutes; 