# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://atomassist.yourdomain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /auth/login

Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "agent"
  },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

## Session Endpoints

### POST /sessions

Create a new support session. **Requires: Agent role**

**Request:**
```
Authorization: Bearer {token}
```

**Response:** `201 Created`
```json
{
  "session": {
    "id": "session_uuid",
    "agent_id": "agent_uuid",
    "start_time": "2026-06-13T22:00:00Z",
    "status": "pending"
  },
  "inviteToken": "ABC123",
  "inviteUrl": "https://atomassist.com/join?code=ABC123"
}
```

### GET /sessions

Get admin's active sessions. **Requires: Admin role**

**Response:** `200 OK`
```json
[
  {
    "id": "session_uuid",
    "agent_id": "agent_uuid",
    "start_time": "2026-06-13T22:00:00Z",
    "status": "active",
    "created_at": "2026-06-13T21:55:00Z"
  }
]
```

### GET /sessions/agent

Get current agent's sessions. **Requires: Agent role**

**Response:** `200 OK`
```json
[
  {
    "id": "session_uuid",
    "agent_id": "agent_uuid",
    "start_time": "2026-06-13T22:00:00Z",
    "status": "active"
  }
]
```

### GET /sessions/{sessionId}

Get session details.

**Response:** `200 OK`
```json
{
  "session": {
    "id": "session_uuid",
    "agent_id": "agent_uuid",
    "start_time": "2026-06-13T22:00:00Z",
    "status": "active"
  },
  "participants": [
    {
      "id": "participant_uuid",
      "user_id": "user_uuid",
      "role": "agent",
      "joined_at": "2026-06-13T22:00:00Z",
      "connection_quality": "good"
    }
  ]
}
```

### POST /sessions/join/{inviteToken}

Join a session with invite token.

