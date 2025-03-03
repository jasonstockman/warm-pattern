import { z } from 'zod';

/**
 * Plaid schema for validation and type safety
 */
export const createLinkTokenSchema = z.object({
  products: z.array(z.string()).optional(),
});

export const createLinkTokenResponseSchema = z.object({
  linkToken: z.string(),
  expiration: z.string(),
});

export const exchangePublicTokenSchema = z.object({
  publicToken: z.string(),
});

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  mask: z.string().nullable(),
  type: z.string(),
  subtype: z.string().nullable(),
  balances: z.object({
    available: z.number().nullable(),
    current: z.number().nullable(),
    limit: z.number().nullable(),
    isoCurrencyCode: z.string().nullable(),
  }),
});

export const exchangePublicTokenResponseSchema = z.object({
  itemId: z.string(),
  institutionName: z.string(),
  accounts: z.array(accountSchema),
});

export const webhookSchema = z.record(z.any());

export const plaidAccountSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  institutionName: z.string(),
  name: z.string(),
  officialName: z.string().nullable(),
  type: z.string(),
  subtype: z.string().nullable(),
  mask: z.string().nullable(),
  balances: z.object({
    current: z.number().nullable(),
    available: z.number().nullable(),
    limit: z.number().nullable(),
    isoCurrencyCode: z.string(),
  }),
});

export const plaidAccountsResponseSchema = z.object({
  accounts: z.array(plaidAccountSchema),
});

// JSON Schema versions for route validation
export const createLinkTokenJsonSchema = {
  type: 'object',
  properties: {
    products: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

export const createLinkTokenResponseJsonSchema = {
  type: 'object',
  properties: {
    linkToken: { type: 'string' },
    expiration: { type: 'string' }
  },
  required: ['linkToken', 'expiration']
};

export const exchangePublicTokenJsonSchema = {
  type: 'object',
  properties: {
    publicToken: { type: 'string' }
  },
  required: ['publicToken']
};

export const accountJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    mask: { type: 'string', nullable: true },
    type: { type: 'string' },
    subtype: { type: 'string', nullable: true },
    balances: {
      type: 'object',
      properties: {
        available: { type: 'number', nullable: true },
        current: { type: 'number', nullable: true },
        limit: { type: 'number', nullable: true },
        isoCurrencyCode: { type: 'string', nullable: true }
      },
      required: ['available', 'current', 'limit', 'isoCurrencyCode']
    }
  },
  required: ['id', 'name', 'type', 'balances']
};

export const exchangePublicTokenResponseJsonSchema = {
  type: 'object',
  properties: {
    itemId: { type: 'string' },
    institutionName: { type: 'string' },
    accounts: {
      type: 'array',
      items: accountJsonSchema
    }
  },
  required: ['itemId', 'institutionName', 'accounts']
};

export const webhookJsonSchema = {
  type: 'object',
  additionalProperties: true
};

export const plaidAccountJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    itemId: { type: 'string' },
    institutionName: { type: 'string' },
    name: { type: 'string' },
    officialName: { type: 'string', nullable: true },
    type: { type: 'string' },
    subtype: { type: 'string', nullable: true },
    mask: { type: 'string', nullable: true },
    balances: {
      type: 'object',
      properties: {
        current: { type: 'number', nullable: true },
        available: { type: 'number', nullable: true },
        limit: { type: 'number', nullable: true },
        isoCurrencyCode: { type: 'string' }
      },
      required: ['isoCurrencyCode']
    }
  },
  required: ['id', 'itemId', 'institutionName', 'name', 'type', 'balances']
};

export const plaidAccountsResponseJsonSchema = {
  type: 'object',
  properties: {
    accounts: {
      type: 'array',
      items: plaidAccountJsonSchema
    }
  },
  required: ['accounts']
};

// Common error response schema
export const errorResponseJsonSchema = {
  type: 'object',
  required: ['error', 'message'],
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// Type definitions
export type CreateLinkTokenInput = z.infer<typeof createLinkTokenSchema>;
export type CreateLinkTokenResponse = z.infer<typeof createLinkTokenResponseSchema>;
export type ExchangePublicTokenInput = z.infer<typeof exchangePublicTokenSchema>;
export type ExchangePublicTokenResponse = z.infer<typeof exchangePublicTokenResponseSchema>;
export type PlaidAccount = z.infer<typeof plaidAccountSchema>;
export type PlaidAccountsResponse = z.infer<typeof plaidAccountsResponseSchema>;

// API request and response interfaces
export interface CreateLinkTokenRequest {
  Body: CreateLinkTokenInput;
}

export interface ExchangePublicTokenRequest {
  Body: ExchangePublicTokenInput;
}

export interface WebhookRequest {
  Body: Record<string, any>;
}

export interface GetPlaidAccountsRequest {
  Querystring: Record<string, never>;
} 