const jwt = require('jsonwebtoken');
const { getOne } = require('../config/database');

// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
  console.log('🔒 Authentication middleware called for:', req.method, req.path);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('🔒 Authorization header:', authHeader ? 'Present' : 'Missing');

  if (!token) {
    console.log('🚨 No token provided - blocking access');
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Veuillez vous connecter pour accéder à cette ressource'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await getOne(
      'SELECT id, email, first_name, last_name, role, is_active, company FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user',
        message: 'Utilisateur invalide ou inactif'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Session expirée, veuillez vous reconnecter'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Token d\'authentification invalide'
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Permissions insuffisantes pour accéder à cette ressource'
      });
    }

    next();
  };
};

// Manager access control - check if user can access specific agent/company
const requireManagerAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Authentification requise'
    });
  }

  // Admins have access to everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Managers can access their assigned agents
  if (req.user.role === 'manager') {
    const { agentId, companyId } = req.params;
    
    if (agentId) {
      const assignment = await getOne(
        `SELECT * FROM manager_agent_assignments 
         WHERE manager_id = $1 AND agent_id = $2 AND status = 'active'`,
        [req.user.id, agentId]
      );
      
      if (!assignment) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Vous n\'avez pas accès à cet agent'
        });
      }
    }

    if (companyId) {
      const companyAssignment = await getOne(
        `SELECT aca.* FROM agent_company_assignments aca
         JOIN manager_agent_assignments maa ON aca.agent_id = maa.agent_id
         WHERE maa.manager_id = $1 AND aca.company_id = $2 AND aca.status = 'active'`,
        [req.user.id, companyId]
      );
      
      if (!companyAssignment) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Vous n\'avez pas accès à cette entreprise'
        });
      }
    }
  }

  next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message || 'Trop de requêtes, veuillez réessayer plus tard'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
);

const registrationRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts
  'Trop de tentatives d\'inscription, veuillez réessayer dans 15 minutes'
);

const apiRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests
  'Trop de requêtes, veuillez ralentir'
);

// Session validation middleware
const validateSession = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    const session = await getOne(
      'SELECT * FROM user_sessions WHERE user_id = $1 AND session_token = $2 AND expire > NOW()',
      [req.user.id, req.headers['x-session-token']]
    );

    if (!session) {
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Session invalide, veuillez vous reconnecter'
      });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    next();
  }
};

// Audit logging middleware
const auditLog = (action, tableName = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      if (req.user) {
        const logData = {
          user_id: req.user.id,
          action,
          table_name: tableName,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          old_values: req.body.old_values || null,
          new_values: req.body.new_values || null
        };

        // Async logging - don't wait for it
        getOne(
          `INSERT INTO audit_logs (user_id, action, table_name, ip_address, user_agent, old_values, new_values)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [logData.user_id, logData.action, logData.table_name, logData.ip_address, logData.user_agent, logData.old_values, logData.new_values]
        ).catch(err => console.error('Audit log error:', err));
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireManagerAccess,
  authRateLimiter,
  registrationRateLimiter,
  apiRateLimiter,
  validateSession,
  auditLog
}; 