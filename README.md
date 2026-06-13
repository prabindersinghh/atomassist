# AtomAssist - Real-Time Video Support Platform

## Overview

AtomAssist is an enterprise-grade real-time video support platform that enables seamless communication between support agents and customers. Built with modern technologies, it provides a complete solution for video conferencing, session recording, real-time chat, and comprehensive analytics.

**Tagline:** Visual Support. Instant Resolution.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## Features

### Core Features
- ✅ **Real-Time Video & Audio** - High-quality peer-to-peer communication
- ✅ **Session Management** - Create, manage, and track support sessions
- ✅ **Secure Invite System** - Generate time-limited invite tokens
- ✅ **Live Chat** - Real-time messaging with read receipts and typing indicators
- ✅ **Session Recording** - Automatic recording and playback
- ✅ **File Sharing** - Share images, PDFs, and documents
- ✅ **Role-Based Access Control** - Agent, customer, and admin roles
- ✅ **Session History** - Complete audit trail of all interactions

### Advanced Features
- 🚀 **AI Session Summary** - Auto-generated summaries after calls end
- 🚀 **Agent Private Notes** - Internal notes attached to sessions
- 🚀 **Session Tags** - Categorize sessions (Installation, Warranty, Repair, etc.)
- 🚀 **Timeline View** - Beautiful chronological timeline of events
- 🚀 **Device Diagnostics** - Browser, OS, network, camera, microphone info
- 🚀 **Admin Dashboard** - Monitor live sessions, metrics, and analytics
- 🚀 **Analytics Center** - Charts and statistics for performance tracking
- 🚀 **Reconnect Recovery** - 60-second grace period for automatic rejoin

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast bundling
- TailwindCSS for styling
- shadcn/ui component library
- Framer Motion for animations
- React Query for data fetching
- Zustand for state management
- React Router for navigation
- LiveKit React Components for video
- Socket.IO Client for real-time updates
- Recharts for analytics visualization

### Backend
- Node.js with Express
- TypeScript for type safety
- Socket.IO for real-time communication
- LiveKit Server SDK for video infrastructure
- Supabase PostgreSQL for data persistence
- JWT for authentication
- Bcrypt for password hashing

### Infrastructure
- Docker & Docker Compose for containerization
- PostgreSQL for database
- LiveKit for video/audio media servers
- Nginx for reverse proxy and static file serving

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

### Local Development

1. **Clone and Navigate**
   ```bash
   cd atomassist
   ```

2. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize Database**
   ```bash
   docker-compose exec postgres psql -U postgres -d atomassist -f /docker-entrypoint-initdb.d/init.sql
   ```

5. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

6. **Run Development**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

7. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - LiveKit: ws://localhost:7880

### Demo Credentials

**Agent Account:**
- Email: agent@atomberg.com
- Password: agent123

**Customer Account:**
- Email: customer@atomberg.com
- Password: customer123

**Admin Account:**
- Email: admin@atomberg.com
- Password: admin123

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - Login/Signup pages                                       │
│  - Agent Dashboard                                          │
│  - Session Room (Video + Chat)                              │
│  - Admin Dashboard                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    HTTP/REST      WebSocket    Socket.IO
        │             │             │
┌───────▼─────┐ ┌────▼────┐ ┌──────▼───────┐
│   Nginx     │ │LiveKit  │ │Backend API   │
│   Proxy     │ │ Server  │ │ (Express)    │
└───────┬─────┘ └────┬────┘ └──────┬───────┘
        │            │            │
        └────────────┼────────────┘
                     │
            ┌────────▼────────┐
            │   PostgreSQL    │
            │   Database      │
            └─────────────────┘
