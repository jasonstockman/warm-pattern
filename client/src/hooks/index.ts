/**
 * Central export file for all custom hooks
 */

export { default as useBoolean } from './useBoolean';
export { default as useOnClickOutside } from './useOnClickOutside';
export { useAsync } from './useAsync';
export { useLocalStorage } from './useLocalStorage';

// Export types from hooks for better developer experience
export type { AsyncResult, AsyncStatus, UseAsyncOptions } from './useAsync';
export type { UseLocalStorageOptions, UseLocalStorageResult } from './useLocalStorage';
