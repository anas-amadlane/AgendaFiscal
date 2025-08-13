const { v4: uuidv4 } = require('uuid');
const { query, getOne, getMany, transaction } = require('../config/database');

// Send invitation
const sendInvitation = async (req, res) => {
  try {
    const { email, companyId, role, message } = req.body;
    const inviterId = req.user.id;

    // Check if inviter has permission to invite (owner or manager)
    const inviterRole = await getOne(`
      SELECT role 
      FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2 AND role IN ('owner', 'manager')
    `, [companyId, inviterId]);

    if (!inviterRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to send invitations for this company'
      });
    }

    // Check if company exists
    const company = await getOne('SELECT id, name FROM companies WHERE id = $1', [companyId]);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'Company not found'
      });
    }

    // Check if user is already invited or assigned
    const existingInvitation = await getOne(`
      SELECT status 
      FROM user_invitations 
      WHERE email = $1 AND company_id = $2 AND status = 'pending'
    `, [email, companyId]);

    if (existingInvitation) {
      return res.status(400).json({
        error: 'Invitation already sent',
        message: 'An active invitation has already been sent to this email for this company'
      });
    }

    // Check if user is already assigned to company
    const existingUser = await getOne(`
      SELECT u.id 
      FROM users u
      JOIN company_user_roles cur ON u.id = cur.user_id
      WHERE u.email = $1 AND cur.company_id = $2
    `, [email, companyId]);

    if (existingUser) {
      return res.status(400).json({
        error: 'User already assigned',
        message: 'This user is already assigned to the company'
      });
    }

    // Create invitation
    const invitationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await getOne(`
      INSERT INTO user_invitations (email, invited_by, company_id, role, invitation_token, expires_at, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [email, inviterId, companyId, role, invitationToken, expiresAt, message || `You have been invited to join ${company.name} as ${role}.`]);

    // If invited user exists in system, create notification
    const invitedUser = await getOne('SELECT id FROM users WHERE email = $1', [email]);
    if (invitedUser) {
      await query(`
        INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
        VALUES ($1, $2, $3, 'info', 'invitation', $4)
      `, [
        invitedUser.id,
        'Company Invitation',
        `You have been invited to join ${company.name} as ${role}.`,
        invitation.id
      ]);
    }

    // TODO: Send email invitation
    console.log(`Invitation sent to ${email} for company ${company.name} with token ${invitationToken}`);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at
      }
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error sending invitation'
    });
  }
};

// Get invitations sent by user
const getSentInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE i.invited_by = $1';
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND i.status = $${paramCount}`;
      params.push(status);
    }

    const invitationsQuery = `
      SELECT 
        i.*,
        c.name as company_name,
        u.first_name || ' ' || u.last_name as inviter_name
      FROM user_invitations i
      JOIN companies c ON i.company_id = c.id
      JOIN users u ON i.invited_by = u.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM user_invitations i
      ${whereClause}
    `;

    params.push(limit, offset);
    
    const [invitationsResult, countResult] = await Promise.all([
      query(invitationsQuery, params),
      query(countQuery, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / limit);

    res.json({
      invitations: invitationsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error fetching invitations'
    });
  }
};

