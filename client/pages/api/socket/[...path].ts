import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This API route handles Socket.IO handshake requests
  // Since we're connecting directly to the backend, this only serves as a fallback
  
  const { method, url } = req;
  
  console.log(`Socket.IO API route called: ${method} ${url}`);
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (url?.includes('/socket.io/')) {
    // For debugging purposes, log the handshake attempt
    console.log('Socket.IO handshake attempt received through Next.js API route');
    
    // Respond with a message indicating the client should connect directly to the backend
    res.status(200).json({
      message: 'Socket.IO connection should be made directly to the backend server',
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    });
    return;
  }
  
  res.status(404).json({ error: 'Not found' });
} 