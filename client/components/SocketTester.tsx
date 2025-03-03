import { useState } from 'react';
import socketClient from '../lib/socketClient';

export default function SocketTester() {
  const [responses, setResponses] = useState<string[]>([]);

  const testConnection = () => {
    // Add listener for response
    const removeListener = socketClient.on('test_response', (data) => {
      setResponses(prev => [...prev, JSON.stringify(data)]);
    });

    // Send test message
    socketClient.emit('test_message', { 
      message: 'Hello server', 
      timestamp: new Date().toISOString() 
    });

    // Remove listener after 5 seconds
    setTimeout(() => {
      removeListener();
    }, 5000);
  };

  return (
    <div className="mt-4 p-4 border rounded">
      <h3 className="font-bold mb-2">Socket Tester</h3>
      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Send Test Message
      </button>
      
      {responses.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Responses:</h4>
          <ul className="mt-2 text-sm">
            {responses.map((res, i) => (
              <li key={i} className="border-b py-1">{res}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 