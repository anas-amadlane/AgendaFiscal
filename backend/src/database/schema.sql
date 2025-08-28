-- Database Schema for Agenda Fiscal Backend
-- PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified roles: only regular and admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (role IN ('regular', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    -- Fiscal and legal information fields
    categorie_personnes VARCHAR(100), -- 'Personne Physique' or 'Personne Morale'
    sous_categorie VARCHAR(100), -- Legal form (SARL, SA, SAS, etc.)
    is_tva_assujetti BOOLEAN DEFAULT false, -- Subject to VAT
    regime_tva VARCHAR(50), -- 'Mensuel' or 'Trimestriel'
    prorata_deduction BOOLEAN DEFAULT false, -- Subject to prorata deduction
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fiscal Calendar table for default calendar data
-- Schema based on comprehensive fiscal declaration requirements
CREATE TABLE fiscal_calendar (
    id SERIAL PRIMARY KEY, -- Simple sequential numbering for unique identification
    categorie_personnes VARCHAR(100) NOT NULL, -- Type of taxpayer (Entreprise, Particulier, Auto-entrepreneur, Association...)
    sous_categorie VARCHAR(100), -- Sub-category precision (Société IS, Salarié, Profession libérale, Micro-entreprise...)
    type VARCHAR(50) NOT NULL, -- Nature of declaration: Fiscal, Social, or other (para-fiscal, réglementaire, etc.)
    tag VARCHAR(50) NOT NULL, -- Code or keyword representing the declaration (IS, IR, TVA, CNSS, CPU, TP...)
    frequence_declaration VARCHAR(50) NOT NULL, -- Declaration frequency: Mensuel, Trimestriel, Annuel
    periode_declaration VARCHAR(200), -- Periods concerned by the declaration (T1-T2-T3-T4, or specific months)
    mois VARCHAR(10), -- Month when declaration or payment is due (03 for March, 06 for June...)
    jours INTEGER, -- Day limit of the month for declaration or payment (20, 31...)
    detail_declaration TEXT, -- Description of content or object of declaration (TVA collectée, IR sur salaires, acompte IS...)
    formulaire VARCHAR(100), -- Form reference or service name used (IS205, TVA-CAD, DAMANCOM, etc.)
    lien VARCHAR(500), -- Link to online declaration portal or tool (www.tax.gov.ma, DAMANCOM...)
    commentaire TEXT, -- Additional information, clarifications, specific conditions, thresholds, reminders or practical remarks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company user roles (many-to-many relationship between users and companies with specific roles)
-- This table handles agent and manager roles within companies
CREATE TABLE company_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'agent')),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, user_id)
);

-- Invitations table for manager-agent invites
CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'agent')),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager-Agent relationships within companies
CREATE TABLE manager_agent_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (assignment_type IN ('all', 'specific')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, manager_id, agent_id)
);

-- Agent-Company assignments (for specific company assignments)
CREATE TABLE agent_company_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, company_id)
);

-- Fiscal obligations table
CREATE TABLE fiscal_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    obligation_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'MAD',
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard configurations
CREATE TABLE dashboard_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    configuration_name VARCHAR(100) NOT NULL,
    configuration_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expire TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for tracking changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_created_by ON companies(created_by);
CREATE INDEX idx_fiscal_calendar_categorie ON fiscal_calendar(categorie_personnes);
CREATE INDEX idx_fiscal_calendar_sous_categorie ON fiscal_calendar(sous_categorie);
CREATE INDEX idx_fiscal_calendar_type ON fiscal_calendar(type);
CREATE INDEX idx_fiscal_calendar_tag ON fiscal_calendar(tag);
CREATE INDEX idx_fiscal_calendar_frequence ON fiscal_calendar(frequence_declaration);
CREATE INDEX idx_fiscal_calendar_mois ON fiscal_calendar(mois);
CREATE INDEX idx_fiscal_calendar_jours ON fiscal_calendar(jours);
CREATE INDEX idx_fiscal_calendar_formulaire ON fiscal_calendar(formulaire);
CREATE INDEX idx_company_user_roles_company_id ON company_user_roles(company_id);
CREATE INDEX idx_company_user_roles_user_id ON company_user_roles(user_id);
CREATE INDEX idx_company_user_roles_role ON company_user_roles(role);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_company_id ON user_invitations(company_id);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_manager_agent_company_id ON manager_agent_assignments(company_id);
CREATE INDEX idx_manager_agent_manager_id ON manager_agent_assignments(manager_id);
CREATE INDEX idx_manager_agent_agent_id ON manager_agent_assignments(agent_id);
CREATE INDEX idx_agent_company_agent_id ON agent_company_assignments(agent_id);
CREATE INDEX idx_agent_company_company_id ON agent_company_assignments(company_id);
CREATE INDEX idx_fiscal_obligations_company_id ON fiscal_obligations(company_id);
CREATE INDEX idx_fiscal_obligations_due_date ON fiscal_obligations(due_date);
CREATE INDEX idx_fiscal_obligations_status ON fiscal_obligations(status);
CREATE INDEX idx_fiscal_obligations_assigned_to ON fiscal_obligations(assigned_to);
CREATE INDEX idx_dashboard_configurations_user_id ON dashboard_configurations(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expire ON user_sessions(expire);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_calendar_updated_at BEFORE UPDATE ON fiscal_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_user_roles_updated_at BEFORE UPDATE ON company_user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_invitations_updated_at BEFORE UPDATE ON user_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manager_agent_assignments_updated_at BEFORE UPDATE ON manager_agent_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_company_assignments_updated_at BEFORE UPDATE ON agent_company_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_obligations_updated_at BEFORE UPDATE ON fiscal_obligations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_configurations_updated_at BEFORE UPDATE ON dashboard_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 