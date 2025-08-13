const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('📋 Creating database schema...');
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Create initial admin user if it doesn't exist
    console.log('👤 Creating initial admin user...');
    const adminExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@agenda-fiscal.ma']
    );

    if (adminExists.rowCount === 0) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('Admin123!', 12);

      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'admin@agenda-fiscal.ma',
          passwordHash,
          'Admin',
          'System',
          'admin',
          true,
          true
        ]
      );
      console.log('✅ Initial admin user created');
      console.log('📧 Email: admin@agenda-fiscal.ma');
      console.log('🔑 Password: Admin123!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample data for testing
    console.log('📊 Creating sample data...');
    await createSampleData();

    console.log('🎉 Database migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  try {
    // Create sample users
    const users = [
      {
        email: 'manager@agenda-fiscal.ma',
        password: 'Manager123!',
        firstName: 'Ahmed',
        lastName: 'Benali',
        company: 'SARL Tech Innovation',
        role: 'manager'
      },
      {
        email: 'agent@agenda-fiscal.ma',
        password: 'Agent123!',
        firstName: 'Fatima',
        lastName: 'Alaoui',
        company: 'Consulting Services',
        role: 'agent'
      },
      {
        email: 'user@agenda-fiscal.ma',
        password: 'User123!',
        firstName: 'Karim',
        lastName: 'Tazi',
        company: 'Digital Solutions',
        role: 'user'
      }
    ];

    const bcrypt = require('bcryptjs');

    for (const userData of users) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rowCount === 0) {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        await pool.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, company, role, is_active, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userData.email,
            passwordHash,
            userData.firstName,
            userData.lastName,
            userData.company,
            userData.role,
            true,
            true
          ]
        );
      }
    }

    // Create sample companies
    const companies = [
      {
        name: 'SARL Tech Innovation',
        registrationNumber: 'MA123456789',
        taxId: '123456789',
        address: '123 Rue Mohammed V, Casablanca',
        phone: '+212-5-22-123456',
        email: 'contact@techinnovation.ma',
        industry: 'Technology',
        size: 'Medium'
      },
      {
        name: 'Consulting Services SARL',
        registrationNumber: 'MA987654321',
        taxId: '987654321',
        address: '456 Avenue Hassan II, Rabat',
        phone: '+212-5-37-654321',
        email: 'info@consultingservices.ma',
        industry: 'Consulting',
        size: 'Small'
      },
      {
        name: 'Digital Solutions Ltd',
        registrationNumber: 'MA456789123',
        taxId: '456789123',
        address: '789 Boulevard Mohammed VI, Marrakech',
        phone: '+212-5-24-789123',
        email: 'hello@digitalsolutions.ma',
        industry: 'Digital Services',
        size: 'Large'
      }
    ];

    const adminUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@agenda-fiscal.ma']
    );

    for (const companyData of companies) {
      const existingCompany = await pool.query(
        'SELECT id FROM companies WHERE registration_number = $1',
        [companyData.registrationNumber]
      );

      if (existingCompany.rowCount === 0) {
        await pool.query(
          `INSERT INTO companies (name, registration_number, tax_id, address, phone, email, industry, size, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            companyData.name,
            companyData.registrationNumber,
            companyData.taxId,
            companyData.address,
            companyData.phone,
            companyData.email,
            companyData.industry,
            companyData.size,
            adminUser.rows[0].id
          ]
        );
      }
    }

    // Create manager-agent assignments
    const managerUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['manager@agenda-fiscal.ma']
    );

    const agentUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['agent@agenda-fiscal.ma']
    );

    if (managerUser.rowCount > 0 && agentUser.rowCount > 0) {
      const existingAssignment = await pool.query(
        'SELECT id FROM manager_agent_assignments WHERE manager_id = $1 AND agent_id = $2',
        [managerUser.rows[0].id, agentUser.rows[0].id]
      );

      if (existingAssignment.rowCount === 0) {
        await pool.query(
          `INSERT INTO manager_agent_assignments (manager_id, agent_id, assignment_type, status)
           VALUES ($1, $2, $3, $4)`,
          [managerUser.rows[0].id, agentUser.rows[0].id, 'all', 'active']
        );
      }
    }

    console.log('✅ Sample data created successfully');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 