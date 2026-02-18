# How to Run the Backend

## Prerequisites
- Node.js 18+ installed
- MongoDB installed (local or Atlas cloud)

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

---

## Step 2: Configure Environment

1. Copy the example env file:
```bash
copy .env.example .env
```

2. Edit `.env` and add your MongoDB connection:
```env
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/crisis_command_center

# Option B: MongoDB Atlas (Cloud - Free Tier)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/crisis_command_center

# Generate secure random strings for JWT
JWT_SECRET=your-super-secret-key-abc123xyz
JWT_REFRESH_SECRET=your-refresh-secret-key-abc123xyz
```

---

## Step 3: Start MongoDB

**Local MongoDB:**
```bash
# If installed locally, start the service:
# Windows: Start MongoDB Service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Add to .env

---

## Step 4: Run the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

The server will start at **http://localhost:5000**

---

## Step 5: Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```
Response: `{"status":"healthy","timestamp":"...","uptime":...,"environment":"development"}`

**Register a new company:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@company.com\",\"password\":\"password123\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"companyName\":\"My Company\"}"
```

---

## Quick Start (If MongoDB is already running)

The backend is already configured to work without MongoDB for development - it will log errors but still start.

```bash
cd backend
npm install
npm run dev
```

Then open http://localhost:5000/health to verify it's working.
