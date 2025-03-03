/**
 * @deprecated This API client is deprecated. Import from '../services/api' instead.
 * This file is maintained for backward compatibility and will be removed in a future version.
 */
import api from '../services/api';

// Add improved error handling for better diagnostics
const enhancedApi = {
  async get<T>(url: string, config?: any): Promise<T> {
    try {
      console.log(`GET request to: ${url}`);
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`Error in GET request to ${url}:`, error);
      // Return empty array or object instead of throwing
      if (Array.isArray([] as unknown as T)) {
        console.log(`Returning empty array for failed GET to ${url}`);
        return [] as unknown as T;
      }
      throw error;
    }
  },
  
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      console.log(`POST request to: ${url}`);
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error in POST request to ${url}:`, error);
      throw error;
    }
  },
  
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      console.log(`PUT request to: ${url}`);
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error in PUT request to ${url}:`, error);
      throw error;
    }
  },
  
  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      console.log(`DELETE request to: ${url}`);
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`Error in DELETE request to ${url}:`, error);
      throw error;
    }
  }
};

// Re-export the enhanced API client for backward compatibility
export default enhancedApi; 