const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole, apiRateLimiter } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateDashboardConfig = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Dashboard name must be between 2 and 100 characters'),
  body('layout').isObject().withMessage('Layout must be an object'),
  body('widgets').isArray().withMessage('Widgets must be an array'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
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

// Get dashboard statistics
router.get('/stats', requireRole(['admin', 'manager', 'agent']), async (req, res) => {
  try {
    const { period = 'month', companyId = '' } = req.query;
    
    // TODO: Implement dashboard controller
    res.json({
      stats: {
        totalObligations: 0,
        pendingObligations: 0,
        overdueObligations: 0,
        totalAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0
      },
      period: period,
      companyId: companyId
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Get dashboard configurations
router.get('/configs', requireRole(['admin', 'manager', 'agent']), async (req, res) => {
  try {
    // TODO: Implement dashboard controller
    res.json({
      configurations: []
    });
  } catch (error) {
    console.error('Error fetching dashboard configs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération des configurations'
    });
  }
});

// Get dashboard configuration by ID
router.get('/configs/:id', requireRole(['admin', 'manager', 'agent']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement dashboard controller
    res.json({
      configuration: null
    });
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération de la configuration'
    });
  }
});

// Create dashboard configuration
router.post('/configs', validateDashboardConfig, handleValidationErrors, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const configData = req.body;
    
    // TODO: Implement dashboard controller
    res.status(201).json({
      message: 'Dashboard configuration created successfully',
      configuration: null
    });
  } catch (error) {
    console.error('Error creating dashboard config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la création de la configuration'
    });
  }
});

// Update dashboard configuration
router.put('/configs/:id', validateDashboardConfig, handleValidationErrors, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const configData = req.body;
    
    // TODO: Implement dashboard controller
    res.json({
      message: 'Dashboard configuration updated successfully',
      configuration: null
    });
  } catch (error) {
    console.error('Error updating dashboard config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la mise à jour de la configuration'
    });
  }
});

// Delete dashboard configuration
router.delete('/configs/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement dashboard controller
    res.json({
      message: 'Dashboard configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dashboard config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la suppression de la configuration'
    });
  }
});

// Get calendar data
router.get('/calendar', requireRole(['admin', 'manager', 'agent']), async (req, res) => {
  try {
    const { startDate, endDate, companyId = '' } = req.query;
    
    // TODO: Implement dashboard controller
    res.json({
      events: []
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération des données du calendrier'
    });
  }
});

module.exports = router; 