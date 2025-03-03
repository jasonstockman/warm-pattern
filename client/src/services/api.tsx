import axios from 'axios';
import React from 'react';
import { toast } from 'react-toastify';
import { PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

import { API_HOST } from '../lib/env';

import DuplicateItemToastMessage from '../components/DuplicateItemToast';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: 0,
  },
});

/**
 * Directly set JWT token for API requests
 * Use this function to manually set a token for testing or when regular authentication fails
 * @param token The JWT token string
 */
export const setAuthToken = (token: string): void => {
  if (!token) {
    console.warn('Attempted to set empty authentication token');
    return;
  }
  
  // Store token in localStorage under both keys for compatibility
  localStorage.setItem('token', token);
  localStorage.setItem('access_token', token);
  
  // Also set token in axios default headers for all future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  console.log('Auth token set successfully:', token.substring(0, 10) + '...');
};

/**
 * Clear authentication token
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete axios.defaults.headers.common['Authorization'];
  delete api.defaults.headers.common['Authorization'];
  console.log('Auth token cleared');
};

// Add request interceptor to include JWT token in all requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage - try both possible keys
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    // Debug logging
    console.log('Auth interceptor running for URL:', config.url);
    console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.warn('No token available for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api;
// currentUser
export const getLoginUser = (username: string) =>
  api.post('/sessions', { username });

// assets
export const addAsset = (userId: number, description: string, value: number) =>
  api.post('/assets', { userId, description, value });
export const getAssetsByUser = (userId: number) => api.get(`/assets?user_id=${userId}`);
export const deleteAssetByAssetId = (assetId: number) =>
  api.delete(`/assets/${assetId}`);

// users
export const getUsers = () => api.get('/users');
export const getUserById = (userId: number) => api.get(`/users/${userId}`);
export const addNewUser = (username: string) =>
  api.post('/users', { username });
export const deleteUserById = (userId: number) =>
  api.delete(`/users/${userId}`);

// items
export const getItemById = (id: number) => api.get(`/items/${id}`);
export const getItemsByUser = (userId: number) =>
  api.get(`/items?user_id=${userId}`);
export const deleteItemById = (id: number) => api.delete(`/items/${id}`);
export const setItemState = (itemId: number, status: string) =>
  api.put(`items/${itemId}`, { status });
// This endpoint is only availble in the sandbox enviornment
export const setItemToBadState = (itemId: number) =>
  api.post('/items/sandbox/item/reset_login', { itemId });

export const getLinkToken = (userId: number, itemId: number) =>
  api.post(`/link-token`, {
    userId,
    itemId,
  });

// accounts
export const getAccountsByItem = (itemId: number) =>
  api.get(`/accounts?item_id=${itemId}`);
export const getAccountsByUser = (userId: number) =>
  api.get(`/accounts?user_id=${userId}`);

// transactions
export const getTransactionsByAccount = (accountId: number) =>
  api.get(`/transactions?account_id=${accountId}`);
export const getTransactionsByItem = (itemId: number) =>
  api.get(`/transactions?item_id=${itemId}`);
export const getTransactionsByUser = (userId: number) =>
  api.get(`/transactions?user_id=${userId}`);

// institutions
export const getInstitutionById = (instId: string) =>
  api.get(`/institutions/${instId}`);

// misc
export const postLinkEvent = (event: any) => api.post(`/link-event`, event);

export const exchangeToken = async (
  publicToken: string,
  institution: any,
  accounts: PlaidLinkOnSuccessMetadata['accounts'],
  userId: number
) => {
  try {
    const { data } = await api.post('/items', {
      publicToken,
      institutionId: institution.institution_id,
      userId,
      accounts,
    });
    return data;
  } catch (err) {
    const { response } = err;
    if (response && response.status === 409) {
      toast.error(
        <DuplicateItemToastMessage institutionName={institution.name} />
      );
    } else {
      toast.error(`Error linking ${institution.name}`);
    }
  }
};

// Account Endpoints
export const getAccountsByUserId = async (userId: number) => {
  try {
    const response = await fetch(`/users/${userId}/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }
    
    return {
      data: await response.json(),
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return {
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 500,
    };
  }
};

// Item Endpoints
export const getAccountsByItemId = async (itemId: number) => {
  try {
    const response = await fetch(`/items/${itemId}/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch accounts for this item');
    }
    
    return {
      data: await response.json(),
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching accounts by item ID:', error);
    return {
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 500,
    };
  }
};

export const getTransactionsByItemId = async (itemId: number) => {
  try {
    const response = await fetch(`/items/${itemId}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions for this item');
    }
    
    return {
      data: await response.json(),
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching transactions by item ID:', error);
    return {
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 500,
    };
  }
};

// Account Endpoints
export const getTransactionsByAccountId = async (accountId: number) => {
  try {
    const response = await fetch(`/accounts/${accountId}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions for this account');
    }
    
    return {
      data: await response.json(),
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching transactions by account ID:', error);
    return {
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 500,
    };
  }
};

// Institution Endpoints
export const getInstitutions = async (count = 200, offset = 0) => {
  try {
    const response = await fetch(`/institutions?count=${count}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch institutions');
    }
    
    return {
      data: await response.json(),
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return {
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 500,
    };
  }
};

// Sandbox Endpoints
export const resetItemLogin = async (itemId: number) => {
  try {
    const response = await fetch('/items/sandbox/item/reset_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset item login state');
    }
    
    return {
      data: await response.json(),
      status: response.status,
    };
  } catch (error) {
    console.error('Error resetting item login:', error);
    return {
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 500,
    };
  }
};
