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

module.exports = {
  getAdminStats,
  getAdminCompaniesOverview,
  getAdminDashboard
};
