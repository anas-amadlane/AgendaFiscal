/**
 * Audit logging middleware
 * Logs user actions for security and compliance purposes
 */

const { create } = require('../config/database');

/**
 * Creates an audit log entry for the specified action
 * @param {string} action - The action being performed
 * @param {string} table - The table being affected
 * @returns {Function} Express middleware function
 */
const auditLog = (action, table) => {
  return (req, res, next) => {
    try {
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to capture response
      res.send = function(data) {
        // Restore original send method
        res.send = originalSend;
        
        // Create audit log entry asynchronously
        createAuditLog(req, action, table, data).catch(err => {
          console.error('Error creating audit log:', err);
        });
        
        // Call original send method
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Error in audit middleware:', error);
      next();
    }
  };
};

/**
 * Creates an audit log entry in the database
 * @param {Object} req - Express request object
 * @param {string} action - The action being performed
 * @param {string} table - The table being affected
 * @param {any} responseData - The response data
 */
const createAuditLog = async (req, action, table, responseData) => {
  try {
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const requestBody = req.body ? JSON.stringify(req.body) : null;
    
    // Extract record ID from URL if available
    const urlParts = req.originalUrl?.split('/') || [];
    const recordId = urlParts[urlParts.length - 1] || null;
    
    // Store old and new values for updates
    const oldValues = req.method === 'PUT' || req.method === 'DELETE' ? requestBody : null;
    const newValues = req.method === 'POST' || req.method === 'PUT' ? requestBody : null;

    await create(
      `INSERT INTO audit_logs (
        user_id, action, table_name, record_id, old_values, new_values, 
        ip_address, user_agent, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        action,
        table,
        recordId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        new Date()
      ]
    );
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to avoid breaking the main request
  }
};

module.exports = {
  auditLog
};
