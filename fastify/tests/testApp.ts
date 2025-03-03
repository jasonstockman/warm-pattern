/**
 * Test app builder that uses mocks for external dependencies
 */
import fastify, { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { fastifyEnv } from '@fastify/env';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifySensible from '@fastify/sensible';
import { fastifyJwt } from '@fastify/jwt';

// Import configuration schema
import { envSchema } from '../config/env';

// Import mock plugins instead of real ones
import mockSupabasePlugin from './mocks/supabase';
import mockAuthPlugin from './mocks/auth';
import mockTransactionServicePlugin from './mocks/transaction';
import mockProfileServicePlugin from './mocks/profile';

// Import routes
import authRoutes from '../routes/auth';
import profileRoutes from '../routes/profile';
import transactionRoutes from '../routes/transaction';
import accountRoutes from '../routes/account';
import assetRoutes from '../routes/asset';
import itemRoutes from '../routes/item';

/**
 * Build a test version of the app with mocked dependencies
 */
export async function buildTestApp(): Promise<FastifyInstance> {
  // Create Fastify instance with minimal logging
  const app = fastify({
    logger: {
      level: 'error', // Minimal logging for tests
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Register env plugin with test values
  await app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
    data: process.env, // Use process.env which includes .env.test values
  });

  // Register essential plugins
  await app.register(fastifyCors, { origin: true });
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });
  await app.register(fastifyCookie);
  await app.register(fastifySensible);

  // Register JWT
  await app.register(fastifyJwt, {
    secret: 'test_jwt_secret_for_testing_purposes_only',
    sign: { expiresIn: '1h' },
    cookie: { cookieName: 'refreshToken', signed: false },
    namespace: 'jwt'
  });

  // Register Swagger but with minimal config for testing
  await app.register(fastifySwagger, {
    openapi: { info: { title: 'Test API', version: '1.0.0' } },
  });
  await app.register(fastifySwaggerUi, { routePrefix: '/documentation' });

  // Register mock plugins
  await app.register(mockSupabasePlugin);
  await app.register(mockAuthPlugin);
  await app.register(mockTransactionServicePlugin);
  await app.register(mockProfileServicePlugin);

  // Register routes
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(profileRoutes, { prefix: '/profiles' });
  await app.register(transactionRoutes, { prefix: '/transactions' });
  await app.register(accountRoutes, { prefix: '/accounts' });
  await app.register(assetRoutes, { prefix: '/assets' });
  await app.register(itemRoutes, { prefix: '/items' });

  // Health check route
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
} 