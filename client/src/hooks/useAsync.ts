/**
 * Custom hook for handling asynchronous operations with loading and error states
 */
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Status of an async operation
 */
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Result of the useAsync hook
 */
export interface AsyncResult<T, E = Error> {
  /** Current execution status */
  status: AsyncStatus;
  /** Result data (if successful) */
  data: T | null;
  /** Error information (if failed) */
  error: E | null;
  /** Whether the operation is currently running */
  isLoading: boolean;
  /** Whether the operation completed successfully */
  isSuccess: boolean;
  /** Whether the operation failed */
  isError: boolean;
  /** Executes the async function */
  run: (...args: any[]) => Promise<T>;
  /** Resets the state back to idle */
  reset: () => void;
}

/**
 * Options for the useAsync hook
 */
export interface UseAsyncOptions<T> {
  /** Whether to execute the function immediately */
  immediate?: boolean;
  /** Initial data value */
  initialData?: T | null;
  /** Callback when operation succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when operation fails */
  onError?: (error: any) => void;
  /** Whether to preserve previous data when loading */
  preserveData?: boolean;
}

/**
 * Hook for handling asynchronous operations with loading and error states
 * 
 * @param asyncFunction - The async function to execute
 * @param options - Configuration options
 * @returns Object containing state and control functions
 */
export function useAsync<T, E = Error>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): AsyncResult<T, E> {
  const {
    immediate = false,
    initialData = null,
    onSuccess,
    onError,
    preserveData = false,
  } = options;

  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<E | null>(null);
  
  // Use a ref to track the mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Store the function in a ref to avoid triggering effects when it changes
  const asyncFunctionRef = useRef(asyncFunction);
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  // Reset state back to initial
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setStatus('idle');
      setData(initialData);
      setError(null);
    }
  }, [initialData]);

  // Execute the async function
  const run = useCallback(
    async (...args: any[]): Promise<T> => {
      if (isMountedRef.current) {
        setStatus('pending');
        if (!preserveData) {
          setData(null);
        }
        setError(null);
      }

      try {
        const result = await asyncFunctionRef.current(...args);
        
        if (isMountedRef.current) {
          setStatus('success');
          setData(result);
          onSuccess?.(result);
        }
        
        return result;
      } catch (err) {
        const typedError = err as E;
        
        if (isMountedRef.current) {
          setStatus('error');
          setError(typedError);
          onError?.(typedError);
        }
        
        throw typedError;
      }
    },
    [onSuccess, onError, preserveData]
  );

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      run();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [immediate, run]);

  return {
    status,
    data,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    run,
    reset,
  };
} 