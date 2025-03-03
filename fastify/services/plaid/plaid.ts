import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, TransactionsSyncRequest } from 'plaid';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

// Interface for creating a link token
export interface CreateLinkTokenParams {
  userId: string;
  clientUserId: string;
  products?: Products[];
}

// Interface for exchanging a public token
export interface ExchangePublicTokenParams {
  publicToken: string;
  userId: string;
  itemId?: string;
}

// Plaid service plugin
export const plaidPlugin = fp(async (fastify: FastifyInstance) => {
  // Initialize Plaid client
  const plaidConfig = new Configuration({
    basePath: PlaidEnvironments[fastify.config.PLAID_ENV ?? 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': fastify.config.PLAID_CLIENT_ID ?? '',
        'PLAID-SECRET': fastify.config.PLAID_SECRET ?? '',
      },
    },
  });

  const plaidClient = new PlaidApi(plaidConfig);

  // Create a link token
  async function createLinkToken({ userId, clientUserId, products = ['auth' as Products, 'transactions' as Products] }: CreateLinkTokenParams) {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: {
          client_user_id: clientUserId,
        },
        client_name: 'Your App Name',
        products: products,
        language: 'en',
        country_codes: ['US'] as CountryCode[],
        webhook: `${process.env.API_URL}/plaid/webhook`,
      });

      // Store link token in database
      const { error } = await fastify.supabase
        .from('plaid_link_tokens')
        .insert({
          user_id: userId,
          link_token: response.data.link_token,
          expiration: response.data.expiration,
          request_id: response.data.request_id,
        });

      if (error) {
        throw error;
      }

      return response.data;
    } catch (err) {
      fastify.log.error('Error creating link token:', err);
      throw err;
    }
  }

  // Get a link token
  async function getLinkToken(linkTokenId: string, userId: string) {
    try {
      const { data, error } = await fastify.supabase
        .from('plaid_link_tokens')
        .select('*')
        .eq('id', linkTokenId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      fastify.log.error('Error getting link token:', err);
      throw err;
    }
  }

  // Exchange a public token for an access token
  async function exchangePublicToken({ publicToken, userId, itemId }: ExchangePublicTokenParams) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const newItemId = response.data.item_id;

      // Get item information
      const itemResponse = await plaidClient.itemGet({
        access_token: accessToken,
      });

      // Get institution information
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id: itemResponse.data.item.institution_id ?? '',
        country_codes: ['US'] as CountryCode[],
      });

      // Store the access token and item data
      const { error } = await fastify.supabase
        .from('plaid_items')
        .insert({
          id: itemId ?? newItemId,
          user_id: userId,
          access_token: accessToken,
          institution_id: itemResponse.data.item.institution_id,
          institution_name: institutionResponse.data.institution.name,
        });

      if (error) {
        throw error;
      }

      // Get accounts associated with the item
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });

      // Store account data
      for (const account of accountsResponse.data.accounts) {
        const { error: accountError } = await fastify.supabase
          .from('accounts')
          .insert({
            user_id: userId,
            item_id: newItemId,
            plaid_account_id: account.account_id,
            name: account.name,
            official_name: account.official_name || account.name,
            type: account.type,
            subtype: account.subtype || null,
            mask: account.mask || null,
            balance_current: account.balances.current,
            balance_available: account.balances.available,
            balance_limit: account.balances.limit,
            balance_iso_currency_code: account.balances.iso_currency_code,
          });

        if (accountError) {
          throw accountError;
        }
      }

      return {
        itemId: newItemId,
        institutionName: institutionResponse.data.institution.name,
        accounts: accountsResponse.data.accounts,
      };
    } catch (err) {
      fastify.log.error('Error exchanging public token:', err);
      throw err;
    }
  }

  // Handle Plaid webhook
  async function handleWebhook(webhook: Record<string, any>) {
    try {
      const webhookType = webhook.webhook_type;
      const webhookCode = webhook.webhook_code;
      const itemId = webhook.item_id;

      fastify.log.info(`Received Plaid webhook: ${webhookType} / ${webhookCode} for item ${itemId}`);

      // Store webhook in database
      const { error } = await fastify.supabase
        .from('plaid_webhooks')
        .insert({
          item_id: itemId,
          webhook_type: webhookType,
          webhook_code: webhookCode,
          error: webhook.error || null,
          new_transactions: webhook.new_transactions || null,
          removed_transactions: webhook.removed_transactions || null,
          payload: webhook,
        });

      if (error) {
        throw error;
      }

      // Process different webhook types
      switch (webhookType) {
        case 'TRANSACTIONS':
          await processTransactionsWebhook(webhook);
          break;

        case 'ITEM':
          await processItemWebhook(webhook);
          break;

        default:
          fastify.log.warn(`Unhandled webhook type: ${webhookType}`);
      }

      return { success: true };
    } catch (err) {
      fastify.log.error('Error handling Plaid webhook:', err);
      throw err;
    }
  }

  // Process transactions webhook
  async function processTransactionsWebhook(webhook: Record<string, any>) {
    try {
      const itemId = webhook.item_id;
      const webhookCode = webhook.webhook_code;

      // Get the item to retrieve the access token
      const { data: itemData, error: itemError } = await fastify.supabase
        .from('plaid_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError || !itemData) {
        throw new Error(`Item not found: ${itemId}`);
      }

      switch (webhookCode) {
        case 'INITIAL_UPDATE':
        case 'HISTORICAL_UPDATE':
        case 'DEFAULT_UPDATE':
          // Fetch new transactions
          const accessToken = itemData.access_token;
          await syncTransactions(accessToken, itemData.user_id, itemId);
          break;

        case 'TRANSACTIONS_REMOVED':
          // Handle removed transactions
          const removedTransactions = webhook.removed_transactions || [];
          await removeTransactions(removedTransactions);
          break;

        default:
          fastify.log.warn(`Unhandled transactions webhook code: ${webhookCode}`);
      }

      return { success: true };
    } catch (err) {
      fastify.log.error('Error processing transactions webhook:', err);
      throw err;
    }
  }

  // Process item webhook
  async function processItemWebhook(webhook: Record<string, any>) {
    try {
      const itemId = webhook.item_id;
      const webhookCode = webhook.webhook_code;

      // Get the item to retrieve the access token
      const { data: itemData, error: itemError } = await fastify.supabase
        .from('plaid_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError || !itemData) {
        throw new Error(`Item not found: ${itemId}`);
      }

      switch (webhookCode) {
        case 'ERROR':
          // Update item status
          const { error } = await fastify.supabase
            .from('plaid_items')
            .update({ error: webhook.error, status: 'error' })
            .eq('id', itemId);

          if (error) {
            throw error;
          }
          break;

        case 'PENDING_EXPIRATION':
          // Update item status
          const { error: updateError } = await fastify.supabase
            .from('plaid_items')
            .update({ status: 'pending_expiration' })
            .eq('id', itemId);

          if (updateError) {
            throw updateError;
          }
          break;

        case 'USER_PERMISSION_REVOKED':
          // Update item status
          const { error: revokeError } = await fastify.supabase
            .from('plaid_items')
            .update({ status: 'revoked' })
            .eq('id', itemId);

          if (revokeError) {
            throw revokeError;
          }
          break;

        default:
          fastify.log.warn(`Unhandled item webhook code: ${webhookCode}`);
      }

      return { success: true };
    } catch (err) {
      fastify.log.error('Error processing item webhook:', err);
      throw err;
    }
  }

  // Sync transactions
  async function syncTransactions(accessToken: string, userId: string, itemId: string) {
    try {
      // Get cursor for the item
      const { data: cursorData } = await fastify.supabase
        .from('plaid_transaction_cursors')
        .select('*')
        .eq('item_id', itemId)
        .single();

      let cursor = cursorData?.cursor;

      // Initialize empty arrays to store added, modified, and removed transactions
      const addedTransactions: Record<string, any>[] = [];
      const modifiedTransactions: Record<string, any>[] = [];
      const removedTransactions: string[] = [];
      let hasMore = true;

      // Loop until all transactions are fetched
      while (hasMore) {
        const request: TransactionsSyncRequest = {
          access_token: accessToken,
          cursor,
          options: {
            include_personal_finance_category: true,
          },
        };

        const response = await plaidClient.transactionsSync(request);
        const data = response.data;

        // Update cursor
        cursor = data.next_cursor;
        hasMore = data.has_more;

        // Add new data to the arrays
        addedTransactions.push(...data.added);
        modifiedTransactions.push(...data.modified);
        removedTransactions.push(...data.removed.map((transaction) => transaction.transaction_id));
      }

      // Store cursor for next sync
      const { error: upsertError } = await fastify.supabase
        .from('plaid_transaction_cursors')
        .upsert(
          {
            item_id: itemId,
            cursor,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'item_id' }
        );

      if (upsertError) {
        throw upsertError;
      }

      // Process removed transactions
      if (removedTransactions.length > 0) {
        await removeTransactions(removedTransactions);
      }

      // Process added transactions
      for (const transaction of addedTransactions) {
        const { error } = await fastify.supabase.from('transactions').insert({
          user_id: userId,
          item_id: itemId,
          account_id: transaction.account_id,
          plaid_transaction_id: transaction.transaction_id,
          category: transaction.personal_finance_category?.primary,
          subcategory: transaction.personal_finance_category?.detailed,
          transaction_type: transaction.payment_channel,
          name: transaction.name,
          merchant_name: transaction.merchant_name,
          amount: transaction.amount,
          iso_currency_code: transaction.iso_currency_code,
          date: transaction.date,
          pending: transaction.pending,
          payment_channel: transaction.payment_channel,
          authorized_date: transaction.authorized_date,
          location: transaction.location,
          raw_data: transaction,
        });

        if (error) {
          throw error;
        }
      }

      // Process modified transactions
      for (const transaction of modifiedTransactions) {
        const { error } = await fastify.supabase
          .from('transactions')
          .update({
            category: transaction.personal_finance_category?.primary,
            subcategory: transaction.personal_finance_category?.detailed,
            transaction_type: transaction.payment_channel,
            name: transaction.name,
            merchant_name: transaction.merchant_name,
            amount: transaction.amount,
            iso_currency_code: transaction.iso_currency_code,
            date: transaction.date,
            pending: transaction.pending,
            payment_channel: transaction.payment_channel,
            authorized_date: transaction.authorized_date,
            location: transaction.location,
            raw_data: transaction,
          })
          .eq('plaid_transaction_id', transaction.transaction_id);

        if (error) {
          throw error;
        }
      }

      return {
        added: addedTransactions.length,
        modified: modifiedTransactions.length,
        removed: removedTransactions.length,
      };
    } catch (err) {
      fastify.log.error('Error syncing transactions:', err);
      throw err;
    }
  }

  // Remove transactions
  async function removeTransactions(transactionIds: string[]) {
    try {
      if (transactionIds.length === 0) {
        return { removed: 0 };
      }

      const { error } = await fastify.supabase
        .from('transactions')
        .update({ deleted: true })
        .in('plaid_transaction_id', transactionIds);

      if (error) {
        throw error;
      }

      return { removed: transactionIds.length };
    } catch (err) {
      fastify.log.error('Error removing transactions:', err);
      throw err;
    }
  }

  // Add methods to fastify instance
  fastify.decorate('plaid', {
    createLinkToken,
    getLinkToken,
    exchangePublicToken,
    handleWebhook,
    syncTransactions,
  });
});

// Add types to Fastify
declare module 'fastify' {
  interface FastifyInstance {
    plaid: {
      createLinkToken: (params: CreateLinkTokenParams) => Promise<any>;
      getLinkToken: (linkTokenId: string, userId: string) => Promise<any>;
      exchangePublicToken: (params: ExchangePublicTokenParams) => Promise<any>;
      handleWebhook: (webhook: Record<string, any>) => Promise<any>;
      syncTransactions: (accessToken: string, userId: string, itemId: string) => Promise<any>;
    };
  }
}

export default plaidPlugin; 