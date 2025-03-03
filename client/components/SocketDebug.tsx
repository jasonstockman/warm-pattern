import { useEffect, useState } from 'react';
import socketClient from '../lib/socketClient';

export default function SocketDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    const addLog = (message: string) => {
      setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };

    const onConnect = () => {
      setStatus('connected');
      addLog(`Connected with socket ID: ${socketClient.getId()}`);
    };

    const onConnectError = (error: Error) => {
      setStatus('error');
      addLog(`Connection error: ${error.message}`);
    };

    const onDisconnect = (reason: string) => {
      setStatus('disconnected');
      addLog(`Disconnected: ${reason}`);
    };

    // Add listeners
    socketClient.on('connect', onConnect);
    socketClient.on('connect_error', onConnectError);
    socketClient.on('disconnect', onDisconnect);

    // Initial log
    addLog('Setting up socket connection...');

    return () => {
      socketClient.off('connect', onConnect);
      socketClient.off('connect_error', onConnectError);
      socketClient.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-white border rounded shadow-lg w-96 max-h-80 overflow-auto">
      <h3 className="font-bold mb-2">Socket Status: <span className={
        status === 'connected' ? 'text-green-600' : 
        status === 'error' ? 'text-red-600' : 'text-gray-600'
      }>{status}</span></h3>
      
      <div className="text-xs">
        <p className="font-bold">Debug Logs:</p>
        {logs.map((log, i) => (
          <div key={i} className="py-1 border-b border-gray-200">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
} 