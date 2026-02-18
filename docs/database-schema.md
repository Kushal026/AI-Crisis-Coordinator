# Database Schema Documentation

## Overview
This document describes the MongoDB schemas for the Enterprise Crisis Command Center multi-tenant SaaS platform.

## Data Models

### 1. Company
```javascript
{
  _id: ObjectId,
  name: String,              // Company name (required)
  slug: String,              // URL-friendly identifier
  email: String,             // Company email (required, unique)
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  logo: String,              // URL to logo image
  subscription: {
    tier: String,            // 'free' | 'pro' | 'enterprise'
    status: String,          // 'active' | 'suspended' | 'cancelled'
    startDate: Date,
    endDate: Date,
    maxUsers: Number,
    maxCrises: Number
  },
  settings: {
    timezone: String,
    currency: String,
    dateFormat: String,
    notifications: {
      email: Boolean,
      push: Boolean,
      sms: Boolean
    }
  },
  usage: {
    users: Number,
    crises: Number,
    storage: Number,
    apiCalls: Number
  },
  createdBy: ObjectId,       // Reference to User
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug: 1` (unique)
- `subscription.status: 1`

---

### 2. User
```javascript
{
  _id: ObjectId,
  email: String,             // Required, unique per company
  password: String,          // Hashed (bcrypt)
  firstName: String,
  lastName: String,
  fullName: String,          // Virtual
  phone: String,
  avatar: String,
  role: String,              // 'super_admin' | 'company_admin' | 'manager' | 'employee'
  company: ObjectId,         // Reference to Company (required)
  department: String,
  position: String,
  isEmailVerified: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    userAgent: String,
    ipAddress: String
  }],
  preferences: {
    theme: String,           // 'light' | 'dark' | 'system'
    notifications: {
      email: Boolean,
      push: Boolean
    },
    dashboardLayout: Mixed
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `company: 1, email: 1` (unique compound)
- `role: 1`

---

### 3. Crisis
```javascript
{
  _id: ObjectId,
  company: ObjectId,         // Reference to Company (required)
  crisisId: String,           // Auto-generated (e.g., CRS-2024-00001)
  title: String,
  description: String,
  category: String,          // 'natural_disaster' | 'security' | 'technical' | etc.
  severity: String,          // 'critical' | 'high' | 'medium' | 'low'
  status: String,            // 'open' | 'investigating' | 'in_progress' | 'resolved' | 'closed'
  priority: Number,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  assignedTo: ObjectId,      // Reference to Employee
  assignedBy: ObjectId,      // Reference to User
  assignedAt: Date,
  assignmentReason: String,
  timeline: [{
    action: String,
    description: String,
    previousValue: Mixed,
    newValue: Mixed,
    user: ObjectId,          // Reference to User
    userName: String,
    createdAt: Date
  }],
  resources: [{
    resource: ObjectId,      // Reference to Equipment
    resourceName: String,
    quantity: Number,
    allocatedAt: Date,
    returnedAt: Date,
    status: String
  }],
  allocatedBudget: Number,
  actualCost: Number,
  budget: ObjectId,           // Reference to Budget
  riskScore: Number,         // 0-100
  riskFactors: [{
    factor: String,
    score: Number,
    weight: Number
  }],
  affectedAreas: [String],
  affectedPeople: Number,
  estimatedDamage: Number,
  resolution: {
    summary: String,
    rootCause: String,
    lessonsLearned: String,
    resolvedAt: Date,
    resolvedBy: ObjectId
  },
  isEscalated: Boolean,
  escalatedTo: ObjectId,
  escalationReason: String,
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: Date,
    uploadedBy: ObjectId
  }],
  relatedCrises: [ObjectId],
  openedAt: Date,
  updatedAt: Date,
  closedAt: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `company: 1, status: 1`
- `company: 1, severity: 1`
- `company: 1, createdAt: -1`
- `assignedTo: 1, status: 1`

---

