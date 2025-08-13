const jwt = require('jsonwebtoken');
const { getOne } = require('../config/database');
const rateLimit = require('express-rate-limit');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await getOne(
      'SELECT id, email, role, status, last_login_at FROM users WHERE id = $1 AND status = $2',
      [decoded.userId, 'active']
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid token',
      code: 'TOKEN_INVALID'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: userRole
      });
    }

    next();
  };
};

const requireManagerAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const { role, id: userId } = req.user;
  
  // Admin can access everything
  if (role === 'admin') {
    return next();
  }

  // Manager can access their assigned agents
  if (role === 'manager') {
    const { agentId } = req.params;
    if (!agentId) {
      return res.status(400).json({ 
        error: 'Agent ID required',
        code: 'AGENT_ID_REQUIRED'
      });
    }

    const assignment = await getOne(
      'SELECT * FROM manager_agent_assignments WHERE manager_id = $1 AND agent_id = $2',
      [userId, agentId]
    );

    if (!assignment) {
      return res.status(403).json({ 
        error: 'Access denied to this agent',
        code: 'ACCESS_DENIED'
      });
    }

    return next();
  }

  return res.status(403).json({ 
    error: 'Manager access required',
    code: 'MANAGER_ACCESS_REQUIRED'
  });
};

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts. Please try again later.'
);

const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many API requests. Please try again later.'
);

const validateSession = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Session validation required',
      code: 'SESSION_REQUIRED'
    });
  }

  try {
    const session = await getOne(
      'SELECT * FROM user_sessions WHERE user_id = $1 AND is_active = true',
      [req.user.id]
    );

    if (!session) {
      return res.status(401).json({ 
        error: 'Invalid session',
        code: 'SESSION_INVALID'
      });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ 
      error: 'Session validation failed',
      code: 'SESSION_ERROR'
    });
  }
};

const auditLog = (action, tableName = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Log after response is sent
      setTimeout(async () => {
        try {
          const logData = {
            user_id: req.user?.id || null,
            action,
            table_name: tableName,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            request_method: req.method,
            request_url: req.originalUrl,
            response_status: res.statusCode,
            request_body: req.body ? JSON.stringify(req.body) : null,
            response_body: typeof data === 'string' ? data : JSON.stringify(data)
          };

          await req.app.locals.db.query(
            `INSERT INTO audit_logs 
             (user_id, action, table_name, ip_address, user_agent, request_method, request_url, response_status, request_body, response_body)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            Object.values(logData)
          );
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      }, 0);

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
  apiRateLimiter,
  validateSession,
  auditLog
}; 