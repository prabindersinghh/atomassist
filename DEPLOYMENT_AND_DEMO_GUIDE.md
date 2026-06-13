# AtomAssist - Complete Setup & Deployment Guide

## ✅ Your Supabase Credentials Are Ready

```
Project ID: wylzdzycmsbpfdodfklt
URL: https://wylzdzycmsbpfdodfklt.supabase.co
Service Role Key: ✓ Configured
Anon Public Key: ✓ Configured
JWT Secret: ✓ Configured
```

---

## 🔧 Setup Phase 1: Database Schema & Seed Data

### Step 1: Deploy Database Schema

**In Supabase Dashboard → SQL Editor:**

1. Click "New Query"
2. Copy all contents from `backend/database.sql`
3. Paste into the editor
4. Click "Run"
5. Wait for completion

**Expected Result**: 12 tables created

### Step 2: Load Demo Seed Data (Optional but Recommended)

**In Supabase Dashboard → SQL Editor:**

1. Click "New Query"
2. Copy all contents from `backend/seed-demo-data.sql`
3. Paste into the editor
4. Click "Run"
5. Wait for completion

**What Gets Created**:
- 7 demo users (3 agents, 3 customers, 1 admin)
- 4 demo sessions (3 completed, 1 active)
- 20+ demo messages
- 4 uploaded files
- 3 recorded sessions
- Session notes and tags
- Audit logs
- Analytics data

**Demo Accounts for Testing**:
```
Agent: alex@atomberg.com
Agent: sarah@atomberg.com
Agent: mike@atomberg.com
Customer: john@customer.com
Customer: emma@customer.com
Customer: robert@customer.com
Admin: admin@atomberg.com
```

---

## 🚀 Setup Phase 2: Local Development (Testing Before Deploy)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
npm run build
npm run typecheck
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output**:
```
✓ Server running on http://localhost:3001
✓ Socket.IO connected
✓ Supabase connected to wylzdzycmsbpfdodfklt
```

### Step 4: Start Frontend (in another terminal)

```bash
cd frontend
npm run dev
```

**Expected Output**:
```
VITE v5.0.8  ready in 123 ms
➜  Local:   http://localhost:5173/
```

### Step 5: Test the Application

**Login Flow**:
1. Open http://localhost:5173
2. Click "Sign up"
3. Create account (email: test@example.com, password: Test123!)
4. Or login with demo account: alex@atomberg.com

**Test Features**:
- [ ] Login/Signup works
- [ ] Agent can create session
- [ ] Invite link generates
- [ ] Customer can join with link
- [ ] Chat works (Socket.IO)
- [ ] Session history visible
- [ ] Admin dashboard loads
- [ ] Analytics display

---

## 📹 Demo Recording Preparation

### What to Demonstrate

**Use Demo Data** (already in database):
1. **Login** - Agent login (alex@atomberg.com)
2. **Dashboard** - Show 4 sessions with history
3. **Session Details** - Show messages, files, recordings
4. **Admin Dashboard** - Show analytics and metrics
5. **Active Session** - Start a new session with existing data

### Demo Account Logins

```
Email: alex@atomberg.com (Agent)
Email: sarah@atomberg.com (Agent)
Email: admin@atomberg.com (Admin)
```

### Demo Script

**Segment 1: Agent Dashboard (1 min)**
- Login as agent
- Show "Active Sessions" tab
- Show session list with demo data
- Click on a session to show details

**Segment 2: Session Details (2 min)**
- Show chat messages
- Show uploaded files
- Show recording controls
- Show session notes

**Segment 3: Admin Dashboard (1 min)**
- Switch to admin account
- Show system metrics
- Show active sessions monitor
- Show analytics charts

**Segment 4: Create New Session (1 min)**
- Create new support session
- Generate invite link
- Show session creation flow

---

## 🌐 Vercel Deployment

### Step 1: Prepare Environment Variables for Vercel

**Frontend Environment Variables** (Settings → Environment Variables):
```
VITE_SUPABASE_URL=https://wylzdzycmsbpfdodfklt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHpkenljbXNicGZkb2Rma2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQ2MzksImV4cCI6MjA5Njk0MDYzOX0.oTRx0Ay-P3IyFuFDX-pkOmVGqkNvDff_gFb7S85-AN4
VITE_API_URL=https://atomassist-api.vercel.app
VITE_SOCKET_URL=https://atomassist-api.vercel.app
VITE_LIVEKIT_URL=wss://livekit.your-domain.com
VITE_ENABLE_RECORDING=true
VITE_ENABLE_ANALYTICS=true
```

