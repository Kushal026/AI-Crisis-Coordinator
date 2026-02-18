import express from 'express';
import { body, validationResult } from 'express-validator';
import Crisis from '../models/Crisis.js';
import Employee from '../models/Employee.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantFilter } from '../middleware/tenant.js';
import { asyncHandler, formatValidationErrors } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication and tenant filter
router.use(protect);
router.use(tenantFilter(Crisis));

/**
 * @route   GET /api/v1/crises
 * @desc    Get all crises
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    severity, 
    category, 
    assignedTo,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { company: req.company._id };
  
  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { crisisId: { $regex: search, $options: 'i' } }
    ];
  }
  
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  const crises = await Crisis.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  const total = await Crisis.countDocuments(query);
  
  res.json({
    success: true,
    data: crises,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   POST /api/v1/crises
 * @desc    Create a new crisis
 * @access  Private
 */
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['natural_disaster', 'security', 'technical', 'financial', 'operational', 'health_safety', 'reputational', 'other']).withMessage('Invalid category'),
  body('severity').isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid severity')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { title, description, category, severity, location, affectedAreas, tags } = req.body;
  
  const crisis = await Crisis.create({
    company: req.company._id,
    title,
    description,
    category,
    severity,
    location,
    affectedAreas: affectedAreas || [],
    tags: tags || [],
    createdBy: req.user._id,
    status: 'open',
    openedAt: new Date(),
    timeline: [{
      action: 'created',
      description: 'Crisis created',
      user: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`
    }]
  });
  
  // Calculate risk score
  crisis.calculateRiskScore();
  await crisis.save();
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`company:${req.company._id}`).emit('crisis:created', crisis);
  }
  
  logger.info(`Crisis created: ${crisis.crisisId} by ${req.user.email}`);
  
  res.status(201).json({
    success: true,
    data: crisis
  });
}));

/**
 * @route   GET /api/v1/crises/:id
 * @desc    Get crisis by ID
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const crisis = await Crisis.findOne({
    _id: req.params.id,
    company: req.company._id
  })
    .populate('assignedTo', 'firstName lastName email phone')
    .populate('createdBy', 'firstName lastName')
    .populate('assignedBy', 'firstName lastName')
    .populate('resources.resource', 'name equipmentId category')
    .populate('budget', 'name totalAmount');
  
  if (!crisis) {
    return res.status(404).json({
      success: false,
      error: 'Crisis not found'
    });
  }
  
  res.json({
    success: true,
    data: crisis
  });
}));

/**
 * @route   PUT /api/v1/crises/:id
 * @desc    Update crisis
 * @access  Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, description, category, severity, status, location, affectedAreas, tags } = req.body;
  
  const crisis = await Crisis.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!crisis) {
    return res.status(404).json({
      success: false,
      error: 'Crisis not found'
    });
  }
  
  // Track changes for timeline
  if (status && status !== crisis.status) {
    crisis.timeline.push({
      action: 'status_changed',
      description: `Status changed from ${crisis.status} to ${status}`,
      previousValue: crisis.status,
      newValue: status,
      user: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`
    });
    crisis.status = status;
    
    if (status === 'resolved') {
      crisis.resolution = {
        summary: req.body.resolution?.summary,
        resolvedAt: new Date(),
        resolvedBy: req.user._id
      };
    } else if (status === 'closed') {
      crisis.closedAt = new Date();
    }
  }
  
  if (title) crisis.title = title;
  if (description) crisis.description = description;
  if (category) crisis.category = category;
  if (severity) crisis.severity = severity;
  if (location) crisis.location = location;
  if (affectedAreas) crisis.affectedAreas = affectedAreas;
  if (tags) crisis.tags = tags;
  
  // Recalculate risk score
  crisis.calculateRiskScore();
  
  await crisis.save();
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`company:${req.company._id}`).emit('crisis:updated', crisis);
  }
  
  res.json({
    success: true,
    data: crisis
  });
}));

/**
 * @route   DELETE /api/v1/crises/:id
 * @desc    Delete crisis
 * @access  Private (Manager+)
 */
router.delete('/:id', authorize('company_admin', 'manager', 'super_admin'), asyncHandler(async (req, res) => {
  const crisis = await Crisis.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!crisis) {
    return res.status(404).json({
      success: false,
      error: 'Crisis not found'
    });
  }
  
  await crisis.deleteOne();
  
  logger.info(`Crisis deleted: ${crisis.crisisId} by ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Crisis deleted successfully'
  });
}));

/**
 * @route   POST /api/v1/crises/:id/assign
 * @desc    Assign crisis to employee
 * @access  Private
 */
router.post('/:id/assign', [
  body('employeeId').notEmpty().withMessage('Employee ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { employeeId, reason } = req.body;
  
  const crisis = await Crisis.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!crisis) {
    return res.status(404).json({
      success: false,
      error: 'Crisis not found'
    });
  }
  
  const employee = await Employee.findOne({
    _id: employeeId,
    company: req.company._id,
    isActive: true
  });
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found or inactive'
    });
  }
  
  crisis.assignedTo = employee._id;
  crisis.assignedBy = req.user._id;
  crisis.assignedAt = new Date();
  crisis.assignmentReason = reason || `Assigned to ${employee.fullName}`;
  
  crisis.timeline.push({
    action: 'assigned',
    description: `Assigned to ${employee.fullName}`,
    previousValue: crisis.assignedTo?.toString(),
    newValue: employee._id.toString(),
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`
  });
  
  await crisis.save();
  
  // Update employee availability
  employee.availability = 'busy';
  await employee.save();
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`company:${req.company._id}`).emit('crisis:assigned', {
      crisis,
      employee: employee.fullName
    });
  }
  
  res.json({
    success: true,
    data: crisis
  });
}));

/**
 * @route   GET /api/v1/crises/:id/timeline
 * @desc    Get crisis timeline
 * @access  Private
 */
router.get('/:id/timeline', asyncHandler(async (req, res) => {
  const crisis = await Crisis.findOne({
    _id: req.params.id,
    company: req.company._id
  })
    .populate('timeline.user', 'firstName lastName')
    .select('timeline');
  
  if (!crisis) {
    return res.status(404).json({
      success: false,
      error: 'Crisis not found'
    });
  }
  
  res.json({
    success: true,
    data: crisis.timeline
  });
}));

/**
 * @route   POST /api/v1/crises/:id/escalate
 * @desc    Escalate crisis
 * @access  Private
 */
router.post('/:id/escalate', asyncHandler(async (req, res) => {
  const { reason, escalateTo } = req.body;
  
  const crisis = await Crisis.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!crisis) {
    return res.status(404).json({
      success: false,
      error: 'Crisis not found'
    });
  }
  
  crisis.isEscalated = true;
  crisis.escalationReason = reason;
  if (escalateTo) crisis.escalatedTo = escalateTo;
  
  crisis.timeline.push({
    action: 'escalated',
    description: reason || 'Crisis escalated',
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`
  });
  
  // Increase severity
  const severityLevels = ['low', 'medium', 'high', 'critical'];
  const currentIndex = severityLevels.indexOf(crisis.severity);
  if (currentIndex < severityLevels.length - 1) {
    crisis.severity = severityLevels[currentIndex + 1];
  }
  
  crisis.calculateRiskScore();
  await crisis.save();
  
  res.json({
    success: true,
    data: crisis
  });
}));

export default router;
