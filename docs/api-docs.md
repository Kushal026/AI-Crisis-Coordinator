# API Documentation

## Base URL
```
Production: https://api.crisiscommand.example.com/api/v1
Development: http://localhost:5000/api/v1
```

## Authentication
All API endpoints (except `/auth/register` and `/auth/login`) require authentication using JWT tokens.

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Error Responses
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Endpoints

### Authentication Routes

#### POST /auth/register
Register a new company and admin user.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "phone": "+1-555-0100"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "company_admin" },
    "company": { "id": "...", "name": "Acme Corp", "subscription": { "tier": "free" } },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "company_admin" },
    "company": { "id": "...", "name": "Acme Corp" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### POST /auth/refresh-token
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

---

#### POST /auth/logout
Logout and invalidate refresh token.

**Headers:** Authorization required

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

---

#### GET /auth/me
Get current user profile.

**Headers:** Authorization required

---

#### PUT /auth/profile
Update user profile.

**Headers:** Authorization required

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0100",
  "preferences": { "theme": "dark" }
}
```

---

### Company Routes

#### GET /companies
Get company details.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Acme Corp",
    "subscription": { "tier": "free", "maxUsers": 5 },
    "usage": { "users": 3, "crises": 12, "employees": 5 }
  }
}
```

---

#### GET /companies/analytics
Get company analytics.

**Headers:** Authorization required

---

#### GET /companies/users
List company users (admin only).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` - Filter by role
- `search` - Search by name/email

---

#### POST /companies/users
Create new user (admin only).

**Request:**
```json
{
  "email": "user@company.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "department": "Operations"
}
```

---

### Crisis Routes

#### GET /crises
List crises with filtering and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status
- `severity` - Filter by severity
- `category` - Filter by category
- `assignedTo` - Filter by assigned employee
- `search` - Search in title/description
- `sortBy` (default: createdAt)
- `sortOrder` (asc/desc)

---

#### POST /crises
Create a new crisis.

**Request:**
```json
{
  "title": "Server Outage",
  "description": "Main servers are down",
  "category": "technical",
  "severity": "critical",
  "location": {
    "address": "123 Main St",
    "city": "New York"
  },
  "affectedAreas": ["Data Center", "Office"],
  "tags": ["urgent", "infrastructure"]
}
```

---

#### GET /crises/:id
Get crisis details by ID.

---

#### PUT /crises/:id
Update crisis.

**Request:**
```json
{
  "status": "in_progress",
  "severity": "high",
  "resolution": { "summary": "Issue resolved" }
}
```

---

#### DELETE /crises/:id
Delete crisis (manager+ only).

---

#### POST /crises/:id/assign
Assign crisis to employee.

**Request:**
```json
{
  "employeeId": "...",
  "reason": "Assigned based on expertise"
}
```

---

#### POST /crises/:id/escalate
Escalate crisis.

**Request:**
```json
{
  "reason": "Requires senior management attention"
}
```

---

### Employee Routes

#### GET /employees
List employees.

**Query Parameters:**
- `page`, `limit`
- `department`
- `availability`
- `skill`
- `search`

---

#### POST /employees
Create new employee (manager+ only).

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "department": "IT",
  "position": "Technician",
  "skills": [
    { "name": "network", "level": "expert" }
  ]
}
```

---

#### PUT /employees/:id/availability
Update employee availability.

**Request:**
```json
{
  "availability": "busy"
}
```

---

### Budget Routes

#### GET /budgets
List budgets.

---

#### POST /budgets
Create new budget (manager+ only).

**Request:**
```json
{
  "name": "Emergency Fund",
  "type": "emergency",
  "totalAmount": 50000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "department": "all"
}
```

---

#### POST /budgets/:id/transactions
Add transaction to budget.

**Request:**
```json
{
  "type": "expense",
  "amount": 500,
  "description": "Equipment repair",
  "category": "maintenance"
}
```

---

### Equipment Routes

#### GET /equipment
List equipment.

---

#### POST /equipment
Add new equipment (manager+ only).

**Request:**
```json
{
  "name": "Emergency Generator",
  "category": "tools",
  "quantity": 2,
  "serialNumber": "GEN-001"
}
```

---

### Analytics Routes

#### GET /analytics/dashboard
Get dashboard analytics.

---

#### GET /analytics/risks
Get risk analytics.

---

#### GET /analytics/reports
Generate reports.

**Query Parameters:**
- `type` - 'summary' | 'performance' | 'employee'
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

---

## WebSocket Events

### Connection
```javascript
const socket = io(WS_URL, {
  auth: { token: accessToken }
});
```

### Events

#### crisis:created
Emitted when a new crisis is created.

```json
{
  "crisisId": "CRS-2024-00001",
  "title": "...",
  "severity": "critical"
}
```

#### crisis:updated
Emitted when a crisis is updated.

#### crisis:assigned
Emitted when a crisis is assigned.

#### employee:availability
Emitted when employee availability changes.

#### notification:new
Emitted for real-time notifications.

#### user:online / user:offline
Emitted when users come online/offline.

---

## Rate Limiting
- **Default:** 100 requests per 15 minutes
- **Exceed:** Returns 429 status

---

## Pagination
All list endpoints support pagination:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```
