/**
 * Error handling utilities
 * 
 * Provides helper functions for safely handling errors and null/undefined values
 */

/**
 * Safely gets a property from an object handling null/undefined
 * 
 * @param obj The object to retrieve a property from
 * @param key The property key
 * @param defaultValue The default value to return if property is undefined
 * @returns The property value or default value
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K] | null = null
): T[K] | null {
  if (obj == null) {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
}

/**
 * Safely convert an error to a string message
 * 
 * @param error The error object
 * @returns A string representation of the error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Try to extract message or error properties if they exist
    const errorObj = error as Record<string, any>;
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if (errorObj.error && typeof errorObj.error === 'string') {
      return errorObj.error;
    }
    
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Safe error handler for async operations
 * 
 * @param promise Promise to handle
 * @returns Tuple of [data, error]
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(getErrorMessage(error))];
  }
}

/**
 * Type guard to check if an error object has a specific code property
 * 
 * @param error The error object to check
 * @param code The code to check for
 * @returns Whether the error has the specified code
 */
export function hasErrorCode(
  error: unknown,
  code: string
): error is { code: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as any).code === code
  );
}

/**
 * Check if a value is defined (not null or undefined)
 * 
 * @param value The value to check
 * @returns Whether the value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Protect a function call against errors, wrapping it in a try/catch block
 * 
 * @param fn The function to protect
 * @param fallback Fallback value or function to call on error
 * @returns The result of the function or fallback
 */
export function protectCall<T>(
  fn: () => T,
  fallback: T | (() => T)
): T {
  try {
    return fn();
  } catch (error) {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
} 