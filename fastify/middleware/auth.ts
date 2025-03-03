import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

// Interface for the verified JWT payload
export interface JwtVerifyPayload {
  id: string;
  type: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Extend JWT module types
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtVerifyPayload;
    user: JwtVerifyPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: JwtVerifyPayload;
  }
}

const authMiddleware: FastifyPluginAsync = async (fastify) => {
  // Decorate request with user property if not already decorated
  if (!fastify.hasRequestDecorator('user')) {
    fastify.decorateRequest('user', null);
  }
  
  // Middleware to verify JWT token
  if (!fastify.hasDecorator('requireAuth')) {
    fastify.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      }
    });
  }
  
  // Middleware for optional authentication
  if (!fastify.hasDecorator('optionalAuth')) {
    fastify.decorate('optionalAuth', async (request: FastifyRequest) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        // Continue even if authentication fails
      }
    });
  }
};

export default fp(authMiddleware, {
  name: 'auth-middleware'
}); 