// Get invitations received by user
const getReceivedInvitations = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE i.email = $1';
    let params = [userEmail];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND i.status = $${paramCount}`;
      params.push(status);
    }

    const invitationsQuery = `
      SELECT 
        i.*,
        c.name as company_name,
        c.industry,
        u.first_name || ' ' || u.last_name as inviter_name
      FROM user_invitations i
      JOIN companies c ON i.company_id = c.id
      JOIN users u ON i.invited_by = u.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM user_invitations i
      ${whereClause}
    `;

    params.push(limit, offset);
    
    const [invitationsResult, countResult] = await Promise.all([
      query(invitationsQuery, params),
      query(countQuery, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / limit);

    res.json({
      invitations: invitationsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching received invitations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error fetching invitations'
    });
  }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const result = await transaction(async (client) => {
      // Get invitation details
      const invitation = await client.query(`
        SELECT i.*, c.name as company_name
        FROM user_invitations i
        JOIN companies c ON i.company_id = c.id
        WHERE i.invitation_token = $1 AND i.status = 'pending'
      `, [token]);

      if (invitation.rows.length === 0) {
        throw new Error('Invalid or expired invitation');
      }

      const inv = invitation.rows[0];

      // Check if invitation has expired
      if (new Date() > new Date(inv.expires_at)) {
        await client.query(`
          UPDATE user_invitations 
          SET status = 'expired', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [inv.id]);
        throw new Error('Invitation has expired');
      }

      // Check if user email matches invitation email
      const user = await client.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (user.rows[0].email !== inv.email) {
        throw new Error('User email does not match invitation email');
      }

      // Check if user is already assigned to this company
      const existingRole = await client.query(`
        SELECT role 
        FROM company_user_roles 
        WHERE company_id = $1 AND user_id = $2
      `, [inv.company_id, userId]);

      if (existingRole.rows.length > 0) {
        throw new Error('User is already assigned to this company');
      }

      // Accept invitation
      await client.query(`
        UPDATE user_invitations 
        SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [inv.id]);

      // Assign user to company
      await client.query(`
        INSERT INTO company_user_roles (company_id, user_id, role, assigned_by, status)
        VALUES ($1, $2, $3, $4, 'active')
      `, [inv.company_id, userId, inv.role, inv.invited_by]);

      // Create notification for inviter
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
        VALUES ($1, $2, $3, 'success', 'invitation_accepted', $4)
      `, [
        inv.invited_by,
        'Invitation Accepted',
        `${user.rows[0].email} has accepted the invitation to join ${inv.company_name}.`,
        inv.company_id
      ]);

      return inv;
    });

    res.json({
      message: 'Invitation accepted successfully',
      company_name: result.company_name,
      role: result.role
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('already assigned') || error.message.includes('does not match')) {
      return res.status(400).json({
        error: 'Invalid invitation',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Error accepting invitation'
    });
  }
};

// Decline invitation
const declineInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    // Get invitation details
    const invitation = await getOne(`
      SELECT i.*, c.name as company_name
      FROM user_invitations i
      JOIN companies c ON i.company_id = c.id
      WHERE i.invitation_token = $1 AND i.status = 'pending'
    `, [token]);

    if (!invitation) {
      return res.status(404).json({
        error: 'Invalid invitation',
        message: 'Invalid or expired invitation'
      });
    }

    // Check if user email matches invitation email
    const user = await getOne('SELECT email FROM users WHERE id = $1', [userId]);
    if (user.email !== invitation.email) {
      return res.status(400).json({
        error: 'Invalid invitation',
        message: 'User email does not match invitation email'
      });
    }

    // Decline invitation
    await query(`
      UPDATE user_invitations 
      SET status = 'declined', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [invitation.id]);

    // Create notification for inviter
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES ($1, $2, $3, 'info', 'invitation_declined', $4)
    `, [
      invitation.invited_by,
      'Invitation Declined',
      `${user.email} has declined the invitation to join ${invitation.company_name}.`,
      invitation.company_id
    ]);

    res.json({
      message: 'Invitation declined successfully'
    });

  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error declining invitation'
    });
  }
};

// Cancel invitation (by inviter)
const cancelInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get invitation details and check permission
    const invitation = await getOne(`
      SELECT * 
      FROM user_invitations 
      WHERE id = $1 AND invited_by = $2 AND status = 'pending'
    `, [id, userId]);

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found',
        message: 'Invitation not found or you do not have permission to cancel it'
      });
    }

    // Cancel invitation
    await query(`
      UPDATE user_invitations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);

    res.json({
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error cancelling invitation'
    });
  }
};

module.exports = {
  sendInvitation,
  getSentInvitations,
  getReceivedInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation
};