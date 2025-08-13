const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool, query } = require('../config/database');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('📋 Creating database schema...');
    await pool.query(schemaSQL);
    console.log('✅ Database schema created successfully');

    // Check if admin user exists
    const adminExists = await query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@agendafiscal.com']
    );

    if (adminExists.length === 0) {
      console.log('👤 Creating default admin user...');
      
      // Create admin user
      const adminId = uuidv4();
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('Admin123!', saltRounds);

      await query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [adminId, 'admin@agendafiscal.com', hashedPassword, 'Admin', 'User', 'admin', 'active']
      );

      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@agendafiscal.com');
      console.log('🔑 Password: Admin123!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Check if sample data exists
    const companiesExist = await query('SELECT COUNT(*) as count FROM companies');
    
    if (parseInt(companiesExist[0].count) === 0) {
      console.log('🏢 Creating sample companies...');
      
      // Create sample companies
      const companies = [
        {
          name: 'Tech Solutions SARL',
          tax_number: 'MA123456789',
          address: '123 Rue Hassan II, Casablanca',
          phone: '+212-5-22-123456',
          email: 'contact@techsolutions.ma'
        },
        {
          name: 'Maroc Industries',
          tax_number: 'MA987654321',
          address: '456 Avenue Mohammed V, Rabat',
          phone: '+212-5-37-654321',
          email: 'info@marocindustries.ma'
        },
        {
          name: 'Atlas Trading',
          tax_number: 'MA456789123',
          address: '789 Boulevard Mohammed VI, Marrakech',
          phone: '+212-5-24-789123',
          email: 'contact@atlastrading.ma'
        }
      ];

      for (const company of companies) {
        await query(
          `INSERT INTO companies (name, tax_number, address, phone, email, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [company.name, company.tax_number, company.address, company.phone, company.email, 'active']
        );
      }

      console.log('✅ Sample companies created');
    } else {
      console.log('ℹ️  Sample companies already exist');
    }

    // Create sample fiscal obligations
    const obligationsExist = await query('SELECT COUNT(*) as count FROM fiscal_obligations');
    
    if (parseInt(obligationsExist[0].count) === 0) {
      console.log('💰 Creating sample fiscal obligations...');
      
      // Get company IDs
      const companies = await query('SELECT id FROM companies LIMIT 3');
      
      if (companies.length > 0) {
        const obligations = [
          {
            company_id: companies[0].id,
            obligation_type: 'TVA',
            description: 'TVA du mois de Janvier 2024',
            amount: 15000.00,
            due_date: '2024-02-20',
            status: 'pending'
          },
          {
            company_id: companies[0].id,
            obligation_type: 'IS',
            description: 'Impôt sur les sociétés - Q1 2024',
            amount: 45000.00,
            due_date: '2024-04-30',
            status: 'pending'
          },
          {
            company_id: companies[1].id,
            obligation_type: 'TVA',
            description: 'TVA du mois de Février 2024',
            amount: 22000.00,
            due_date: '2024-03-20',
            status: 'pending'
          },
          {
            company_id: companies[2].id,
            obligation_type: 'CNSS',
            description: 'Cotisations CNSS - Mars 2024',
            amount: 8500.00,
            due_date: '2024-04-15',
            status: 'pending'
          }
        ];

        for (const obligation of obligations) {
          await query(
            `INSERT INTO fiscal_obligations (company_id, obligation_type, description, amount, due_date, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [obligation.company_id, obligation.obligation_type, obligation.description, obligation.amount, obligation.due_date, obligation.status]
          );
        }

        console.log('✅ Sample fiscal obligations created');
      }
    } else {
      console.log('ℹ️  Sample fiscal obligations already exist');
    }

    console.log('🎉 Database migration completed successfully!');
    console.log('\n📊 Database Summary:');
    
    // Get statistics
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const companyCount = await query('SELECT COUNT(*) as count FROM companies');
    const obligationCount = await query('SELECT COUNT(*) as count FROM fiscal_obligations');
    
    console.log(`👥 Users: ${userCount[0].count}`);
    console.log(`🏢 Companies: ${companyCount[0].count}`);
    console.log(`💰 Fiscal Obligations: ${obligationCount[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 