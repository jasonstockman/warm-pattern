import { useEffect, useState } from 'react';
import DirectSocketTester from '../components/DirectSocketTester';
import SocketTester from '../components/SocketTester';
import socketClient from '../lib/socketClient';

export default function SocketTestPage() {
  const [events, setEvents] = useState<{type: string, data: any}[]>([]);
  
  useEffect(() => {
    // Listen for any events from the server
    const addEvent = (type: string, data: any) => {
      setEvents(prev => [...prev, { type, data, timestamp: new Date().toISOString() }].slice(-10));
    };
    
    // Set up listeners for common events
    const listenToEvent = (eventName: string) => {
      return socketClient.on(eventName, (data: any) => {
        console.log(`Received ${eventName}:`, data);
        addEvent(eventName, data);
      });
    };
    
    const removeListeners = [
      listenToEvent('server_heartbeat'),
      listenToEvent('test_response')
    ];
    
    // Send a test message when component mounts
    setTimeout(() => {
      socketClient.emit('test_message', { 
        source: 'socket-test page',
        timestamp: new Date().toISOString()
      });
    }, 1000);
    
    return () => {
      // Clean up all listeners
      removeListeners.forEach(removeListener => removeListener());
    };
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Socket.IO Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DirectSocketTester />
        </div>
        
        <div>
          <SocketTester />
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Received Events</h2>
        
        {events.length === 0 ? (
          <p className="text-gray-500">No events received yet...</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event, i) => (
              <li key={i} className="p-2 bg-gray-50 rounded text-sm">
                <div className="font-semibold">{event.type}</div>
                <div className="text-xs text-gray-500">{event.timestamp}</div>
                <pre className="mt-1 whitespace-pre-wrap text-xs bg-gray-100 p-1 rounded">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 