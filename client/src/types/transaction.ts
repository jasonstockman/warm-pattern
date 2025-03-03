/**
 * Transaction-related type definitions
 */
import { TransactionId, AccountId, ItemId, UserId } from './branded';

/**
 * Represents a financial transaction from Plaid
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: TransactionId;
  /** ID of the account this transaction belongs to */
  account_id: AccountId;
  /** ID of the item this transaction belongs to */
  item_id: ItemId;
  /** ID of the user who owns this transaction */
  user_id: UserId;
  /** Plaid's identifier for the transaction */
  plaid_transaction_id: string;
  /** Plaid's category ID for the transaction */
  plaid_category_id: string;
  /** Human-readable category for the transaction */
  category: string;
  /** Transaction type */
  type: string;
  /** Name or description of the transaction */
  name: string;
  /** Amount of the transaction (positive for deposits, negative for debits) */
  amount: number;
  /** ISO currency code */
  iso_currency_code: string;
  /** Currency code when ISO code is not available */
  unofficial_currency_code: string;
  /** Date of the transaction (YYYY-MM-DD) */
  date: string;
  /** Whether the transaction is pending */
  pending: boolean;
  /** Account owner of the transaction */
  account_owner: string;
  /** Timestamp when the transaction was created */
  created_at: string;
  /** Timestamp when the transaction was last updated */
  updated_at: string;
}

/**
 * Simplified transaction information for display in lists
 */
export interface TransactionSummary {
  /** Unique identifier for the transaction */
  id: TransactionId;
  /** Name or description of the transaction */
  name: string;
  /** Amount of the transaction */
  amount: number;
  /** Date of the transaction */
  date: string;
  /** Category of the transaction */
  category: string;
  /** Whether the transaction is pending */
  pending: boolean;
}

/**
 * Type for transaction filters
 */
export interface TransactionFilters {
  /** Start date for filtering transactions */
  startDate?: string;
  /** End date for filtering transactions */
  endDate?: string;
  /** Minimum amount for filtering transactions */
  minAmount?: number;
  /** Maximum amount for filtering transactions */
  maxAmount?: number;
  /** Category for filtering transactions */
  category?: string;
  /** Whether to include pending transactions */
  includePending?: boolean;
} 