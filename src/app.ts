import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import authMiddleware from '../fastify/middleware/auth';

const server = fastify({
  logger: true,
});

// Register plugins
server.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key',
});

// Register auth middleware
server.register(authMiddleware);

// Default route
server.get('/', async () => {
  return { status: 'ok', message: 'Server is running' };
});

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    console.log(`Server is running on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 