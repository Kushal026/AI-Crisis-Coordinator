import express from 'express';
import { body, validationResult } from 'express-validator';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Crisis from '../models/Crisis.js';
import Employee from '../models/Employee.js';
import { protect, authorize, superAdminOnly } from '../middleware/auth.js';
import { tenantFilter } from '../middleware/tenant.js';
import { asyncHandler, formatValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply tenant filter to all routes
router.use(protect);
router.use(tenantFilter(Company));

/**
 * @route   GET /api/v1/companies
 * @desc    Get company details
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const company = await Company.findById(req.company._id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      error: 'Company not found'
    });
  }
  
  // Get usage stats
  const [userCount, crisisCount, employeeCount] = await Promise.all([
    User.countDocuments({ company: company._id }),
    Crisis.countDocuments({ company: company._id }),
    Employee.countDocuments({ company: company._id })
  ]);
  
  res.json({
    success: true,
    data: {
      ...company.toJSON(),
      usage: {
        users: userCount,
        crises: crisisCount,
        employees: employeeCount
      }
    }
  });
}));

/**
 * @route   PUT /api/v1/companies
 * @desc    Update company
 * @access  Private (Company Admin)
 */
router.put('/', authorize('company_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { name, phone, address, logo, settings } = req.body;
  
  const company = await Company.findById(req.company._id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      error: 'Company not found'
    });
  }
  
  if (name) company.name = name;
  if (phone) company.phone = phone;
  if (address) company.address = address;
  if (logo) company.logo = logo;
  if (settings) company.settings = { ...company.settings, ...settings };
  
  await company.save();
  
  res.json({
    success: true,
    data: company
  });
}));

/**
 * @route   GET /api/v1/companies/analytics
 * @desc    Get company analytics
 * @access  Private
 */
router.get('/analytics', asyncHandler(async (req, res) => {
  const companyId = req.company._id;
  
  // Get crisis stats
  const crisisStats = await Crisis.aggregate([
    { $match: { company: companyId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get severity distribution
  const severityStats = await Crisis.aggregate([
    { $match: { company: companyId } },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get employee availability
  const employeeStats = await Employee.aggregate([
    { $match: { company: companyId, isActive: true } },
    {
      $group: {
        _id: '$availability',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get recent crises
  const recentCrises = await Crisis.find({ company: companyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('assignedTo', 'firstName lastName');
  
  // Get category distribution
  const categoryStats = await Crisis.aggregate([
    { $match: { company: companyId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      crises: {
        byStatus: crisisStats,
        bySeverity: severityStats,
        byCategory: categoryStats,
        total: crisisStats.reduce((sum, s) => sum + s.count, 0)
      },
      employees: {
        byAvailability: employeeStats,
        total: employeeStats.reduce((sum, s) => sum + s.count, 0)
      },
      recentCrises
    }
  });
}));

/**
 * @route   GET /api/v1/companies/users
 * @desc    Get company users
 * @access  Private
 */
router.get('/users', authorize('company_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  
  const query = { company: req.company._id };
  
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  const total = await User.countDocuments(query);
  
  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   POST /api/v1/companies/users
 * @desc    Create a new user
 * @access  Private (Company Admin)
 */
router.post('/users', authorize('company_admin', 'super_admin'), [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['company_admin', 'manager', 'employee']).withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { email, password, firstName, lastName, role, department, position, phone } = req.body;
  
  // Check if email exists
  const existingUser = await User.findOne({ email: email.toLowerCase(), company: req.company._id });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Email already exists in this company'
    });
  }
  
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    role,
    company: req.company._id,
    department,
    position,
    phone
  });
  
  res.status(201).json({
    success: true,
    data: user
  });
}));

/**
 * @route   PUT /api/v1/companies/subscription
 * @desc    Update subscription
 * @access  Private (Company Admin)
 */
router.put('/subscription', authorize('company_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { tier } = req.body;
  
  const company = await Company.findById(req.company._id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      error: 'Company not found'
    });
  }
  
  const tierLimits = {
    free: { maxUsers: 5, maxCrises: 100 },
    pro: { maxUsers: 50, maxCrises: 1000 },
    enterprise: { maxUsers: 999999, maxCrises: 999999 }
  };
  
  company.subscription.tier = tier;
  company.subscription.maxUsers = tierLimits[tier].maxUsers;
  company.subscription.maxCrises = tierLimits[tier].maxCrises;
  
  await company.save();
  
  res.json({
    success: true,
    data: company.subscription
  });
}));

export default router;
