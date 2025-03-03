import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';
import { 
  createItem, 
  updateItem, 
  getItem, 
  getAllItems, 
  deleteItem 
} from '../controllers/item';
import itemServicePlugin from '../services/item';

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
const itemJsonSchemas = {
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
      plaid_item_id: { type: 'string' },
      plaid_access_token: { type: 'string' },
      plaid_institution_id: { type: 'string' },
      institution_name: { type: 'string', minLength: 1, maxLength: 100 },
      status: { type: 'string', minLength: 1, maxLength: 50 },
      error: { type: 'object', nullable: true }
    },
    required: ['plaid_item_id', 'plaid_access_token', 'plaid_institution_id', 'institution_name']
  },
  update: {
    type: 'object',
    properties: {
      plaid_item_id: { type: 'string' },
      plaid_access_token: { type: 'string' },
      plaid_institution_id: { type: 'string' },
      institution_name: { type: 'string', minLength: 1, maxLength: 100 },
      status: { type: 'string', minLength: 1, maxLength: 50 },
      error: { type: 'object', nullable: true }
    }
  },
  response: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      plaid_item_id: { type: 'string' },
      plaid_access_token: { type: 'string' },
      plaid_institution_id: { type: 'string' },
      institution_name: { type: 'string' },
      status: { type: 'string' },
      error: { type: 'object', nullable: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'user_id', 'plaid_item_id', 'plaid_access_token', 'plaid_institution_id', 'institution_name', 'status']
  },
  responses: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        plaid_item_id: { type: 'string' },
        plaid_access_token: { type: 'string' },
        plaid_institution_id: { type: 'string' },
        institution_name: { type: 'string' },
        status: { type: 'string' },
        error: { type: 'object', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'user_id', 'plaid_item_id', 'plaid_access_token', 'plaid_institution_id', 'institution_name', 'status']
    }
  }
};

/**
 * Item API routes
 */
const itemRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register the item service plugin
  await fastify.register(itemServicePlugin);

  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /items - Get all items
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      summary: 'Get all items',
      description: 'Retrieves all items with optional filtering',
      tags: ['items'],
      querystring: itemJsonSchemas.query,
      response: {
        200: itemJsonSchemas.responses,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: getAllItems,
  });

  // GET /items/:id - Get item by ID
  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      summary: 'Get item by ID',
      description: 'Retrieves a single item by its ID',
      tags: ['items'],
      params: itemJsonSchemas.params,
      response: {
        200: itemJsonSchemas.response,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: getItem,
  });

  // POST /items - Create a new item
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      summary: 'Create a new item',
      description: 'Creates a new item and returns the created item data',
      tags: ['items'],
      body: itemJsonSchemas.create,
      response: {
        201: itemJsonSchemas.response,
        400: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: createItem,
  });

  // PUT /items/:id - Update an item
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      summary: 'Update an item',
      description: 'Updates an existing item and returns the updated item data',
      tags: ['items'],
      params: itemJsonSchemas.params,
      body: itemJsonSchemas.update,
      response: {
        200: itemJsonSchemas.response,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: updateItem,
  });

  // DELETE /items/:id - Delete an item
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      summary: 'Delete an item',
      description: 'Deletes an item by its ID',
      tags: ['items'],
      params: itemJsonSchemas.params,
      response: {
        204: { type: 'null' },
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }]
    },
    onRequest: [fastify.requireAuth],
    handler: deleteItem,
  });
};

export default fp(itemRoutes); 