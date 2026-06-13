# AtomAssist Architecture Diagram Brief

Use this file as the source prompt/spec for generating an architecture diagram of AtomAssist.

## One-Line Summary

AtomAssist is a real-time video support platform where agents create support sessions, customers join through invite tokens, LiveKit carries audio/video, Socket.IO carries real-time collaboration events, and an Express API persists users, sessions, chat, files, recordings, analytics, and audit data in Supabase/PostgreSQL.

## Primary Actors

- Support Agent: logs in, creates sessions, starts/ends sessions, joins video rooms, sends chat messages, reviews session history.
- Customer: signs up/logs in, joins a session through an invite token, joins the LiveKit room, sends chat messages and files.
- Admin: monitors active sessions, views metrics, reads audit logs, can end sessions.

## Runtime Components

- Frontend Web App
  - React 18 + TypeScript + Vite
  - React Router for pages
  - React Query for API polling/cache
  - Zustand for auth/session state
  - LiveKit React Components for video UI
  - Socket.IO client for real-time events
  - TailwindCSS for styling

- Backend API
  - Node.js + Express + TypeScript
  - REST API under `/api`
  - JWT authentication middleware
  - Role-based authorization for agent/admin routes
  - Socket.IO server attached to the same HTTP server
  - LiveKit Server SDK for room access token generation
  - Supabase JS service-role client for database access

- LiveKit Media Server
  - Handles WebRTC audio/video transport
  - Backend creates participant JWTs with room grants
  - Frontend connects through `LiveKitRoom`

- Supabase/PostgreSQL
  - System of record for users, sessions, participants, messages, files, recordings, notes, tags, invite tokens, audit logs, metrics, and analytics events
  - Application-layer authorization is handled by Express middleware

## High-Level System Diagram

```mermaid
flowchart LR
  Agent[Support Agent Browser] --> FE[React/Vite Frontend]
  Customer[Customer Browser] --> FE
  Admin[Admin Browser] --> FE

  FE -- "HTTPS REST /api/* with JWT" --> API[Express Backend API]
  FE -- "Socket.IO with JWT" --> SIO[Socket.IO Server]
  FE -- "WebRTC via LiveKit token" --> LK[LiveKit Media Server]

  API -- "Supabase service-role client" --> DB[(Supabase PostgreSQL)]
  API -- "Generate room JWT" --> LK
  SIO -- "Room events: chat, typing, recording, quality" --> FE

  API -. "JWT signing/verification" .-> Auth[JWT Auth Layer]
```

## Backend Module Diagram

```mermaid
flowchart TB
  Index[src/index.ts] --> AuthRoutes[routes/auth.ts]
  Index --> SessionRoutes[routes/sessions.ts]
  Index --> ChatRoutes[routes/chat.ts]
  Index --> AdminRoutes[routes/admin.ts]
  Index --> Socket[Socket.IO handlers]
  Index --> ErrorHandler[errorHandler middleware]

  AuthRoutes --> UserService[user.service.ts]
  SessionRoutes --> SessionService[session.service.ts]
  SessionRoutes --> LiveKitConfig[config/livekit.ts]
  ChatRoutes --> ChatService[chat.service.ts]
  AdminRoutes --> SessionService
  AdminRoutes --> AnalyticsService[analytics.service.ts]

  UserService --> Supabase[config/supabase.ts]
  SessionService --> Supabase
  ChatService --> Supabase
  AnalyticsService --> Supabase

  AuthRoutes --> JWT[utils/jwt.ts]
  Middleware[middleware/auth.ts] --> JWT
  SessionService --> IdUtil[utils/id.ts]
  UserService --> Password[utils/password.ts]
```

## Frontend Page Diagram

```mermaid
flowchart TB
  App[src/App.tsx] --> Login[Login Page]
  App --> Signup[Signup Page]
  App --> Protected[ProtectedRoute]
  Protected --> AgentDashboard[Agent Dashboard]
  Protected --> SessionRoom[Session Room]

  Login --> AuthStore[Zustand auth store]
  Signup --> AuthStore
  AgentDashboard --> ApiService[services/api.ts]
  SessionRoom --> ApiService
  SessionRoom --> SocketService[services/socket.ts]
  SessionRoom --> SessionStore[Zustand session store]
  SessionRoom --> LiveKitUI[LiveKit React Components]

  ApiService --> Backend[Express API]
  SocketService --> SocketIO[Socket.IO Backend]
  LiveKitUI --> LiveKit[LiveKit Media Server]
```

