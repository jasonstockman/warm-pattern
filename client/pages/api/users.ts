import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory storage for demo purposes
let users: any[] = [
  { id: 1, username: 'demo-user', created_at: new Date().toISOString() }
];
let nextId = 2;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const newUser = {
      id: nextId++,
      username,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    return res.status(201).json(newUser);
  } else if (req.method === 'GET') {
    return res.status(200).json(users);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
} 