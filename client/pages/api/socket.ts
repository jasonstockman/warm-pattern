import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle socket.io handshake requests
  if (req.method === 'GET' && req.url?.includes('/socket.io/')) {
    res.status(200).end();
    return;
  }
  
  res.status(404).end();
} 