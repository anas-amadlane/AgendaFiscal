const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, apiRateLimiter } = require('../middleware/auth');
const invitationController = require('../controllers/invitationController');

const router = express.Router();

// Validation middleware
const validateInvitation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('companyId').isUUID().withMessage('Invalid company ID'),
  body('role').isIn(['manager', 'agent']).withMessage('Role must be manager or agent'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message must be less than 500 characters')
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

// Send invitation
router.post('/', validateInvitation, handleValidationErrors, invitationController.sendInvitation);

// Get sent invitations
router.get('/sent', invitationController.getSentInvitations);

// Get received invitations
router.get('/received', invitationController.getReceivedInvitations);

// Accept invitation by token
router.post('/accept/:token', invitationController.acceptInvitation);

// Decline invitation by token
router.post('/decline/:token', invitationController.declineInvitation);

// Cancel invitation (by sender)
router.delete('/:id', invitationController.cancelInvitation);

module.exports = router;