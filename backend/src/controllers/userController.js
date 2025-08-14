const { query, getOne, getMany, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get users with company count
    paramCount++;
    const users = await getMany(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, 
              u.email_verified, u.last_login_at, u.created_at,
              COUNT(DISTINCT c.id) as companies_count
       FROM users u
       LEFT JOIN companies c ON u.id = c.created_by
       ${whereClause}
       GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, 
                u.email_verified, u.last_login_at, u.created_at
       ORDER BY u.created_at DESC
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
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        companiesCount: parseInt(user.companies_count)
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
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, isActive = true } = req.body;

    // Check if email already exists
    const existingUser = await getOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [firstName, lastName, email, passwordHash, role, isActive]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    // Check if user exists
    const existingUser = await getOne(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Utilisateur non trouvé'
      });
    }

    // Check if email is already used by another user
    if (email !== existingUser.email) {
      const emailExists = await getOne(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailExists) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
    }

    // Update user
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, role = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, email, first_name, last_name, role, is_active, updated_at`,
      [firstName, lastName, email, role, isActive, userId]
    );

    const user = result.rows[0];

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await getOne(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Utilisateur non trouvé'
      });
    }

    // Check if user has associated companies
    const companiesCount = await getOne(
      'SELECT COUNT(*) as count FROM companies WHERE created_by = $1',
      [userId]
    );

    if (parseInt(companiesCount.count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with companies',
        message: 'Impossible de supprimer un utilisateur qui a des entreprises associées'
      });
    }

    // Delete user
    await query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};

// Change user password (admin only)
const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const existingUser = await getOne(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Utilisateur non trouvé'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      `UPDATE users 
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, userId]
    );

    res.json({
      message: 'Mot de passe modifié avec succès',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name
      }
    });

  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'Erreur lors de la modification du mot de passe'
    });
  }
};

