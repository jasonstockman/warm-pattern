import { z } from 'zod';

/**
 * Account schema for validation and type safety
 */
export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  item_id: z.string().uuid(),
  user_id: z.string().uuid(),
  plaid_account_id: z.string(),
  name: z.string().min(1).max(100),
  mask: z.string().max(20).nullable().optional(),
  official_name: z.string().max(100).nullable().optional(),
  current_balance: z.number().nullable().optional(),
  available_balance: z.number().nullable().optional(),
  iso_currency_code: z.string().max(3).nullable().optional(),
  account_type: z.string().min(1).max(50),
  account_subtype: z.string().min(1).max(50),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createAccountSchema = accountSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateAccountSchema = accountSchema.partial().omit({
  id: true,
  item_id: true,
  user_id: true,
  plaid_account_id: true,
  created_at: true,
  updated_at: true,
});

export const accountParamsSchema = z.object({
  id: z.string().uuid(),
});

export const accountQuerySchema = z.object({
  limit: z.number().int().positive().optional().default(100),
  offset: z.number().int().nonnegative().optional().default(0),
  user_id: z.string().uuid().optional(),
  item_id: z.string().uuid().optional(),
});

export const accountResponseSchema = accountSchema;
export const accountsResponseSchema = z.array(accountSchema);

/**
 * Account type definitions
 */
export type Account = z.infer<typeof accountSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountParams = z.infer<typeof accountParamsSchema>;
export type AccountQuery = z.infer<typeof accountQuerySchema>;

/**
 * API request and response interfaces
 */
export interface CreateAccountRequest {
  Body: CreateAccountInput;
}

export interface UpdateAccountRequest {
  Params: AccountParams;
  Body: UpdateAccountInput;
}

export interface GetAccountRequest {
  Params: AccountParams;
}

export interface GetAllAccountsRequest {
  Querystring: AccountQuery;
}

export interface DeleteAccountRequest {
  Params: AccountParams;
}

/**
 * Account service interface
 */
export interface AccountService {
  create(account: CreateAccountInput): Promise<Account>;
  update(id: string, account: UpdateAccountInput): Promise<Account>;
  getById(id: string): Promise<Account>;
  getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    itemId?: string;
  }): Promise<Account[]>;
  delete(id: string): Promise<void>;
} 