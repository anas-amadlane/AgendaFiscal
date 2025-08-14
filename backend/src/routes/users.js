const express = require('express');
const { body } = require('express-validator');
const { 
  authenticateToken, 
  requireRole, 
  requireManagerAccess,
  auditLog 
} = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateAgentAssignment = [
  body('agentId')
    .isUUID()
    .withMessage('ID d\'agent invalide'),
  body('assignmentType')
    .optional()
    .isIn(['all', 'specific'])
    .withMessage('Type d\'assignation invalide')
];

const validateCompanyAssignment = [
  body('agentId')
    .isUUID()
    .withMessage('ID d\'agent invalide'),
  body('companyIds')
    .isArray({ min: 1 })
    .withMessage('Au moins une entreprise doit être sélectionnée'),
  body('companyIds.*')
    .isUUID()
    .withMessage('ID d\'entreprise invalide')
];

const validateUserStatusUpdate = [
  body('isActive')
    .isBoolean()
    .withMessage('Statut invalide')
];

const validateUserUpdate = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Prénom doit contenir entre 2 et 100 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('role')
    .isIn(['regular', 'admin'])
    .withMessage('Rôle invalide'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Statut invalide')
];

const validateUserCreate = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Prénom doit contenir entre 2 et 100 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mot de passe doit contenir au moins 8 caractères'),
  body('role')
    .isIn(['regular', 'admin'])
    .withMessage('Rôle invalide')
];

const validatePasswordChange = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nouveau mot de passe doit contenir au moins 8 caractères')
];

// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Données de validation invalides',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Admin routes
router.get('/', 
  requireRole(['admin']), 
  auditLog('GET_USERS', 'users'),
  userController.getAllUsers
);

router.get('/stats', 
  requireRole(['admin']), 
  auditLog('GET_USER_STATS', 'users'),
  userController.getUserStats
);

// Create new user (admin only)
router.post('/',
  requireRole(['admin']),
  validateUserCreate,
  handleValidationErrors,
  auditLog('CREATE_USER', 'users'),
  userController.createUser
);

// Update user (admin only)
router.put('/:userId',
  requireRole(['admin']),
  validateUserUpdate,
  handleValidationErrors,
  auditLog('UPDATE_USER', 'users'),
  userController.updateUser
);

// Delete user (admin only)
router.delete('/:userId',
  requireRole(['admin']),
  auditLog('DELETE_USER', 'users'),
  userController.deleteUser
);

// Change user password (admin only)
router.put('/:userId/password',
  requireRole(['admin']),
  validatePasswordChange,
  handleValidationErrors,
  auditLog('CHANGE_USER_PASSWORD', 'users'),
  userController.changeUserPassword
);

router.put('/:userId/status', 
  requireRole(['admin']), 
  validateUserStatusUpdate,
  handleValidationErrors,
  auditLog('UPDATE_USER_STATUS', 'users'),
  userController.updateUserStatus
);

// Manager routes
router.get('/agents', 
  requireRole(['admin', 'manager']), 
  auditLog('GET_MANAGER_AGENTS', 'manager_agent_assignments'),
  userController.getManagerAgents
);

router.post('/agents/assign', 
  requireRole(['admin', 'manager']), 
  validateAgentAssignment,
  handleValidationErrors,
  auditLog('ASSIGN_AGENT', 'manager_agent_assignments'),
  userController.assignAgentToManager
);

router.delete('/agents/:agentId', 
  requireRole(['admin', 'manager']), 
  auditLog('REMOVE_AGENT_ASSIGNMENT', 'manager_agent_assignments'),
  userController.removeAgentAssignment
);

router.post('/agents/:agentId/companies', 
  requireRole(['admin', 'manager']), 
  validateCompanyAssignment,
  handleValidationErrors,
  auditLog('ASSIGN_COMPANIES_TO_AGENT', 'agent_company_assignments'),
  userController.assignCompaniesToAgent
);

router.get('/agents/:agentId/companies', 
  requireRole(['admin', 'manager']), 
  requireManagerAccess,
  auditLog('GET_AGENT_COMPANIES', 'agent_company_assignments'),
  userController.getAgentCompanies
);

module.exports = router; 