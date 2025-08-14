const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, getOne, getMany, transaction } = require('../config/database');

// Get all companies (admin only)
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (c.name ILIKE $${paramCount} OR c.registration_number ILIKE $${paramCount} OR c.tax_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM companies c ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get companies with user counts
    paramCount++;
    const companies = await getMany(
      `SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as created_by_name,
        COUNT(DISTINCT cur.user_id) as total_users,
        COUNT(DISTINCT CASE WHEN cur.role = 'owner' THEN cur.user_id END) as owners_count,
        COUNT(DISTINCT CASE WHEN cur.role = 'manager' THEN cur.user_id END) as managers_count,
        COUNT(DISTINCT CASE WHEN cur.role = 'agent' THEN cur.user_id END) as agents_count
       FROM companies c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN company_user_roles cur ON c.id = cur.company_id
       ${whereClause}
       GROUP BY c.id, c.name, c.registration_number, c.tax_id, c.status, c.created_at, c.updated_at, u.first_name, u.last_name
       ORDER BY c.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.json({
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        registrationNumber: company.registration_number,
        taxId: company.tax_id,
        status: company.status,
        createdAt: company.created_at,
        updatedAt: company.updated_at,
        createdByName: company.created_by_name,
        totalUsers: parseInt(company.total_users),
        ownersCount: parseInt(company.owners_count),
        managersCount: parseInt(company.managers_count),
        agentsCount: parseInt(company.agents_count)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({
      error: 'Failed to get companies',
      message: 'Erreur lors de la récupération des entreprises'
    });
  }
};

// Get company details with users (admin only)
const getAdminCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get company details
    const company = await getOne(`
      SELECT c.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM companies c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [id]);

    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'Entreprise non trouvée'
      });
    }

    // Get all users associated with this company
    const companyUsers = await getMany(`
      SELECT 
        cur.role,
        cur.status,
        cur.created_at as assigned_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.last_login_at,
        assigner.first_name || ' ' || assigner.last_name as assigned_by_name
      FROM company_user_roles cur
      JOIN users u ON cur.user_id = u.id
      LEFT JOIN users assigner ON cur.assigned_by = assigner.id
      WHERE cur.company_id = $1
      ORDER BY 
        CASE cur.role 
          WHEN 'owner' THEN 1 
          WHEN 'manager' THEN 2 
          WHEN 'agent' THEN 3 
        END,
        cur.created_at
    `, [id]);

    // Separate users by role
    const owners = companyUsers.filter(user => user.role === 'owner');
    const managers = companyUsers.filter(user => user.role === 'manager');
    const agents = companyUsers.filter(user => user.role === 'agent');

    res.json({
      company: {
        id: company.id,
        name: company.name,
        registrationNumber: company.registration_number,
        taxId: company.tax_id,
        status: company.status,
        createdAt: company.created_at,
        updatedAt: company.updated_at,
        createdByName: company.created_by_name
      },
      users: {
        owners,
        managers,
        agents,
        total: companyUsers.length
      }
    });

  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({
      error: 'Failed to get company details',
      message: 'Erreur lors de la récupération des détails de l\'entreprise'
    });
  }
};

// Update company status (admin only)
const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if company exists
    const existingCompany = await getOne(
      'SELECT id, name, status FROM companies WHERE id = $1',
      [id]
    );

    if (!existingCompany) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'Entreprise non trouvée'
      });
    }

    // Update company status
    const result = await query(
      `UPDATE companies 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, status, updated_at`,
      [status, id]
    );

    const updatedCompany = result.rows[0];

    res.json({
      message: `Company ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        status: updatedCompany.status,
        updatedAt: updatedCompany.updated_at
      }
    });

  } catch (error) {
    console.error('Update company status error:', error);
    res.status(500).json({
      error: 'Failed to update company status',
      message: 'Erreur lors de la mise à jour du statut de l\'entreprise'
    });
  }
};

// Update company (admin only)
const updateCompanyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if company exists
    const existingCompany = await getOne(
      'SELECT id, name FROM companies WHERE id = $1',
      [id]
    );

    if (!existingCompany) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'Entreprise non trouvée'
      });
    }

    // Build update query
    const fields = Object.keys(updateData).filter(key => 
      ['name', 'registration_number', 'tax_id', 'address', 'phone', 'email', 'website', 'industry', 'size', 'status'].includes(key)
    );

    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        message: 'Aucun champ valide fourni pour la mise à jour'
      });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updateData[field])];

    const updateQuery = `
      UPDATE companies 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const updatedCompany = await getOne(updateQuery, values);

    res.json({
      message: 'Company updated successfully',
      company: updatedCompany
    });

  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      error: 'Failed to update company',
      message: 'Erreur lors de la mise à jour de l\'entreprise'
    });
  }
};

