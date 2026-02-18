import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      
      // Get user from token
      const user = await User.findById(decoded.id).populate('company');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
      }
      
      req.user = user;
      req.company = user.company;
      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user belongs to company
export const checkCompany = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.body.company;
    
    if (companyId && companyId !== req.user.company._id.toString()) {
      // For company admins, they can only access their own company
      if (req.user.role === 'company_admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this company'
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Check company middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
};

// Super admin only
export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }
  next();
};

// Generate tokens
export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
};
