import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  JwtVerifyPayload,
  loginJsonSchema,
  loginResponseJsonSchema,
  signupJsonSchema,
  signupResponseJsonSchema,
  resetPasswordRequestJsonSchema,
  resetPasswordJsonSchema,
  refreshTokenRequestJsonSchema,
  refreshTokenResponseJsonSchema,
  errorResponseJsonSchema,
  LoginRequest,
  SignupRequest,
  ResetPasswordRequestRequest,
  ResetPasswordRequest,
  signupSchema
} from '../types/auth';

// Auth routes plugin
const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /login - User login
  fastify.post<LoginRequest>(
    '/login',
    {
      schema: {
        body: loginJsonSchema,
        response: {
          200: loginResponseJsonSchema,
          401: errorResponseJsonSchema
        },
        description: 'Login with email and password',
        tags: ['auth']
      }
    },
    async (request, reply) => {
      const { email, password } = request.body;
      
      try {
        // Authenticate with Supabase
        const { data, error } = await fastify.supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        // Set refresh token cookie
        reply.setCookie('refreshToken', data.session.refresh_token, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'lax',
        });
        
        return {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: err instanceof Error ? err.message : 'Invalid credentials',
        });
      }
    }
  );
  
  fastify.post<SignupRequest>(
    '/signup',
    {
      schema: {
        body: signupJsonSchema,
        response: {
          201: signupResponseJsonSchema,
          400: errorResponseJsonSchema
        },
        description: 'Register a new user',
        tags: ['auth']
      }
    },
    async (request, reply) => {
      const { email, password, name } = signupSchema.parse(request.body);
      
      try {
        // Register with Supabase
        const { data, error } = await fastify.supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        if (!data?.user) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Could not create user',
          });
        }
        
        // Create user profile
        const { error: profileError } = await fastify.supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            role: 'user',
          });
        
        if (profileError) {
          throw profileError;
        }
        
        // Create JWT token
        const token = await reply.jwtSign(
          {
            id: data.user.id,
            email: data.user.email || undefined,
            role: 'user',
            type: 'access'
          },
          {
            expiresIn: fastify.config.JWT_EXPIRATION,
          }
        );
        
        // Create refresh token
        const refreshToken = await reply.jwtSign(
          {
            id: data.user.id,
            type: 'refresh',
            email: data.user.email || undefined,
            role: 'user'
          },
          {
            expiresIn: fastify.config.JWT_REFRESH_EXPIRATION,
          }
        );
        
        // Set refresh token as cookie
        reply.setCookie('refreshToken', await refreshToken, {
          path: '/',
          secure: fastify.config.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
        });
        
        return reply.status(201).send({
          user: {
            id: data.user.id,
            email: data.user.email as string,
            name,
          },
          token,
          refreshToken,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: err instanceof Error ? err.message : 'Could not create user',
        });
      }
    }
  );
  
  // POST /refresh - Refresh access token
  fastify.post(
    '/refresh',
    {
      schema: {
        body: refreshTokenRequestJsonSchema,
        response: {
          200: refreshTokenResponseJsonSchema,
          401: errorResponseJsonSchema
        },
        description: 'Refresh access token using refresh token cookie',
        tags: ['auth']
      }
    },
    async (request, reply) => {
      const refreshToken = request.cookies.refreshToken;
      
      if (!refreshToken) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Refresh token not found',
        });
      }
      
      try {
        // Verify refresh token
        const decoded = await request.jwtVerify<JwtVerifyPayload>();
        
        if (decoded.type !== 'refresh') {
          throw new Error('Invalid token type');
        }
        
        // Create new access token
        const accessToken = await reply.jwtSign(
          {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            type: 'access'
          },
          {
            expiresIn: fastify.config.JWT_EXPIRATION,
          }
        );
        
        return { accessToken };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: err instanceof Error ? err.message : 'Invalid refresh token',
        });
      }
    }
  );
  
  // POST /reset-password-request - Request password reset
  fastify.post<ResetPasswordRequestRequest>(
    '/reset-password-request',
    {
      schema: {
        body: resetPasswordRequestJsonSchema,
        response: {
          200: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' }
            }
          },
          400: errorResponseJsonSchema
        },
        description: 'Request a password reset email',
        tags: ['auth']
      }
    },
    async (request) => {
      const { email } = request.body;
      
      try {
        // Send password reset email with Supabase
        const { error } = await fastify.supabase.auth.resetPasswordForEmail(email);
        
        if (error) {
          throw error;
        }
        
        return {
          message: 'Password reset email sent',
        };
      } catch (err) {
        fastify.log.error(err);
        // Return success message even if email doesn't exist to prevent user enumeration
        return {
          message: 'Password reset email sent',
        };
      }
    }
  );
  
  // POST /reset-password - Reset password with token
  fastify.post<ResetPasswordRequest>(
    '/reset-password',
    {
      schema: {
        body: resetPasswordJsonSchema,
        response: {
          200: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' }
            }
          },
          400: errorResponseJsonSchema
        },
        description: 'Reset password using reset token',
        tags: ['auth']
      }
    },
    async (request, reply) => {
      const { password } = request.body;
      
      try {
        // Reset password with Supabase
        const { error } = await fastify.supabase.auth.updateUser({
          password,
        });
        
        if (error) {
          throw error;
        }
        
        return {
          message: 'Password reset successful',
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: err instanceof Error ? err.message : 'Could not reset password',
        });
      }
    }
  );
  
  // GET /me - Get current user info
  fastify.get(
    '/me',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        response: {
          200: {
            type: 'object',
            required: ['user'],
            properties: {
              user: {
                type: 'object',
                required: ['id', 'email', 'name', 'role'],
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string', minLength: 1 },
                  role: { type: 'string', enum: ['user', 'admin'] }
                }
              }
            }
          },
          401: errorResponseJsonSchema
        },
        tags: ['auth'],
        description: 'Get current user information',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request) => {
      const user = request.user as JwtVerifyPayload;
      
      // Get user from Supabase
      const { data: { user: supabaseUser }, error } = await fastify.supabase.auth.getUser(user.id);
      
      if (error || !supabaseUser) {
        throw error || new Error('User not found');
      }
      
      return {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || '',
          role: supabaseUser.role || 'user',
        },
      };
    }
  );
  
  // POST /logout - User logout
  fastify.post(
    '/logout',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' }
            }
          },
          500: errorResponseJsonSchema
        },
        tags: ['auth'],
        description: 'Logout user and clear refresh token cookie',
        security: [{ bearerAuth: [] }]
      }
    },
    async (_request, reply) => {
      reply.clearCookie('refreshToken', { path: '/' });
      
      return {
        message: 'Logged out successfully',
      };
    }
  );
};

export default fp(authRoutes); 