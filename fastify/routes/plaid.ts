import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { JwtVerifyPayload } from '../middleware/auth';
import {
  createLinkTokenJsonSchema,
  createLinkTokenResponseJsonSchema,
  exchangePublicTokenJsonSchema,
  exchangePublicTokenResponseJsonSchema,
  webhookJsonSchema,
  plaidAccountsResponseJsonSchema,
  errorResponseJsonSchema,
  CreateLinkTokenInput,
  ExchangePublicTokenInput
} from '../types/plaid';

// Plaid routes plugin
const plaidRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /plaid/create-link-token - Create a new link token
  fastify.post(
    '/create-link-token',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        body: createLinkTokenJsonSchema,
        response: {
          200: createLinkTokenResponseJsonSchema,
          500: errorResponseJsonSchema
        },
        tags: ['plaid'],
        description: 'Create a new Plaid link token',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user as JwtVerifyPayload;
      const { products } = request.body as CreateLinkTokenInput;

      try {
        const response = await fastify.plaid.createLinkToken({
          userId: user.id,
          clientUserId: user.id,
          products: products as any[],
        });

        return {
          linkToken: response.link_token,
          expiration: response.expiration,
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to create link token',
        });
      }
    }
  );

  // POST /plaid/exchange-public-token - Exchange public token for access token
  fastify.post(
    '/exchange-public-token',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        body: exchangePublicTokenJsonSchema,
        response: {
          200: exchangePublicTokenResponseJsonSchema,
          400: errorResponseJsonSchema,
          500: errorResponseJsonSchema
        },
        tags: ['plaid'],
        description: 'Exchange a public token for an access token',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user as JwtVerifyPayload;
      const { publicToken } = request.body as ExchangePublicTokenInput;

      try {
        const response = await fastify.plaid.exchangePublicToken({
          publicToken,
          userId: user.id,
        });

        // Transform the accounts to match the response schema
        const accounts = response.accounts.map((account: any) => ({
          id: account.account_id,
          name: account.name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          balances: {
            available: account.balances.available,
            current: account.balances.current,
            limit: account.balances.limit,
            isoCurrencyCode: account.balances.iso_currency_code,
          },
        }));

        return {
          itemId: response.itemId,
          institutionName: response.institutionName,
          accounts,
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to exchange public token',
        });
      }
    }
  );

  // POST /plaid/webhook - Handle Plaid webhooks
  fastify.post(
    '/webhook',
    {
      schema: {
        body: webhookJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            },
            required: ['success']
          },
          500: errorResponseJsonSchema
        },
        tags: ['plaid'],
        description: 'Handle Plaid webhooks',
      },
    },
    async (request, reply) => {
      const webhook = request.body as Record<string, any>;

      try {
        await fastify.plaid.handleWebhook(webhook);
        return { success: true };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to process webhook',
        });
      }
    }
  );

  // GET /plaid/accounts - Get user accounts
  fastify.get(
    '/accounts',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        response: {
          200: plaidAccountsResponseJsonSchema,
          500: errorResponseJsonSchema
        },
        tags: ['plaid'],
        description: 'Get user accounts',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user as JwtVerifyPayload;

      try {
        // Get accounts from database
        const { data, error } = await fastify.supabase
          .from('accounts')
          .select(`
            *,
            plaid_items:item_id (
              institution_name
            )
          `)
          .eq('user_id', user.id)
          .eq('deleted', false);

        if (error) {
          throw error;
        }

        // Transform the accounts to match the response schema
        const accounts = data.map((account) => ({
          id: account.id,
          itemId: account.item_id,
          institutionName: account.plaid_items?.institution_name || 'Unknown',
          name: account.name,
          officialName: account.official_name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balances: {
            current: account.balance_current,
            available: account.balance_available,
            limit: account.balance_limit,
            isoCurrencyCode: account.balance_iso_currency_code || 'USD',
          },
        }));

        return { accounts };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to get accounts',
        });
      }
    }
  );

  // GET /plaid/transactions - Get user transactions
  fastify.get(
    '/transactions',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        querystring: z.object({
          accountId: z.string().uuid().optional(),
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          limit: z.coerce.number().min(1).max(100).optional(),
          offset: z.coerce.number().min(0).optional(),
        }),
        response: {
          200: z.object({
            transactions: z.array(
              z.object({
                id: z.string().uuid(),
                accountId: z.string().uuid(),
                name: z.string().min(1),
                merchantName: z.string().nullable(),
                amount: z.number(),
                date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                category: z.string().nullable(),
                subcategory: z.string().nullable(),
                pending: z.boolean().nullable(),
                transactionType: z.string().nullable(),
              })
            ),
            total: z.number().int().min(0),
          }),
          400: errorResponseJsonSchema,
          500: errorResponseJsonSchema
        },
        tags: ['plaid'],
        description: 'Get user transactions with pagination and filtering',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user as JwtVerifyPayload;
      const query = request.query as {
        accountId?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
      };

      try {
        // Build query
        let dbQuery = fastify.supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('deleted', false);

        // Apply filters
        if (query.accountId) {
          dbQuery = dbQuery.eq('account_id', query.accountId);
        }

        if (query.startDate) {
          dbQuery = dbQuery.gte('date', query.startDate);
        }

        if (query.endDate) {
          dbQuery = dbQuery.lte('date', query.endDate);
        }

        // Apply pagination
        const limit = query.limit || 50;
        const offset = query.offset || 0;

        dbQuery = dbQuery.order('date', { ascending: false }).range(offset, offset + limit - 1);

        // Execute query
        const { data, error, count } = await dbQuery;

        if (error) {
          throw error;
        }

        // Transform the transactions to match the response schema
        const transactions = data.map((transaction) => ({
          id: transaction.id,
          accountId: transaction.account_id,
          name: transaction.name,
          merchantName: transaction.merchant_name,
          amount: transaction.amount,
          date: transaction.date,
          category: transaction.category,
          subcategory: transaction.subcategory,
          pending: transaction.pending,
          transactionType: transaction.transaction_type,
        }));

        return { transactions, total: count || 0 };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to get transactions',
        });
      }
    }
  );
};

export default fp(plaidRoutes); 