/**
 * Test helper functions
 */
import { FastifyInstance } from 'fastify';
import { buildApp } from '../app';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

/**
 * Create a test instance of the Fastify app
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp();
  // Disable logging for tests
  app.log.level = 'error';
  return app;
}

/**
 * Generate a valid JWT token for test authentication
 */
export function generateTestToken(app: FastifyInstance, userId = '00000000-0000-0000-0000-000000000000'): string {
  return app.jwt.sign({ 
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
}

/**
 * Mock Supabase responses
 */
export function mockSupabaseResponse<T>(data: T | null = null, error: Error | null = null): {
  data: T | null;
  error: Error | null;
  count: number | null;
  status: number;
  statusText: string;
} {
  return {
    data,
    error,
    count: data ? (Array.isArray(data) ? data.length : 1) : 0,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK',
  };
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient(): jest.Mocked<SupabaseClient<Database>> {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    } as any,
  } as unknown as jest.Mocked<SupabaseClient<Database>>;
}

/**
 * Helper to get an authenticated request
 */
export function getAuthHeaders(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
} 