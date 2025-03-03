/**
 * Unit tests for the Account Service
 */
import { FastifyInstance } from 'fastify';
import { AccountServiceImpl } from '../../services/account';
import { Account, CreateAccountInput, UpdateAccountInput } from '../../types/account';
import { DatabaseError } from '../../db/client';

// Mock data
const mockAccount: Account = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  item_id: '123e4567-e89b-12d3-a456-426614174001',
  user_id: '123e4567-e89b-12d3-a456-426614174002',
  plaid_account_id: 'plaid-account-123',
  name: 'Checking Account',
  mask: '1234',
  official_name: 'Personal Checking',
  current_balance: 1000.50,
  available_balance: 950.25,
  iso_currency_code: 'USD',
  account_type: 'depository',
  account_subtype: 'checking',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

const mockCreateInput: CreateAccountInput = {
  item_id: mockAccount.item_id,
  user_id: mockAccount.user_id,
  plaid_account_id: mockAccount.plaid_account_id,
  name: mockAccount.name,
  mask: mockAccount.mask,
  official_name: mockAccount.official_name,
  current_balance: mockAccount.current_balance,
  available_balance: mockAccount.available_balance,
  iso_currency_code: mockAccount.iso_currency_code,
  account_type: mockAccount.account_type,
  account_subtype: mockAccount.account_subtype,
};

const mockUpdateInput: UpdateAccountInput = {
  name: 'Updated Checking Account',
  current_balance: 1100.75,
  available_balance: 1050.25,
};

// Mock the Fastify instance
const mockFastify = {
  getSupabaseClient: jest.fn(),
  log: {
    error: jest.fn(),
    info: jest.fn(),
  }
} as unknown as FastifyInstance;

// Mock Supabase client
const mockSupabaseResponse = {
  data: mockAccount,
  error: null,
};

const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnValue(mockSupabaseResponse),
  range: jest.fn().mockReturnThis(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockFastify.getSupabaseClient.mockReturnValue(mockSupabaseClient);
});

describe('AccountService', () => {
  let accountService: AccountServiceImpl;

  beforeEach(() => {
    accountService = new AccountServiceImpl(mockFastify);
  });

  describe('create', () => {
    it('should create a new account successfully', async () => {
      // Arrange
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: mockAccount,
        error: null,
      });

      // Act
      const result = await accountService.create(mockCreateInput);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(mockAccount);
    });

    it('should throw DatabaseError when creation fails', async () => {
      // Arrange
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: null,
        error: { message: 'Database error', code: 'INTERNAL_ERROR' },
      });

      // Act & Assert
      await expect(accountService.create(mockCreateInput)).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    it('should update an account successfully', async () => {
      // Arrange
      const updatedAccount = { ...mockAccount, ...mockUpdateInput };
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: updatedAccount,
        error: null,
      });

      // Act
      const result = await accountService.update(mockAccount.id, mockUpdateInput);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabaseClient.update).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(updatedAccount);
    });

    it('should throw DatabaseError when update fails', async () => {
      // Arrange
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: null,
        error: { message: 'Database error', code: 'INTERNAL_ERROR' },
      });

      // Act & Assert
      await expect(accountService.update(mockAccount.id, mockUpdateInput)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getById', () => {
    it('should get an account by ID successfully', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: mockAccount,
        error: null,
      });

      // Act
      const result = await accountService.getById(mockAccount.id);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockAccount.id);
      expect(result).toEqual(mockAccount);
    });

    it('should throw DatabaseError when account not found', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: null,
        error: { message: 'Account not found', code: 'NOT_FOUND' },
      });

      // Act & Assert
      await expect(accountService.getById(mockAccount.id)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    it('should get all accounts successfully', async () => {
      // Arrange
      const mockAccounts = [mockAccount, { ...mockAccount, id: 'another-id' }];
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.range = jest.fn().mockReturnThis();
      
      // Mock the full query chain
      const queryResult = {
        data: mockAccounts,
        error: null,
        eq: jest.fn().mockReturnValue({
          data: mockAccounts,
          error: null
        })
      };
      mockSupabaseClient.range.mockReturnValue(queryResult);

      // Act
      const options = { limit: 10, offset: 0, userId: mockAccount.user_id };
      const result = await accountService.getAll(options);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockAccounts);
    });

    it('should throw DatabaseError when getAll fails', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.range = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Database error', code: 'INTERNAL_ERROR' },
        eq: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Database error', code: 'INTERNAL_ERROR' }
        })
      });

      // Act & Assert
      await expect(accountService.getAll({ limit: 10, offset: 0 })).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    it('should delete an account successfully', async () => {
      // Arrange
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.eq.mockReturnValue({
        data: { success: true },
        error: null,
      });

      // Act
      await accountService.delete(mockAccount.id);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockAccount.id);
    });

    it('should throw DatabaseError when delete fails', async () => {
      // Arrange
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockReturnValue({
        data: null,
        error: { message: 'Database error', code: 'INTERNAL_ERROR' },
      });

      // Act & Assert
      await expect(accountService.delete(mockAccount.id)).rejects.toThrow(DatabaseError);
    });
  });
}); 