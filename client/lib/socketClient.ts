import { io, Socket } from 'socket.io-client';

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  
  private constructor() {
    this.initSocket();
  }
  
  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }
  
  private initSocket() {
    // Connect to the main server
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    console.log(`Connecting to socket at ${SERVER_URL}`);
    
    try {
      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: false
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected!', this.socket?.id);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      
      // Reconnect listeners after reconnection
      this.socket.on('reconnect', () => {
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach(callback => {
            this.socket?.on(event, callback);
          });
        });
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }
  
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)?.push(callback);
    this.socket?.on(event, callback);
    
    return () => this.off(event, callback);
  }
  
  public off(event: string, callback: Function) {
    this.socket?.off(event, callback as any);
    
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.listeners.set(event, callbacks);
    }
  }
  
  public emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args);
  }
  
  public getSocket() {
    return this.socket;
  }
  
  public isConnected() {
    return this.socket?.connected || false;
  }
  
  public getId() {
    return this.socket?.id;
  }
}

export const socketClient = SocketClient.getInstance();
export default socketClient; 