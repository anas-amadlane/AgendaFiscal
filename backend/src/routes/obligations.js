const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole, apiRateLimiter } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateObligation = [
  body('companyId').isUUID().withMessage('Invalid company ID'),
  body('type').isIn(['tax', 'social', 'other']).withMessage('Type must be tax, social, or other'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('status').optional().isIn(['pending', 'paid', 'overdue']).withMessage('Status must be pending, paid, or overdue')
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

// Get all obligations (with pagination and filtering)
router.get('/', requireRole(['admin', 'manager', 'agent']), async (req, res) => {
  try {
    const { page = 1, limit = 10, companyId = '', type = '', status = '', dueDateFrom = '', dueDateTo = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // TODO: Implement obligation controller
    res.json({
      obligations: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error('Error fetching obligations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération des obligations'
    });
  }
});

// Get obligation by ID
router.get('/:id', requireRole(['admin', 'manager', 'agent']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement obligation controller
    res.json({
      obligation: null
    });
  } catch (error) {
    console.error('Error fetching obligation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération de l\'obligation'
    });
  }
});

// Create new obligation
router.post('/', validateObligation, handleValidationErrors, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const obligationData = req.body;
    
    // TODO: Implement obligation controller
    res.status(201).json({
      message: 'Obligation created successfully',
      obligation: null
    });
  } catch (error) {
    console.error('Error creating obligation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la création de l\'obligation'
    });
  }
});

// Update obligation
router.put('/:id', validateObligation, handleValidationErrors, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const obligationData = req.body;
    
    // TODO: Implement obligation controller
    res.json({
      message: 'Obligation updated successfully',
      obligation: null
    });
  } catch (error) {
    console.error('Error updating obligation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la mise à jour de l\'obligation'
    });
  }
});

// Delete obligation
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement obligation controller
    res.json({
      message: 'Obligation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting obligation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la suppression de l\'obligation'
    });
  }
});

// Mark obligation as paid
router.patch('/:id/paid', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement obligation controller
    res.json({
      message: 'Obligation marked as paid'
    });
  } catch (error) {
    console.error('Error marking obligation as paid:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
});

module.exports = router; 