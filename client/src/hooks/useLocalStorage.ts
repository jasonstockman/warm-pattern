/**
 * Custom hook for persisting state in localStorage with automatic serialization/deserialization
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Options for the useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  /** Key to use in localStorage */
  key: string;
  /** Initial value if not found in localStorage */
  initialValue: T;
  /** Parser function to use instead of JSON.parse */
  parser?: (value: string) => T;
  /** Serializer function to use instead of JSON.stringify */
  serializer?: (value: T) => string;
}

/**
 * Result of the useLocalStorage hook
 */
export interface UseLocalStorageResult<T> {
  /** Current value */
  value: T;
  /** Function to update the value */
  setValue: (value: T | ((val: T) => T)) => void;
  /** Function to remove the value from localStorage */
  removeValue: () => void;
  /** Error that occurred during operations (if any) */
  error: Error | null;
}

/**
 * Hook for persisting state in localStorage with type safety
 * 
 * @param options - Configuration options
 * @returns Object containing state and control functions
 */
export function useLocalStorage<T>({
  key,
  initialValue,
  parser = JSON.parse,
  serializer = JSON.stringify,
}: UseLocalStorageOptions<T>): UseLocalStorageResult<T> {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? parser(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Error state
  const [error, setError] = useState<Error | null>(null);
  
  // Keep track of the key to react to changes
  const prevKeyRef = useRef<string>(key);
  
  // Update local storage when the state changes
  useEffect(() => {
    try {
      // Detect key changes
      if (prevKeyRef.current !== key) {
        // Remove the old key if it changed
        window.localStorage.removeItem(prevKeyRef.current);
        prevKeyRef.current = key;
      }
      
      // Save state to localStorage
      window.localStorage.setItem(key, serializer(storedValue));
      setError(null);
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [key, storedValue, serializer]);
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      setStoredValue(prev => {
        const newValue = value instanceof Function ? value(prev) : value;
        return newValue;
      });
      setError(null);
    } catch (error) {
      console.error(`Error updating localStorage key "${key}":`, error);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [key]);
  
  // Function to remove the value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      setError(null);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [key, initialValue]);
  
  return { value: storedValue, setValue, removeValue, error };
} 