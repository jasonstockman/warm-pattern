/**
 * API endpoint constants
 * Centralizes all API URLs used in the application
 */

// Base API URL - can be configured per environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Object containing all API endpoints used in the application
 * Use this instead of hardcoding URLs throughout the codebase
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: `${API_BASE_URL}/login`,
  LOGOUT: `${API_BASE_URL}/logout`,
  SIGNUP: `${API_BASE_URL}/signup`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  
  // Item endpoints
  ITEMS: `${API_BASE_URL}/items`,
  
  // Account endpoints
  ACCOUNTS: `${API_BASE_URL}/accounts`,
  
  // Transaction endpoints
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  
  // Asset endpoints
  ASSETS: `${API_BASE_URL}/assets`,
  
  // Link token endpoints
  LINK_TOKEN: `${API_BASE_URL}/link-token`,
  
  // Link events
  LINK_EVENT: `${API_BASE_URL}/link-event`,
  
  // Helper function to build user-specific URLs
  userSpecific: {
    transactions: (userId: string | number) => `${API_BASE_URL}/transactions?user_id=${userId}`,
    items: (userId: string | number) => `${API_BASE_URL}/items?user_id=${userId}`,
    assets: (userId: string | number) => `${API_BASE_URL}/assets?user_id=${userId}`,
    accounts: (userId: string | number) => `${API_BASE_URL}/accounts?user_id=${userId}`,
  },
};

/**
 * Helper function to construct a URL with path parameters
 * @param baseUrl - The base endpoint URL
 * @param params - Object with path parameters
 * @returns Formatted URL with path parameters
 * 
 * @example
 * // Returns "/api/users/123/items/456"
 * buildUrl(API_ENDPOINTS.USERS, { userId: '123', resource: 'items', resourceId: '456' });
 */
export const buildUrl = (baseUrl: string, params: Record<string, string | number>) => {
  let url = baseUrl;
  
  Object.entries(params).forEach(([key, value]) => {
    // Replace placeholder if it exists (/:key/)
    if (url.includes(`:${key}`)) {
      url = url.replace(`:${key}`, String(value));
    } else {
      // Otherwise append as path segment
      url = url.endsWith('/') ? `${url}${value}` : `${url}/${value}`;
    }
  });
  
  return url;
}; 