## Core Data Model

```mermaid
erDiagram
  users ||--o{ sessions : "agent_id"
  users ||--o{ participants : "user_id"
  users ||--o{ messages : "user_id"
  users ||--o{ files : "user_id"
  users ||--o{ session_notes : "created_by"
  users ||--o{ audit_logs : "actor_id"

  sessions ||--o{ participants : "session_id"
  sessions ||--o{ messages : "session_id"
  sessions ||--o{ files : "session_id"
  sessions ||--o{ recordings : "session_id"
  sessions ||--o{ session_notes : "session_id"
  sessions ||--o{ session_tags : "session_id"
  sessions ||--o{ invite_tokens : "session_id"
  sessions ||--o{ analytics_events : "session_id"
```

## Main User Flows

### Authentication

```mermaid
sequenceDiagram
  participant U as User Browser
  participant FE as React Frontend
  participant API as Express API
  participant DB as Supabase PostgreSQL

  U->>FE: Submit login/signup form
  FE->>API: POST /api/auth/login or /api/auth/signup
  API->>DB: Read/create user and password hash
  DB-->>API: User record
  API-->>FE: User, JWT, refresh token
  FE->>FE: Store auth state in Zustand/local storage
```

### Agent Creates And Starts A Session

```mermaid
sequenceDiagram
  participant Agent as Agent Browser
  participant FE as React Frontend
  participant API as Express API
  participant DB as Supabase PostgreSQL
  participant LK as LiveKit

  Agent->>FE: Click Create Session
  FE->>API: POST /api/sessions with JWT
  API->>DB: Insert session with status pending
  API->>DB: Insert invite token with expiry
  API-->>FE: Session, inviteToken, inviteUrl
  Agent->>FE: Open session room
  FE->>API: POST /api/sessions/:sessionId/start
  API->>DB: Update session status active
  API->>LK: Generate room participant JWT
  API-->>FE: Session, liveKitToken, liveKitUrl
  FE->>LK: Connect to LiveKit room
```

### Customer Joins A Session

```mermaid
sequenceDiagram
  participant Customer as Customer Browser
  participant FE as React Frontend
  participant API as Express API
  participant DB as Supabase PostgreSQL
  participant LK as LiveKit

  Customer->>FE: Open invite URL with code
  FE->>API: POST /api/sessions/join/:inviteToken with JWT
  API->>DB: Validate token and expiry
  API->>DB: Insert participant
  API->>DB: Set pending session active
  API->>LK: Generate room participant JWT
  API-->>FE: Session, participant, liveKitToken, liveKitUrl
  FE->>LK: Connect to LiveKit room
```

### Chat And Realtime Events

```mermaid
sequenceDiagram
  participant User as Browser
  participant FE as React Frontend
  participant API as Express API
  participant DB as Supabase PostgreSQL
  participant SIO as Socket.IO
  participant Peer as Other Browser

  User->>FE: Send message
  FE->>API: POST /api/chat/:sessionId/messages
  API->>DB: Insert message
  API-->>FE: Persisted message
  FE->>SIO: emit message to session room
  SIO-->>Peer: message event

  FE->>SIO: emit typing / stop-typing / recording / quality
  SIO-->>Peer: broadcast event to session room
```

## REST API Surface

