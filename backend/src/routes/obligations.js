const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const fiscalObligationService = require('../services/fiscalObligationService');
const { getOne, getMany, query } = require('../config/database');

/**
 * @route GET /api/v1/obligations
 * @desc Get all obligations for the authenticated user's companies
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_id,
      status,
      priority,
      obligation_type,
      due_date_from,
      due_date_to,
      page = 1,
      limit = 20000,
      sort_by = 'due_date',
      sort_order = 'asc'
    } = req.query;

    let sql = `
      SELECT 
        fo.*,
        c.name as company_name,
        c.categorie_personnes,
        c.sous_categorie
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
    `;
    
    const params = [userId];
    let paramIndex = 2;

    // Add filters
    if (company_id) {
      sql += ` AND fo.company_id = $${paramIndex++}`;
      params.push(company_id);
    }

    if (status) {
      sql += ` AND fo.status = $${paramIndex++}`;
      params.push(status);
    }

    if (priority) {
      sql += ` AND fo.priority = $${paramIndex++}`;
      params.push(priority);
    }

    if (obligation_type) {
      sql += ` AND fo.obligation_type = $${paramIndex++}`;
      params.push(obligation_type);
    }

    if (due_date_from) {
      sql += ` AND fo.due_date >= $${paramIndex++}`;
      params.push(due_date_from);
    }

    if (due_date_to) {
      sql += ` AND fo.due_date <= $${paramIndex++}`;
      params.push(due_date_to);
    }

    // Add sorting
    const allowedSortFields = ['due_date', 'created_at', 'priority', 'status', 'title'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'due_date';
    const sortDirection = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    sql += ` ORDER BY fo.${sortField} ${sortDirection}`;

    // Add pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), offset);

    const obligations = await getMany(sql, params);

    // Get total count for pagination
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*LIMIT.*OFFSET.*$/, '');
    const countResult = await getOne(countSql, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;

    res.json({
      success: true,
      data: obligations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get obligations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get obligations',
      message: 'Erreur lors de la récupération des obligations'
    });
  }
});

/**
 * @route GET /api/v1/obligations/:id
 * @desc Get a single obligation by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const obligation = await getOne(`
      SELECT 
        fo.*,
        c.name as company_name,
        c.categorie_personnes,
        c.sous_categorie
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE fo.id = $1 AND cur.user_id = $2 AND cur.status = 'active'
    `, [id, userId]);

    if (!obligation) {
      return res.status(404).json({
        success: false,
        error: 'Obligation not found',
        message: 'Obligation non trouvée'
      });
    }

    res.json({
      success: true,
      data: obligation
    });

  } catch (error) {
    console.error('Get obligation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get obligation',
      message: 'Erreur lors de la récupération de l\'obligation'
    });
  }
});

/**
 * @route POST /api/v1/obligations
 * @desc Create a new obligation
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_id,
      title,
      description,
      obligation_type,
      due_date,
      status = 'pending',
      priority = 'medium',
      periode_declaration,
      lien,
      obligation_details
    } = req.body;

    // Validate required fields
    if (!company_id || !title || !obligation_type || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Champs requis manquants'
      });
    }

    // Check if user has access to the company
    const companyAccess = await getOne(`
      SELECT 1 FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2 AND status = 'active'
    `, [company_id, userId]);

    if (!companyAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Accès refusé à cette entreprise'
      });
    }

    const result = await query(`
      INSERT INTO fiscal_obligations (
        company_id, title, description, obligation_type, due_date, 
        status, priority, created_by, periode_declaration, lien, 
        obligation_details, last_edited, edited_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      company_id,
      title,
      description || '',
      obligation_type,
      due_date,
      status,
      priority,
      userId,
      periode_declaration || '',
      lien || '',
      obligation_details ? JSON.stringify(obligation_details) : null,
      new Date(),
      userId,
      new Date()
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Obligation créée avec succès'
    });

  } catch (error) {
    console.error('Create obligation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create obligation',
      message: 'Erreur lors de la création de l\'obligation'
    });
  }
});

/**
 * @route PUT /api/v1/obligations/:id
 * @desc Update an obligation
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      obligation_type,
      due_date,
      status,
      priority,
      periode_declaration,
      lien,
      obligation_details
    } = req.body;

    // Check if user has access to the obligation
    const obligation = await getOne(`
      SELECT fo.* FROM fiscal_obligations fo
      INNER JOIN company_user_roles cur ON fo.company_id = cur.company_id
      WHERE fo.id = $1 AND cur.user_id = $2 AND cur.status = 'active'
    `, [id, userId]);

    if (!obligation) {
      return res.status(404).json({
        success: false,
        error: 'Obligation not found',
        message: 'Obligation non trouvée'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (obligation_type !== undefined) {
      updates.push(`obligation_type = $${paramIndex++}`);
      values.push(obligation_type);
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(due_date);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (periode_declaration !== undefined) {
      updates.push(`periode_declaration = $${paramIndex++}`);
      values.push(periode_declaration);
    }

    if (lien !== undefined) {
      updates.push(`lien = $${paramIndex++}`);
      values.push(lien);
    }

    if (obligation_details !== undefined) {
      updates.push(`obligation_details = $${paramIndex++}`);
      values.push(JSON.stringify(obligation_details));
    }

    // Always update last_edited and edited_by
    updates.push(`last_edited = $${paramIndex++}`);
    updates.push(`edited_by = $${paramIndex++}`);
    values.push(new Date(), userId);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
        message: 'Aucun champ à mettre à jour'
      });
    }

    values.push(id);
    const result = await query(`
      UPDATE fiscal_obligations 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Obligation mise à jour avec succès'
    });

  } catch (error) {
    console.error('Update obligation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update obligation',
      message: 'Erreur lors de la mise à jour de l\'obligation'
    });
  }
});

/**
 * @route DELETE /api/v1/obligations/:id
 * @desc Delete an obligation
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to the obligation
    const obligation = await getOne(`
      SELECT fo.* FROM fiscal_obligations fo
      INNER JOIN company_user_roles cur ON fo.company_id = cur.company_id
      WHERE fo.id = $1 AND cur.user_id = $2 AND cur.status = 'active'
    `, [id, userId]);

    if (!obligation) {
      return res.status(404).json({
        success: false,
        error: 'Obligation not found',
        message: 'Obligation non trouvée'
      });
    }

    await query('DELETE FROM fiscal_obligations WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Obligation supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete obligation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete obligation',
      message: 'Erreur lors de la suppression de l\'obligation'
    });
  }
});

/**
 * @route POST /api/v1/obligations/generate
 * @desc Generate obligations for a company based on fiscal calendar
 * @access Private
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_id } = req.body;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
        message: 'ID de l\'entreprise requis'
      });
    }

    // Check if user has access to the company
    const companyAccess = await getOne(`
      SELECT 1 FROM company_user_roles 
      WHERE company_id = $1 AND user_id = $2 AND status = 'active'
    `, [company_id, userId]);

    if (!companyAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Accès refusé à cette entreprise'
      });
    }

    // Generate obligations
    const obligations = await fiscalObligationService.generateObligationsForCompany(company_id, userId);
    
    if (obligations.length > 0) {
      // Save obligations to database
      const savedObligations = await fiscalObligationService.saveObligations(obligations);
      
      res.json({
        success: true,
        data: savedObligations,
        message: `${savedObligations.length} obligations générées avec succès`
      });
    } else {
      res.json({
        success: true,
        data: [],
        message: 'Aucune obligation générée'
      });
    }

  } catch (error) {
    console.error('Generate obligations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate obligations',
      message: 'Erreur lors de la génération des obligations'
    });
  }
});

/**
 * @route GET /api/v1/obligations/stats/overview
 * @desc Get obligation statistics overview
 * @access Private
 */
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await getOne(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN due_date < CURRENT_DATE THEN 1 END) as past_due
      FROM fiscal_obligations fo
      INNER JOIN company_user_roles cur ON fo.company_id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
    `, [userId]);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get obligation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get obligation statistics',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;