// Get manager's assigned agents
const getManagerAgents = async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const agents = await getMany(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.company, u.role,
              u.is_active, u.last_login_at, u.created_at,
              maa.assignment_type, maa.status as assignment_status, maa.created_at as assigned_at
       FROM users u
       JOIN manager_agent_assignments maa ON u.id = maa.agent_id
       WHERE maa.manager_id = $1 AND maa.status = $2
       ORDER BY u.created_at DESC`,
      [req.user.id, status]
    );

    res.json({
      agents: agents.map(agent => ({
        id: agent.id,
        email: agent.email,
        firstName: agent.first_name,
        lastName: agent.last_name,
        company: agent.company,
        role: agent.role,
        isActive: agent.is_active,
        lastLoginAt: agent.last_login_at,
        createdAt: agent.created_at,
        assignmentType: agent.assignment_type,
        assignmentStatus: agent.assignment_status,
        assignedAt: agent.assigned_at
      }))
    });

  } catch (error) {
    console.error('Get manager agents error:', error);
    res.status(500).json({
      error: 'Failed to get agents',
      message: 'Erreur lors de la récupération des agents'
    });
  }
};

// Assign agent to manager
const assignAgentToManager = async (req, res) => {
  try {
    const { agentId, assignmentType = 'all' } = req.body;

    if (!agentId) {
      return res.status(400).json({
        error: 'Agent ID required',
        message: 'ID de l\'agent requis'
      });
    }

    // Check if agent exists and is an agent
    const agent = await getOne(
      'SELECT id, role FROM users WHERE id = $1',
      [agentId]
    );

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'Agent non trouvé'
      });
    }

    if (agent.role !== 'agent') {
      return res.status(400).json({
        error: 'User is not an agent',
        message: 'L\'utilisateur n\'est pas un agent'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await getOne(
      'SELECT id FROM manager_agent_assignments WHERE manager_id = $1 AND agent_id = $2',
      [req.user.id, agentId]
    );

    if (existingAssignment) {
      return res.status(409).json({
        error: 'Assignment already exists',
        message: 'L\'agent est déjà assigné à ce manager'
      });
    }

    // Create assignment
    const result = await query(
      `INSERT INTO manager_agent_assignments (manager_id, agent_id, assignment_type, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id, manager_id, agent_id, assignment_type, status, created_at`,
      [req.user.id, agentId, assignmentType]
    );

    const assignment = result.rows[0];

    res.status(201).json({
      message: 'Agent assigné avec succès',
      assignment: {
        id: assignment.id,
        managerId: assignment.manager_id,
        agentId: assignment.agent_id,
        assignmentType: assignment.assignment_type,
        status: assignment.status,
        createdAt: assignment.created_at
      }
    });

  } catch (error) {
    console.error('Assign agent error:', error);
    res.status(500).json({
      error: 'Failed to assign agent',
      message: 'Erreur lors de l\'assignation de l\'agent'
    });
  }
};

// Remove agent assignment
const removeAgentAssignment = async (req, res) => {
  try {
    const { agentId } = req.params;

    const result = await query(
      `DELETE FROM manager_agent_assignments 
       WHERE manager_id = $1 AND agent_id = $2
       RETURNING id`,
      [req.user.id, agentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'Assignation non trouvée'
      });
    }

    res.json({
      message: 'Assignation supprimée avec succès'
    });

  } catch (error) {
    console.error('Remove agent assignment error:', error);
    res.status(500).json({
      error: 'Failed to remove assignment',
      message: 'Erreur lors de la suppression de l\'assignation'
    });
  }
};

// Assign specific companies to agent
const assignCompaniesToAgent = async (req, res) => {
  try {
    const { agentId, companyIds } = req.body;

    if (!agentId || !companyIds || !Array.isArray(companyIds)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Agent ID et liste des entreprises requis'
      });
    }

    // Verify agent exists and is assigned to this manager
    const agentAssignment = await getOne(
      `SELECT maa.* FROM manager_agent_assignments maa
       JOIN users u ON maa.agent_id = u.id
       WHERE maa.manager_id = $1 AND maa.agent_id = $2 AND maa.status = 'active'`,
      [req.user.id, agentId]
    );

    if (!agentAssignment) {
      return res.status(403).json({
        error: 'Agent not assigned',
        message: 'Agent non assigné à ce manager'
      });
    }

    // Verify companies exist
    const companies = await getMany(
      'SELECT id, name FROM companies WHERE id = ANY($1)',
      [companyIds]
    );

    if (companies.length !== companyIds.length) {
      return res.status(400).json({
        error: 'Some companies not found',
        message: 'Certaines entreprises n\'existent pas'
      });
    }

    // Use transaction to ensure data consistency
    await transaction(async (client) => {
      // Remove existing assignments for this agent
      await client.query(
        'DELETE FROM agent_company_assignments WHERE agent_id = $1',
        [agentId]
      );

      // Create new assignments
      for (const companyId of companyIds) {
        await client.query(
          `INSERT INTO agent_company_assignments (agent_id, company_id, assigned_by, status)
           VALUES ($1, $2, $3, 'active')`,
          [agentId, companyId, req.user.id]
        );
      }
    });

    res.json({
      message: 'Entreprises assignées avec succès',
      assignedCompanies: companies.map(company => ({
        id: company.id,
        name: company.name
      }))
    });

  } catch (error) {
    console.error('Assign companies error:', error);
    res.status(500).json({
      error: 'Failed to assign companies',
      message: 'Erreur lors de l\'assignation des entreprises'
    });
  }
};

// Get agent's assigned companies
const getAgentCompanies = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Verify access
    const agentAssignment = await getOne(
      `SELECT maa.* FROM manager_agent_assignments maa
       WHERE maa.manager_id = $1 AND maa.agent_id = $2 AND maa.status = 'active'`,
      [req.user.id, agentId]
    );

    if (!agentAssignment) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Accès refusé'
      });
    }

    const companies = await getMany(
      `SELECT c.id, c.name, c.registration_number, c.tax_id, c.status,
              aca.permissions, aca.created_at as assigned_at
       FROM companies c
       JOIN agent_company_assignments aca ON c.id = aca.company_id
       WHERE aca.agent_id = $1 AND aca.status = 'active'
       ORDER BY c.name`,
      [agentId]
    );

    res.json({
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        registrationNumber: company.registration_number,
        taxId: company.tax_id,
        status: company.status,
        permissions: company.permissions,
        assignedAt: company.assigned_at
      }))
    });

  } catch (error) {
    console.error('Get agent companies error:', error);
    res.status(500).json({
      error: 'Failed to get companies',
      message: 'Erreur lors de la récupération des entreprises'
    });
  }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await query(
      `UPDATE users SET is_active = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, first_name, last_name, role, is_active`,
      [isActive, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Utilisateur non trouvé'
      });
    }

    const user = result.rows[0];

    res.json({
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: 'Erreur lors de la mise à jour du statut utilisateur'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await getOne(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
        COUNT(CASE WHEN role = 'agent' THEN 1 END) as agent_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_logins
       FROM users`
    );

    res.json({
      stats: {
        totalUsers: parseInt(stats.total_users),
        adminCount: parseInt(stats.admin_count),
        managerCount: parseInt(stats.manager_count),
        agentCount: parseInt(stats.agent_count),
        userCount: parseInt(stats.user_count),
        activeUsers: parseInt(stats.active_users),
        recentLogins: parseInt(stats.recent_logins)
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getManagerAgents,
  assignAgentToManager,
  removeAgentAssignment,
  assignCompaniesToAgent,
  getAgentCompanies,
  updateUserStatus,
  getUserStats
}; 