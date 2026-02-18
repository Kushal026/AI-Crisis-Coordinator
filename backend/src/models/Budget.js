import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['allocation', 'expense', 'adjustment', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  category: String,
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'transactions.referenceType'
  },
  referenceType: {
    type: String,
    enum: ['Crisis', 'Equipment', null],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const budgetSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['operational', 'emergency', 'capital', 'department', 'project'],
    default: 'operational'
  },
  // Amounts
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Budget amount cannot be negative']
  },
  allocatedAmount: {
    type: Number,
    default: 0
  },
  spentAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: function() {
      return this.totalAmount - this.allocatedAmount;
    }
  },
  // Period
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Department scope
  department: {
    type: String,
    default: 'all'
  },
  // Related crisis (if emergency budget)
  relatedCrisis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crisis'
  },
  // Transactions
  transactions: [transactionSchema],
  // Alerts
  alerts: {
    warningThreshold: {
      type: Number,
      default: 80 // percentage
    },
    criticalThreshold: {
      type: Number,
      default: 95 // percentage
    },
    sendAlerts: {
      type: Boolean,
      default: true
    }
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'frozen', 'exhausted', 'expired'],
    default: 'active'
  },
  // Recurring
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  }
}, {
  timestamps: true
});

// Compound indexes
budgetSchema.index({ company: 1, status: 1 });
budgetSchema.index({ company: 1, type: 1 });
budgetSchema.index({ company: 1, department: 1 });

// Calculate remaining amount
budgetSchema.methods.calculateRemaining = function() {
  this.remainingAmount = this.totalAmount - this.spentAmount;
  return this.remainingAmount;
};

// Check if budget is exhausted
budgetSchema.methods.isExhausted = function() {
  return this.spentAmount >= this.totalAmount;
};

// Check alert thresholds
budgetSchema.methods.getAlertLevel = function() {
  const percentage = (this.spentAmount / this.totalAmount) * 100;
  
  if (percentage >= this.alerts.criticalThreshold) {
    return 'critical';
  } else if (percentage >= this.alerts.warningThreshold) {
    return 'warning';
  }
  return 'normal';
};

// Add transaction
budgetSchema.methods.addTransaction = async function(transactionData) {
  this.transactions.push(transactionData);
  
  if (transactionData.type === 'expense') {
    this.spentAmount += transactionData.amount;
  } else if (transactionData.type === 'allocation') {
    this.allocatedAmount += transactionData.amount;
  } else if (transactionData.type === 'adjustment' && transactionData.amount > 0) {
    this.totalAmount += transactionData.amount;
  }
  
  this.calculateRemaining();
  await this.save();
  
  return this.transactions[this.transactions.length - 1];
};

// JSON transformation
budgetSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    ret.utilizationPercentage = ret.totalAmount > 0 
      ? Math.round((ret.spentAmount / ret.totalAmount) * 100) 
      : 0;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
