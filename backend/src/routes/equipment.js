import express from 'express';
import { body, validationResult } from 'express-validator';
import Equipment from '../models/Equipment.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantFilter } from '../middleware/tenant.js';
import { asyncHandler, formatValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(tenantFilter(Equipment));

/**
 * @route   GET /api/v1/equipment
 * @desc    Get all equipment
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    category,
    status,
    search
  } = req.query;
  
  const query = { company: req.company._id };
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
      { equipmentId: { $regex: search, $options: 'i' } }
    ];
  }
  
  const equipment = await Equipment.find(query)
    .populate('assignedTo', 'firstName lastName')
    .populate('assignedToCrisis', 'crisisId title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  const total = await Equipment.countDocuments(query);
  
  res.json({
    success: true,
    data: equipment,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   POST /api/v1/equipment
 * @desc    Create new equipment
 * @access  Private (Manager+)
 */
router.post('/', authorize('company_admin', 'manager', 'super_admin'), [
  body('name').notEmpty().withMessage('Equipment name is required'),
  body('category').isIn(['vehicle', 'communication', 'safety', 'medical', 'tools', 'technology', 'other']).withMessage('Invalid category')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { name, description, category, location, quantity, specifications, serialNumber, modelNumber, manufacturer, purchaseDate, purchaseCost, warrantyExpiryDate, imageUrl } = req.body;
  
  const equipment = await Equipment.create({
    company: req.company._id,
    name,
    description,
    category,
    location,
    quantity: quantity || 1,
    availableQuantity: quantity || 1,
    specifications,
    serialNumber,
    modelNumber,
    manufacturer,
    purchaseDate,
    purchaseCost,
    warrantyExpiryDate,
    imageUrl,
    status: 'available'
  });
  
  res.status(201).json({
    success: true,
    data: equipment
  });
}));

/**
 * @route   GET /api/v1/equipment/:id
 * @desc    Get equipment by ID
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const equipment = await Equipment.findOne({
    _id: req.params.id,
    company: req.company._id
  })
    .populate('assignedTo', 'firstName lastName email phone')
    .populate('assignedToCrisis', 'crisisId title status severity');
  
  if (!equipment) {
    return res.status(404).json({
      success: false,
      error: 'Equipment not found'
    });
  }
  
  res.json({
    success: true,
    data: equipment
  });
}));

/**
 * @route   PUT /api/v1/equipment/:id
 * @desc    Update equipment
 * @access  Private (Manager+)
 */
router.put('/:id', authorize('company_admin', 'manager', 'super_admin'), asyncHandler(async (req, res) => {
  const { name, description, category, location, quantity, specifications, status } = req.body;
  
  const equipment = await Equipment.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!equipment) {
    return res.status(404).json({
      success: false,
      error: 'Equipment not found'
    });
  }
  
  if (name) equipment.name = name;
  if (description) equipment.description = description;
  if (category) equipment.category = category;
  if (location) equipment.location = location;
  if (quantity) {
    equipment.quantity = quantity;
    equipment.availableQuantity = quantity;
  }
  if (specifications) equipment.specifications = specifications;
  if (status) equipment.status = status;
  
  await equipment.save();
  
  res.json({
    success: true,
    data: equipment
  });
}));

/**
 * @route   DELETE /api/v1/equipment/:id
 * @desc    Delete equipment
 * @access  Private (Company Admin)
 */
router.delete('/:id', authorize('company_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const equipment = await Equipment.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!equipment) {
    return res.status(404).json({
      success: false,
      error: 'Equipment not found'
    });
  }
  
  if (equipment.status === 'in_use') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete equipment that is currently in use'
    });
  }
  
  await equipment.deleteOne();
  
  res.json({
    success: true,
    message: 'Equipment deleted successfully'
  });
}));

/**
 * @route   POST /api/v1/equipment/:id/maintenance
 * @desc    Add maintenance record
 * @access  Private (Manager+)
 */
router.post('/:id/maintenance', authorize('company_admin', 'manager', 'super_admin'), [
  body('type').isIn(['preventive', 'corrective', 'inspection', 'upgrade']).withMessage('Invalid maintenance type'),
  body('description').notEmpty().withMessage('Description is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { type, description, cost, performedBy, nextMaintenanceDate } = req.body;
  
  const equipment = await Equipment.findOne({
    _id: req.params.id,
    company: req.company._id
  });
  
  if (!equipment) {
    return res.status(404).json({
      success: false,
      error: 'Equipment not found'
    });
  }
  
  equipment.maintenanceHistory.push({
    date: new Date(),
    type,
    description,
    cost: cost || 0,
    performedBy,
    nextMaintenanceDate
  });
  
  if (nextMaintenanceDate) {
    equipment.nextMaintenanceDate = nextMaintenanceDate;
  }
  
  // Set to available after maintenance if was in maintenance
  if (equipment.status === 'maintenance') {
    equipment.status = 'available';
  }
  
  await equipment.save();
  
  res.json({
    success: true,
    data: equipment
  });
}));

export default router;