```

### Database Schema

**Core Tables:**
- `users` - User accounts with roles
- `sessions` - Support sessions
- `participants` - Session participants
- `messages` - Chat messages
- `files` - Shared files
- `recordings` - Session recordings
- `session_notes` - Agent notes
- `session_tags` - Session categorization
- `invite_tokens` - Secure invite links
- `audit_logs` - Action history
- `analytics_events` - Usage analytics

## API Documentation

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: 201 Created
{
  "user": { "id", "email", "name", "role" },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { "id", "email", "name", "role" },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### Session Endpoints

#### Create Session (Agent Only)
```
POST /api/sessions
Authorization: Bearer {token}

Response: 201 Created
{
  "session": { "id", "agent_id", "status", ... },
  "inviteToken": "ABCD1234",
  "inviteUrl": "https://atomassist.com/join?code=ABCD1234"
}
```

#### Join Session (Customer)
```
POST /api/sessions/join/{inviteToken}
Authorization: Bearer {token}

Response: 200 OK
{
  "session": { ... },
  "participant": { ... },
  "liveKitToken": "livekit_jwt",
  "liveKitUrl": "ws://livekit:7880"
}
```

#### Start Session (Agent)
```
POST /api/sessions/{sessionId}/start
Authorization: Bearer {token}

Response: 200 OK
{
  "session": { "id", "status": "active", ... },
  "liveKitToken": "livekit_jwt",
  "liveKitUrl": "ws://livekit:7880"
}
```

#### End Session (Agent/Admin)
```
POST /api/sessions/{sessionId}/end
Authorization: Bearer {token}

Response: 200 OK
{
  "session": { "id", "status": "ended", "end_time": ... }
}
```

### Chat Endpoints

#### Send Message
```
POST /api/chat/{sessionId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello, how can I help?"
}

Response: 201 Created
{
  "id": "msg_123",
  "sessionId": "sess_123",
  "userId": "user_123",
  "content": "Hello, how can I help?",
  "type": "text",
  "createdAt": "2026-06-13T22:00:00Z"
}
```

#### Get Messages
```
GET /api/chat/{sessionId}
Authorization: Bearer {token}

Response: 200 OK
[
  { "id", "content", "userId", "createdAt", ... },
  ...
]
```

#### Upload File
```
POST /api/chat/{sessionId}/files
Authorization: Bearer {token}
Content-Type: multipart/form-data

Response: 201 Created
{
  "file": { "id", "filename", "size", "type", "url", ... },
  "message": { "id", "content", "type": "file", ... }
}
```

### Real-Time Socket Events

#### Emitting
- `join-session` - Join a session
- `leave-session` - Leave a session
- `message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `recording-started` - Recording started
- `recording-stopped` - Recording stopped
- `connection-quality` - Report connection quality

#### Receiving
- `user-joined` - User joined session
- `user-left` - User left session
- `message` - New message received
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing
- `recording-started` - Recording started
- `recording-stopped` - Recording stopped
- `connection-quality` - Connection quality update

## Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   JWT_SECRET=<generate-strong-secret>
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_KEY=<your-service-key>
   LIVEKIT_URL=wss://<livekit-domain>
   LIVEKIT_API_KEY=<api-key>
   LIVEKIT_API_SECRET=<api-secret>
   ```

2. **Build & Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Database Migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

4. **SSL/TLS Configuration**
   - Configure Nginx with valid SSL certificates
   - Update LiveKit configuration for secure WebSocket (wss://)

## Performance Optimization

- **Frontend**: Lazy loading, code splitting, image optimization
- **Backend**: Connection pooling, request caching, rate limiting
- **Video**: Adaptive bitrate, simulcast, participant limits
- **Database**: Indexing on frequently queried fields, RLS policies

## Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Row-level security (RLS) on database
- Invite token expiration
- Password hashing with bcrypt
- CORS protection
- Input sanitization and validation
- Audit logging for all actions

## Monitoring & Analytics

- Real-time session metrics
- Call quality indicators
- Connection quality monitoring
- Recording status tracking
- Error rate tracking
- System health monitoring

## Support

For issues, questions, or suggestions, please contact the AtomAssist team.

## License

Proprietary - AtomBerg Technologies
