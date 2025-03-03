import { z } from 'zod';

/**
 * Item schema for validation and type safety
 */
export const itemSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  plaid_item_id: z.string(),
  plaid_access_token: z.string(),
  plaid_institution_id: z.string(),
  institution_name: z.string().min(1).max(100),
  status: z.string().min(1).max(50),
  error: z.any().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createItemSchema = itemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateItemSchema = itemSchema.partial().omit({
  id: true,
  user_id: true,
  plaid_item_id: true,
  plaid_access_token: true,
  created_at: true,
  updated_at: true,
});

export const itemParamsSchema = z.object({
  id: z.string().uuid(),
});

export const itemQuerySchema = z.object({
  limit: z.number().int().positive().optional().default(100),
  offset: z.number().int().nonnegative().optional().default(0),
  user_id: z.string().uuid().optional(),
  status: z.string().optional(),
});

export const itemResponseSchema = itemSchema.omit({
  plaid_access_token: true,
});

export const itemsResponseSchema = z.array(itemResponseSchema);

// JSON Schema versions for route validation
export const itemJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    plaid_item_id: { type: 'string' },
    plaid_access_token: { type: 'string' },
    plaid_institution_id: { type: 'string' },
    institution_name: { type: 'string', minLength: 1, maxLength: 100 },
    status: { type: 'string', minLength: 1, maxLength: 50 },
    error: { type: ['object', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['user_id', 'plaid_item_id', 'plaid_access_token', 'plaid_institution_id', 'institution_name', 'status']
};

export const createItemJsonSchema = {
  type: 'object',
  properties: {
    user_id: { type: 'string', format: 'uuid' },
    plaid_item_id: { type: 'string' },
    plaid_access_token: { type: 'string' },
    plaid_institution_id: { type: 'string' },
    institution_name: { type: 'string', minLength: 1, maxLength: 100 },
    status: { type: 'string', minLength: 1, maxLength: 50 },
    error: { type: ['object', 'null'] }
  },
  required: ['user_id', 'plaid_item_id', 'plaid_access_token', 'plaid_institution_id', 'institution_name', 'status']
};

export const updateItemJsonSchema = {
  type: 'object',
  properties: {
    institution_name: { type: 'string', minLength: 1, maxLength: 100 },
    status: { type: 'string', minLength: 1, maxLength: 50 },
    error: { type: ['object', 'null'] }
  }
};

export const itemParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id']
};

export const itemQueryJsonSchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, default: 100 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    user_id: { type: 'string', format: 'uuid' },
    status: { type: 'string' }
  }
};

export const itemResponseJsonSchema = itemJsonSchema;
export const itemsResponseJsonSchema = {
  type: 'array',
  items: itemJsonSchema
};

/**
 * Item type definitions
 */
export type Item = z.infer<typeof itemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
export type ItemQuery = z.infer<typeof itemQuerySchema>;
export type ItemResponse = z.infer<typeof itemResponseSchema>;

/**
 * API request and response interfaces
 */
export interface CreateItemRequest {
  Body: CreateItemInput;
}

export interface UpdateItemRequest {
  Params: ItemParams;
  Body: UpdateItemInput;
}

export interface GetItemRequest {
  Params: ItemParams;
}

export interface GetAllItemsRequest {
  Querystring: ItemQuery;
}

export interface DeleteItemRequest {
  Params: ItemParams;
}

/**
 * Item service interface
 */
export interface ItemService {
  create(item: CreateItemInput): Promise<Item>;
  update(id: string, item: UpdateItemInput): Promise<Item>;
  getById(id: string): Promise<Item>;
  getByPlaidItemId(plaidItemId: string): Promise<Item>;
  getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    status?: string;
  }): Promise<Item[]>;
  delete(id: string): Promise<void>;
} 