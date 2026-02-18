# Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB 6.0+ (local or Atlas)
- npm or yarn

---

## Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd enterprise-crisis-command-center

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crisis_command_center
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
```

#### Frontend
```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Production Deployment

### Option 1: Traditional VPS/Dedicated Server

#### Backend Deployment

1. **Build the application:**
```bash
cd backend
npm install --production
```

2. **Set up environment variables:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crisis_command_center
JWT_SECRET=generate-secure-random-string
JWT_REFRESH_SECRET=generate-secure-random-string
CORS_ORIGIN=https://yourdomain.com
```

3. **Use PM2 for process management:**
```bash
npm install -g pm2
pm2 start src/server.js --name crisis-api
pm2 save
pm2 startup
```

4. **Set up Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Frontend Deployment

1. **Build for production:**
```bash
cd frontend
npm run build
```

2. **Deploy to web server:**
```bash
# Copy dist folder to web server
scp -r dist/* user@yourserver:/var/www/html/
```

3. **Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

---

### Option 2: Containerized Deployment (Docker)

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/crisis_command_center
    depends_on:
      - mongo
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

---

### Option 3: Cloud Platforms

#### Heroku (Backend)
```bash
# Create Heroku app
heroku create crisis-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### MongoDB Atlas Setup
1. Create Atlas account
2. Create cluster (free tier M0)
3. Create database user
4. Get connection string
5. Whitelist IP addresses

---

## Security Checklist

- [ ] Change default JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Enable database authentication
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy

---

## Monitoring & Logging

### Winston Logger Configuration
Logs are stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### PM2 Monitoring
```bash
pm2 monit          # View logs and metrics
pm2 list           # List all processes
pm2 logs           # View logs
pm2 restart all    # Restart all processes
```

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string
   - Check firewall rules

2. **JWT Token Errors**
   - Verify JWT_SECRET matches
   - Check token expiration

3. **CORS Errors**
   - Update CORS_ORIGIN in environment

4. **Port Already in Use**
   - Change PORT in environment
   - Kill process using the port

---

## Backup & Restore

### Database Backup
```bash
# Using mongodump
mongodump --uri="mongodb://localhost:27017/crisis_command_center" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/crisis_command_center" ./backup
```

---

## Support

For deployment issues, contact: support@crisiscommand.example.com
