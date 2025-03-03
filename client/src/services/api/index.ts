/**
 * Centralized API module that provides a unified interface for making HTTP requests.
 * This module handles common concerns like error handling, authentication, and request formatting.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Configuration options for creating an API client instance
 */
export interface ApiClientConfig {
  /** Base URL for all API requests */
  baseURL: string;
  /** Default headers to include with every request */
  headers?: Record<string, string>;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials in cross-origin requests */
  withCredentials?: boolean;
}

/**
 * Standard API error format
 */
export interface ApiError {
  /** HTTP status code of the error */
  status: number;
  /** Error message */
  message: string;
  /** Optional error code defined by the API */
  code?: string;
  /** Raw error data from the server */
  data?: any;
}

/**
 * API response wrapper type
 */
export type ApiResponse<T> = {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
};

/**
 * ApiClient class that provides methods for making API requests with consistent error handling
 */
export class ApiClient {
  private client: AxiosInstance;
  
  /**
   * Creates a new ApiClient instance
   * 
   * @param config - Configuration options for the API client
   */
  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      timeout: config.timeout || 30000,
      withCredentials: config.withCredentials || false,
    });
    
    // Add request interceptor for auth tokens, etc.
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage or other storage
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );
    
    // Add response interceptor for consistent error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error))
    );
  }
  
  /**
   * Transforms AxiosError into a standardized ApiError format
   * 
   * @param error - The error to transform
   * @returns A standardized ApiError
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        code: error.response.data?.code,
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        message: 'No response received from server',
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        message: error.message || 'Unknown error',
      };
    }
  }
  
  /**
   * Performs a GET request
   * 
   * @param url - The URL to send the request to
   * @param config - Optional Axios request configuration
   * @returns Promise that resolves with the response data
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Performs a POST request
   * 
   * @param url - The URL to send the request to
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise that resolves with the response data
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Performs a PUT request
   * 
   * @param url - The URL to send the request to
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise that resolves with the response data
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Performs a PATCH request
   * 
   * @param url - The URL to send the request to
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise that resolves with the response data
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Performs a DELETE request
   * 
   * @param url - The URL to send the request to
   * @param config - Optional Axios request configuration
   * @returns Promise that resolves with the response data
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      throw error;
    }
  }
}

// Create default API client
const api = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json'
  }
});

export default api; 