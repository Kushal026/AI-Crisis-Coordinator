import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { protect, generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { asyncHandler, formatValidationErrors } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('companyName').notEmpty().withMessage('Company name is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new company and admin user
 * @access  Public
 */
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { email, password, firstName, lastName, companyName, phone } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Email already registered'
    });
  }
  
  // Create company
  const company = await Company.create({
    name: companyName,
    email: email.toLowerCase(),
    phone,
    subscription: {
      tier: 'free',
      status: 'active',
      maxUsers: 5,
      maxCrises: 100
    }
  });
  
  // Create admin user
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    company: company._id,
    role: 'company_admin',
    isEmailVerified: true
  });
  
  // Update company with admin user
  company.createdBy = user._id;
  await company.save();
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  // Save refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });
  await user.save();
  
  // Populate company for response
  await user.populate('company');
  
  logger.info(`New company registered: ${company.name} by ${user.email}`);
  
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      },
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        subscription: company.subscription
      },
      accessToken,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  
  const { email, password } = req.body;
  
  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('company');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Check if account is locked
  if (user.isLocked()) {
    return res.status(401).json({
      success: false,
      error: 'Account temporarily locked. Please try again later.'
    });
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Reset login attempts
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  // Save refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });
  
  await user.save();
  
  logger.info(`User logged in: ${user.email}`);
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences
      },
      company: {
        id: user.company._id,
        name: user.company.name,
        slug: user.company.slug,
        subscription: user.company.subscription
      },
      accessToken,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }
  
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if refresh token exists
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
    
    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(user._id);
    
    // Save new refresh token
    user.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });
    
    await user.save();
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== refreshToken);
    await req.user.save();
  }
  
  logger.info(`User logged out: ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        department: user.department,
        position: user.position
      },
      company: {
        id: user.company._id,
        name: user.company.name,
        slug: user.company.slug,
        subscription: user.company.subscription,
        settings: user.company.settings
      }
    }
  });
}));

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, preferences } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  
  await user.save();
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        preferences: user.preferences
      }
    }
  });
}));

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Update password
 * @access  Private
 */
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }
  
  user.password = newPassword;
  await user.save();
  
  logger.info(`Password updated for user: ${user.email}`);
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

export default router;
