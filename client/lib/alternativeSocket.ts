import { io } from 'socket.io-client';

// Create a direct socket connection without using a class wrapper
export const createDirectSocket = () => {
  const socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    forceNew: true,
    timeout: 10000
  });
  
  socket.on('connect', () => {
    console.log('Alternative socket connected:', socket.id);
  });
  
  socket.on('connect_error', (err) => {
    console.error('Alternative socket error:', err.message);
  });
  
  return socket;
};

export default createDirectSocket; 