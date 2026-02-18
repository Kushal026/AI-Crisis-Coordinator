import { logger } from '../utils/logger.js';

/**
 * Tenant Isolation Middleware
 * Ensures all database queries are scoped to the user's company
 */

// Extract company ID from authenticated user
export const getTenantId = (req) => {
  if (req.company) {
    return req.company._id || req.company;
  }
  return null;
};

// Middleware to add company filter to queries
export const tenantFilter = (Model) => {
  return async (req, res, next) => {
    try {
      const companyId = getTenantId(req);
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company context not found'
        });
      }
      
      // Add company to query params
      req.tenantFilter = { company: companyId };
      req.tenantId = companyId;
      
      next();
    } catch (error) {
      logger.error('Tenant filter error:', error);
      return res.status(500).json({
        success: false,
        error: 'Tenant isolation error'
      });
    }
  };
};

// Middleware to verify company access
export const verifyCompanyAccess = (paramName = 'companyId') => {
  return async (req, res, next) => {
    try {
      const requestedCompanyId = req.params[paramName] || req.body.company;
      const userCompanyId = getTenantId(req);
      
      // Super admin can access any company
      if (req.user.role === 'super_admin') {
        return next();
      }
      
      // Other users can only access their own company
      if (requestedCompanyId && requestedCompanyId !== userCompanyId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this company resource'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Verify company access error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

// Pre-save hook for models - automatically add company
export const addCompanyToDoc = (companyId) => {
  return async (doc) => {
    if (!doc.company) {
      doc.company = companyId;
    }
    return doc;
  };
};

// Query helper - filter by company
export const filterByCompany = (query, companyId) => {
  return query.where('company').equals(companyId);
};

// Aggregate helper - match by company
export const matchByCompany = (companyId) => {
  return { $match: { company: companyId } };
};

export default {
  getTenantId,
  tenantFilter,
  verifyCompanyAccess,
  addCompanyToDoc,
  filterByCompany,
  matchByCompany
};
