/**
 * Account-related type definitions
 */
import { AccountId, UserId, ItemId } from './branded';

/**
 * Account types
 */
export type AccountType = 'depository' | 'credit' | 'loan' | 'investment' | 'other';

/**
 * Account subtypes
 */
export type AccountSubtype = 
  | 'checking' 
  | 'savings' 
  | 'credit card' 
  | 'mortgage' 
  | 'student' 
  | 'auto' 
  | 'brokerage' 
  | 'ira' 
  | '401k' 
  | 'cash management' 
  | 'money market' 
  | 'paypal' 
  | 'prepaid' 
  | 'certificates of deposit' 
  | 'other';

/**
 * Represents a financial account from Plaid
 */
export interface Account {
  /** Unique identifier for the account */
  id: AccountId;
  /** ID of the item this account belongs to */
  item_id: ItemId;
  /** ID of the user who owns this account */
  user_id: UserId;
  /** Plaid's identifier for the account */
  plaid_account_id: string;
  /** Account name as provided by the institution */
  name: string;
  /** Last 4 digits of the account number */
  mask: string;
  /** Official name of the account as given by the institution */
  official_name: string;
  /** Current balance of the account */
  current_balance: number;
  /** Available balance (current balance less pending transactions) */
  available_balance: number;
  /** ISO currency code */
  iso_currency_code: string;
  /** Currency code when ISO code is not available */
  unofficial_currency_code: string;
  /** Type of account */
  type: AccountType;
  /** Subtype of account */
  subtype: AccountSubtype;
  /** Timestamp when the account was created */
  created_at: string;
  /** Timestamp when the account was last updated */
  updated_at: string;
}

/**
 * Simplified account information for display in lists
 */
export interface AccountSummary {
  /** Unique identifier for the account */
  id: AccountId;
  /** Account name */
  name: string;
  /** Last 4 digits of account number */
  mask: string;
  /** Current balance */
  balance: number;
  /** Type of account */
  type: AccountType;
  /** Subtype of account */
  subtype: AccountSubtype;
  /** ISO currency code */
  currency: string;
}

/**
 * Represents a financial account from a linked institution
 */
export interface Account {
  /** Unique identifier for the account */
  id: number;
  /** The item this account belongs to */
  item_id: number;
  /** Name of the account */
  name: string;
  /** Last 4 digits of the account number */
  mask: string;
  /** Type of account (depository, credit, loan, etc.) */
  type: AccountType;
  /** Subtype of account (checking, savings, credit card, etc.) */
  subtype: AccountSubtype;
  /** Current balance of the account */
  current_balance: number;
  /** Available balance of the account */
  available_balance: number;
}

/**
 * Represents a financial transaction
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: number;
  /** The account this transaction belongs to */
  account_id: number;
  /** Name or description of the transaction */
  name: string;
  /** Amount of the transaction */
  amount: number;
  /** Date of the transaction */
  date: string;
  /** Whether the transaction is pending */
  pending: boolean;
  /** Categories for the transaction */
  category: string[];
} 