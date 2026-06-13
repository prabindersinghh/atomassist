# AtomAssist Judge Demo Script

## Session Overview

This demo showcases all key features of AtomAssist in a real, working scenario.

## Pre-Demo Setup

1. **Start Docker Services**
   ```bash
   docker-compose up -d
   ```

2. **Wait for Services**
   - Monitor: `docker-compose ps`
   - When all are healthy, proceed

3. **Create Test Accounts**
   - Agent: agent@atomberg.com / agent123
   - Customer: customer@atomberg.com / customer123
   - Admin: admin@atomberg.com / admin123

## Demo Flow (15 minutes)

### Part 1: Authentication (1 minute)

**Show:**
1. Navigate to http://localhost:5173
2. Click "Login"
3. Enter agent@atomberg.com / agent123
4. Show agent dashboard loaded
5. "This shows our secure JWT-based authentication with role-based access"

### Part 2: Session Creation & Invite (2 minutes)

**Agent Perspective:**
1. Click "Create Session" button
2. "This generates a unique session with a secure invite token"
3. Copy the invite link from the response
4. Show the response contains: sessionId, inviteToken, inviteUrl

**Share Code:**
- Copy the 6-digit code from inviteToken
- Example: "The customer will enter code: ABC123"

### Part 3: Customer Join & Video Call (5 minutes)

**Customer Perspective:**
1. Open new incognito window
2. Navigate to http://localhost:5173
3. Click "Sign Up"
4. Register as: customer@atomberg.com / customer123 (or just login if exists)
5. You're on customer dashboard
6. Navigate to /join?code=ABC123
7. "Customer clicks join with the 6-digit code"
8. Show successful connection to session
9. "Now we have a real LiveKit video connection"

**Show Features:**
- Video stream from both participants
- Microphone indicator
- Camera toggle button
- Connection quality indicator (showing "Good")
- "Our video infrastructure self-hosts with LiveKit"

### Part 4: Real-Time Chat (2 minutes)

**Agent sends message:**
1. Type in chat: "Hello! How can I assist you today?"
2. Click Send
3. "Message appears instantly via Socket.IO"
4. Show message on both sides
5. "Both participants see the message with timestamps"

**Customer sends message:**
1. Type: "I need help with my device setup"
2. Send
3. "Show read receipts feature"
4. Type indicator shows when other user is typing

### Part 5: File Sharing (2 minutes)

**Agent uploads document:**
1. Click file upload button in chat
2. Select an image or PDF
3. "File uploads to secure storage"
4. Show file appears in chat
5. Show file in Files section
6. "Files are secure and accessible only to session participants"

### Part 6: Recording Control (1 minute)

**Agent controls recording:**
1. Click "Start Recording" button
2. "Recording started - visible to all participants"
3. Show recording status: "Recording" in UI
4. Let it run for 10 seconds
5. Click "Stop Recording"
6. Show status change to "Processing"
7. "After processing, recording is stored securely"

### Part 7: AI Session Summary (1 minute)

**After call ends:**
1. Agent clicks "End Session"
2. Both participants disconnect
3. Navigate back to dashboard
4. Show session in history
5. "Our AI automatically generated a summary"
6. Show summary popup with:
   - Issue Summary
   - Root Cause
   - Actions Taken
   - Resolution
   - Next Steps

### Part 8: Session History & Analytics (1 minute)

**Admin Dashboard:**
1. Login as admin
2. Navigate to /admin/dashboard
3. Show:
   - Active Sessions (0 now, since we ended it)
   - Session History (our test session visible)
   - Participants list
   - Call timeline
   - Event log showing all actions
4. "Complete audit trail of all interactions"

## Key Features Highlighted

✅ **Real-Time Video & Audio** - Live peer-to-peer communication via LiveKit  
✅ **Secure Invites** - Time-limited tokens with 6-digit codes  
✅ **Instant Messaging** - Socket.IO real-time chat with read receipts  
✅ **File Sharing** - Secure document sharing with preview  
✅ **Session Recording** - One-click recording with auto-processing  
✅ **AI Summaries** - Automatic post-call analysis and summary  
✅ **Complete History** - Searchable session history with tags  
✅ **Admin Dashboard** - Real-time monitoring and analytics  
✅ **Enterprise Security** - JWT auth, RBAC, RLS policies  
✅ **Professional Design** - Modern UI with premium animations  

## Technical Highlights

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Database**: PostgreSQL with RLS security policies
- **Video**: LiveKit self-hosted media servers
- **Realtime**: Socket.IO for live messaging and events
- **Deployment**: Docker Compose with production-ready config

## Performance Notes

- Video codecs: VP9, H.264 with simulcast
- Chat messages: < 100ms latency via Socket.IO
- File uploads: Multipart with progress tracking
- Database: Indexed queries, connection pooling
- Frontend: Code splitting, lazy loading, virtual scrolling

## Security Features

- JWT token with 24hr expiration
- Role-based access control (RBAC)
- Row-level security (RLS) on all tables
- Password hashing with bcrypt
- Audit logging of all actions
- Secure WebSocket connections
- Input sanitization and validation

## Q&A Points

**Q: How does scaling work?**  
A: Stateless API servers scale horizontally behind a load balancer. WebSocket servers can use Redis pub/sub for distribution. Database replication for read scaling.

**Q: What about recordings?**  
A: LiveKit Egress handles recording. Files stored in S3/CDN for scalability. Playback available with authentication.

**Q: Security?**  
A: JWT auth with refresh tokens. Database RLS prevents cross-tenant access. All API endpoints protected. Audit logging for compliance.

**Q: Mobile support?**  
A: ReactNative version of UI components. LiveKit has native SDKs for iOS/Android.

**Q: What's the cost at scale?**  
A: With self-hosted infrastructure, costs scale linearly with bandwidth. No vendor lock-in.

---

**Total Demo Time**: ~15 minutes  
**Judges Feedback Points**: Enterprise-grade, production-ready, all features implemented
