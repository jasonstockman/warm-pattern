import apiClient from '../apiClient';
import { Asset, CreateAssetRequest } from '../../types/asset';

/**
 * Service for managing personal assets
 */
export const assetService = {
  /**
   * Get all assets
   * @returns Array of assets
   */
  getAll: async (): Promise<Asset[]> => {
    return await apiClient.get<Asset[]>('/assets');
  },
  
  /**
   * Get an asset by ID
   * @param assetId - ID of the asset to fetch
   * @returns The asset with the specified ID
   */
  getById: async (assetId: number): Promise<Asset> => {
    const assets = await apiClient.get<Asset[]>(`/assets/${assetId}`);
    return assets[0];
  },
  
  /**
   * Get assets by user ID
   * @param userId - ID of the user
   * @returns Assets belonging to the user
   */
  getByUserId: async (userId: number): Promise<Asset[]> => {
    return await apiClient.get<Asset[]>(`/users/${userId}/assets`);
  },
  
  /**
   * Create a new asset
   * @param assetData - Data for the new asset
   * @returns The newly created asset
   */
  create: async (assetData: CreateAssetRequest): Promise<Asset> => {
    const assets = await apiClient.post<Asset[]>('/assets', assetData);
    return assets[0];
  },
  
  /**
   * Update an existing asset
   * @param assetId - ID of the asset to update
   * @param assetData - Updated asset data
   * @returns The updated asset
   */
  update: async (assetId: number, assetData: Partial<CreateAssetRequest>): Promise<Asset> => {
    const assets = await apiClient.put<Asset[]>(`/assets/${assetId}`, assetData);
    return assets[0];
  },
  
  /**
   * Delete an asset
   * @param assetId - ID of the asset to delete
   */
  delete: async (assetId: number): Promise<void> => {
    await apiClient.delete(`/assets/${assetId}`);
  }
};

export default assetService; 