import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function DirectSocketTester() {
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [heartbeats, setHeartbeats] = useState<string[]>([]);
  
  useEffect(() => {
    // Try a direct connection
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true
    });
    
    socket.on('connect', () => {
      console.log('Direct socket connected with ID:', socket.id);
      setStatus('connected');
      setSocketId(socket.id || null);
      setError(null);
      
      // Test sending a message
      socket.emit('test_message', { 
        client: 'DirectSocketTester',
        timestamp: new Date().toISOString() 
      });
    });
    
    socket.on('connect_error', (err) => {
      console.error('Direct socket connect error:', err);
      setStatus('error');
      setError(err.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Direct socket disconnected:', reason);
      setStatus('disconnected');
      setSocketId(null);
    });
    
    // Listen for heartbeats
    socket.on('server_heartbeat', (data) => {
      console.log('Received heartbeat:', data);
      setHeartbeats(prev => [...prev.slice(-4), data.timestamp]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-md">
      <h3 className="font-bold">Direct Socket Connection Test</h3>
      <div className="mt-2">
        <p>Status: <span className={
          status === 'connected' ? 'text-green-600 font-bold' : 
          status === 'error' ? 'text-red-600 font-bold' : 'text-gray-600'
        }>{status}</span></p>
        {socketId && <p className="text-sm">Socket ID: {socketId}</p>}
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 text-sm rounded">
            Error: {error}
          </div>
        )}
        
        {heartbeats.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold">Recent Heartbeats:</h4>
            <ul className="text-xs">
              {heartbeats.map((beat, i) => (
                <li key={i} className="text-green-700">{beat}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 