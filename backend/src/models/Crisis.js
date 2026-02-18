import mongoose from 'mongoose';

const crisisLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'status_changed', 'assigned', 'escalated', 'resolved', 'comment', 'attachment']
  },
  description: {
    type: String,
    required: true
  },
  previousValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String
}, { timestamps: true });

const resourceAllocationSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  resourceName: String,
  quantity: {
    type: Number,
    default: 1
  },
  allocatedAt: {
    type: Date,
    default: Date.now
  },
  returnedAt: Date,
  status: {
    type: String,
    enum: ['allocated', 'returned'],
    default: 'allocated'
  }
});

const crisisSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  crisisId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Crisis title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Crisis description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['natural_disaster', 'security', 'technical', 'financial', 'operational', 'health_safety', 'reputational', 'other'],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  priority: {
    type: Number,
    default: 5
  },
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
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  assignmentReason: String,
  
  // Timeline and history
  timeline: [crisisLogSchema],
  
  // Resources
  resources: [resourceAllocationSchema],
  
  // Budget
  allocatedBudget: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  
  // Risk assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskFactors: [{
    factor: String,
    score: Number,
    weight: Number
  }],
  
  // Impact assessment
  affectedAreas: [String],
  affectedPeople: {
    type: Number,
    default: 0
  },
  estimatedDamage: {
    type: Number,
    default: 0
  },
  
  // Resolution
  resolution: {
    summary: String,
    rootCause: String,
    lessonsLearned: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Escalation
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationReason: String,
  
  // Tags
  tags: [String],
  
  // Attachments
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Related crises
  relatedCrises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crisis'
  }],
  
  // Timestamps
  openedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for company-based queries
crisisSchema.index({ company: 1, status: 1 });
crisisSchema.index({ company: 1, severity: 1 });
crisisSchema.index({ company: 1, createdAt: -1 });
crisisSchema.index({ assignedTo: 1, status: 1 });

// Generate crisis ID before saving
crisisSchema.pre('save', async function(next) {
  if (this.isNew && !this.crisisId) {
    const count = await this.constructor.countDocuments({ company: this.company });
    const prefix = 'CRS';
    const year = new Date().getFullYear();
    const num = (count + 1).toString().padStart(5, '0');
    this.crisisId = `${prefix}-${year}-${num}`;
  }
  this.updatedAt = new Date();
  next();
});

// Calculate risk score
crisisSchema.methods.calculateRiskScore = function() {
  const severityScores = { critical: 100, high: 75, medium: 50, low: 25 };
  let score = severityScores[this.severity] || 50;
  
  // Factor in affected areas
  if (this.affectedAreas && this.affectedAreas.length > 0) {
    score += Math.min(this.affectedAreas.length * 5, 20);
  }
  
  // Factor in affected people
  if (this.affectedPeople > 100) score += 15;
  else if (this.affectedPeople > 10) score += 10;
  else if (this.affectedPeople > 0) score += 5;
  
  this.riskScore = Math.min(score, 100);
  return this.riskScore;
};

// JSON transformation
crisisSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Crisis = mongoose.model('Crisis', crisisSchema);

export default Crisis;
