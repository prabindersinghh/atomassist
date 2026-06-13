# Vercel Deployment Checklist - AtomAssist

## Pre-Deployment Requirements

- [ ] Node.js v18+ installed
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] GitHub account linked to Vercel
- [ ] Backend code committed to GitHub
- [ ] Frontend code committed to GitHub
- [ ] All environment variables configured locally

---

## Phase 1: Backend Deployment

### 1.1 Create Vercel Project for Backend

```bash
cd backend
vercel login
vercel
```

**Configure**:
- Project name: `atomassist-api`
- Framework: `Other`
- Root directory: `./` (default)
- Output directory: `dist`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`

### 1.2 Set Backend Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

```
SUPABASE_URL=https://wylzdzycmsbpfdodfklt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHpkenljbXNicGZkb2Rma2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM2NDYzOSwiZXhwIjoyMDk2OTQwNjM5fQ.U3_-8xSoJTZxVaGfW_0oXqT6gIriuxctryjoJso0N68
SUPABASE_JWT_SECRET=Pg1L/bLp7FPAWjW8x7Xj4q5Wr2S9K0m3N8pQ1R5t6U9vW
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
PORT=3001
NODE_ENV=production
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
CORS_ORIGIN=https://atomassist.vercel.app
```

### 1.3 Deploy Backend

```bash
# Development deployment (testing)
vercel --env-file=.env

# Production deployment
vercel deploy --prod
```

**Expected Result**: 
- URL: `https://atomassist-api.vercel.app`
- Status: Ready

### 1.4 Verify Backend Deployment

```bash
# Test health endpoint
curl https://atomassist-api.vercel.app/health

# Expected response:
# {"status":"ok"}
```

---

## Phase 2: Frontend Deployment

### 2.1 Create Vercel Project for Frontend

```bash
cd frontend
vercel
```

**Configure**:
- Project name: `atomassist`
- Framework: `Vite`
- Root directory: `./` (default)
- Output directory: `dist`
- Install command: `npm install`
- Build command: `npm run build`

### 2.2 Set Frontend Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

```
VITE_SUPABASE_URL=https://wylzdzycmsbpfdodfklt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHpkenljbXNicGZkb2Rma2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQ2MzksImV4cCI6MjA5Njk0MDYzOX0.oTRx0Ay-P3IyFuFDX-pkOmVGqkNvDff_gFb7S85-AN4
VITE_API_URL=https://atomassist-api.vercel.app
VITE_SOCKET_URL=https://atomassist-api.vercel.app
VITE_LIVEKIT_URL=wss://livekit.your-domain.com
VITE_ENABLE_RECORDING=true
VITE_ENABLE_ANALYTICS=true
```

### 2.3 Deploy Frontend

```bash
# Development deployment (testing)
vercel --env-file=.env

# Production deployment
vercel deploy --prod
```

**Expected Result**: 
- URL: `https://atomassist.vercel.app`
- Status: Ready

### 2.4 Verify Frontend Deployment

```bash
# Open in browser
https://atomassist.vercel.app

# Expected: Login page loads successfully
```

---

## Phase 3: Connect GitHub for Automatic Deployments

### 3.1 Backend Auto-Deployment

**In Vercel Dashboard → Backend Project Settings:**

1. Go to "Deployments"
2. Click "Connect to Git Repository"
3. Select GitHub repository: `prabindersinghh/atomassist`
4. Branch: `main`
5. Root directory: `backend/`
6. Save

**Result**: Every push to `backend/` automatically deploys

### 3.2 Frontend Auto-Deployment

**In Vercel Dashboard → Frontend Project Settings:**

1. Go to "Deployments"
2. Click "Connect to Git Repository"
3. Select GitHub repository: `prabindersinghh/atomassist`
4. Branch: `main`
5. Root directory: `frontend/`
6. Save

**Result**: Every push to `frontend/` automatically deploys

---

## Phase 4: Post-Deployment Verification

### Verify Backend API

```bash
# Health check
curl -X GET https://atomassist-api.vercel.app/health

# Expected output:
# {"status":"ok"}

# Test Supabase connection
curl -X GET https://atomassist-api.vercel.app/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Frontend

- [ ] Open https://atomassist.vercel.app
- [ ] Page loads without errors
- [ ] Login form visible
- [ ] Console has no errors (F12 → Console)

### Verify Data Flow

- [ ] Login with demo account (alex@atomberg.com)
- [ ] Dashboard loads session data from Supabase
- [ ] Chat messages display
- [ ] Admin dashboard works
- [ ] Verify Socket.IO connection (check Network tab)

---

## Phase 5: Performance Optimization

### 5.1 Enable Caching

**Frontend Vercel Configuration:**

Create `vercel.json` in frontend root:
```json
{
  "headers": [
    {
      "source": "/static/:path*",
      "headers": [
        {
          "key": "cache-control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 5.2 Monitor Performance

**In Vercel Dashboard:**
- Check Analytics tab
- Review deployment logs
- Monitor API response times
- Track error rates

---

## Phase 6: Custom Domain (Optional)

### Add Custom Domain

**In Vercel Dashboard → Settings → Domains:**

1. Click "Add Domain"
2. Enter: `atomassist.yourdomain.com`
3. Verify DNS records
4. Configure SSL/TLS (automatic)

---

## Common Issues & Solutions

### Issue: "Build Failed - Cannot find module"

**Solution**:
```bash
# Check dependencies
cd backend && npm install
npm run build

cd ../frontend && npm install
npm run build
```

### Issue: "Supabase Connection Refused"

**Solution**:
- Verify `SUPABASE_URL` and keys in Vercel environment
- Ensure Supabase project is active
- Check firewall/network settings

### Issue: "Frontend Cannot Connect to Backend"

**Solution**:
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Restart frontend deployment after fixing

### Issue: "Socket.IO Connection Fails"

**Solution**:
- Verify `VITE_SOCKET_URL` is correct
- Check backend is running
- Verify firewall allows WebSocket connections

---

## Deployment Status Tracking

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| Backend | ✓ | https://atomassist-api.vercel.app | |
| Frontend | ✓ | https://atomassist.vercel.app | |
| Database | ✓ | Supabase | Seed data loaded |
| DNS | ○ | Custom domain | Optional |
| SSL/TLS | ✓ | Vercel managed | Automatic |

---

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Or manually deploy previous commit
git revert HEAD
git push
```

---

## Monitoring & Alerts

**Set up Vercel alerts for**:
- [ ] Build failures
- [ ] Runtime errors
- [ ] Performance degradation
- [ ] 404 errors

---

## After Successful Deployment

1. ✓ Notify team of new deployment
2. ✓ Test all features end-to-end
3. ✓ Monitor error logs for 24 hours
4. ✓ Document any configuration changes
5. ✓ Update runbook/wiki if needed

---

## Success Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Can login with demo account
- [ ] Can view session data
- [ ] Chat works in real-time
- [ ] Admin dashboard functions
- [ ] No console errors
- [ ] API calls are successful
- [ ] WebSocket connections established
- [ ] Database queries return correct data

---

**Deployment Date**: [Your Date]
**Deployed By**: [Your Name]
**Version**: 1.0.0
