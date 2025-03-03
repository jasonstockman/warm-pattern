import fastify, { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { fastifyEnv } from '@fastify/env';
import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyRateLimit } from '@fastify/rate-limit';
import { fastifyCookie } from '@fastify/cookie';
import { fastifySensible } from '@fastify/sensible';
import { fastifyRequestContext } from '@fastify/request-context';
import fastifyRawBody from 'fastify-raw-body';
import { fastifyJwt } from '@fastify/jwt';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

// Import configuration schema
import { envSchema } from './config/env';

// Import routes
import authRoutes from './routes/auth';
import itemRoutes from './routes/item';
import accountRoutes from './routes/account';
import assetRoutes from './routes/asset';
import transactionRoutes from './routes/transaction';
import profileRoutes from './routes/profile';
import userRoutes from './routes/users';
import authMiddleware from './middleware/auth';

async function buildApp(): Promise<FastifyInstance> {
  // Create Fastify instance
  const app = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register env plugin
  await app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  // Register CORS
  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  // Register Helmet
  await app.register(fastifyHelmet, {
    global: true,
  });

  // Register rate limit
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register cookie
  await app.register(fastifyCookie);

  // Register sensible
  await app.register(fastifySensible as any);

  // Register request context
  await app.register(fastifyRequestContext);

  // Register raw body
  await app.register(fastifyRawBody);

  // Register JWT
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  });

  // Register Swagger
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'API Documentation',
        description: 'API documentation',
        version: '1.0.0'
      },
      host: 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'items', description: 'Item management endpoints' },
        { name: 'accounts', description: 'Account management endpoints' },
        { name: 'assets', description: 'Asset management endpoints' },
        { name: 'transactions', description: 'Transaction management endpoints' }
      ],
    }
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  // Register auth middleware
  await app.register(authMiddleware);

  // Register routes
  await app.register(authRoutes, { prefix: '/auth' } as const);
  await app.register(itemRoutes, { prefix: '/items' } as const);
  await app.register(accountRoutes, { prefix: '/accounts' } as const);
  await app.register(assetRoutes, { prefix: '/assets' } as const);
  await app.register(transactionRoutes, { prefix: '/transactions' } as const);
  await app.register(profileRoutes, { prefix: '/profiles' } as const);
  await app.register(userRoutes, { prefix: '/users' } as const);

  // Health check route
  app.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          },
          required: ['status', 'timestamp']
        }
      },
      description: 'Health check endpoint',
      tags: ['system']
    }
  }, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
    });
  });

  // Error handler
  app.setErrorHandler((error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    app.log.error(error);
    
    const statusCode = error.statusCode || 500;
    const response = {
      statusCode,
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unknown error occurred',
    };
    
    // Only include stack trace in development
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      Object.assign(response, { stack: error.stack });
    }
    
    reply.status(statusCode).send(response);
  });

  return app;
}

async function startApp() {
  try {
    const app = await buildApp();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    
    // Initialize Socket.IO with the raw HTTP server
    const io = new SocketServer(app.server, {
      cors: {
        origin: true,
        credentials: true
      }
    });
    
    // Socket.IO connection handling
    io.on('connection', (socket: Socket) => {
      app.log.info(`Client connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        app.log.info(`Client disconnected: ${socket.id}`);
      });
    });
    
    app.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startApp();
}

export { buildApp }; 