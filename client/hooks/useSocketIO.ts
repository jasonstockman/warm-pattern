import { useEffect, useRef, useState } from 'react';
import socketClient from '../lib/socketClient';

export function useSocketIO<T>(event: string, initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isListening, setIsListening] = useState(false);
  const callbackRef = useRef<Function | null>(null);
  
  useEffect(() => {
    // Create the callback function
    callbackRef.current = (newData: T) => {
      console.log(`Socket event received: ${event}`, newData);
      setData(newData);
    };
    
    // Start listening for the event
    const removeListener = socketClient.on(event, callbackRef.current);
    setIsListening(true);
    
    return () => {
      // Clean up the listener when the component unmounts
      removeListener();
      setIsListening(false);
    };
  }, [event]);
  
  // Function to emit an event to the server
  const emit = (emitEvent: string, ...args: any[]) => {
    socketClient.emit(emitEvent, ...args);
  };
  
  return { data, isListening, emit };
} 