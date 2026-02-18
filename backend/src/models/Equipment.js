import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  equipmentId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['vehicle', 'communication', 'safety', 'medical', 'tools', 'technology', 'other'],
    index: true
  },
  // Location
  location: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    currentLocation: String
  },
  // Status
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'retired', 'lost'],
    default: 'available',
    index: true
  },
  // Quantity
  quantity: {
    type: Number,
    default: 1,
    min: [0, 'Quantity cannot be negative']
  },
  availableQuantity: {
    type: Number,
    default: 1
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  assignedToCrisis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crisis'
  },
  // Maintenance
  maintenanceHistory: [{
    date: Date,
    type: {
      type: String,
      enum: ['preventive', 'corrective', 'inspection', 'upgrade']
    },
    description: String,
    cost: Number,
    performedBy: String,
    nextMaintenanceDate: Date
  }],
  nextMaintenanceDate: Date,
  // Purchase info
  purchaseDate: Date,
  purchaseCost: Number,
  warrantyExpiryDate: Date,
  // Specifications
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Serial number
  serialNumber: String,
  modelNumber: String,
  manufacturer: String,
  // Image
  imageUrl: String,
  // Value
  currentValue: {
    type: Number,
    default: 0
  },
  // Tags
  tags: [String],
  // Custom fields
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes
equipmentSchema.index({ company: 1, status: 1 });
equipmentSchema.index({ company: 1, category: 1 });
equipmentSchema.index({ company: 1, assignedTo: 1 });

// Generate equipment ID before saving
equipmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.equipmentId) {
    const count = await this.constructor.countDocuments({ company: this.company });
    const prefix = 'EQP';
    const num = (count + 1).toString().padStart(5, '0');
    this.equipmentId = `${prefix}-${num}`;
  }
  next();
});

// Calculate available quantity
equipmentSchema.methods.calculateAvailable = function() {
  // This would need to track allocations
  this.availableQuantity = this.quantity; // Simplified for now
  return this.availableQuantity;
};

// Check if available
equipmentSchema.methods.isAvailable = function(requestedQuantity = 1) {
  return this.status === 'available' && this.availableQuantity >= requestedQuantity;
};

// JSON transformation
equipmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