**Request:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "session": { ... },
  "participant": { ... },
  "liveKitToken": "livekit_jwt",
  "liveKitUrl": "ws://livekit:7880"
}
```

### POST /sessions/{sessionId}/start

Start a session. **Requires: Agent role, own session**

**Response:** `200 OK`
```json
{
  "session": { ... },
  "liveKitToken": "livekit_jwt",
  "liveKitUrl": "ws://livekit:7880"
}
```

### POST /sessions/{sessionId}/end

End a session. **Requires: Agent (own session) or Admin**

**Response:** `200 OK`
```json
{
  "id": "session_uuid",
  "status": "ended",
  "end_time": "2026-06-13T22:30:00Z"
}
```

---

## Chat Endpoints

### GET /chat/{sessionId}

Get all messages in a session.

**Response:** `200 OK`
```json
[
  {
    "id": "msg_uuid",
    "session_id": "session_uuid",
    "user_id": "user_uuid",
    "content": "Hello!",
    "type": "text",
    "read_by": ["user1", "user2"],
    "created_at": "2026-06-13T22:05:00Z"
  }
]
```

### POST /chat/{sessionId}/messages

Send a message.

**Request:**
```json
{
  "content": "Hello, how can I help?"
}
```

**Response:** `201 Created`
```json
{
  "id": "msg_uuid",
  "session_id": "session_uuid",
  "user_id": "user_uuid",
  "content": "Hello, how can I help?",
  "type": "text",
  "read_by": ["current_user_uuid"],
  "created_at": "2026-06-13T22:05:00Z"
}
```

### POST /chat/{sessionId}/messages/{messageId}/read

Mark message as read.

**Response:** `200 OK`
```json
{
  "success": true
}
```

### POST /chat/{sessionId}/files

Upload a file.

**Request:** (multipart/form-data)
```
file: <binary>
filename: "document.pdf"
size: 1024000
type: "application/pdf"
url: "https://storage.example.com/file.pdf"
previewUrl: "https://storage.example.com/file-preview.jpg"
```

**Response:** `201 Created`
```json
{
  "file": {
    "id": "file_uuid",
    "session_id": "session_uuid",
    "filename": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "https://storage.example.com/file.pdf"
  },
  "message": { ... }
}
```

### GET /chat/{sessionId}/files

Get all files in a session.

**Response:** `200 OK`
```json
[
  {
    "id": "file_uuid",
    "session_id": "session_uuid",
    "filename": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "https://storage.example.com/file.pdf",
    "created_at": "2026-06-13T22:10:00Z"
  }
]
```

---

## Admin Endpoints

### GET /admin/sessions/active

Get all active sessions. **Requires: Admin role**

**Response:** `200 OK`
```json
[
  {
    "id": "session_uuid",
    "agent_id": "agent_uuid",
    "status": "active",
    "start_time": "2026-06-13T22:00:00Z"
  }
]
```

### GET /admin/sessions

Get all sessions with pagination. **Requires: Admin role**

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)

**Response:** `200 OK`
```json
{
  "sessions": [...],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

### GET /admin/sessions/{sessionId}

Get session details. **Requires: Admin role**

**Response:** `200 OK`
```json
{
  "session": { ... },
  "participants": [ ... ]
}
```

### POST /admin/sessions/{sessionId}/end

End a session (admin override). **Requires: Admin role**

**Response:** `200 OK`
```json
{
  "id": "session_uuid",
  "status": "ended",
  "end_time": "2026-06-13T22:30:00Z"
}
```

### GET /admin/metrics

Get system metrics. **Requires: Admin role**

**Response:** `200 OK`
```json
{
  "activeSessions": 5,
  "totalSessions": 143,
  "averageSessionDuration": 15,
  "recordingCount": 89,
  "timestamp": "2026-06-13T22:30:00Z"
}
```

### GET /admin/logs

Get audit logs. **Requires: Admin role**

**Query Parameters:**
- `limit` (number, default: 100)

**Response:** `200 OK`
```json
[
  {
    "id": "log_uuid",
    "action": "SESSION_CREATED",
    "actor_id": "user_uuid",
    "resource_type": "SESSION",
    "resource_id": "session_uuid",
    "changes": null,
    "created_at": "2026-06-13T22:00:00Z"
  }
]
```

### GET /admin/logs/session/{sessionId}

Get logs for a specific session. **Requires: Admin role**

**Response:** `200 OK`
```json
[
  {
    "id": "log_uuid",
    "action": "PARTICIPANT_JOINED",
    "actor_id": "user_uuid",
    "resource_type": "PARTICIPANT",
    "resource_id": "participant_uuid",
    "created_at": "2026-06-13T22:01:00Z"
  }
]
```

---

## Socket.IO Real-Time Events

### Client → Server

**Emit Events:**

```javascript
// Join a session
socket.emit('join-session', 'session_uuid');

// Leave a session
socket.emit('leave-session', 'session_uuid');

// Send message
socket.emit('message', {
  sessionId: 'session_uuid',
  content: 'Hello!'
});

// User is typing
socket.emit('typing', 'session_uuid');

// User stopped typing
socket.emit('stop-typing', 'session_uuid');

// Recording started
socket.emit('recording-started', 'session_uuid');

// Recording stopped
socket.emit('recording-stopped', 'session_uuid');

// Report connection quality
socket.emit('connection-quality', {
  sessionId: 'session_uuid',
  quality: 'good' // 'good' | 'fair' | 'poor'
});
```

### Server → Client

**Listen Events:**

```javascript
// User joined session
socket.on('user-joined', (data) => {
  console.log(`User ${data.userId} joined at ${data.timestamp}`);
});

// User left session
socket.on('user-left', (data) => {
  console.log(`User ${data.userId} left`);
});

// New message received
socket.on('message', (data) => {
  console.log(`${data.userId}: ${data.content}`);
});

// User is typing
socket.on('user-typing', (data) => {
  console.log(`${data.userId} is typing...`);
});

// User stopped typing
socket.on('user-stopped-typing', (data) => {
  console.log(`${data.userId} stopped typing`);
});

// Recording started
socket.on('recording-started', (data) => {
  console.log('Recording started');
});

// Recording stopped
socket.on('recording-stopped', (data) => {
  console.log('Recording stopped');
});

// Connection quality update
socket.on('connection-quality', (data) => {
  console.log(`${data.userId} quality: ${data.quality}`);
});
```

---

## Rate Limiting

Coming soon. Current rate limits:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Pagination

For endpoints returning lists:

```json
{
  "data": [ ... ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "pages": 3
}
```

---

## Examples

### Complete Session Flow

```javascript
// 1. Agent logs in
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'agent@atomberg.com',
    password: 'password'
  })
});
const { token } = await loginResponse.json();

// 2. Agent creates session
const createResponse = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { inviteToken } = await createResponse.json();

// 3. Customer joins
const joinResponse = await fetch(`/api/sessions/join/${inviteToken}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${customerToken}`
  }
});
const { liveKitToken, liveKitUrl } = await joinResponse.json();

// 4. Connect to LiveKit
const room = await connect(liveKitUrl, liveKitToken);

// 5. Send messages
await fetch('/api/chat/{sessionId}/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Hello!'
  })
});

// 6. Upload file
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('filename', 'document.pdf');
await fetch('/api/chat/{sessionId}/files', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// 7. End session
await fetch('/api/sessions/{sessionId}/end', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Support

For API issues or questions, refer to the architecture documentation or contact support.
