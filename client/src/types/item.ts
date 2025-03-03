/**
 * Item-related type definitions
 */
import { UserId, ItemId } from './branded';

/**
 * Statuses that an item can have
 */
export type ItemStatus = 'good' | 'bad' | 'login_required';

/**
 * Represents a Plaid item in the system
 * An item is a connection to a financial institution
 */
export interface ItemType {
  /** Unique identifier for the item */
  id: ItemId;
  /** Plaid's identifier for the item */
  plaid_item_id: string;
  /** User who owns the item */
  user_id: UserId;
  /** Access token for Plaid API */
  plaid_access_token: string;
  /** Institution identifier in Plaid */
  plaid_institution_id: string;
  /** Current status of the item */
  status: ItemStatus;
  /** Timestamp when the item was created */
  created_at: string;
  /** Timestamp when the item was last updated */
  updated_at: string;
}

/**
 * Simplified item type for list display
 */
export interface ItemSummary {
  /** Unique identifier for the item */
  id: ItemId;
  /** User who owns the item */
  user_id: UserId;
  /** Institution identifier in Plaid */
  institution_id: string;
  /** Institution name */
  institution_name: string;
  /** Current status of the item */
  status: ItemStatus;
  /** Number of accounts associated with this item */
  account_count: number;
}

/**
 * Represents a financial institution item linked through Plaid
 */
export interface Item {
  /** Unique identifier for the item */
  id: number;
  /** The associated Plaid institution ID */
  institution_id: string;
  /** The Plaid item ID */
  plaid_item_id: string;
  /** Current status of the item (good, login_required, etc.) */
  status: string;
  /** When the item was created */
  created_at: string;
  /** When the item was last updated */
  updated_at: string;
}

/**
 * Request to create a new item
 */
export interface CreateItemRequest {
  /** Public token received from Plaid Link */
  publicToken: string;
  /** ID of the institution */
  institutionId: string;
  /** ID of the user who owns this item */
  userId: number;
}

/**
 * Request to update an item's status
 */
export interface UpdateItemRequest {
  /** New status for the item */
  status: string;
}

/**
 * Request to reset an item's login in sandbox mode
 */
export interface ResetLoginRequest {
  /** ID of the item to reset */
  itemId: number;
} 