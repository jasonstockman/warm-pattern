import { z } from 'zod';

/**
 * Profile schema for validation and type safety
 */
export const profileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  first_name: z.string().min(1).max(100).nullable().optional(),
  last_name: z.string().min(1).max(100).nullable().optional(),
  phone: z.string().min(10).max(20).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createProfileSchema = profileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateProfileSchema = profileSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const profileParamsSchema = z.object({
  id: z.string().uuid(),
});

export const profileResponseSchema = profileSchema;
export const profilesResponseSchema = z.array(profileSchema);

// JSON Schema versions for route validation
export const profileJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    first_name: { type: 'string', minLength: 1, maxLength: 100, nullable: true },
    last_name: { type: 'string', minLength: 1, maxLength: 100, nullable: true },
    phone: { type: 'string', minLength: 10, maxLength: 20, nullable: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['user_id']
};

export const createProfileJsonSchema = {
  type: 'object',
  properties: {
    user_id: { type: 'string', format: 'uuid' },
    first_name: { type: 'string', minLength: 1, maxLength: 100, nullable: true },
    last_name: { type: 'string', minLength: 1, maxLength: 100, nullable: true },
    phone: { type: 'string', minLength: 10, maxLength: 20, nullable: true }
  },
  required: ['user_id']
};

export const updateProfileJsonSchema = {
  type: 'object',
  properties: {
    first_name: { type: 'string', minLength: 1, maxLength: 100, nullable: true },
    last_name: { type: 'string', minLength: 1, maxLength: 100, nullable: true },
    phone: { type: 'string', minLength: 10, maxLength: 20, nullable: true }
  }
};

export const profileParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id']
};

export const profileQueryJsonSchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, default: 100 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    user_id: { type: 'string', format: 'uuid' }
  }
};

export const profileResponseJsonSchema = profileJsonSchema;

export const profilesResponseJsonSchema = {
  type: 'array',
  items: profileJsonSchema
};

/**
 * Profile type definitions
 */
export type Profile = z.infer<typeof profileSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfileParams = z.infer<typeof profileParamsSchema>;

/**
 * API request and response interfaces
 */
export interface CreateProfileRequest {
  Body: CreateProfileInput;
}

export interface UpdateProfileRequest {
  Params: ProfileParams;
  Body: UpdateProfileInput;
}

export interface GetProfileRequest {
  Params: ProfileParams;
}

export interface GetAllProfilesRequest {
  Querystring: {
    limit?: number;
    offset?: number;
    user_id?: string;
  };
}

export interface DeleteProfileRequest {
  Params: ProfileParams;
}

/**
 * Profile service interface
 */
export interface ProfileService {
  create(profile: CreateProfileInput): Promise<Profile>;
  update(id: string, profile: UpdateProfileInput): Promise<Profile>;
  getById(id: string): Promise<Profile>;
  getByUserId(userId: string): Promise<Profile>;
  getAll(options?: { limit?: number; offset?: number; userId?: string }): Promise<Profile[]>;
  delete(id: string): Promise<void>;
} 