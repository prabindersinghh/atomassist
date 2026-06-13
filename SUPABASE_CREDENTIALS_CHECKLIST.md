# ✅ Supabase Credentials Checklist

## Quick Reference - What You Need

### From Supabase Dashboard → Settings → API

| Credential | Location | Backend | Frontend | Secret? |
|-----------|----------|---------|----------|---------|
| **Project URL** | Copy top URL | ✅ | ✅ | ❌ |
| **Anon Public Key** | "anon public" row | ❌ | ✅ | ❌ |
| **Service Role Key** | "service_role secret" row | ✅ | ❌ | ⚠️ YES |
| **JWT Secret** | Settings → API → JWT Settings | ✅ | ❌ | ⚠️ YES |

---

## Step-by-Step Collection

### 1️⃣ Get Project URL
```
Supabase Dashboard → Settings → API
↓
Copy "Project URL" (looks like: https://your-project.supabase.co)
↓
Save to backend/.env as: SUPABASE_URL=...
Save to frontend/.env as: VITE_SUPABASE_URL=...
```

### 2️⃣ Get Anon Key
```
Supabase Dashboard → Settings → API
↓
Find row "anon | public"
↓
Click "Copy" button
↓
Save to frontend/.env as: VITE_SUPABASE_ANON_KEY=...
```

### 3️⃣ Get Service Role Key ⚠️
```
Supabase Dashboard → Settings → API
↓
Find row "service_role | secret"
↓
Click "Copy" button (key starts with "eyJ")
↓
BACKEND ONLY: Save to backend/.env as: SUPABASE_SERVICE_ROLE_KEY=...
⚠️ NEVER put in frontend!
```

### 4️⃣ Get JWT Secret ⚠️
```
Supabase Dashboard → Settings → API
↓
Scroll to "JWT Settings" section
↓
Copy the "JWT Secret" value
↓
BACKEND ONLY: Save to backend/.env as: SUPABASE_JWT_SECRET=...
⚠️ NEVER expose publicly!
```

---

## Environment Files

### ✅ `backend/.env` (Keep Secret!)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role...
SUPABASE_JWT_SECRET=your_jwt_secret_here
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
PORT=3001
NODE_ENV=development
```

### ✅ `frontend/.env` (Safe for version control)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key...
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_LIVEKIT_URL=ws://localhost:7880
```

---

## Critical Security Rules

| ✅ DO | ❌ DON'T |
|------|---------|
| Store `SUPABASE_SERVICE_ROLE_KEY` in backend only | Expose service role key in frontend |
| Use anon key for frontend | Put anon key in backend env vars |
| Add backend/.env to .gitignore | Commit backend/.env to git |
| Rotate keys if compromised | Share keys with team via chat |
| Use secrets manager in production | Hard-code keys in source |
| Keep backups of credentials | Lose your JWT secret |

---

## Verification Steps

After setting up credentials:

```bash
# 1. Test backend connection
cd backend
npm install
npm run build
npm run dev

# In another terminal:
curl http://localhost:3001/health
# Should return: { "status": "ok" }

# 2. Check database tables exist
# In Supabase UI → SQL Editor
# Run: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
# Should show: users, sessions, messages, files, recordings, etc.

# 3. Test frontend
cd frontend
npm install
npm run dev
# Open http://localhost:5173
# Should load login page
```

---

## If Something Goes Wrong

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Copy-paste credentials again from Supabase Settings |
| "Connection refused" | Ensure Supabase project is active (not paused) |
| "Table doesn't exist" | Run `backend/database.sql` in Supabase SQL Editor |
| "JWT token invalid" | Check `SUPABASE_JWT_SECRET` is correct |
| "CORS errors" | Add frontend URL to Supabase CORS settings |

---

## Never Share These!

```
❌ SUPABASE_SERVICE_ROLE_KEY
❌ SUPABASE_JWT_SECRET
❌ LIVEKIT_API_SECRET
❌ backend/.env (entire file)
```

---

**Time to set up: ~5 minutes**

**Created**: 2024
**Project**: AtomAssist