// Create a new company
const createCompany = async (req, res) => {
  try {
    const { name, registrationNumber, taxId, address, phone, email, website, industry, size, userRole, managerEmail } = req.body;
    const userId = req.user.id;

    const result = await transaction(async (client) => {
      // Create the company
      const companyResult = await client.query(`
        INSERT INTO companies (name, registration_number, tax_id, address, phone, email, website, industry, size, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [name, registrationNumber, taxId, address, phone, email, website, industry, size, userId]);

      const company = companyResult.rows[0];

      // If user chose to be a manager or agent, assign the role
      if (userRole === 'manager') {
        // User becomes the manager of the company
        await client.query(`
          INSERT INTO company_user_roles (company_id, user_id, role, assigned_by, status)
          VALUES ($1, $2, 'manager', $1, 'active')
        `, [company.id, userId]);

      } else if (userRole === 'agent' && managerEmail) {
        // User becomes an agent and sends invitation to manager
        const invitationToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create invitation for the manager
        await client.query(`
          INSERT INTO user_invitations (email, invited_by, company_id, role, invitation_token, expires_at, message)
          VALUES ($1, $2, $3, 'manager', $4, $5, $6)
        `, [managerEmail, userId, company.id, invitationToken, expiresAt, 
           `You have been invited to manage the company "${name}" as a manager.`]);

        // User becomes an agent of the company
        await client.query(`
          INSERT INTO company_user_roles (company_id, user_id, role, assigned_by, status)
          VALUES ($1, $2, 'agent', $2, 'active')
        `, [company.id, userId]);

        // Send notification to the invited manager (if they exist in the system)
        const existingManager = await client.query('SELECT id FROM users WHERE email = $1', [managerEmail]);
        if (existingManager.rows.length > 0) {
          await client.query(`
            INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
            VALUES ($1, $2, $3, 'info', 'invitation', $4)
          `, [
            existingManager.rows[0].id,
            'Manager Invitation',
            `You have been invited to manage the company "${name}".`,
            company.id
          ]);
        }

        // TODO: Send email invitation to manager
        console.log(`Invitation sent to ${managerEmail} for company ${name}`);
      } else {
        // User becomes the owner by default
        await client.query(`
          INSERT INTO company_user_roles (company_id, user_id, role, assigned_by, status)
          VALUES ($1, $2, 'owner', $2, 'active')
        `, [company.id, userId]);
      }

      return company;
    });

    res.status(201).json({
      message: 'Company created successfully',
      company: result
    });

  } catch (error) {
    console.error('Error creating company:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        error: 'Company already exists',
        message: 'A company with this registration number already exists'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Error creating company'
    });
  }
};

// Get companies accessible to the user
const getUserCompanies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE cur.user_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereClause += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    const companiesQuery = `
      SELECT 
        c.*,
        cur.role as user_role,
        cur.status as user_status,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM companies c
      JOIN company_user_roles cur ON c.id = cur.company_id
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM companies c
      JOIN company_user_roles cur ON c.id = cur.company_id
      ${whereClause}
    `;

    params.push(limit, offset);
    
    const [companiesResult, countResult] = await Promise.all([
      query(companiesQuery, params),
      query(countQuery, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / limit);

    res.json({
      companies: companiesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching user companies:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error fetching companies'
    });
  }
};

// Get company details with user roles
const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to this company
    const userRole = await getOne(`
      SELECT role, status 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2
    `, [id, userId]);

    if (!userRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this company'
      });
    }

    // Get company details
    const company = await getOne(`
      SELECT c.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM companies c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [id]);

    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'Company not found'
      });
    }

    // Get all users associated with this company
    const companyUsers = await getMany(`
      SELECT 
        cur.role,
        cur.status,
        cur.created_at as assigned_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.last_login_at,
        assigner.first_name || ' ' || assigner.last_name as assigned_by_name
      FROM company_user_roles cur
      JOIN users u ON cur.user_id = u.id
      LEFT JOIN users assigner ON cur.assigned_by = assigner.id
      WHERE cur.company_id = $1
      ORDER BY 
        CASE cur.role 
          WHEN 'owner' THEN 1 
          WHEN 'manager' THEN 2 
          WHEN 'agent' THEN 3 
        END,
        cur.created_at
    `, [id]);

    res.json({
      company: {
        ...company,
        user_role: userRole.role,
        user_status: userRole.status
      },
      users: companyUsers
    });

  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error fetching company details'
    });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if user has permission to update (owner or manager)
    const userRole = await getOne(`
      SELECT role 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2 AND role IN ('owner', 'manager')
    `, [id, userId]);

    if (!userRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this company'
      });
    }

    // Build update query
    const fields = Object.keys(updateData).filter(key => 
      ['name', 'registration_number', 'tax_id', 'address', 'phone', 'email', 'website', 'industry', 'size', 'status'].includes(key)
    );

    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        message: 'No valid fields provided for update'
      });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updateData[field])];

    const updateQuery = `
      UPDATE companies 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const updatedCompany = await getOne(updateQuery, values);

    res.json({
      message: 'Company updated successfully',
      company: updatedCompany
    });

  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error updating company'
    });
  }
};

// Assign user to company
const assignUserToCompany = async (req, res) => {
  try {
    const { companyId, userId: targetUserId, role } = req.body;
    const requesterId = req.user.id;

    // Check if requester has permission (owner or manager)
    const requesterRole = await getOne(`
      SELECT role 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2 AND role IN ('owner', 'manager')
    `, [companyId, requesterId]);

    if (!requesterRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to assign users to this company'
      });
    }

    // Check if target user exists
    const targetUser = await getOne('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Target user not found'
      });
    }

    // Check if user is already assigned to this company
    const existingRole = await getOne(`
      SELECT role, status 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2
    `, [companyId, targetUserId]);

    if (existingRole) {
      return res.status(400).json({
        error: 'User already assigned',
        message: 'User is already assigned to this company'
      });
    }

    // Assign user to company
    await query(`
      INSERT INTO company_user_roles (company_id, user_id, role, assigned_by, status)
      VALUES ($1, $2, $3, $4, 'active')
    `, [companyId, targetUserId, role, requesterId]);

    // Create notification for the assigned user
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES ($1, $2, $3, 'info', 'company_assignment', $4)
    `, [
      targetUserId,
      'Company Assignment',
      `You have been assigned as ${role} to a company.`,
      companyId
    ]);

    res.json({
      message: 'User assigned to company successfully'
    });

  } catch (error) {
    console.error('Error assigning user to company:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error assigning user to company'
    });
  }
};

