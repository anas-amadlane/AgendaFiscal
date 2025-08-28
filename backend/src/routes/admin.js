const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

// Apply authentication to all admin routes
router.use(authenticateToken);

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

// Admin fiscal calendar management routes
router.get('/calendar', 
  requireRole(['admin']), 
  auditLog('GET_ADMIN_CALENDAR', 'admin'),
  adminController.getAdminCalendar
);

router.post('/calendar', 
  requireRole(['admin']), 
  auditLog('CREATE_ADMIN_CALENDAR_ENTRY', 'admin'),
  adminController.createAdminCalendarEntry
);

router.put('/calendar/:id', 
  requireRole(['admin']), 
  auditLog('UPDATE_ADMIN_CALENDAR_ENTRY', 'admin'),
  adminController.updateAdminCalendarEntry
);

router.delete('/calendar/:id', 
  requireRole(['admin']), 
  auditLog('DELETE_ADMIN_CALENDAR_ENTRY', 'admin'),
  adminController.deleteAdminCalendarEntry
);

router.post('/calendar/import', 
  requireRole(['admin']), 
  auditLog('IMPORT_ADMIN_CALENDAR', 'admin'),
  adminController.importAdminCalendar
);

module.exports = router;
