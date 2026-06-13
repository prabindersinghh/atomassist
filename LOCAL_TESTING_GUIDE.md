# Quick Local Testing Guide

## 🎯 Goal: Verify Everything Works Before Deploy

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] .env files created with Supabase credentials
- [ ] Supabase schema deployed
- [ ] Seed data loaded

---

## Test 1: Backend Setup (10 minutes)

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Type check
npm run typecheck

# Start dev server
npm run dev
```

**Expected Output:**
```
✓ Server running on http://localhost:3001
✓ Socket.IO ready
✓ Supabase connected
```

**Verify:**
```bash
# In another terminal, test health endpoint
curl http://localhost:3001/health
# Response: {"status":"ok"}
```

---

## Test 2: Frontend Setup (10 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 150 ms
➜  Local:   http://localhost:5173/
```

**Open Browser:**
- Navigate to http://localhost:5173
- Should see AtomAssist login page
- No console errors (F12 to check)

---

## Test 3: Authentication Flow (5 minutes)

### Test Signup
1. Click "Sign up"
2. Enter: email=testuser@example.com, password=Test123!, name=Test User
3. Submit
4. Should redirect to dashboard
5. Verify user appears in Supabase `users` table

### Test Login (with Demo Data)
1. Logout
2. Click "Sign in"
3. Enter: email=alex@atomberg.com, password=Password123
4. Submit
5. Should load Agent Dashboard
6. Should see 4 sessions from seed data

---

## Test 4: Dashboard Features (10 minutes)

### Check Session List
- [ ] 4 sessions visible (from seed data)
- [ ] Session titles display correctly
- [ ] Status shows (completed/active)
- [ ] Duration visible
- [ ] Agent/Customer names displayed

### Click on Session
- [ ] Session details load
- [ ] Chat messages visible (20+ messages from seed data)
- [ ] Files section shows 4 documents
- [ ] Recordings show 3 completed recordings
- [ ] Session notes visible to agent

### Admin Dashboard
1. Logout
2. Login as admin@atomberg.com
3. Should see Admin Dashboard
4. Check:
   - [ ] Active Sessions: 1
   - [ ] Total Sessions: 4
   - [ ] Total Users: 7
   - [ ] Analytics chart displays

---

## Test 5: Real-Time Features (10 minutes)

### Chat Test
1. Open session details
2. Click "Send Message"
3. Type message: "Test message"
4. Message should appear immediately
5. Check Supabase - message should exist in `messages` table

### Create New Session
1. Click "Create Session"
2. Fill in:
   - Title: "Test Session"
   - Description: "Testing new session"
   - Customer: Select from dropdown
3. Click "Create"
4. Should generate invite link
5. Should appear in active sessions list

---

## Test 6: Data Persistence

### Verify Supabase
Open Supabase Dashboard → SQL Editor and run:

```sql
-- Check users
SELECT COUNT(*) FROM users;
-- Expected: 7+

-- Check sessions
SELECT COUNT(*) FROM sessions;
-- Expected: 4+

-- Check messages
SELECT COUNT(*) FROM messages;
-- Expected: 20+

-- Check files
SELECT COUNT(*) FROM files;
-- Expected: 4

-- Check recordings
SELECT COUNT(*) FROM recordings;
-- Expected: 3
```

---

## Test 7: Error Handling (5 minutes)

### Test Invalid Login
1. Try login with wrong password
2. Should show error message
3. Not crash or hang

### Test Missing Field
1. Click signup
2. Try submit without email
3. Should show validation error
4. Don't allow submission

### Test Network Error (simulate)
1. Close backend server
2. Try to create new session
3. Should show error (not loading forever)
4. Restart backend

---

## Test 8: Browser Console (5 minutes)

**F12 → Console tab - should see:**
- ✓ No red errors
- ✓ No unhandled promises
- ✓ Warning messages are OK
- ✓ Check Network tab for failed requests

**Look for:**
- Successful API calls to /api/*
- Socket.IO connection message
- Supabase initialization

---

## Quick Troubleshooting

### Problem: Backend won't start
```bash
# Check port 3001 is free
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Or change port in backend/.env
PORT=3002
```

### Problem: Frontend won't compile
```bash
# Clear cache and reinstall
rm -rf frontend/node_modules
npm install
npm run dev
```

### Problem: Can't connect to Supabase
```bash
# Verify credentials in .env
SUPABASE_URL=https://wylzdzycmsbpfdodfklt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Test connection
curl https://wylzdzycmsbpfdodfklt.supabase.co/rest/v1/users \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT"
```

### Problem: Socket.IO not connecting
```
Check backend is running on port 3001
Check VITE_SOCKET_URL in frontend/.env
Check browser console for WebSocket errors
```

---

## Test Checklist ✓

- [ ] Backend installs without errors
- [ ] Backend starts on port 3001
- [ ] Frontend installs without errors
- [ ] Frontend starts on port 5173
- [ ] Login page loads
- [ ] Can signup new account
- [ ] Can login with demo account
- [ ] Dashboard shows 4 sessions
- [ ] Can click session to view details
- [ ] Can see chat messages (20+)
- [ ] Can see files (4)
- [ ] Can see recordings (3)
- [ ] Can create new session
- [ ] Admin dashboard loads
- [ ] Admin can see metrics
- [ ] No console errors
- [ ] Network requests are successful
- [ ] All data matches seed data

---

## Ready for Demo?

If all tests pass ✓, you're ready to:
1. Record demo video
2. Deploy to Vercel
3. Submit to hackathon

---

## Demo Recording Tips

1. **Setup**: Clean desktop, close distractions
2. **Quality**: Use screen recording tool (OBS, ScreenFlow, etc.)
3. **Resolution**: 1920x1080 recommended
4. **Audio**: Use good microphone
5. **Pace**: Slow down so viewers can follow
6. **Narration**: Explain what you're demonstrating

**Suggested Flow**:
- [0:00] Login with demo account
- [0:30] Show dashboard with 4 sessions
- [1:00] Click session, show chat/files
- [1:30] Create new session (show flow)
- [2:00] Switch to admin dashboard
- [2:30] Show analytics
- [3:00] Outro / Next steps

---

**Time to Complete All Tests**: ~45 minutes
**Confidence Level After**: High ✓
