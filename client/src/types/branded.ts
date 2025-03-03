/**
 * Branded types module that provides type safety for primitive types
 * that should not be accidentally mixed (like different types of IDs).
 */

/**
 * Branded type helper that creates a nominal type from a base type
 */
export type Brand<T, K extends string> = T & { readonly __brand: K };

/**
 * User ID type (branded number)
 */
export type UserId = Brand<number, 'UserId'>;

/**
 * Item ID type (branded number)
 */
export type ItemId = Brand<number, 'ItemId'>;

/**
 * Account ID type (branded number)
 */
export type AccountId = Brand<number, 'AccountId'>;

/**
 * Transaction ID type (branded number)
 */
export type TransactionId = Brand<number, 'TransactionId'>;

/**
 * Asset ID type (branded number)
 */
export type AssetId = Brand<number, 'AssetId'>;

/**
 * Type guard for UserId
 */
export function isUserId(id: number): id is UserId {
  return typeof id === 'number';
}

/**
 * Type guard for ItemId
 */
export function isItemId(id: number): id is ItemId {
  return typeof id === 'number';
}

/**
 * Type guard for AccountId
 */
export function isAccountId(id: number): id is AccountId {
  return typeof id === 'number';
}

/**
 * Type guard for TransactionId
 */
export function isTransactionId(id: number): id is TransactionId {
  return typeof id === 'number';
}

/**
 * Type guard for AssetId
 */
export function isAssetId(id: number): id is AssetId {
  return typeof id === 'number';
}

/**
 * Factory functions to create branded types from raw values
 */
export const createId = {
  /**
   * Creates a branded UserId from a number
   */
  user: (id: number): UserId => id as UserId,
  
  /**
   * Creates a branded ItemId from a number
   */
  item: (id: number): ItemId => id as ItemId,
  
  /**
   * Creates a branded AccountId from a number
   */
  account: (id: number): AccountId => id as AccountId,
  
  /**
   * Creates a branded TransactionId from a number
   */
  transaction: (id: number): TransactionId => id as TransactionId,
  
  /**
   * Creates a branded AssetId from a number
   */
  asset: (id: number): AssetId => id as AssetId,
}; 