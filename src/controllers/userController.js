const { query, getOne, getMany, transaction } = require('../config/database');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get users
    paramCount++;
    const users = await getMany(
      `SELECT id, email, first_name, last_name, role, status, created_at, last_login_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      code: 'GET_USERS_ERROR'
    });
  }
};

// Get manager's assigned agents
const getManagerAgents = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE maa.manager_id = $1';
    const params = [managerId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND u.status = $${paramCount}`;
      params.push(status);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM manager_agent_assignments maa
       JOIN users u ON maa.agent_id = u.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get agents
    paramCount++;
    const agents = await getMany(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.status, 
              u.created_at, u.last_login_at, maa.assigned_at
       FROM manager_agent_assignments maa
       JOIN users u ON maa.agent_id = u.id
       ${whereClause}
       ORDER BY maa.assigned_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.json({
      agents: agents.map(agent => ({
        id: agent.id,
        email: agent.email,
        firstName: agent.first_name,
        lastName: agent.last_name,
        role: agent.role,
        status: agent.status,
        createdAt: agent.created_at,
        lastLoginAt: agent.last_login_at,
        assignedAt: agent.assigned_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get manager agents error:', error);
    res.status(500).json({
      error: 'Failed to get manager agents',
      code: 'GET_MANAGER_AGENTS_ERROR'
    });
  }
};

// Assign agent to manager
const assignAgentToManager = async (req, res) => {
  try {
    const { managerId, agentId } = req.body;

    // Check if manager and agent exist
    const manager = await getOne('SELECT id, role FROM users WHERE id = $1 AND role = $2', [managerId, 'manager']);
    const agent = await getOne('SELECT id, role FROM users WHERE id = $1 AND role = $2', [agentId, 'agent']);

    if (!manager) {
      return res.status(404).json({
        error: 'Manager not found',
        code: 'MANAGER_NOT_FOUND'
      });
    }

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        code: 'AGENT_NOT_FOUND'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await getOne(
      'SELECT id FROM manager_agent_assignments WHERE manager_id = $1 AND agent_id = $2',
      [managerId, agentId]
    );

    if (existingAssignment) {
      return res.status(400).json({
        error: 'Agent is already assigned to this manager',
        code: 'ASSIGNMENT_EXISTS'
      });
    }

    // Create assignment
    await query(
      'INSERT INTO manager_agent_assignments (manager_id, agent_id, assigned_at) VALUES ($1, $2, NOW())',
      [managerId, agentId]
    );

    res.status(201).json({
      message: 'Agent assigned to manager successfully'
    });
  } catch (error) {
    console.error('Assign agent error:', error);
    res.status(500).json({
      error: 'Failed to assign agent',
      code: 'ASSIGN_AGENT_ERROR'
    });
  }
};

// Remove agent from manager
const removeAgentFromManager = async (req, res) => {
  try {
    const { managerId, agentId } = req.params;

    const result = await query(
      'DELETE FROM manager_agent_assignments WHERE manager_id = $1 AND agent_id = $2',
      [managerId, agentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Assignment not found',
        code: 'ASSIGNMENT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Agent removed from manager successfully'
    });
  } catch (error) {
    console.error('Remove agent error:', error);
    res.status(500).json({
      error: 'Failed to remove agent',
      code: 'REMOVE_AGENT_ERROR'
    });
  }
};

// Assign companies to agent
const assignCompaniesToAgent = async (req, res) => {
  try {
    const { agentId, companyIds } = req.body;

    // Check if agent exists
    const agent = await getOne('SELECT id, role FROM users WHERE id = $1 AND role = $2', [agentId, 'agent']);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        code: 'AGENT_NOT_FOUND'
      });
    }

    // Check if companies exist
    const companies = await getMany('SELECT id FROM companies WHERE id = ANY($1)', [companyIds]);
    if (companies.length !== companyIds.length) {
      return res.status(400).json({
        error: 'Some companies not found',
        code: 'COMPANIES_NOT_FOUND'
      });
    }

    // Remove existing assignments for this agent
    await query('DELETE FROM agent_company_assignments WHERE agent_id = $1', [agentId]);

    // Create new assignments
    const assignmentValues = companyIds.map(companyId => `($1, $${companyIds.indexOf(companyId) + 2}, NOW())`).join(', ');
    const assignmentParams = [agentId, ...companyIds];

    await query(
      `INSERT INTO agent_company_assignments (agent_id, company_id, assigned_at) VALUES ${assignmentValues}`,
      assignmentParams
    );

    res.json({
      message: 'Companies assigned to agent successfully'
    });
  } catch (error) {
    console.error('Assign companies error:', error);
    res.status(500).json({
      error: 'Failed to assign companies',
      code: 'ASSIGN_COMPANIES_ERROR'
    });
  }
};

// Get agent's companies
const getAgentCompanies = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM agent_company_assignments WHERE agent_id = $1',
      [agentId]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get companies
    const companies = await getMany(
      `SELECT c.id, c.name, c.tax_number, c.address, c.phone, c.email, c.status,
              c.created_at, aca.assigned_at
       FROM agent_company_assignments aca
       JOIN companies c ON aca.company_id = c.id
       WHERE aca.agent_id = $1
       ORDER BY aca.assigned_at DESC
       LIMIT $2 OFFSET $3`,
      [agentId, limit, offset]
    );

    res.json({
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        taxNumber: company.tax_number,
        address: company.address,
        phone: company.phone,
        email: company.email,
        status: company.status,
        createdAt: company.created_at,
        assignedAt: company.assigned_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get agent companies error:', error);
    res.status(500).json({
      error: 'Failed to get agent companies',
      code: 'GET_AGENT_COMPANIES_ERROR'
    });
  }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        code: 'INVALID_STATUS'
      });
    }

    const result = await query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, status',
      [status, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.rows[0];

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user.id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      code: 'UPDATE_USER_STATUS_ERROR'
    });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await getOne(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
        COUNT(CASE WHEN role = 'agent' THEN 1 END) as agents,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as users,
        COUNT(CASE WHEN last_login_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_logins
      FROM users
    `);

    res.json({
      stats: {
        totalUsers: parseInt(stats.total_users),
        activeUsers: parseInt(stats.active_users),
        inactiveUsers: parseInt(stats.inactive_users),
        suspendedUsers: parseInt(stats.suspended_users),
        admins: parseInt(stats.admins),
        managers: parseInt(stats.managers),
        agents: parseInt(stats.agents),
        users: parseInt(stats.users),
        recentLogins: parseInt(stats.recent_logins)
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      code: 'GET_USER_STATS_ERROR'
    });
  }
};

module.exports = {
  getAllUsers,
  getManagerAgents,
  assignAgentToManager,
  removeAgentFromManager,
  assignCompaniesToAgent,
  getAgentCompanies,
  updateUserStatus,
  getUserStats
}; 