### Step 2: Deploy Backend to Vercel

```bash
# Build backend
cd backend
npm run build

# Deploy backend
vercel deploy --prod
```

**Expected Output**:
```
Production: https://atomassist-api.vercel.app
```

### Step 3: Deploy Frontend to Vercel

```bash
cd frontend
npm run build
vercel deploy --prod
```

**Expected Output**:
```
Production: https://atomassist.vercel.app
```

### Step 4: Update CORS Settings

In `backend/.env` (Vercel deployment):
```
CORS_ORIGIN=https://atomassist.vercel.app,https://atomassist-api.vercel.app
```

### Step 5: Verify Deployment

```bash
# Test API health
curl https://atomassist-api.vercel.app/health

# Test Frontend
Open https://atomassist.vercel.app
```

---

## ✅ Pre-Demo Checklist

- [ ] Database schema deployed to Supabase
- [ ] Seed data loaded (demo accounts & sessions)
- [ ] Backend running locally on port 3001
- [ ] Frontend running locally on port 5173
- [ ] Can login with demo account
- [ ] Can see session history with demo data
- [ ] Admin dashboard displays metrics
- [ ] Chat messages load from seed data
- [ ] Recording metadata displays
- [ ] All features responsive on screen recording resolution

---

## 🔐 Security Notes for Production

**Before Going Live**:
1. Rotate LiveKit API keys
2. Enable RLS policies in Supabase (if desired)
3. Configure proper CORS settings
4. Enable database backups
5. Set up monitoring/alerting
6. Enable SSL/TLS everywhere
7. Remove seed data (if not needed)

---

## 📱 Responsive Design for Recording

**Screen Recording Setup**:
- Resolution: 1920x1080 or 1366x768
- Browser zoom: 100%
- Dark theme enabled for professional look
- All panels visible

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to Supabase"
```
Solution: Check SUPABASE_URL and service role key in .env
Verify: curl https://wylzdzycmsbpfdodfklt.supabase.co/rest/v1/
```

### Issue: "Socket.IO connection fails"
```
Solution: Backend must be running on port 3001
Check: lsof -i :3001 (on Mac/Linux)
Or: netstat -ano | findstr :3001 (on Windows)
```

### Issue: "Frontend env variables not loading"
```
Solution: Vite uses VITE_ prefix for browser variables
Verify: Check frontend/.env syntax
Remember: Restart dev server after changing .env
```

### Issue: "Demo data not appearing"
```
Solution: Verify seed-demo-data.sql ran without errors
Check: Run this in Supabase SQL Editor:
SELECT COUNT(*) FROM users;
Should return: 7
```

---

## 📊 Database Verification

**After Seed Data Load**, verify in Supabase:

```sql
-- Check users
SELECT COUNT(*) as user_count FROM users;
-- Expected: 7

-- Check sessions
SELECT COUNT(*) as session_count FROM sessions;
-- Expected: 4 (3 completed, 1 active)

-- Check messages
SELECT COUNT(*) as message_count FROM messages;
-- Expected: 20+

-- Check recordings
SELECT COUNT(*) as recording_count FROM recordings;
-- Expected: 3

-- Check analytics
SELECT COUNT(*) as event_count FROM analytics_events;
-- Expected: 10+
```

---

## 🎥 Demo Video Recording Tips

1. **Test audio**: Use external mic for quality
2. **Close notifications**: Hide Slack, Discord, etc.
3. **Practice flow**: Demo script should take ~5 minutes
4. **Slow down**: Give viewers time to read/follow
5. **Narrate clearly**: Explain each step as you go
6. **Show errors gracefully**: If something breaks, recover smoothly

---

## 📝 After Demo

1. Clean up any test data created during demo
2. Keep seed data for future reference/testing
3. Get feedback on feature completeness
4. Note any UX improvements needed
5. Prepare for final submission

---

## ✨ You're All Set!

Everything is configured and ready for:
- ✅ Local testing
- ✅ Demo video recording
- ✅ Vercel deployment
- ✅ Production use

**Next Action**: Run database schema, load seed data, then start local development servers.
