import React, { createContext, useContext, useEffect, useState } from 'react';
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
  
  useEffect(() => {
    // Initialize connection status
    setIsConnected(socketClient.isConnected());
    setSocketId(socketClient.getId() || null);
    
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socketClient.getId());
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };
    
    // Set up listeners
    const removeConnectListener = socketClient.on('connect', handleConnect);
    const removeDisconnectListener = socketClient.on('disconnect', handleDisconnect);
    
    return () => {
      removeConnectListener();
      removeDisconnectListener();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={{ isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 