// Remove user from company
const removeUserFromCompany = async (req, res) => {
  try {
    const { companyId, userId: targetUserId } = req.params;
    const requesterId = req.user.id;

    // Check if requester has permission (owner or manager)
    const requesterRole = await getOne(`
      SELECT role 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2 AND role IN ('owner', 'manager')
    `, [companyId, requesterId]);

    if (!requesterRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to remove users from this company'
      });
    }

    // Cannot remove owner
    const targetRole = await getOne(`
      SELECT role 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2
    `, [companyId, targetUserId]);

    if (!targetRole) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User is not assigned to this company'
      });
    }

    if (targetRole.role === 'owner') {
      return res.status(400).json({
        error: 'Cannot remove owner',
        message: 'Cannot remove the company owner'
      });
    }

    // Remove user from company
    await query(`
      DELETE FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2
    `, [companyId, targetUserId]);

    res.json({
      message: 'User removed from company successfully'
    });

  } catch (error) {
    console.error('Error removing user from company:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error removing user from company'
    });
  }
};

module.exports = {
  createCompany,
  getUserCompanies,
  getCompanyDetails,
  updateCompany,
  assignUserToCompany,
  removeUserFromCompany,
  getAllCompanies,
  getAdminCompanyDetails,
  updateCompanyStatus,
  updateCompanyAdmin
};