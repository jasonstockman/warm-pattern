/**
 * Unit tests for the Asset Service
 */
import { FastifyInstance } from 'fastify';
import { AssetServiceImpl } from '../../services/asset';
import { Asset, CreateAssetInput, UpdateAssetInput } from '../../types/asset';
import { DatabaseError } from '../../db/client';

// Mock data
const mockAsset: Asset = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Test Asset',
  type: 'real_estate',
  value: 250000,
  currency: 'USD',
  description: 'Test asset description',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

const mockCreateInput: CreateAssetInput = {
  user_id: mockAsset.user_id,
  name: mockAsset.name,
  type: mockAsset.type,
  value: mockAsset.value,
  currency: mockAsset.currency,
  description: mockAsset.description,
  is_active: mockAsset.is_active
};

const mockUpdateInput: UpdateAssetInput = {
  name: 'Updated Asset Name',
  value: 275000,
  description: 'Updated asset description'
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
  data: mockAsset,
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

describe('AssetService', () => {
  let assetService: AssetServiceImpl;

  beforeEach(() => {
    assetService = new AssetServiceImpl(mockFastify);
  });

  describe('create', () => {
    it('should create a new asset successfully', async () => {
      // Arrange
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: mockAsset,
        error: null,
      });

      // Act
      const result = await assetService.create(mockCreateInput);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('assets');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(mockAsset);
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
      await expect(assetService.create(mockCreateInput)).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    it('should update an asset successfully', async () => {
      // Arrange
      const updatedAsset = { ...mockAsset, ...mockUpdateInput };
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: updatedAsset,
        error: null,
      });

      // Act
      const result = await assetService.update(mockAsset.id, mockUpdateInput);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('assets');
      expect(mockSupabaseClient.update).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(updatedAsset);
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
      await expect(assetService.update(mockAsset.id, mockUpdateInput)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getById', () => {
    it('should get an asset by ID successfully', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: mockAsset,
        error: null,
      });

      // Act
      const result = await assetService.getById(mockAsset.id);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('assets');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockAsset.id);
      expect(result).toEqual(mockAsset);
    });

    it('should throw DatabaseError when asset not found', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockReturnValue({
        data: null,
        error: { message: 'Asset not found', code: 'NOT_FOUND' },
      });

      // Act & Assert
      await expect(assetService.getById(mockAsset.id)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    it('should get all assets successfully', async () => {
      // Arrange
      const mockAssets = [mockAsset, { ...mockAsset, id: 'another-id' }];
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.range = jest.fn().mockReturnThis();
      
      // Mock the full query chain
      const queryResult = {
        data: mockAssets,
        error: null,
        eq: jest.fn().mockReturnValue({
          data: mockAssets,
          error: null
        })
      };
      mockSupabaseClient.range.mockReturnValue(queryResult);

      // Act
      const options = { limit: 10, offset: 0, userId: mockAsset.user_id };
      const result = await assetService.getAll(options);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('assets');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockAssets);
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
      await expect(assetService.getAll({ limit: 10, offset: 0 })).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    it('should delete an asset successfully', async () => {
      // Arrange
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.eq.mockReturnValue({
        data: { success: true },
        error: null,
      });

      // Act
      await assetService.delete(mockAsset.id);

      // Assert
      expect(mockFastify.getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('assets');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockAsset.id);
    });

    it('should throw DatabaseError when delete fails', async () => {
      // Arrange
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockReturnValue({
        data: null,
        error: { message: 'Database error', code: 'INTERNAL_ERROR' },
      });

      // Act & Assert
      await expect(assetService.delete(mockAsset.id)).rejects.toThrow(DatabaseError);
    });
  });
}); 