import express from 'express';
import Crisis from '../models/Crisis.js';
import Employee from '../models/Employee.js';
import Budget from '../models/Budget.js';
import Equipment from '../models/Equipment.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);

// Helper to get company ID from request
const getCompanyId = (req) => {
  if (req.company && req.company._id) {
    return req.company._id;
  }
  if (req.user && req.user.company) {
    return req.user.company._id || req.user.company;
  }
  return null;
};

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard analytics
 * @access  Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req);
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: 'Company not found in request'
    });
  }
  
  // Crisis statistics
  const crisisStats = await Crisis.aggregate([
    { $match: { company: companyId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgRiskScore: { $avg: '$riskScore' }
      }
    }
  ]);
  
  // Employee statistics
  const employeeStats = await Employee.aggregate([
    { $match: { company: companyId, isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] } },
        busy: { $sum: { $cond: [{ $eq: ['$availability', 'busy'] }, 1, 0] } },
        offline: { $sum: { $cond: [{ $eq: ['$availability', 'offline'] }, 1, 0] } }
      }
    }
  ]);
  
  // Budget overview
  const budgetStats = await Budget.aggregate([
    { $match: { company: companyId, status: 'active' } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        allocated: { $sum: '$allocatedAmount' },
        spent: { $sum: '$spentAmount' }
      }
    }
  ]);
  
  // Equipment availability
  const equipmentStats = await Equipment.aggregate([
    { $match: { company: companyId } },
    {
      $group: {
        _id: null,
        total: { $sum: '$quantity' },
        available: { $sum: '$availableQuantity' },
        inUse: { $sum: { $subtract: ['$quantity', '$availableQuantity'] } }
      }
    }
  ]);
  
  // Recent crises
  const recentCrises = await Crisis.find({ company: companyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('assignedTo', 'firstName lastName')
    .select('crisisId title severity status createdAt');
  
  // High risk crises
  const highRiskCrises = await Crisis.find({ 
    company: companyId,
    riskScore: { $gte: 70 },
    status: { $nin: ['resolved', 'closed'] }
  })
    .sort({ riskScore: -1 })
    .limit(5)
    .select('crisisId title severity riskScore status');
  
  // Category distribution
  const categoryDistribution = await Crisis.aggregate([
    { $match: { company: companyId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      crises: crisisStats[0] || {
        total: 0, critical: 0, high: 0, medium: 0, low: 0,
        open: 0, inProgress: 0, resolved: 0, avgRiskScore: 0
      },
      employees: employeeStats[0] || { total: 0, available: 0, busy: 0, offline: 0 },
      budgets: budgetStats[0] || { total: 0, allocated: 0, spent: 0 },
      equipment: equipmentStats[0] || { total: 0, available: 0, inUse: 0 },
      recentCrises,
      highRiskCrises,
      categoryDistribution
    }
  });
}));

/**
 * @route   GET /api/v1/analytics/risks
 * @desc    Get risk analytics
 * @access  Private
 */
router.get('/risks', asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req);
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: 'Company not found in request'
    });
  }
  
  // Risk distribution
  const riskDistribution = await Crisis.aggregate([
    { $match: { company: companyId, status: { $nin: ['resolved', 'closed'] } } },
    {
      $bucket: {
        groupBy: '$riskScore',
        boundaries: [0, 25, 50, 75, 100],
        default: 'Other',
        output: { count: { $sum: 1 } }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      riskDistribution
    }
  });
}));

/**
 * @route   GET /api/v1/analytics/reports
 * @desc    Generate reports
 * @access  Private
 */
router.get('/reports', asyncHandler(async (req, res) => {
  const { type = 'summary', startDate, endDate } = req.query;
  const companyId = getCompanyId(req);
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: 'Company not found in request'
    });
  }
  
  let reportData = {};
  
  switch (type) {
    case 'summary':
      const summary = await Crisis.aggregate([
        { $match: { company: companyId } },
        {
          $group: {
            _id: null,
            totalCrises: { $sum: 1 },
            totalBudget: { $sum: '$allocatedBudget' },
            totalActualCost: { $sum: '$actualCost' }
          }
        }
      ]);
      reportData = summary[0] || {};
      break;
      
    case 'performance':
      const performance = await Crisis.find({ company: companyId, status: 'closed' })
        .sort({ closedAt: -1 })
        .limit(100);
      reportData = { crises: performance, count: performance.length };
      break;
      
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid report type'
      });
  }
  
  res.json({
    success: true,
    data: reportData,
    metadata: {
      type,
      generatedAt: new Date(),
      dateRange: { startDate, endDate }
    }
  });
}));

export default router;
