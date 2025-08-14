const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

// Admin dashboard routes - all require admin role
router.get('/dashboard', 
  requireRole(['admin']), 
  auditLog('GET_ADMIN_DASHBOARD', 'admin'),
  adminController.getAdminDashboard
);

router.get('/stats', 
  requireRole(['admin']), 
  auditLog('GET_ADMIN_STATS', 'admin'),
  adminController.getAdminStats
);

router.get('/companies/overview', 
  requireRole(['admin']), 
  auditLog('GET_ADMIN_COMPANIES_OVERVIEW', 'admin'),
  adminController.getAdminCompaniesOverview
);

module.exports = router;