### 4. Employee
```javascript
{
  _id: ObjectId,
  company: ObjectId,
  user: ObjectId,            // Reference to User (optional)
  employeeId: String,        // Auto-generated (e.g., EMP-00001)
  firstName: String,
  lastName: String,
  fullName: String,          // Virtual
  email: String,
  phone: String,
  department: String,
  position: String,
  skills: [{
    name: String,
    level: String,           // 'beginner' | 'intermediate' | 'expert'
    certified: Boolean,
    certifiedUntil: Date
  }],
  availability: String,     // 'available' | 'busy' | 'offline' | 'on_leave'
  availableFrom: Date,
  currentLocation: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  schedule: {
    type: String,           // 'full_time' | 'part_time' | 'contract' | 'shift'
    shiftStart: String,
    shiftEnd: String,
    workingDays: [Number]
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  metrics: {
    crisesHandled: Number,
    avgResolutionTime: Number,
    rating: Number,
    responseTime: Number
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiresDate: Date,
    documentUrl: String
  }],
  isActive: Boolean,
  hireDate: Date,
  terminationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `company: 1, department: 1`
- `company: 1, availability: 1`
- `company: 1, skills.name: 1`

---

### 5. Budget
```javascript
{
  _id: ObjectId,
  company: ObjectId,
  name: String,
  description: String,
  type: String,              // 'operational' | 'emergency' | 'capital' | 'department' | 'project'
  totalAmount: Number,
  allocatedAmount: Number,
  spentAmount: Number,
  remainingAmount: Number,
  startDate: Date,
  endDate: Date,
  department: String,
  relatedCrisis: ObjectId,
  transactions: [{
    type: String,            // 'allocation' | 'expense' | 'adjustment' | 'transfer'
    amount: Number,
    description: String,
    category: String,
    reference: ObjectId,
    referenceType: String,
    createdBy: ObjectId,
    createdAt: Date
  }],
  alerts: {
    warningThreshold: Number,
    criticalThreshold: Number,
    sendAlerts: Boolean
  },
  status: String,            // 'active' | 'frozen' | 'exhausted' | 'expired'
  isRecurring: Boolean,
  recurringInterval: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `company: 1, status: 1`
- `company: 1, type: 1`
- `company: 1, department: 1`

---

### 6. Equipment
```javascript
{
  _id: ObjectId,
  company: ObjectId,
  equipmentId: String,       // Auto-generated (e.g., EQP-00001)
  name: String,
  description: String,
  category: String,          // 'vehicle' | 'communication' | 'safety' | 'medical' | 'tools' | 'technology' | 'other'
  location: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    currentLocation: String
  },
  status: String,            // 'available' | 'in_use' | 'maintenance' | 'retired' | 'lost'
  quantity: Number,
  availableQuantity: Number,
  assignedTo: ObjectId,
  assignedToCrisis: ObjectId,
  maintenanceHistory: [{
    date: Date,
    type: String,
    description: String,
    cost: Number,
    performedBy: String,
    nextMaintenanceDate: Date
  }],
  nextMaintenanceDate: Date,
  purchaseDate: Date,
  purchaseCost: Number,
  warrantyExpiryDate: Date,
  specifications: Mixed,
  serialNumber: String,
  modelNumber: String,
  manufacturer: String,
  imageUrl: String,
  currentValue: Number,
  tags: [String],
  customFields: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `company: 1, status: 1`
- `company: 1, category: 1`
- `company: 1, assignedTo: 1`

---

## Multi-Tenant Isolation

All collections include a `company` field that references the Company model. This enables:

1. **Data Isolation**: Every query can be filtered by company ID
2. **Tenant Middleware**: Automatic injection of company filter
3. **Usage Tracking**: Per-company analytics and quotas

### Example Query with Tenant Isolation
```javascript
// Get all crises for a company
const crises = await Crisis.find({ company: companyId })
  .sort({ createdAt: -1 })
  .limit(20);
```

---

## Data Relationships

```
Company (1) ----< (N) User
Company (1) ----< (N) Crisis
Company (1) ----< (N) Employee
Company (1) ----< (N) Budget
Company (1) ----< (N) Equipment

User (1) ----< (N) Crisis (createdBy)
Employee (1) ----< (N) Crisis (assignedTo)
Crisis (1) ----< (N) Crisis Timeline
Crisis (1) ----< (N) Resource Allocation
Budget (1) ----< (N) Transaction
Employee (1) ----< (N) Maintenance History
```

---

## Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Max Users | 5 | 50 | Unlimited |
| Max Crises | 100 | 1,000 | Unlimited |
| Storage | 100MB | 1GB | 10GB |
| API Calls | 1,000/day | 10,000/day | Unlimited |
| Support | Email | Priority | Dedicated |
