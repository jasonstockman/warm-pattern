import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  createTransaction, 
  updateTransaction, 
  getTransaction, 
  getAllTransactions, 
  deleteTransaction 
} from '../controllers/transaction';
import { 
  createTransactionJsonSchema,
  updateTransactionJsonSchema,
  transactionParamsJsonSchema,
  transactionQueryJsonSchema,
  transactionResponseJsonSchema,
  transactionsResponseJsonSchema
} from '../types/transaction';
import transactionServicePlugin from '../services/transaction';

/**
 * Transaction API routes
 */
const transactionRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register the transaction service plugin
  fastify.register(transactionServicePlugin);

  // Use Zod for request/response validation
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /transactions - Get all transactions
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      summary: 'Get all transactions',
      description: 'Retrieves a list of transactions with optional pagination and filtering',
      tags: ['transactions'],
      querystring: transactionQueryJsonSchema,
      response: {
        200: transactionsResponseJsonSchema,
        500: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      },
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: getAllTransactions,
  });

  // GET /transactions/:id - Get transaction by ID
  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      summary: 'Get transaction by ID',
      description: 'Retrieves a specific transaction by its ID',
      tags: ['transactions'],
      params: transactionParamsJsonSchema,
      response: {
        200: transactionResponseJsonSchema,
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
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: getTransaction,
  });

  // POST /transactions - Create a new transaction
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      summary: 'Create transaction',
      description: 'Creates a new transaction',
      tags: ['transactions'],
      body: createTransactionJsonSchema,
      response: {
        201: transactionResponseJsonSchema,
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
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: createTransaction,
  });

  // PUT /transactions/:id - Update a transaction
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      summary: 'Update transaction',
      description: 'Updates an existing transaction',
      tags: ['transactions'],
      params: transactionParamsJsonSchema,
      body: updateTransactionJsonSchema,
      response: {
        200: transactionResponseJsonSchema,
        400: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
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
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: updateTransaction,
  });

  // DELETE /transactions/:id - Delete a transaction
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      summary: 'Delete transaction',
      description: 'Deletes an existing transaction',
      tags: ['transactions'],
      params: transactionParamsJsonSchema,
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
      security: [{ bearerAuth: [] }],
    },
    onRequest: [fastify.requireAuth],
    handler: deleteTransaction,
  });
};

export default transactionRoutes; 