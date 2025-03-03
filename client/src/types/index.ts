/**
 * Central export file for all application types
 */

// Re-export all type modules
export * from './branded';
export * from './user';
export * from './item';
export * from './account';
export * from './transaction';
export * from './asset';

// Common shared types

/**
 * Base interface for entities with timestamp fields
 */
export interface TimestampedEntity {
  /** When the entity was created */
  created_at: string;
  /** When the entity was last updated */
  updated_at: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Optional error message */
  error?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Items per page */
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Items in the current page */
  items: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  pages: number;
} 