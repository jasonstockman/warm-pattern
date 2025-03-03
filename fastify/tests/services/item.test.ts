/**
 * Unit tests for the Item Service
 */
import { FastifyInstance } from 'fastify';
import { ItemServiceImpl } from '../../services/item';
import { Item, CreateItemInput, UpdateItemInput } from '../../types/item';
import { DatabaseError } from '../../db/client';

// Mock data
const mockItem: Item = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174002',
  plaid_item_id: 'plaid-item-123',
  plaid_access_token: 'access-token-123',
  plaid_institution_id: 'institution-123',
  institution_name: 'Test Bank',
  is_active: true,
  status: 'good',
  last_updated: '2023-01-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

const mockCreateInput: CreateItemInput = {
  user_id: mockItem.user_id,
  plaid_item_id: mockItem.plaid_item_id,
  plaid_access_token: mockItem.plaid_access_token,
  plaid_institution_id: mockItem.plaid_institution_id,
  institution_name: mockItem.institution_name,
  is_active: mockItem.is_active,
  status: mockItem.status,
  last_updated: mockItem.last_updated,
};

const mockUpdateInput: UpdateItemInput = {
  institution_name: 'Updated Test Bank',
  is_active: false,
  status: 'error',
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
  data: mockItem,
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

describe('ItemService', () => {
  let itemService: ItemServiceImpl;

  beforeEach(() => {
    itemService = new ItemServiceImpl(mockFastify);
  });

  describe('create', () => {
    it('should create a new item successfully', async () => {
      // Arrange
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: mockItem,
        error: null,
      });

      // Act
      const result = await itemService.create(mockCreateInput);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('items');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(mockItem);
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
      await expect(itemService.create(mockCreateInput)).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    it('should update an item successfully', async () => {
      // Arrange
      const updatedItem = { ...mockItem, ...mockUpdateInput };
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: updatedItem,
        error: null,
      });

      // Act
      const result = await itemService.update(mockItem.id, mockUpdateInput);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('items');
      expect(mockSupabaseClient.update).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
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
      await expect(itemService.update(mockItem.id, mockUpdateInput)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getById', () => {
    it('should get an item by ID successfully', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: mockItem,
        error: null,
      });

      // Act
      const result = await itemService.getById(mockItem.id);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('items');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockItem.id);
      expect(result).toEqual(mockItem);
    });

    it('should throw DatabaseError when item not found', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: null,
        error: { message: 'Item not found', code: 'NOT_FOUND' },
      });

      // Act & Assert
      await expect(itemService.getById(mockItem.id)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    it('should get all items successfully', async () => {
      // Arrange
      const mockItems = [mockItem, { ...mockItem, id: 'another-id' }];
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.range = jest.fn().mockReturnThis();
      
      // Mock the full query chain
      const queryResult = {
        data: mockItems,
        error: null,
        eq: jest.fn().mockReturnValue({
          data: mockItems,
          error: null
        })
      };
      mockSupabaseClient.range.mockReturnValue(queryResult);

      // Act
      const options = { limit: 10, offset: 0, userId: mockItem.user_id };
      const result = await itemService.getAll(options);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('items');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockItems);
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
      await expect(itemService.getAll({ limit: 10, offset: 0 })).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    it('should delete an item successfully', async () => {
      // Arrange
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.eq.mockReturnValue({
        data: { success: true },
        error: null,
      });

      // Act
      await itemService.delete(mockItem.id);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('items');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockItem.id);
    });

    it('should throw DatabaseError when delete fails', async () => {
      // Arrange
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockReturnValue({
        data: null,
        error: { message: 'Database error', code: 'INTERNAL_ERROR' },
      });

      // Act & Assert
      await expect(itemService.delete(mockItem.id)).rejects.toThrow(DatabaseError);
    });
  });
}); 