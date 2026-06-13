# Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Docker & Docker Compose installed
- Port 3000, 5173, 5432, 7880 available

### Step 1: Clone & Navigate
```bash
cd atomassist
```

### Step 2: Start Docker Stack
```bash
docker-compose up -d
```

Wait for all services to be healthy:
```bash
docker-compose ps
```

### Step 3: Initialize Database
```bash
docker-compose exec postgres psql -U postgres -d atomassist \
  -f /docker-entrypoint-initdb.d/init.sql
```

### Step 4: Create Demo Accounts (Optional)
```bash
# In your local terminal, create users via API calls
# Or use the signup flow in the UI
```

### Step 5: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **LiveKit**: ws://localhost:7880

---

## 🎬 Demo Flow (10 minutes)

### Test Account Credentials

Agent:
```
Email: agent@atomberg.com
Password: agent123
```

Customer:
```
Email: customer@atomberg.com
Password: customer123
```

Admin:
```
Email: admin@atomberg.com
Password: admin123
```

### Demo Scenario

**1. Agent Creates Session (2 min)**
- Login as agent
- Click "Create Session"
- Copy invite code

**2. Customer Joins (2 min)**
- Open new window (incognito)
- Navigate to frontend
- Login/Signup as customer
- Join with invite code
- Video connection established

**3. Real-Time Features (3 min)**
- Send chat messages (see instant delivery)
- Upload a file
- Start recording
- See typing indicators
- View connection quality

**4. End & Review (3 min)**
- Agent ends session
- View in session history
- See AI-generated summary
- Admin can view analytics

---

## 🔧 Development Setup

### Start Backend (Hot Reload)
```bash
cd backend
npm install
npm run dev
```

### Start Frontend (Vite Dev Server)
```bash
cd frontend
npm install
npm run dev
```

### Database Access
```bash
docker-compose exec postgres psql -U postgres -d atomassist
```

### LiveKit Access
```
Dashboard: http://localhost:7880
API: http://localhost:7880/api/v1
```

---

## 📚 Key Documentation

- **README.md** - Full documentation
- **ARCHITECTURE.md** - System design
- **API_DOCUMENTATION.md** - Complete API reference
- **DEPLOYMENT.md** - Production setup
- **FEATURE_MATRIX.md** - Features list

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs postgres
docker-compose logs backend
docker-compose logs livekit

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Frontend Not Loading
```bash
# Clear cache
rm -rf frontend/node_modules
npm install

# Check backend connectivity
curl http://localhost:3000/health
```

### Can't Connect to Video
```bash
# Verify LiveKit is running
curl http://localhost:7880/health

# Check WebSocket connection
# Look at browser console for errors
```

### Database Errors
```bash
# Reset database
docker-compose exec postgres psql -U postgres \
  -c "DROP DATABASE atomassist;"
docker-compose exec postgres psql -U postgres \
  -c "CREATE DATABASE atomassist;"

# Reinitialize
docker-compose exec postgres psql -U postgres -d atomassist \
  -f /docker-entrypoint-initdb.d/init.sql
```

---

## 🚀 Production Deployment

### Using Docker Compose
```bash
# Copy and edit environment
cp backend/.env.example backend/.env
# Edit .env with production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Using Kubernetes
```bash
kubectl apply -f k8s/
kubectl get pods
```

### SSL/TLS
```bash
# Generate certificates
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem -days 365 -nodes

# Place in ssl/ directory
mkdir -p ssl
cp cert.pem ssl/
cp key.pem ssl/

# Update nginx.conf for HTTPS
```

---

## 📊 Admin Dashboard

Access admin features at:
```
http://localhost:5173/admin/dashboard
```

Features:
- Active session monitoring
- System metrics
- Audit logs
- Recording management
- Analytics

---

## 🔐 Security Checklist

Before production:
- [ ] Change JWT_SECRET to strong value
- [ ] Set SUPABASE credentials
- [ ] Configure SSL/TLS certificates
- [ ] Enable database backups
- [ ] Set rate limits
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Set up monitoring alerts

---

## 📱 API Testing

### Using curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@atomberg.com","password":"agent123"}'

# Create session
curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get sessions
curl http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
- Import API endpoints from docs/API_DOCUMENTATION.md
- Set Bearer token in Authorization
- Test each endpoint

---

## 🎯 Next Steps

1. **Explore the codebase**
   - Check backend/src for API implementation
   - Check frontend/src for UI components

2. **Customize branding**
   - Update colors in tailwind.config.js
   - Change logo in frontend/public
   - Update app name in nginx.conf

3. **Extend features**
   - Add more session types
   - Implement custom fields
   - Add integrations

4. **Deploy to cloud**
   - Follow DEPLOYMENT.md
   - Set up CI/CD pipeline
   - Configure monitoring

---

## 📞 Support

For issues:
1. Check troubleshooting section above
2. Review Docker logs
3. Check browser console
4. Refer to ARCHITECTURE.md for design
5. Check API_DOCUMENTATION.md for endpoints

---

## ✅ Features You Can Test

✅ Real-time video & audio calling
✅ Live chat with typing indicators
✅ File sharing & preview
✅ Session recording
✅ AI summaries
✅ Agent notes
✅ Session tagging
✅ Complete audit trail
✅ Admin dashboard
✅ Analytics & metrics

---

## 🎓 Learning Resources

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- TailwindCSS: https://tailwindcss.com
- Express: https://expressjs.com
- LiveKit: https://docs.livekit.io
- Socket.IO: https://socket.io/docs
- PostgreSQL: https://www.postgresql.org/docs
- Docker: https://docs.docker.com

---

**You're all set! Start exploring AtomAssist! 🚀**
