# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript                                           │
│  - Authentication Pages                                          │
│  - Agent Dashboard                                               │
│  - Session Room Component                                        │
│  - Admin Dashboard                                               │
│  - Analytics Dashboard                                           │
│  - Real-time Updates via Socket.IO                               │
│  - LiveKit Video Components                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
  HTTP/REST    WebSocket         RTC Media
     │               │               │
┌────▼──────────────▼──────────────▼────┐
│         NGINX REVERSE PROXY             │
│  - Route API requests to backend        │
│  - Serve static frontend files          │
│  - Handle WebSocket upgrade             │
│  - SSL/TLS termination                  │
└─────┬────────────────────────────┬──────┘
      │                            │
      │                            │
┌─────▼─────────────────────────────▼────┐
│        APPLICATION LAYER                 │
├──────────────────────────────────────────┤
│  Express.js + Node.js                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      REST API Routes                │ │
│  │  - Authentication                   │ │
│  │  - Sessions                         │ │
│  │  - Chat                             │ │
│  │  - Files                            │ │
│  │  - Admin operations                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Socket.IO Server                 │ │
│  │  - Real-time messaging              │ │
│  │  - Connection quality updates       │ │
│  │  - Typing indicators                │ │
│  │  - Recording status                 │ │
│  │  - User presence                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Service Layer                    │ │
│  │  - UserService                      │ │
│  │  - SessionService                   │ │
│  │  - ChatService                      │ │
│  │  - RecordingService                 │ │
│  │  - AnalyticsService                 │ │
│  └────────────────────────────────────┘ │
└────┬───────────────────────┬────────────┘
     │                       │
     │                   ┌───▼────────┐
     │                   │   File     │
     │                   │  Storage   │
     │                   │  (S3/CDN)  │
     │                   └────────────┘
     │
┌────▼──────────────────────────────────┐
│     DATA & MEDIA LAYER                 │
├────────────────────────────────────────┤
│                                        │
│  ┌────────────────────────────────┐   │
│  │     PostgreSQL Database        │   │
│  │  - Users & Roles              │   │
│  │  - Sessions & Participants     │   │
│  │  - Messages & Files           │   │
│  │  - Recordings                 │   │
│  │  - Analytics Events           │   │
│  │  - Audit Logs                 │   │
│  │  - RLS Policies               │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │     LiveKit Server             │   │
│  │  - Media Server                │   │
│  │  - Egress (Recording)          │   │
│  │  - Connection Management       │   │
│  │  - RTC Infrastructure          │   │
│  └────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

## Data Flow Diagrams

### Session Creation Flow

```
Agent              Frontend           Backend            Database
  │                   │                  │                  │
  │ Create Session    │                  │                  │
  ├──────────────────>│                  │                  │
  │                   │ POST /sessions   │                  │
  │                   ├─────────────────>│                  │
  │                   │                  │ INSERT session   │
  │                   │                  ├─────────────────>│
  │                   │                  │                  │ Session created
  │                   │                  │<─────────────────┤
  │                   │<─────────────────┤                  │
  │<──────────────────┤ { sessionId,     │                  │
  │ Session & Invite  │   inviteToken }  │                  │
  │
  │ Share Invite Code
  │ (Out of band)
  │
  ├──────────────────────────────────────>
         Customer joins with code
```

### Video Call Establishment Flow

```
Customer          Frontend         Backend      LiveKit      Database
  │                  │                │            │             │
  │ Join Session     │                │            │             │
  ├─────────────────>│ POST /join     │            │             │
  │                  ├───────────────>│            │             │
  │                  │                │ Validate  │             │
  │                  │                │ token &   │             │
  │                  │                │ insert    │             │
  │                  │                │ participant──────────────>│
  │                  │<────────────────┤ LiveKit   │             │
  │                  │ { liveKitToken} │ token     │             │
  │<─────────────────┤                │            │             │
  │ Connect to room  │                │            │             │
  │ with token       │                │            │             │
  │                  │ initializeRoom │            │             │
  │                  │ with LiveKit    │            │             │
  │                  ├────────────────────────────>│             │
  │                  │                │<───────────┤             │
  │                  │              Connected             │
  │<─────────────────┤ Stream video/audio              │
```

