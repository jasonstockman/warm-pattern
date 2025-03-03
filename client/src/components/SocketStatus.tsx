import { useEffect, useState } from 'react';
import socketClient from '../lib/socketClient';

export default function SocketStatus() {
  const [status, setStatus] = useState('disconnected');
  const [socketId, setSocketId] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      const connected = socketClient.isConnected();
      setStatus(connected ? 'connected' : 'disconnected');
      setSocketId(socketClient.getId() || '');
    };
    
    const handleConnect = () => {
      updateStatus();
      setRetryCount(0);
    };
    
    const handleDisconnect = () => {
      updateStatus();
    };
    
    const handleReconnectAttempt = (attemptNumber: number) => {
      setRetryCount(attemptNumber);
    };
    
    // Initial status
    updateStatus();
    
    // Listen for connection events
    const removeConnectListener = socketClient.on('connect', handleConnect);
    const removeDisconnectListener = socketClient.on('disconnect', handleDisconnect);
    const removeReconnectListener = socketClient.on('reconnect_attempt', handleReconnectAttempt);
    
    return () => {
      removeConnectListener();
      removeDisconnectListener();
      removeReconnectListener();
    };
  }, []);

  return (
    <div className="p-2 text-sm bg-gray-100 rounded-md">
      <div>
        Socket status: <span className={status === 'connected' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{status}</span>
      </div>
      {socketId && <div className="text-xs text-gray-600">ID: {socketId}</div>}
      {retryCount > 0 && <div className="text-xs text-orange-500">Reconnect attempts: {retryCount}</div>}
    </div>
  );
} 