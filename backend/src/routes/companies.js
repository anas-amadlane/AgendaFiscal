const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole, apiRateLimiter } = require('../middleware/auth');
const companyController = require('../controllers/companyController');

const router = express.Router();

// Validation middleware
const validateCompany = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('userRole').optional().isIn(['manager', 'agent']).withMessage('User role must be manager or agent'),
  body('managerEmail').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty/null values
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid manager email format');
    }
    return true;
  }).withMessage('Invalid manager email format'),
  // Fiscal and legal information fields
  body('categoriePersonnes').optional().isLength({ max: 100 }).withMessage('Categorie personnes must be less than 100 characters'),
  body('sousCategorie').optional().isLength({ max: 100 }).withMessage('Sous categorie must be less than 100 characters'),
  body('isTvaAssujetti').optional().isBoolean().withMessage('isTvaAssujetti must be a boolean'),
  body('regimeTva').optional().isLength({ max: 50 }).withMessage('Regime TVA must be less than 50 characters'),
  body('prorataDdeduction').optional().isBoolean().withMessage('Prorata deduction must be a boolean')
];

const validateUserAssignment = [
  body('companyId').isUUID().withMessage('Invalid company ID'),
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('role').isIn(['manager', 'agent']).withMessage('Role must be manager or agent')
];

const validateCompanyStatusUpdate = [
  body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Apply middleware to all routes
router.use(authenticateToken);
router.use(apiRateLimiter);

// Admin routes - Get all companies (admin only)
router.get('/admin/all', 
  requireRole(['admin']), 
  companyController.getAllCompanies
);

// Admin routes - Get company details with users (admin only)
router.get('/admin/:id', 
  requireRole(['admin']), 
  companyController.getAdminCompanyDetails
);

// Admin routes - Update company status (admin only)
router.put('/admin/:id/status', 
  requireRole(['admin']), 
  validateCompanyStatusUpdate,
  handleValidationErrors,
  companyController.updateCompanyStatus
);

// Admin routes - Update company (admin only)
router.put('/admin/:id', 
  requireRole(['admin']), 
  validateCompany,
  handleValidationErrors,
  companyController.updateCompanyAdmin
);

// Get user's companies (with pagination and filtering)
router.get('/', companyController.getUserCompanies);

// Get company by ID with details
router.get('/:id', companyController.getCompanyDetails);

// Create new company with role assignment
router.post('/', validateCompany, handleValidationErrors, companyController.createCompany);

// Update company
router.put('/:id', validateCompany, handleValidationErrors, companyController.updateCompany);

// Assign user to company
router.post('/assign-user', validateUserAssignment, handleValidationErrors, companyController.assignUserToCompany);

// Remove user from company
router.delete('/:companyId/users/:userId', companyController.removeUserFromCompany);

// Admin route - Assign calendar to all companies
router.post('/admin/assign-calendar', 
  requireRole(['admin']), 
  companyController.assignCalendarToAllCompanies
);

module.exports = router; 