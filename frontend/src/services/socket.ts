import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.js';

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (socket) return socket;

  const token = useAuthStore.getState().token;
  const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

  socket = io(socketURL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const socketAPI = {
  joinSession: (sessionId: string) => {
    const s = getSocket();
    s.emit('join-session', sessionId);
  },

  leaveSession: (sessionId: string) => {
    const s = getSocket();
    s.emit('leave-session', sessionId);
  },

  sendMessage: (sessionId: string, content: string) => {
    const s = getSocket();
    s.emit('message', { sessionId, content });
  },

  typing: (sessionId: string) => {
    const s = getSocket();
    s.emit('typing', sessionId);
  },

  stopTyping: (sessionId: string) => {
    const s = getSocket();
    s.emit('stop-typing', sessionId);
  },

  recordingStarted: (sessionId: string) => {
    const s = getSocket();
    s.emit('recording-started', sessionId);
  },

  recordingStopped: (sessionId: string) => {
    const s = getSocket();
    s.emit('recording-stopped', sessionId);
  },

  connectionQuality: (sessionId: string, quality: 'good' | 'fair' | 'poor') => {
    const s = getSocket();
    s.emit('connection-quality', { sessionId, quality });
  },

  onMessage: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('message', callback);
  },

  onUserJoined: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('user-joined', callback);
  },

  onUserLeft: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('user-left', callback);
  },

  onUserTyping: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('user-typing', callback);
  },

  onUserStoppedTyping: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('user-stopped-typing', callback);
  },

  onRecordingStarted: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('recording-started', callback);
  },

  onRecordingStopped: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('recording-stopped', callback);
  },

  onConnectionQuality: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('connection-quality', callback);
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};
