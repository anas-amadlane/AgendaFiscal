const { query, getOne } = require('../config/database');

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    // Get user statistics
    const userStats = await getOne(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'regular' THEN 1 END) as regular_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_logins
       FROM users
    `);

    // Get company statistics
    const companyStats = await getOne(`
      SELECT 
        COUNT(*) as total_companies,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_companies,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_companies,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_companies
       FROM companies
    `);

    // Get company role statistics
    const roleStats = await getOne(`
      SELECT 
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as total_managers,
        COUNT(CASE WHEN role = 'agent' THEN 1 END) as total_agents,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as total_owners
       FROM company_user_roles
       WHERE status = 'active'
    `);

    res.json({
      stats: {
        totalUsers: parseInt(userStats.total_users),
        activeUsers: parseInt(userStats.active_users),
        totalCompanies: parseInt(companyStats.total_companies),
        activeCompanies: parseInt(companyStats.active_companies),
        totalManagers: parseInt(roleStats.total_managers),
        totalAgents: parseInt(roleStats.total_agents),
        totalAdmins: parseInt(userStats.admin_count),
        totalRegularUsers: parseInt(userStats.regular_count),
        recentLogins: parseInt(userStats.recent_logins)
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      error: 'Failed to get admin statistics',
      message: 'Erreur lors de la récupération des statistiques admin'
    });
  }
};

// Get admin dashboard companies overview
const getAdminCompaniesOverview = async (req, res) => {
  try {
    const companies = await query(`
      SELECT 
        c.id,
        c.name,
        c.status,
        c.created_at,
        COUNT(DISTINCT cur.user_id) as total_users,
        COUNT(CASE WHEN cur.role = 'manager' THEN 1 END) as managers_count,
        COUNT(CASE WHEN cur.role = 'agent' THEN 1 END) as agents_count,
        COUNT(CASE WHEN cur.role = 'owner' THEN 1 END) as owners_count
      FROM companies c
      LEFT JOIN company_user_roles cur ON c.id = cur.company_id AND cur.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, c.status, c.created_at
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    // Get users for each company
    const companiesWithUsers = await Promise.all(
      companies.rows.map(async (company) => {
        const users = await query(`
          SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            cur.role
          FROM company_user_roles cur
          JOIN users u ON cur.user_id = u.id
          WHERE cur.company_id = $1 AND cur.status = 'active'
          ORDER BY cur.role, u.first_name
        `, [company.id]);

        const managers = users.rows.filter(user => user.role === 'manager');
        const agents = users.rows.filter(user => user.role === 'agent');
        const owners = users.rows.filter(user => user.role === 'owner');

        return {
          id: company.id,
          name: company.name,
          status: company.status,
          totalUsers: parseInt(company.total_users),
          managers: managers,
          agents: agents,
          owners: owners,
          managersCount: parseInt(company.managers_count),
          agentsCount: parseInt(company.agents_count),
          ownersCount: parseInt(company.owners_count)
        };
      })
    );

    res.json({
      companies: companiesWithUsers
    });

  } catch (error) {
    console.error('Get admin companies overview error:', error);
    res.status(500).json({
      error: 'Failed to get companies overview',
      message: 'Erreur lors de la récupération de la vue d\'ensemble des entreprises'
    });
  }
};

// Get admin dashboard complete data
const getAdminDashboard = async (req, res) => {
  try {
    // Get all statistics
    const userStats = await getOne(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'regular' THEN 1 END) as regular_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_logins
       FROM users
    `);

    const companyStats = await getOne(`
      SELECT 
        COUNT(*) as total_companies,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_companies,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_companies,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_companies
       FROM companies
    `);

    const roleStats = await getOne(`
      SELECT 
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as total_managers,
        COUNT(CASE WHEN role = 'agent' THEN 1 END) as total_agents,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as total_owners
       FROM company_user_roles
       WHERE status = 'active'
    `);

    // Get companies overview
    const companies = await query(`
      SELECT 
        c.id,
        c.name,
        c.status,
        c.created_at,
        COUNT(DISTINCT cur.user_id) as total_users,
        COUNT(CASE WHEN cur.role = 'manager' THEN 1 END) as managers_count,
        COUNT(CASE WHEN cur.role = 'agent' THEN 1 END) as agents_count,
        COUNT(CASE WHEN cur.role = 'owner' THEN 1 END) as owners_count
      FROM companies c
      LEFT JOIN company_user_roles cur ON c.id = cur.company_id AND cur.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, c.status, c.created_at
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    // Get users for each company
    const companiesWithUsers = await Promise.all(
      companies.rows.map(async (company) => {
        const users = await query(`
          SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            cur.role
          FROM company_user_roles cur
          JOIN users u ON cur.user_id = u.id
          WHERE cur.company_id = $1 AND cur.status = 'active'
          ORDER BY cur.role, u.first_name
        `, [company.id]);

        const managers = users.rows.filter(user => user.role === 'manager');
        const agents = users.rows.filter(user => user.role === 'agent');
        const owners = users.rows.filter(user => user.role === 'owner');

        return {
          id: company.id,
          name: company.name,
          status: company.status,
          totalUsers: parseInt(company.total_users),
          managers: managers,
          agents: agents,
          owners: owners,
          managersCount: parseInt(company.managers_count),
          agentsCount: parseInt(company.agents_count),
          ownersCount: parseInt(company.owners_count)
        };
      })
    );

    const responseData = {
      stats: {
        totalUsers: parseInt(userStats.total_users),
        activeUsers: parseInt(userStats.active_users),
        totalCompanies: parseInt(companyStats.total_companies),
        activeCompanies: parseInt(companyStats.active_companies),
        totalManagers: parseInt(roleStats.total_managers),
        totalAgents: parseInt(roleStats.total_agents),
        totalAdmins: parseInt(userStats.admin_count),
        totalRegularUsers: parseInt(userStats.regular_count),
        recentLogins: parseInt(userStats.recent_logins)
      },
      companies: companiesWithUsers
    };

    res.json(responseData);

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get admin dashboard data',
      message: 'Erreur lors de la récupération des données du tableau de bord admin'
    });
  }
};

