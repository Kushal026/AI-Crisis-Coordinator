import express from 'express';
import { body, validationResult } from 'express-validator';
import Budget from '../models/Budget.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantFilter } from '../middleware/tenant.js';
import { asyncHandler, formatValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(tenantFilter(Budget));

/**
 * @route   GET /api/v1/budgets
 * @desc    Get all budgets
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    type,
    department,
    status,
    search
  } = req.query;
  
  const query = { company: req.company._id };
  
  if (type) query.type = type;
  if (department) query.department = department;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const budgets = await Budget.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  const total = await Budget.countDocuments(query);
  
  res.json({
    success: true,
    data: budgets,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   POST /api/v1/budgets
 * @desc    Create a new budget
 * @access  Private (Manager+)
 */
router.post('/', authorize('company_admin', 'manager', 'super_admin'), [
  body('name').notEmpty().withMessage('Budget name is required'),
  body('totalAmount').isNumeric().withMessage('Total amount is required'),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').isISO8601().withMessage('End date is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { name, description, type, totalAmount, startDate, endDate, department, alerts } = req.body;
  
  const budget = await Budget.create({
    company: req.company._id,
    name,
    description,
    type: type || 'operational',
    totalAmount,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: totalAmount,
    startDate,
    endDate,
    department: department || 'all',
    alerts: alerts || {}
  });
  
  res.status(201).json({
    success: true,
    data: budget
  });
}));

/**
 * @route   GET /api/v1/budgets/:id
 * @desc    Get budget by ID
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    company: req.company._id
  }).populate('transactions.createdBy', 'firstName lastName');
  
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  res.json({
    success: true,
    data: budget
  });
}));

/**
 * @route   PUT /api/v1/budgets/:id
 * @desc    Update budget
 * @access  Private (Manager+)
 */
router.put('/:id', authorize('company_admin', 'manager', 'super_admin'), asyncHandler(async (req, res) => {
  const { name, description, type, alerts, status } = req.body;
  
  const budget = await Budget.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  if (name) budget.name = name;
  if (description) budget.description = description;
  if (type) budget.type = type;
  if (alerts) budget.alerts = { ...budget.alerts, ...alerts };
  if (status) budget.status = status;
  
  await budget.save();
  
  res.json({
    success: true,
    data: budget
  });
}));

/**
 * @route   DELETE /api/v1/budgets/:id
 * @desc    Delete budget
 * @access  Private (Company Admin)
 */
router.delete('/:id', authorize('company_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  if (budget.spentAmount > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete budget with transactions'
    });
  }
  
  await budget.deleteOne();
  
  res.json({
    success: true,
    message: 'Budget deleted successfully'
  });
}));

/**
 * @route   POST /api/v1/budgets/:id/transactions
 * @desc    Add transaction to budget
 * @access  Private (Manager+)
 */
router.post('/:id/transactions', authorize('company_admin', 'manager', 'super_admin'), [
  body('type').isIn(['allocation', 'expense', 'adjustment', 'transfer']).withMessage('Invalid transaction type'),
  body('amount').isNumeric().withMessage('Amount is required'),
  body('description').notEmpty().withMessage('Description is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { type, amount, description, category, reference, referenceType } = req.body;
  
  const budget = await Budget.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  // Check if budget can accommodate expense
  if (type === 'expense' && budget.remainingAmount < amount) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient budget. Transaction would exceed available funds.'
    });
  }
  
  const transaction = await budget.addTransaction({
    type,
    amount,
    description,
    category,
    reference,
    referenceType,
    createdBy: req.user._id
  });
  
  res.status(201).json({
    success: true,
    data: transaction
  });
}));

/**
 * @route   GET /api/v1/budgets/:id/transactions
 * @desc    Get budget transactions
 * @access  Private
 */
router.get('/:id/transactions', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;
  
  const budget = await Budget.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  let transactions = budget.transactions.sort((a, b) => b.createdAt - a.createdAt);
  
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: transactions.length,
      pages: Math.ceil(transactions.length / limit)
    }
  });
}));

export default router;
