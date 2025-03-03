import { z } from 'zod';

/**
 * Asset schema for validation and type safety
 */
export const assetSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  value: z.number(),
  currency: z.string().min(1).max(3),
  institution: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createAssetSchema = assetSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateAssetSchema = assetSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const assetParamsSchema = z.object({
  id: z.string().uuid(),
});

export const assetQuerySchema = z.object({
  limit: z.number().int().positive().optional().default(100),
  offset: z.number().int().nonnegative().optional().default(0),
  user_id: z.string().uuid().optional(),
  type: z.string().optional(),
});

export const assetResponseSchema = assetSchema;
export const assetsResponseSchema = z.array(assetSchema);

/**
 * Asset type definitions
 */
export type Asset = z.infer<typeof assetSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetParams = z.infer<typeof assetParamsSchema>;
export type AssetQuery = z.infer<typeof assetQuerySchema>;

/**
 * API request and response interfaces
 */
export interface CreateAssetRequest {
  Body: CreateAssetInput;
}

export interface UpdateAssetRequest {
  Params: AssetParams;
  Body: UpdateAssetInput;
}

export interface GetAssetRequest {
  Params: AssetParams;
}

export interface GetAllAssetsRequest {
  Querystring: AssetQuery;
}

export interface DeleteAssetRequest {
  Params: AssetParams;
}

/**
 * Asset service interface
 */
export interface AssetService {
  create(asset: CreateAssetInput): Promise<Asset>;
  update(id: string, asset: UpdateAssetInput): Promise<Asset>;
  getById(id: string): Promise<Asset>;
  getAll(options?: { 
    limit?: number; 
    offset?: number; 
    userId?: string;
    type?: string;
  }): Promise<Asset[]>;
  delete(id: string): Promise<void>;
}

// JSON Schema versions for route validation
export const assetJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    type: { type: 'string', minLength: 1, maxLength: 50 },
    value: { type: 'number' },
    currency: { type: 'string', minLength: 1, maxLength: 3 },
    institution: { type: ['string', 'null'], maxLength: 100 },
    notes: { type: ['string', 'null'], maxLength: 500 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['user_id', 'name', 'type', 'value', 'currency']
};

export const assetQueryJsonSchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, default: 100 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    user_id: { type: 'string', format: 'uuid' },
    type: { type: 'string' }
  }
};

export const assetParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id']
};

export const assetResponseJsonSchema = assetJsonSchema;
export const assetsResponseJsonSchema = {
  type: 'array',
  items: assetJsonSchema
};