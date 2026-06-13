import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/auth.js';
import { verifyToken } from './utils/jwt.js';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const user = verifyToken(token);
    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO events
io.on('connection', (socket) => {
  const userId = socket.data.user.sub;
  console.log(`User ${userId} connected:`, socket.id);

  // Join session room
  socket.on('join-session', (sessionId: string) => {
    socket.join(`session:${sessionId}`);
    io.to(`session:${sessionId}`).emit('user-joined', {
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave session room
  socket.on('leave-session', (sessionId: string) => {
    socket.leave(`session:${sessionId}`);
    io.to(`session:${sessionId}`).emit('user-left', {
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat message
  socket.on('message', (data) => {
    io.to(`session:${data.sessionId}`).emit('message', {
      id: crypto.randomUUID(),
      userId,
      content: data.content,
      timestamp: new Date().toISOString(),
    });
  });

  // Typing indicator
  socket.on('typing', (sessionId: string) => {
    socket.to(`session:${sessionId}`).emit('user-typing', {
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Stop typing
  socket.on('stop-typing', (sessionId: string) => {
    socket.to(`session:${sessionId}`).emit('user-stopped-typing', {
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Recording events
  socket.on('recording-started', (sessionId: string) => {
    io.to(`session:${sessionId}`).emit('recording-started', {
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('recording-stopped', (sessionId: string) => {
    io.to(`session:${sessionId}`).emit('recording-stopped', {
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Connection quality
  socket.on('connection-quality', (data) => {
    io.to(`session:${data.sessionId}`).emit('connection-quality', {
      userId,
      quality: data.quality,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

// Error handling
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
