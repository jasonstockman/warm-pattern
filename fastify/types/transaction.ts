import { z } from 'zod';

/**
 * Transaction schema for validation and type safety
 */
export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  account_id: z.string().uuid(),
  user_id: z.string().uuid(),
  plaid_transaction_id: z.string(),
  category_id: z.string().nullable().optional(),
  category: z.array(z.string()).nullable().optional(),
  subcategory: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  name: z.string(),
  amount: z.number(),
  iso_currency_code: z.string().nullable().optional(),
  date: z.string(),
  pending: z.boolean(),
  merchant_name: z.string().nullable().optional(),
  payment_channel: z.string().nullable().optional(),
  authorized_date: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createTransactionSchema = transactionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateTransactionSchema = transactionSchema.partial().omit({
  id: true,
  user_id: true,
  account_id: true,
  plaid_transaction_id: true,
  created_at: true,
  updated_at: true,
});

export const transactionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const transactionQuerySchema = z.object({
  limit: z.number().int().positive().optional().default(100),
  offset: z.number().int().nonnegative().optional().default(0),
  user_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  category: z.string().optional(),
});

export const transactionResponseSchema = transactionSchema;
export const transactionsResponseSchema = z.array(transactionSchema);

// JSON Schema versions for route validation
export const transactionJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    account_id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    plaid_transaction_id: { type: 'string' },
    category_id: { type: 'string', nullable: true },
    category: { type: 'array', items: { type: 'string' }, nullable: true },
    subcategory: { type: 'string', nullable: true },
    type: { type: 'string', nullable: true },
    name: { type: 'string' },
    amount: { type: 'number' },
    iso_currency_code: { type: 'string', nullable: true },
    date: { type: 'string' },
    pending: { type: 'boolean' },
    merchant_name: { type: 'string', nullable: true },
    payment_channel: { type: 'string', nullable: true },
    authorized_date: { type: 'string', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['account_id', 'user_id', 'plaid_transaction_id', 'name', 'amount', 'date', 'pending']
};

export const createTransactionJsonSchema = {
  type: 'object',
  properties: {
    account_id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    plaid_transaction_id: { type: 'string' },
    category_id: { type: 'string', nullable: true },
    category: { type: 'array', items: { type: 'string' }, nullable: true },
    subcategory: { type: 'string', nullable: true },
    type: { type: 'string', nullable: true },
    name: { type: 'string' },
    amount: { type: 'number' },
    iso_currency_code: { type: 'string', nullable: true },
    date: { type: 'string' },
    pending: { type: 'boolean' },
    merchant_name: { type: 'string', nullable: true },
    payment_channel: { type: 'string', nullable: true },
    authorized_date: { type: 'string', nullable: true }
  },
  required: ['account_id', 'user_id', 'plaid_transaction_id', 'name', 'amount', 'date', 'pending']
};

export const updateTransactionJsonSchema = {
  type: 'object',
  properties: {
    category_id: { type: 'string', nullable: true },
    category: { type: 'array', items: { type: 'string' }, nullable: true },
    subcategory: { type: 'string', nullable: true },
    type: { type: 'string', nullable: true },
    name: { type: 'string' },
    amount: { type: 'number' },
    iso_currency_code: { type: 'string', nullable: true },
    date: { type: 'string' },
    pending: { type: 'boolean' },
    merchant_name: { type: 'string', nullable: true },
    payment_channel: { type: 'string', nullable: true },
    authorized_date: { type: 'string', nullable: true }
  }
};

export const transactionParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id']
};

export const transactionQueryJsonSchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, default: 100 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    user_id: { type: 'string', format: 'uuid' },
    account_id: { type: 'string', format: 'uuid' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    category: { type: 'string' }
  }
};

export const transactionResponseJsonSchema = transactionJsonSchema;
export const transactionsResponseJsonSchema = {
  type: 'array',
  items: transactionJsonSchema
};

/**
 * Transaction type definitions
 */
export type Transaction = z.infer<typeof transactionSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionParams = z.infer<typeof transactionParamsSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

/**
 * API request and response interfaces
 */
export interface CreateTransactionRequest {
  Body: CreateTransactionInput;
}

export interface UpdateTransactionRequest {
  Params: TransactionParams;
  Body: UpdateTransactionInput;
}

export interface GetTransactionRequest {
  Params: TransactionParams;
}

export interface GetAllTransactionsRequest {
  Querystring: TransactionQuery;
}

export interface DeleteTransactionRequest {
  Params: TransactionParams;
}

/**
 * Transaction service interface
 */
export interface TransactionService {
  create(transaction: CreateTransactionInput): Promise<Transaction>;
  update(id: string, transaction: UpdateTransactionInput): Promise<Transaction>;
  getById(id: string): Promise<Transaction>;
  getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<Transaction[]>;
  delete(id: string): Promise<void>;
} 