import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import socketClient from '../lib/socketClient';

interface SocketContextType {
  isConnected: boolean;
  socketId: string | null;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socketId: null
});

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  
  // Use useCallback for event handlers to stabilize them
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setSocketId(socketClient.getId() || null);
  }, []);
  
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setSocketId(null);
  }, []);
  
  useEffect(() => {
    // Initialize connection status
    setIsConnected(socketClient.isConnected());
    setSocketId(socketClient.getId() || null);
    
    // Set up listeners
    const removeConnectListener = socketClient.on('connect', handleConnect);
    const removeDisconnectListener = socketClient.on('disconnect', handleDisconnect);
    
    return () => {
      removeConnectListener();
      removeDisconnectListener();
    };
  }, [handleConnect, handleDisconnect]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    isConnected, 
    socketId 
  }), [isConnected, socketId]);
  
  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 