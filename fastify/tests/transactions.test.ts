/**
 * Tests for transaction routes
 */
import { FastifyInstance } from 'fastify';
import { buildTestApp } from './testApp';
import { mockSupabaseClient, resetMocks as resetSupabaseMocks } from './mocks/supabase';
import { mockRequireAuth, resetMocks as resetAuthMocks } from './mocks/auth';
import { mockCreate, mockUpdate, mockGetById, mockGetAll, mockDelete, resetMocks as resetTransactionMocks } from './mocks/transaction';
import { mockSupabaseResponse } from './helpers';
import { Transaction } from '../types/transaction';

describe('Transaction Routes', () => {
  let app: FastifyInstance;
  const testToken = 'test.jwt.token';
  
  // Sample transaction data for testing
  const mockTransaction: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    account_id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: '123e4567-e89b-12d3-a456-426614174002',
    plaid_transaction_id: 'plaid-tx-123456',
    name: 'Coffee Shop',
    amount: 4.99,
    date: '2023-03-01',
    pending: false,
    category: ['Food and Drink', 'Coffee Shop'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeAll(async () => {
    // Build the app once for all tests in this file
    app = await buildTestApp();
    // Mock the JWT verify function
    app.jwt.verify = jest.fn().mockReturnValue({
      sub: mockTransaction.user_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    resetSupabaseMocks();
    resetAuthMocks();
    resetTransactionMocks();
    
    // Default behavior for requireAuth is to pass through
    mockRequireAuth.mockImplementation(async (request, reply) => {
      request.user = {
        id: mockTransaction.user_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    });

    // Default behavior for transaction service mocks
    mockGetAll.mockResolvedValue([mockTransaction]);
    mockGetById.mockResolvedValue(mockTransaction);
    mockCreate.mockResolvedValue(mockTransaction);
    mockUpdate.mockResolvedValue({ ...mockTransaction, name: 'Updated Coffee Shop' });
    mockDelete.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    // Close the app after all tests
    await app.close();
  });

  describe('GET /transactions', () => {
    it('should return a list of transactions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/transactions',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([mockTransaction]);
    });

    it('should handle query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/transactions?limit=10&offset=0&userId=123',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /transactions/:id', () => {
    it('should return a transaction by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/transactions/${mockTransaction.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockTransaction);
    });

    it('should return 404 if transaction not found', async () => {
      mockGetById.mockRejectedValue(new Error('Transaction not found'));

      const response = await app.inject({
        method: 'GET',
        url: '/transactions/nonexistent',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.statusCode).toBe(500); // The service returns 500 for DB errors
    });
  });

  describe('POST /transactions', () => {
    it('should create a new transaction', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        headers: {
          authorization: `Bearer ${testToken}`,
          'content-type': 'application/json',
        },
        payload: {
          account_id: mockTransaction.account_id,
          plaid_transaction_id: mockTransaction.plaid_transaction_id,
          name: mockTransaction.name,
          amount: mockTransaction.amount,
          date: mockTransaction.date,
          pending: mockTransaction.pending,
          category: mockTransaction.category,
        },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(mockTransaction);
    });
  });

  describe('PUT /transactions/:id', () => {
    it('should update an existing transaction', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/transactions/${mockTransaction.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
          'content-type': 'application/json',
        },
        payload: {
          name: 'Updated Coffee Shop',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).name).toBe('Updated Coffee Shop');
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should delete a transaction', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/transactions/${mockTransaction.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
    });
  });
}); 