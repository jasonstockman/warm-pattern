import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  createAccount, 
  updateAccount, 
  getAccount, 
  getAllAccounts, 
  deleteAccount 
} from '../controllers/account';
import accountServicePlugin from '../services/account';

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
const accountJsonSchemas = {
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
      user_id: { type: 'string', format: 'uuid' },
      item_id: { type: 'string', format: 'uuid' }
    }
  },
  create: {
    type: 'object',
    properties: {
      item_id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      plaid_account_id: { type: 'string' },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      mask: { type: 'string', maxLength: 20, nullable: true },
      official_name: { type: 'string', maxLength: 100, nullable: true },
      current_balance: { type: 'number', nullable: true },
      available_balance: { type: 'number', nullable: true },
      iso_currency_code: { type: 'string', maxLength: 3, nullable: true },
      account_type: { type: 'string', minLength: 1, maxLength: 50 },
      account_subtype: { type: 'string', minLength: 1, maxLength: 50 }
    },
    required: ['item_id', 'user_id', 'plaid_account_id', 'name', 'account_type', 'account_subtype']
  },
  update: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      mask: { type: 'string', maxLength: 20, nullable: true },
      official_name: { type: 'string', maxLength: 100, nullable: true },
      current_balance: { type: 'number', nullable: true },
      available_balance: { type: 'number', nullable: true },
      iso_currency_code: { type: 'string', maxLength: 3, nullable: true },
      account_type: { type: 'string', minLength: 1, maxLength: 50 },
      account_subtype: { type: 'string', minLength: 1, maxLength: 50 }
    }
  },
  response: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      plaid_account_id: { type: 'string' },
      name: { type: 'string' },
      mask: { type: 'string', nullable: true },
      official_name: { type: 'string', nullable: true },
      current_balance: { type: 'number', nullable: true },
      available_balance: { type: 'number', nullable: true },
      iso_currency_code: { type: 'string', nullable: true },
      account_type: { type: 'string' },
      account_subtype: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'user_id', 'plaid_account_id', 'name', 'account_type', 'account_subtype']
  },
  responses: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        plaid_account_id: { type: 'string' },
        name: { type: 'string' },
        mask: { type: 'string', nullable: true },
        official_name: { type: 'string', nullable: true },
        current_balance: { type: 'number', nullable: true },
        available_balance: { type: 'number', nullable: true },
        iso_currency_code: { type: 'string', nullable: true },
        account_type: { type: 'string' },
        account_subtype: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'user_id', 'plaid_account_id', 'name', 'account_type', 'account_subtype']
    }
  }
};

/**
 * Account API routes
 */
const accountRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register the account service plugin
  fastify.register(accountServicePlugin);

  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /accounts - Get all accounts
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      summary: 'Get all accounts',
      description: 'Retrieves a list of accounts with optional pagination and filtering',
      tags: ['accounts'],
      querystring: accountJsonSchemas.query,
      response: {
        200: accountJsonSchemas.responses,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: getAllAccounts,
  });

  // GET /accounts/:id - Get account by ID
  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      summary: 'Get account by ID',
      description: 'Retrieves a single account by its ID',
      tags: ['accounts'],
      params: accountJsonSchemas.params,
      response: {
        200: accountJsonSchemas.response,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: getAccount,
  });

  // POST /accounts - Create a new account
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      summary: 'Create a new account',
      description: 'Creates a new account and returns the created account data',
      tags: ['accounts'],
      body: accountJsonSchemas.create,
      response: {
        201: accountJsonSchemas.response,
        400: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: createAccount,
  });

  // PUT /accounts/:id - Update an account
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      summary: 'Update an account',
      description: 'Updates an existing account and returns the updated account data',
      tags: ['accounts'],
      params: accountJsonSchemas.params,
      body: accountJsonSchemas.update,
      response: {
        200: accountJsonSchemas.response,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: updateAccount,
  });

  // DELETE /accounts/:id - Delete an account
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      summary: 'Delete an account',
      description: 'Deletes an account by its ID',
      tags: ['accounts'],
      params: accountJsonSchemas.params,
      response: {
        204: { type: 'null' },
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema
      },
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: deleteAccount,
  });
};

export default accountRoutes; 