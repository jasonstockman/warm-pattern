import apiClient from '../apiClient';
import { Institution, GetInstitutionsParams } from '../../types/institution';

/**
 * Service for managing financial institutions
 */
export const institutionService = {
  /**
   * Get all institutions
   * @param params - Optional parameters for pagination
   * @returns Array of institutions
   */
  getAll: async (params?: GetInstitutionsParams): Promise<Institution[]> => {
    return await apiClient.get<Institution[]>('/institutions', { params });
  },
  
  /**
   * Get an institution by ID
   * @param institutionId - ID of the institution to fetch
   * @returns The institution with the specified ID
   */
  getById: async (institutionId: string): Promise<Institution> => {
    const institutions = await apiClient.get<Institution[]>(`/institutions/${institutionId}`);
    return institutions[0];
  },
  
  /**
   * Search for institutions by name
   * @param query - Search query
   * @param params - Optional parameters for pagination
   * @returns Institutions matching the search query
   */
  search: async (query: string, params?: GetInstitutionsParams): Promise<Institution[]> => {
    const searchParams = { ...params, query };
    return await apiClient.get<Institution[]>('/institutions/search', { params: searchParams });
  },
  
  /**
   * Get institutions by country
   * @param countryCode - 2-letter country code (e.g., 'US')
   * @param params - Optional parameters for pagination
   * @returns Institutions for the specified country
   */
  getByCountry: async (countryCode: string, params?: GetInstitutionsParams): Promise<Institution[]> => {
    const countryParams = { ...params, country: countryCode };
    return await apiClient.get<Institution[]>('/institutions', { params: countryParams });
  }
};

export default institutionService; 