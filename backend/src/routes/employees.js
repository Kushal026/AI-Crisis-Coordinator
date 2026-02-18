import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';
import Crisis from '../models/Crisis.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantFilter } from '../middleware/tenant.js';
import { asyncHandler, formatValidationErrors } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication and tenant filter
router.use(protect);
router.use(tenantFilter(Employee));

/**
 * @route   GET /api/v1/employees
 * @desc    Get all employees
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    department, 
    availability,
    skill,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { company: req.company._id, isActive: true };
  
  if (department) query.department = department;
  if (availability) query.availability = availability;
  if (skill) query['skills.name'] = skill;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }
  
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  const employees = await Employee.find(query)
    .populate('user', 'firstName lastName email')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  const total = await Employee.countDocuments(query);
  
  res.json({
    success: true,
    data: employees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   POST /api/v1/employees
 * @desc    Create a new employee
 * @access  Private (Manager+)
 */
router.post('/', authorize('company_admin', 'manager', 'super_admin'), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { firstName, lastName, email, phone, department, position, skills, schedule, emergencyContact } = req.body;
  
  const employee = await Employee.create({
    company: req.company._id,
    firstName,
    lastName,
    email,
    phone,
    department,
    position,
    skills: skills || [],
    schedule,
    emergencyContact,
    availability: 'available',
    hireDate: new Date()
  });
  
  logger.info(`Employee created: ${employee.employeeId} by ${req.user.email}`);
  
  res.status(201).json({
    success: true,
    data: employee
  });
}));

/**
 * @route   GET /api/v1/employees/:id
 * @desc    Get employee by ID
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({
    _id: req.params.id,
    company: req.company._id
  })
    .populate('user', 'firstName lastName email')
    .populate('assignedToCrisis', 'crisisId title status severity');
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found'
    });
  }
  
  res.json({
    success: true,
    data: employee
  });
}));

/**
 * @route   PUT /api/v1/employees/:id
 * @desc    Update employee
 * @access  Private (Manager+)
 */
router.put('/:id', authorize('company_admin', 'manager', 'super_admin'), asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, department, position, skills, schedule, emergencyContact } = req.body;
  
  const employee = await Employee.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found'
    });
  }
  
  if (firstName) employee.firstName = firstName;
  if (lastName) employee.lastName = lastName;
  if (phone) employee.phone = phone;
  if (department) employee.department = department;
  if (position) employee.position = position;
  if (skills) employee.skills = skills;
  if (schedule) employee.schedule = schedule;
  if (emergencyContact) employee.emergencyContact = emergencyContact;
  
  await employee.save();
  
  res.json({
    success: true,
    data: employee
  });
}));

/**
 * @route   DELETE /api/v1/employees/:id
 * @desc    Delete (deactivate) employee
 * @access  Private (Company Admin)
 */
router.delete('/:id', authorize('company_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found'
    });
  }
  
  // Check if employee has active crises
  const activeCrises = await Crisis.countDocuments({
    assignedTo: employee._id,
    status: { $nin: ['resolved', 'closed'] }
  });
  
  if (activeCrises > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot deactivate employee with ${activeCrises} active crises. Please reassign them first.`
    });
  }
  
  employee.isActive = false;
  employee.terminationDate = new Date();
  await employee.save();
  
  logger.info(`Employee deactivated: ${employee.employeeId} by ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Employee deactivated successfully'
  });
}));

/**
 * @route   PUT /api/v1/employees/:id/availability
 * @desc    Update employee availability
 * @access  Private
 */
router.put('/:id/availability', asyncHandler(async (req, res) => {
  const { availability, availableFrom } = req.body;
  
  const employee = await Employee.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found'
    });
  }
  
  if (availability) {
    employee.availability = availability;
  }
  if (availableFrom) {
    employee.availableFrom = availableFrom;
  }
  
  await employee.save();
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`company:${req.company._id}`).emit('employee:availability', {
      employeeId: employee._id,
      availability: employee.availability
    });
  }
  
  res.json({
    success: true,
    data: employee
  });
}));

/**
 * @route   GET /api/v1/employees/:id/crises
 * @desc    Get employee's assigned crises
 * @access  Private
 */
router.get('/:id/crises', asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const query = {
    assignedTo: req.params.id,
    company: req.company._id
  };
  
  if (status) {
    query.status = status;
  }
  
  const crises = await Crisis.find(query)
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: crises
  });
}));

/**
 * @route   GET /api/v1/employees/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/meta/departments', asyncHandler(async (req, res) => {
  const departments = await Employee.distinct('department', { 
    company: req.company._id,
    isActive: true 
  });
  
  res.json({
    success: true,
    data: departments
  });
}));

/**
 * @route   GET /api/v1/employees/skills
 * @desc    Get all skills
 * @access  Private
 */
router.get('/meta/skills', asyncHandler(async (req, res) => {
  const employees = await Employee.find({ 
    company: req.company._id,
    isActive: true 
  }).select('skills');
  
  const skillsSet = new Set();
  employees.forEach(emp => {
    emp.skills.forEach(skill => {
      skillsSet.add(skill.name);
    });
  });
  
  res.json({
    success: true,
    data: Array.from(skillsSet)
  });
}));

export default router;
