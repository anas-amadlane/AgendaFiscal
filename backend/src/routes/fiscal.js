const express = require('express');
const router = express.Router();
const fiscalController = require('../controllers/fiscalController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

// Apply authentication to all fiscal routes
router.use(authenticateToken);

// Get all fiscal calendar entries (with optional filtering)
router.get('/calendar', 
  auditLog('GET_FISCAL_CALENDAR', 'fiscal_calendar'),
  fiscalController.getFiscalCalendarEntries
);

// Get fiscal calendar statistics
router.get('/calendar/stats', 
  auditLog('GET_FISCAL_CALENDAR_STATS', 'fiscal_calendar'),
  fiscalController.getFiscalCalendarStats
);

// Get filter options for fiscal calendar
router.get('/calendar/filter-options', 
  auditLog('GET_FISCAL_CALENDAR_FILTER_OPTIONS', 'fiscal_calendar'),
  fiscalController.getFiscalCalendarFilterOptions
);

// Get a single fiscal calendar entry
router.get('/calendar/:id', 
  auditLog('GET_FISCAL_CALENDAR_ENTRY', 'fiscal_calendar'),
  fiscalController.getFiscalCalendarEntry
);

// Admin-only routes for managing fiscal calendar
router.post('/calendar', 
  requireRole(['admin']),
  auditLog('CREATE_FISCAL_CALENDAR_ENTRY', 'fiscal_calendar'),
  fiscalController.createFiscalCalendarEntry
);

router.put('/calendar/:id', 
  requireRole(['admin']),
  auditLog('UPDATE_FISCAL_CALENDAR_ENTRY', 'fiscal_calendar'),
  fiscalController.updateFiscalCalendarEntry
);

router.delete('/calendar/:id', 
  requireRole(['admin']),
  auditLog('DELETE_FISCAL_CALENDAR_ENTRY', 'fiscal_calendar'),
  fiscalController.deleteFiscalCalendarEntry
);

// Generate obligations routes
router.post('/obligations/generate/company/:companyId', 
  requireRole(['admin', 'regular']),
  auditLog('GENERATE_OBLIGATIONS_FOR_COMPANY', 'fiscal_obligations'),
  fiscalController.generateObligationsForCompany
);

router.post('/obligations/generate/user', 
  requireRole(['admin', 'regular']),
  auditLog('GENERATE_OBLIGATIONS_FOR_USER', 'fiscal_obligations'),
  fiscalController.generateObligationsForUser
);

// Generate obligations for all companies for 2025 (admin only)
router.post('/obligations/generate/all-companies', 
  requireRole(['admin']),
  auditLog('GENERATE_OBLIGATIONS_FOR_ALL_COMPANIES', 'fiscal_obligations'),
  fiscalController.generateObligationsForAllCompanies
);

// Generate obligations for all companies with dynamic date range (admin only)
router.post('/obligations/generate/all-companies-dynamic', 
  requireRole(['admin']),
  auditLog('GENERATE_OBLIGATIONS_FOR_ALL_COMPANIES_DYNAMIC', 'fiscal_obligations'),
  fiscalController.generateObligationsForAllCompaniesDynamic
);

// Manual trigger for automated service (admin only)
router.post('/obligations/generate/manual', 
  requireRole(['admin']),
  auditLog('MANUAL_OBLIGATION_GENERATION', 'fiscal_obligations'),
  fiscalController.triggerManualGeneration
);

module.exports = router;
