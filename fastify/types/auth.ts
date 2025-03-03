import { z } from 'zod';

export interface JwtVerifyPayload {
  id: string;
  type: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Zod schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string(),
});

// JSON schemas for route validation
export const loginJsonSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  }
};

export const loginResponseJsonSchema = {
  type: 'object',
  required: ['accessToken', 'refreshToken'],
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' }
  }
};

export const signupJsonSchema = {
  type: 'object',
  required: ['email', 'password', 'name'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    name: { type: 'string', minLength: 1 }
  }
};

export const signupResponseJsonSchema = {
  type: 'object',
  required: ['user', 'token', 'refreshToken'],
  properties: {
    user: {
      type: 'object',
      required: ['id', 'email', 'name'],
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' }
      }
    },
    token: { type: 'string' },
    refreshToken: { type: 'string' }
  }
};

export const resetPasswordRequestJsonSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' }
  }
};

export const resetPasswordJsonSchema = {
  type: 'object',
  required: ['password'],
  properties: {
    password: { type: 'string' }
  }
};

export const refreshTokenRequestJsonSchema = {
  type: 'object',
  required: [],
  properties: {}
};

export const refreshTokenResponseJsonSchema = {
  type: 'object',
  required: ['accessToken'],
  properties: {
    accessToken: { type: 'string' }
  }
};

export const errorResponseJsonSchema = {
  type: 'object',
  required: ['error', 'message'],
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// Type definitions
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// API request and response interfaces
export interface LoginRequest {
  Body: LoginInput;
}

export interface SignupRequest {
  Body: SignupInput;
}

export interface ResetPasswordRequestRequest {
  Body: ResetPasswordRequestInput;
}

export interface ResetPasswordRequest {
  Body: ResetPasswordInput;
}

export interface RefreshTokenRequest {
  Body: Record<string, never>;
} 