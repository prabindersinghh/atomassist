# Supabase Configuration Guide for AtomAssist

## Overview

AtomAssist uses Supabase PostgreSQL as the primary database. This guide details all required credentials and setup steps.

---

## Required Supabase Credentials

### 1. **Project URL**
- **Environment Variable**: `SUPABASE_URL`
- **Example**: `https://your-project-id.supabase.co`
- **Where to Find**: 
  - Go to Supabase Dashboard → Settings → API
  - Copy the "Project URL"
- **Used For**: API requests to Supabase
- **Required In**: Backend (`backend/.env`) and Frontend (`frontend/.env`)

### 2. **Anon Key (Public API Key)**
- **Environment Variable**: `SUPABASE_ANON_KEY`
- **Example**: `eyJhbGc...very_long_key...`
- **Where to Find**: 
  - Supabase Dashboard → Settings → API
  - Copy the "anon public" key
- **Used For**: Public browser-side operations, chat, analytics
- **Required In**: Frontend (`frontend/.env`)
- **Security**: This is public-safe (can be exposed in browser)

### 3. **Service Role Key (Secret API Key)**
- **Environment Variable**: `SUPABASE_SERVICE_ROLE_KEY`
- **Example**: `eyJhbGc...very_long_secret_key...`
- **Where to Find**: 
  - Supabase Dashboard → Settings → API
  - Copy the "service_role secret" key
- **Used For**: Server-side authentication, admin operations, user management
- **Required In**: Backend (`backend/.env`) ONLY
- **Security**: ⚠️ KEEP SECRET - never expose in frontend or public repos
- **Critical**: Use only in backend `.env`

### 4. **JWT Secret**
- **Environment Variable**: `SUPABASE_JWT_SECRET`
- **Where to Find**: 
  - Supabase Dashboard → Settings → API
  - Under "JWT Settings", copy the "JWT Secret"
- **Used For**: Signing JWT tokens for session authentication
- **Required In**: Backend (`backend/.env`)
- **Security**: ⚠️ KEEP SECRET

---

## Database Setup

### Tables Created by AtomAssist

The `database.sql` file creates 12 tables:

1. **users** - User accounts (agents, customers, admins)
2. **sessions** - Support sessions (one-to-one support calls)
3. **participants** - Session participants tracking
4. **messages** - Chat messages with timestamps
5. **files** - File uploads (images, PDFs, DOCX)
6. **recordings** - Recording metadata and references
7. **session_notes** - Agent private notes
8. **session_tags** - Session categorization
9. **invite_tokens** - Secure invite links (expire after 1 hour)
10. **audit_logs** - Action audit trail
11. **analytics_events** - Session analytics
12. **system_metrics** - Platform metrics

### Deploy Database Schema

```bash
# Using psql CLI (recommended)
psql -h your-db-host -U postgres -d postgres -f backend/database.sql

# Or using Supabase UI
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Click "New Query"
# 3. Copy-paste contents of backend/database.sql
# 4. Click "Run"
```

---

## Environment Variables Setup

### Backend (`backend/.env`)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key...
SUPABASE_JWT_SECRET=your_jwt_secret_from_settings

# LiveKit Configuration
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Server Configuration
PORT=3001
NODE_ENV=development
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
# Supabase Configuration (Public - OK to expose)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key...

# API Configuration
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

# LiveKit Configuration
VITE_LIVEKIT_URL=ws://localhost:7880

