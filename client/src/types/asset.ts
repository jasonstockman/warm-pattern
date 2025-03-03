/**
 * Asset-related type definitions
 */
import { AssetId, UserId } from './branded';

/**
 * Represents a personal asset owned by a user
 */
export interface Asset {
  /** Unique identifier for the asset */
  id: number;
  /** ID of the user who owns this asset */
  user_id: number;
  /** Description of the asset */
  description: string;
  /** Value of the asset */
  value: number;
  /** When the asset was created */
  created_at: string;
  /** When the asset was last updated */
  updated_at: string;
}

/**
 * Simplified asset information for display in lists
 */
export interface AssetSummary {
  /** Unique identifier for the asset */
  id: AssetId;
  /** Description of the asset */
  description: string;
  /** Monetary value of the asset */
  value: number;
}

/**
 * Request to create a new asset
 */
export interface CreateAssetRequest {
  /** ID of the user who owns this asset */
  userId: number;
  /** Description of the asset */
  description: string;
  /** Value of the asset */
  value: number;
} 