// Admin fiscal calendar management methods

// Get all fiscal calendar entries for admin
const getAdminCalendar = async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM fiscal_calendar 
      ORDER BY categorie_personnes, type, tag, frequence_declaration
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get admin calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fiscal calendar entries',
      message: 'Erreur lors de la récupération des entrées du calendrier fiscal'
    });
  }
};

// Create a new fiscal calendar entry
const createAdminCalendarEntry = async (req, res) => {
  try {
    const {
      categorie_personnes,
      sous_categorie,
      type,
      tag,
      frequence_declaration,
      periode_declaration,
      mois,
      jours,
      detail_declaration,
      formulaire,
      lien,
      commentaire
    } = req.body;

    // Validate required fields
    if (!categorie_personnes || !type || !tag || !frequence_declaration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Champs requis manquants'
      });
    }

    const result = await query(`
      INSERT INTO fiscal_calendar (
        categorie_personnes, sous_categorie, type, tag, frequence_declaration,
        periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      categorie_personnes, sous_categorie, type, tag, frequence_declaration,
      periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Entrée du calendrier fiscal créée avec succès'
    });

  } catch (error) {
    console.error('Create admin calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fiscal calendar entry',
      message: 'Erreur lors de la création de l\'entrée du calendrier fiscal'
    });
  }
};

// Update a fiscal calendar entry
const updateAdminCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categorie_personnes,
      sous_categorie,
      type,
      tag,
      frequence_declaration,
      periode_declaration,
      mois,
      jours,
      detail_declaration,
      formulaire,
      lien,
      commentaire
    } = req.body;

    // Check if entry exists
    const existingEntry = await getOne('SELECT * FROM fiscal_calendar WHERE id = $1', [id]);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
        message: 'Entrée non trouvée'
      });
    }

    const result = await query(`
      UPDATE fiscal_calendar SET
        categorie_personnes = $1,
        sous_categorie = $2,
        type = $3,
        tag = $4,
        frequence_declaration = $5,
        periode_declaration = $6,
        mois = $7,
        jours = $8,
        detail_declaration = $9,
        formulaire = $10,
        lien = $11,
        commentaire = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [
      categorie_personnes, sous_categorie, type, tag, frequence_declaration,
      periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire, id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Entrée du calendrier fiscal mise à jour avec succès'
    });

  } catch (error) {
    console.error('Update admin calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fiscal calendar entry',
      message: 'Erreur lors de la mise à jour de l\'entrée du calendrier fiscal'
    });
  }
};

// Delete a fiscal calendar entry
const deleteAdminCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry exists
    const existingEntry = await getOne('SELECT * FROM fiscal_calendar WHERE id = $1', [id]);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
        message: 'Entrée non trouvée'
      });
    }

    await query('DELETE FROM fiscal_calendar WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Entrée du calendrier fiscal supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete admin calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete fiscal calendar entry',
      message: 'Erreur lors de la suppression de l\'entrée du calendrier fiscal'
    });
  }
};

// Import fiscal calendar entries from Excel
const importAdminCalendar = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid import data',
        message: 'Données d\'import invalides'
      });
    }

    let imported = 0;
    let errors = [];

    for (const item of items) {
      try {
        // Validate required fields
        if (!item.categorie_personnes || !item.type || !item.tag || !item.frequence_declaration) {
          errors.push(`Item missing required fields: ${JSON.stringify(item)}`);
          continue;
        }

        await query(`
          INSERT INTO fiscal_calendar (
            categorie_personnes, sous_categorie, type, tag, frequence_declaration,
            periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          item.categorie_personnes, item.sous_categorie, item.type, item.tag, item.frequence_declaration,
          item.periode_declaration, item.mois, item.jours, item.detail_declaration, item.formulaire, item.lien, item.commentaire
        ]);

        imported++;
      } catch (error) {
        errors.push(`Error importing item: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        imported,
        total: items.length,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `${imported} entrées importées avec succès sur ${items.length}`
    });

  } catch (error) {
    console.error('Import admin calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import fiscal calendar entries',
      message: 'Erreur lors de l\'import des entrées du calendrier fiscal'
    });
  }
};

module.exports = {
  getAdminStats,
  getAdminCompaniesOverview,
  getAdminDashboard,
  getAdminCalendar,
  createAdminCalendarEntry,
  updateAdminCalendarEntry,
  deleteAdminCalendarEntry,
  importAdminCalendar
};