# Features
VITE_ENABLE_RECORDING=true
VITE_ENABLE_ANALYTICS=true
```

---

## Security Considerations

### ✅ Safe to Expose
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- Frontend environment variables (prefixed with `VITE_`)

### ⚠️ NEVER Expose
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only
- `SUPABASE_JWT_SECRET` - Server-side only
- `LIVEKIT_API_SECRET` - Server-side only
- Backend `.env` file - Keep in `.gitignore`

### RLS Policies

**Status**: Currently disabled in `database.sql` (lines 160-170)

**Reason**: AtomAssist uses application-layer authorization via Express middleware instead of Supabase RLS because:
- We manage JWT tokens directly (not Supabase Auth)
- RLS policies use `auth.uid()` which requires Supabase Auth integration
- Application-layer authorization is more flexible for custom RBAC

**To Enable RLS** (optional for production):
1. Uncomment RLS policies in `database.sql`
2. Integrate Supabase Auth into frontend
3. Update backend to use Supabase Auth tokens instead of custom JWT

---

## Step-by-Step Setup

### 1. Create Supabase Project
```
1. Go to supabase.com
2. Click "Start your project"
3. Sign up / Log in
4. Create new organization
5. Create new project (name: "atomassist")
6. Wait for project initialization (2-3 minutes)
```

### 2. Get Credentials
```
1. Go to Settings → API
2. Copy and save:
   - Project URL
   - anon public key
   - service_role secret key
3. Go to Settings → API → JWT Settings
4. Copy JWT Secret
```

### 3. Update Environment Variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Supabase URL and anon key
```

### 4. Deploy Database Schema
```bash
# Via Supabase UI (easiest)
# 1. Dashboard → SQL Editor
# 2. New Query
# 3. Paste backend/database.sql
# 4. Run

# Or via psql
psql -h db.your-project-id.supabase.co -U postgres -f backend/database.sql
```

### 5. Verify Connection
```bash
# In backend directory
npm install
npm run build
npm run dev

# Test in another terminal
curl http://localhost:3001/health
# Should return: { "status": "ok" }
```

---

## Credential Locations in Code

### Backend Uses Supabase For:

**`backend/src/config/supabase.ts`**
```typescript
const supabase = createClient(
  process.env.SUPABASE_URL!,           // Project URL
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
);
```

**`backend/src/services/user.service.ts`**
- User registration and authentication
- Profile updates
- Role management

**`backend/src/services/session.service.ts`**
- Session creation and management
- Recording metadata storage
- Session history

**`backend/src/services/chat.service.ts`**
- Message storage and retrieval
- File upload references

**`backend/src/services/analytics.service.ts`**
- Event logging
- Metrics tracking

### Frontend Uses Supabase For:

**`frontend/src/main.tsx`**
```typescript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**`frontend/src/stores/auth.ts`**
- Authentication state
- User session persistence

---

## Troubleshooting

### Error: "Invalid API key"
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Ensure no extra spaces or quotes in `.env` file
- Verify keys haven't been rotated in Supabase Settings

### Error: "Connection refused"
- Confirm Supabase project is active (not paused)
- Check network connectivity
- Verify firewall allows outbound HTTPS to Supabase

### Error: "Table doesn't exist"
- Run `database.sql` schema file
- Check if tables exist: `\dt` in psql
- Verify schema deployment completed without errors

### Error: "RLS policy violation"
- RLS is currently disabled (commented out in schema)
- If you enabled RLS, ensure policies allow your user role
- Check policy conditions in `database.sql`

---

## Production Deployment

### For Vercel/Railway/Render:

```bash
# Set these environment variables in platform settings:
SUPABASE_URL=<production-url>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role>
SUPABASE_JWT_SECRET=<production-jwt-secret>
```

### Security Checklist:

- [ ] Service role key stored in secrets manager
- [ ] JWT secret stored in secrets manager
- [ ] Anon key verified safe for frontend
- [ ] Database backups enabled
- [ ] SSL/TLS enforced
- [ ] RLS policies reviewed (if enabled)
- [ ] Rate limiting configured
- [ ] Audit logs enabled
- [ ] Network restrictions applied if needed

---

## Support

For Supabase documentation:
- https://supabase.com/docs
- https://supabase.com/docs/guides/getting-started
- https://supabase.com/docs/guides/api

For AtomAssist backend documentation:
- See `docs/ARCHITECTURE.md`
- See `docs/API_DOCUMENTATION.md`