### Message Flow

```
User A              Socket.IO       User B
  │ sendMessage()      │              │
  ├────────────────────>│              │
  │                     │ onMessage()  │
  │                     ├─────────────>│
  │                     │              │ Display message
  │                     │              │
  │                     │<─────────────┤ ack
  │<────────────────────┤              │
  │                     │              │
  │              Save to DB (async)    │
  │                     │              │
```

## Component Interaction Map

### Frontend Components

```
App (Root)
├── Router
│   ├── Login Page
│   ├── Signup Page
│   ├── ProtectedRoute
│   │   ├── AgentDashboard
│   │   │   ├── SessionCard
│   │   │   └── CreateSessionButton
│   │   └── SessionRoom
│   │       ├── VideoConference (LiveKit)
│   │       │   ├── Participant Video
│   │       │   ├── Screen Share
│   │       │   ├── Connection Quality Indicator
│   │       │   └── Call Timer
│   │       └── ChatPanel
│   │           ├── MessageList
│   │           ├── MessageInput
│   │           ├── TypingIndicator
│   │           ├── FileUpload
│   │           └── RecordingControls
│   └── AdminDashboard
│       ├── SessionMonitor
│       ├── AnalyticsDashboard
│       ├── RecordingsList
│       └── SystemHealth
```

## State Management

### Zustand Stores

**AuthStore**
- user: Current authenticated user
- token: JWT token
- isAuthenticated: Auth state
- login/logout/restore methods

**SessionStore**
- currentSession: Active session
- participants: Session participants
- messages: Chat messages
- isRecording: Recording state
- recordingDuration: Duration in seconds

### Server State (React Query)

- Agent sessions cache
- Session details
- Messages
- Files
- Analytics metrics

## Database Schema Relationships

```
users (1) ─── (N) sessions
          ├─── (N) participants
          ├─── (N) messages
          └─── (N) session_notes

sessions (1) ─── (N) participants
          ├─── (1) recordings
          ├─── (N) messages
          ├─── (N) files
          ├─── (N) session_notes
          └─── (N) session_tags

recordings (1) ─── (N) playback_events
messages (1) ─── (N) read_receipts
files (1) ─── (N) access_logs
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend verifies password hash
   ↓
3. Generate JWT token + refresh token
   ↓
4. Client stores tokens in localStorage
   ↓
5. Subsequent requests include JWT in Authorization header
   ↓
6. Middleware verifies JWT signature and expiration
   ↓
7. Request continues with user context or returns 401/403
```

### Authorization Flow

```
1. Authenticated request arrives
   ↓
2. Middleware checks JWT role claim
   ↓
3. Compare against required roles
   ↓
4. If authorized: proceed
   If not: return 403 Forbidden
   ↓
5. Row-level security policies apply at database level
```

## Performance Considerations

### Frontend Optimization
- Code splitting by route
- Lazy loading components
- Memoization of expensive computations
- Image lazy loading
- Virtual scrolling for long lists
- WebSocket connection pooling

### Backend Optimization
- Database connection pooling
- Query result caching with React Query
- Pagination for large datasets
- Compression for responses
- Rate limiting on sensitive endpoints
- Async I/O for blocking operations

### Video Infrastructure
- Adaptive bitrate streaming
- Simulcast for multiple quality levels
- Participant-based CPU scaling
- Network quality monitoring
- Automatic recovery from disconnections

## Scalability

### Horizontal Scaling
- Stateless API servers (scale via load balancer)
- WebSocket server requires sticky sessions or Redis pub/sub
- Database replication for read scaling
- CDN for static assets and recordings

### Vertical Scaling
- Database connection pooling optimization
- Memory-efficient data structures
- Query optimization and indexing
- Response compression

## Deployment Topology

### Development
- Docker Compose with all services
- Hot reload enabled
- Console logging

### Production
- Kubernetes cluster (optional)
- Separate pods for API, Socket.IO, scheduled jobs
- PostgreSQL with replication
- Redis for session state (optional)
- S3/CDN for recordings
- CloudFlare or similar for DDoS protection
- Monitoring with Prometheus/Grafana
