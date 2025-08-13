const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole, apiRateLimiter } = require('../middleware/auth');
const companyController = require('../controllers/companyController');

const router = express.Router();

// Validation middleware
const validateCompany = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('registrationNumber').optional().isLength({ min: 5, max: 50 }).withMessage('Registration number must be between 5 and 50 characters'),
  body('taxId').optional().isLength({ min: 8, max: 20 }).withMessage('Tax ID must be between 8 and 20 characters'),
  body('address').optional().isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  body('phone').optional().matches(/^[\+]?[0-9\s\-\(\)]+$/).withMessage('Invalid phone number format'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('industry').optional().isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  body('size').optional().isIn(['small', 'medium', 'large', 'enterprise']).withMessage('Size must be small, medium, large, or enterprise'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  body('userRole').optional().isIn(['manager', 'agent']).withMessage('User role must be manager or agent'),
  body('managerEmail').optional().isEmail().withMessage('Invalid manager email format')
];

const validateUserAssignment = [
  body('companyId').isUUID().withMessage('Invalid company ID'),
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('role').isIn(['manager', 'agent']).withMessage('Role must be manager or agent')
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

module.exports = router; 