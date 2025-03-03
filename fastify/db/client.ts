import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { Database } from '../types/supabase';
import pino from 'pino';

// Connection pool configuration
const POOL_SIZE = 10;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Client pool
let clientPool: SupabaseClient<Database>[] = [];
let currentClientIndex = 0;

// Error classes
export class DatabaseError extends Error {
  public statusCode: number;
  public originalError: Error;

  constructor(message: string, statusCode = 500, originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.originalError = originalError || new Error(message);
  }
}

// Add Supabase response type definition
type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
  count: number | null;
  status: number;
  statusText: string;
};

/**
 * Initialize the client pool
 */
function initializeClientPool(url: string, key: string, size: number): SupabaseClient<Database>[] {
  const pool: SupabaseClient<Database>[] = [];
  
  for (let i = 0; i < size; i++) {
    const client = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
      },
      // Add global error handler
      global: {
        fetch: (url, options) => {
          return fetch(url, options).catch(error => {
            throw new DatabaseError(`Supabase request failed: ${error.message}`, 500, error);
          });
        }
      }
    });
    
    pool.push(client);
  }
  
  return pool;
}

/**
 * Get a client from the pool using round-robin selection
 */
function getClient(): SupabaseClient<Database> {
  if (clientPool.length === 0) {
    throw new DatabaseError('Client pool not initialized', 500);
  }
  
  const client = clientPool[currentClientIndex];
  currentClientIndex = (currentClientIndex + 1) % clientPool.length;
  
  return client;
}

// Define the Supabase client plugin
const supabasePlugin: FastifyPluginAsync = async (fastify) => {
  // Get configuration from the environment
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  // Initialize the client pool
  clientPool = initializeClientPool(supabaseUrl, supabaseKey, POOL_SIZE);
  
  // Create the main Supabase client (for backward compatibility)
  const supabase = clientPool[0];

  // Add the client to the Fastify instance
  fastify.decorate('supabase', supabase);
  
  // Add pool management methods
  fastify.decorate('getSupabaseClient', () => getClient());
  
  // Add utility method for getting client in request context
  fastify.decorateRequest('getSupabaseClient', function(this: FastifyRequest) {
    return getClient();
  });

  // Add a hook to close the client when the server is shutting down
  fastify.addHook('onClose', async () => {
    // No explicit close method for Supabase client in v2
    clientPool = [];
    fastify.log.info('Supabase client pool released');
  });

  // Log that Supabase was initialized
  fastify.log.info(`Supabase client pool initialized with ${POOL_SIZE} connections`);
};

// Export the plugin
export default fp(supabasePlugin, {
  name: 'supabase',
});

// Add type definitions for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient<Database>;
    getSupabaseClient: () => SupabaseClient<Database>;
  }
  
  interface FastifyRequest {
    getSupabaseClient: () => SupabaseClient<Database>;
  }
}

/**
 * Execute a database operation with retry logic
 * @param operation The database operation to execute
 * @param maxRetries Maximum number of retry attempts
 * @param delayMs Delay between retries in milliseconds
 */
export async function withRetry<T>(
  operation: () => Promise<SupabaseResponse<T>>, 
  maxRetries: number = RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_MS
): Promise<SupabaseResponse<T>> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error('Database operation failed');
}

// Helper functions for common database operations
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getClient();
    // We need to add explicit Promise wrapping to make the types work
    const result = await withRetry<any>(() => 
      Promise.resolve(client.from('health_check').select('*').limit(1))
    );
    
    if (result.error) {
      throw new DatabaseError(result.error.message, 500, result.error);
    }
    return true;
  } catch (error: any) {
    const logger = pino();
    logger.error('Supabase health check failed:', error);
    return false;
  }
} 