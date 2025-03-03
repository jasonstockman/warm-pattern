import { z } from 'zod';

// Define environment schema using Zod
export const envSchema = {
  type: 'object',
  required: ['PORT', 'NODE_ENV', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'JWT_SECRET'],
  properties: {
    PORT: {
      type: 'string',
      default: '3000',
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0',
    },
    NODE_ENV: {
      type: 'string',
      default: 'development',
    },
    SUPABASE_URL: {
      type: 'string',
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      type: 'string',
    },
    SUPABASE_ANON_KEY: {
      type: 'string',
    },
    JWT_SECRET: {
      type: 'string',
    },
    JWT_EXPIRATION: {
      type: 'string',
      default: '1h',
    },
    JWT_REFRESH_EXPIRATION: {
      type: 'string',
      default: '7d',
    },
    PLAID_CLIENT_ID: {
      type: 'string',
      default: '',
    },
    PLAID_SECRET: {
      type: 'string',
      default: '',
    },
    PLAID_ENV: {
      type: 'string',
      default: 'sandbox',
    },
  },
};

// Zod schema for type validation
export const configSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('1h'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  PLAID_CLIENT_ID: z.string().optional(),
  PLAID_SECRET: z.string().optional(),
  PLAID_ENV: z.enum(['sandbox', 'development', 'production']).default('sandbox'),
});

// Type for the configuration
export type Config = z.infer<typeof configSchema>;

// Helper function to validate environment variables
export function validateConfig(config: Record<string, unknown>): Config {
  return configSchema.parse(config);
}

// Get typed config from fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
} 