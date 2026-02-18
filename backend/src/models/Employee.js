import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  employeeId: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  // Skills
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    certified: {
      type: Boolean,
      default: false
    },
    certifiedUntil: Date
  }],
  
  // Availability
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline', 'on_leave'],
    default: 'available',
    index: true
  },
  availableFrom: Date,
  
  // Location
  currentLocation: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Work schedule
  schedule: {
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'shift'],
      default: 'full_time'
    },
    shiftStart: String,
    shiftEnd: String,
    workingDays: [Number] // 0-6, Sunday-Saturday
  },
  
  // Emergency contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Performance metrics
  metrics: {
    crisesHandled: { type: Number, default: 0 },
    avgResolutionTime: { type: Number, default: 0 }, // in hours
    rating: { type: Number, default: 0, min: 0, max: 5 },
    responseTime: { type: Number, default: 0 } // in minutes
  },
  
  // Certifications
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiresDate: Date,
    documentUrl: String
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  hireDate: Date,
  terminationDate: Date
}, {
  timestamps: true
});

// Compound indexes
employeeSchema.index({ company: 1, department: 1 });
employeeSchema.index({ company: 1, availability: 1 });
employeeSchema.index({ company: 1, 'skills.name': 1 });

// Create fullName virtual
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Create fullName virtual
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Generate employee ID before saving
employeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    const count = await this.constructor.countDocuments({ company: this.company });
    const prefix = 'EMP';
    const num = (count + 1).toString().padStart(5, '0');
    this.employeeId = `${prefix}-${num}`;
  }
  next();
});

// JSON transformation
employeeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
