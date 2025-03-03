/**
 * Custom hook for managing boolean state with convenience toggle functions
 */
import { useState, useCallback } from 'react';

/**
 * Result of the useBoolean hook
 */
export interface UseBooleanResult {
  /** Current boolean value */
  value: boolean;
  /** Function to set value to true */
  setTrue: () => void;
  /** Function to set value to false */
  setFalse: () => void;
  /** Function to toggle the value */
  toggle: () => void;
  /** Function to set an arbitrary value */
  setValue: (value: boolean) => void;
}

/**
 * Hook for managing boolean state with convenient toggle methods
 * 
 * @param initialValue - Initial boolean value (defaults to false)
 * @returns Object containing value and control functions
 */
export default function useBoolean(initialValue = false): UseBooleanResult {
  const [value, setValue] = useState<boolean>(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);

  return { value, setTrue, setFalse, toggle, setValue };
}