- `POST /api/auth/signup`: create customer user and return JWT.
- `POST /api/auth/login`: validate password and return JWT.
- `POST /api/sessions`: agent creates a pending session and invite token.
- `GET /api/sessions/agent`: agent lists own sessions.
- `GET /api/sessions/:sessionId`: fetch session and participants.
- `POST /api/sessions/join/:inviteToken`: validate invite, add customer participant, return LiveKit credentials.
- `POST /api/sessions/:sessionId/start`: agent starts session and receives LiveKit credentials.
- `POST /api/sessions/:sessionId/end`: agent/admin ends session.
- `GET /api/sessions`: admin lists active sessions.
- `GET /api/chat/:sessionId`: fetch messages.
- `POST /api/chat/:sessionId/messages`: persist text message.
- `POST /api/chat/:sessionId/messages/:messageId/read`: mark message read.
- `POST /api/chat/:sessionId/files`: store file metadata and create file message.
- `GET /api/chat/:sessionId/files`: list files.
- `GET /api/admin/sessions/active`: admin active sessions.
- `GET /api/admin/sessions`: admin paginated session list.
- `GET /api/admin/sessions/:sessionId`: admin session details.
- `POST /api/admin/sessions/:sessionId/end`: admin override end session.
- `GET /api/admin/metrics`: session and recording metrics.
- `GET /api/admin/logs`: audit logs.
- `GET /api/admin/logs/session/:sessionId`: audit logs for one session.

## Socket.IO Event Surface

- Client emits: `join-session`, `leave-session`, `message`, `typing`, `stop-typing`, `recording-started`, `recording-stopped`, `connection-quality`.
- Server emits: `user-joined`, `user-left`, `message`, `user-typing`, `user-stopped-typing`, `recording-started`, `recording-stopped`, `connection-quality`.
- Socket authentication: JWT passed in `socket.handshake.auth.token`.
- Socket room pattern: `session:{sessionId}`.

## Deployment View

```mermaid
flowchart TB
  subgraph LocalDev["Local Development"]
    FEDev[Vite dev server :5173]
    APIDev[Express dev server :3001]
    LiveKitLocal[LiveKit ws://localhost:7880]
    SupabaseCloud[(Supabase cloud project)]
  end

  FEDev --> APIDev
  FEDev --> LiveKitLocal
  APIDev --> SupabaseCloud
  APIDev --> LiveKitLocal

  subgraph ContainerOption["Docker Compose Option"]
    Nginx[Nginx/static frontend :5173]
    APIContainer[Backend container :3000]
    Postgres[(Postgres :5432)]
    SupabaseContainer[Supabase container :54321]
    LiveKitContainer[LiveKit :7880]
  end

  Nginx --> APIContainer
  APIContainer --> SupabaseContainer
  APIContainer --> LiveKitContainer
  SupabaseContainer --> Postgres
```

## Security Boundaries

- Browser stores JWT and sends it to REST API through `Authorization: Bearer`.
- Express validates JWT with `JWT_SECRET`.
- Express role middleware restricts agent and admin operations.
- Supabase service key is backend-only and must never be exposed to the frontend.
- LiveKit API secret is backend-only; frontend receives only participant room JWTs.
- Invite tokens expire after 24 hours.
- Passwords are hashed with bcrypt before storage.

## Current Implementation Notes

- Local backend port is `3001`.
- Local frontend port is `5173`.
- Local frontend API base must include `/api`: `VITE_API_URL=http://localhost:3001/api`.
- Docker is described in the repo, but Docker is not available on this machine's PATH.
- Admin users route to `/admin/dashboard`.
- Agents receive LiveKit credentials from `POST /api/sessions/:sessionId/start`.
- Customers receive LiveKit credentials from `POST /api/sessions/join/:inviteToken`.
- The customer join page is available at `/join` and accepts `?code=INVITE_TOKEN`.
- LiveKit local URL is configured as `ws://localhost:7880`; a LiveKit server must be running for video rooms to connect.

## Diagram Generator Prompt

Create a clean architecture diagram for "AtomAssist - Real-Time Video Support Platform".

Show three user actors: Support Agent, Customer, and Admin. Show a React/Vite frontend connected to an Express/TypeScript backend by REST over HTTPS and Socket.IO. Show the frontend connecting directly to LiveKit for WebRTC audio/video using a LiveKit token received from the backend. Show the backend connected to Supabase/PostgreSQL through the Supabase service-role client. Show backend modules for auth, sessions, chat, admin, analytics, JWT middleware, LiveKit token generation, and Socket.IO session rooms. Show database tables grouped around sessions: users, sessions, participants, messages, files, recordings, session_notes, session_tags, invite_tokens, audit_logs, system_metrics, analytics_events. Label key flows: login/signup, create session, invite token join, LiveKit token generation, WebRTC media, persisted chat, realtime events, admin metrics/audit logs. Use clear boundaries for browser, backend, media server, and database.
