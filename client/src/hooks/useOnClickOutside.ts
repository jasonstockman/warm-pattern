/**
 * Custom hook that detects clicks outside of a specified element
 * Useful for closing modals, dropdowns, etc. when clicking outside
 */
import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Props for the useOnClickOutside hook
 */
interface UseOnClickOutsideProps {
  /** Callback function to execute when a click outside is detected */
  callback: () => void;
  /** Ref to an element that should be ignored (clicks on this element won't trigger the callback) */
  ignoreRef: React.RefObject<HTMLElement>;
  /** Whether the listener should be active (default: true) */
  isActive?: boolean;
}

/**
 * Creates a ref and attaches click/touch listeners to detect clicks outside of the referenced element
 * 
 * @param props - Configuration for the outside click detection
 * @returns A ref to attach to the element you want to detect clicks outside of
 */
export default function useOnClickOutside<T extends HTMLElement = HTMLDivElement>(
  props: UseOnClickOutsideProps
): React.RefObject<T> {
  const { callback, ignoreRef, isActive = true } = props;
  const ref = useRef<T>(null);
  
  // Memoize the listener function to prevent it being recreated on every render
  const listener = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Do nothing if the hook is not active
      if (!isActive) return;

      // Get the DOM nodes
      const targetNode = event.target as Node;
      const refNode = ref.current;
      const ignoreNode = ignoreRef.current;
      
      // If click is on the ref element itself, do nothing
      if (!refNode || refNode.contains(targetNode)) {
        return;
      }

      // If click is on the ignored element, do nothing
      if (ignoreNode && ignoreNode.contains(targetNode)) {
        return;
      }

      // Otherwise, execute the callback
      callback();
    },
    [callback, ignoreRef, isActive]
  );

  useEffect(() => {
    // Only attach listeners if the hook is active
    if (!isActive) return;
    
    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [listener, isActive]); // Re-run effect if listener or isActive changes

  return ref;
}
