/**
 * Mock implementation of the transaction service for testing
 */
import { FastifyInstance } from 'fastify';
import { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionService } from '../../types/transaction';
import fp from 'fastify-plugin';

// Mock functions
export const mockCreate = jest.fn();
export const mockUpdate = jest.fn();
export const mockGetById = jest.fn();
export const mockGetAll = jest.fn();
export const mockDelete = jest.fn();

/**
 * Reset all mocks between tests
 */
export function resetMocks(): void {
  mockCreate.mockClear();
  mockUpdate.mockClear();
  mockGetById.mockClear();
  mockGetAll.mockClear();
  mockDelete.mockClear();
}

/**
 * Mock implementation of the transaction service
 */
class MockTransactionService implements TransactionService {
  async create(transaction: CreateTransactionInput): Promise<Transaction> {
    return mockCreate(transaction);
  }

  async update(id: string, transaction: UpdateTransactionInput): Promise<Transaction> {
    return mockUpdate(id, transaction);
  }

  async getById(id: string): Promise<Transaction> {
    return mockGetById(id);
  }

  async getAll(options?: {
    limit?: number;
    offset?: number;
    userId?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<Transaction[]> {
    return mockGetAll(options);
  }

  async delete(id: string): Promise<void> {
    return mockDelete(id);
  }
}

/**
 * Mock transaction service plugin
 */
const mockTransactionServicePlugin = async (fastify: FastifyInstance) => {
  const service = new MockTransactionService();
  fastify.decorate('transactionService', service);
  fastify.log.info('Mock Transaction service initialized');
};

/**
 * Export the plugin
 */
export default fp(mockTransactionServicePlugin, {
  name: 'transactionService'
}); 