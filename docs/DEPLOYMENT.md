# DEPLOYMENT GUIDE

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 15+
- LiveKit Server (for self-hosted media)
- Supabase account (or self-hosted Postgres)
- Node.js 20+ (for manual deployment)
- SSL certificate (for production)

## Local Development Deployment

### 1. Quick Start

```bash
# Clone repository
cd atomassist

# Create environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# (Or manually)
docker-compose exec postgres psql -U postgres -d atomassist \
  -f /docker-entrypoint-initdb.d/init.sql
```

### 3. Create Demo Accounts

```bash
# Backend shell
docker-compose exec backend node

// Inside Node shell:
const userService = require('./dist/services/user.service').userService;

await userService.createUser(
  'agent@atomberg.com',
  'agent123',
  'Agent User',
  'agent'
);

await userService.createUser(
  'customer@atomberg.com',
  'customer123',
  'Customer User',
  'customer'
);

await userService.createUser(
  'admin@atomberg.com',
  'admin123',
  'Admin User',
  'admin'
);

process.exit();
```

### 4. Verify Services

```bash
# Health checks
curl http://localhost:3000/health          # Backend
curl http://localhost:5173                 # Frontend
curl http://localhost:7880/health          # LiveKit

# Test API endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@atomberg.com","password":"agent123"}'
```

## Production Deployment

### 1. Environment Configuration

Create `backend/.env` with production values:

```env
NODE_ENV=production
PORT=3000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=generate-strong-random-string-here

# LiveKit
LIVEKIT_URL=wss://livekit.yourdomain.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=https://atomassist.yourdomain.com
```

### 2. Build for Production

```bash
# Build backend
cd backend
npm install --production
npm run build

# Build frontend
cd ../frontend
npm install --production
npm run build
```

### 3. Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database.sql:/docker-entrypoint-initdb.d/init.sql
    restart: always
    networks:
      - atomassist

  livekit:
    image: livekit/livekit-server:latest
    command: --config /etc/livekit.yaml
    ports:
      - "7880:7880"
      - "7882:7882"
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
      - livekit_data:/data
    restart: always
    networks:
      - atomassist

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      LIVEKIT_URL: ${LIVEKIT_URL}
      LIVEKIT_API_KEY: ${LIVEKIT_API_KEY}
      LIVEKIT_API_SECRET: ${LIVEKIT_API_SECRET}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - livekit
    restart: always
    networks:
      - atomassist
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    restart: always
    networks:
      - atomassist

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - atomassist

volumes:
  postgres_data:
  livekit_data:

networks:
  atomassist:
    driver: bridge
```

Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. SSL/TLS Configuration

```bash
# Generate self-signed certificate (test only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Place in ssl/
mkdir ssl
cp cert.pem ssl/
cp key.pem ssl/
```

Update `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name atomassist.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... rest of configuration
}
```

### 5. Database Setup

```bash
# Connect to Supabase or self-hosted PostgreSQL
psql -h your-db-host -U postgres -d atomassist

# Run schema
\i database.sql

# Verify tables
\dt
```

### 6. LiveKit Configuration

Create `livekit.yaml` with production settings:

```yaml
port: 7880
bind_addresses:
  - "0.0.0.0"

api_key: your-production-api-key
api_secret: your-production-api-secret

room:
  max_participants: 1000
  empty_timeout: 300
  max_metadata_bytes: 2048

logging:
  level: info
  sample: false

development: false
```

### 7. Database Backups

```bash
# Automated daily backup
0 2 * * * pg_dump -h localhost -U postgres atomassist > /backups/atomassist-$(date +\%Y\%m\%d).sql

# Restore from backup
psql -h localhost -U postgres atomassist < /backups/atomassist-20260613.sql
```

### 8. Monitoring & Logging

Set up centralized logging:

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f livekit

# Structured logging (using Winston/Morgan in backend)
# Logs sent to CloudWatch, DataDog, or ELK stack
```

### 9. Health Checks & Monitoring

Create health check endpoints:

```bash
# Backend health
GET /health

# Database
GET /health/db

# LiveKit
GET /health/livekit

# Cache/Redis (if used)
GET /health/cache
```

## Kubernetes Deployment (Optional)

### 1. Create Deployments

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: atomassist-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: atomassist-backend
  template:
    metadata:
      labels:
        app: atomassist-backend
    spec:
      containers:
      - name: backend
        image: atomassist-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: atomassist-config
              key: db_host
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

### 2. Create Services

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: atomassist-backend
spec:
  type: LoadBalancer
  selector:
    app: atomassist-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

### 3. Deploy

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f livekit-deployment.yaml
kubectl apply -f postgres-statefulset.yaml
```

## Performance Tuning

### Database

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';

-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Optimize work memory
ALTER SYSTEM SET work_mem = '64MB';

-- Connection pooling
CREATE EXTENSION IF NOT EXISTS pgbouncer;
```

### Node.js

```bash
# Use Node cluster mode for multiple cores
# Or use PM2
npm install -g pm2

pm2 start dist/index.js -i max --name atomassist
pm2 save
pm2 startup
```

### LiveKit

```yaml
# Adjust for your infrastructure
room:
  auto_create: true
  empty_timeout: 300
  max_participants: 100

video:
  # Disable simulcast for lower bandwidth
  dynacast: true
  
  # Codec selection
  codecs:
    - mime: video/vp9
    - mime: video/h264
```

## Rollback Procedure

```bash
# Keep previous versions
docker images | grep atomassist

# Rollback to previous version
docker-compose down
docker-compose up -d atomassist-backend:v1.0.0 atomassist-frontend:v1.0.0

# Or using tags
git checkout v1.0.0
docker-compose up -d --build
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs postgres
docker-compose logs backend
docker-compose logs livekit

# Verify configurations
docker-compose config

# Restart services
docker-compose restart
```

### Connection Issues

```bash
# Test database connection
docker-compose exec backend psql -h postgres -U postgres -d atomassist

# Test LiveKit
curl http://localhost:7880/health

# Check network
docker network ls
docker network inspect atomassist_atomassist
```

### Performance Issues

```bash
# Monitor resources
docker stats

# Analyze database queries
# Enable slow query logging in PostgreSQL

# Check Node.js memory
docker exec backend node -e "console.log(require('v8').getHeapStatistics())"
```

## Support & Updates

For production support and updates, refer to:
- README.md
- ARCHITECTURE.md
- API documentation in code comments
