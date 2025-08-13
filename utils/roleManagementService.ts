import { UserRole, CompanyWithRole } from '@/types/auth';
import { apiProxy } from './apiProxy';

export class RoleManagementService {
  // Check if we're in demo mode
  private static isDemoMode(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
  }

  static canViewAllCompanies(userRole: UserRole): boolean {
    return userRole === UserRole.MANAGER;
  }

  static canAssignUsers(userRole: UserRole): boolean {
    return userRole === UserRole.MANAGER;
  }

  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.AGENT:
        return 'Agent';
      case UserRole.USER:
        return 'Utilisateur';
      default:
        return 'Inconnu';
    }
  }

  static getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.MANAGER:
        return '#1E40AF'; // Blue
      case UserRole.AGENT:
        return '#059669'; // Green
      case UserRole.USER:
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  }

  // Get user's companies with their roles
  static async getUserCompanies(): Promise<CompanyWithRole[]> {
    if (this.isDemoMode()) {
      return this.getDemoCompanies();
    }

    try {
      const response = await apiProxy.get('/api/v1/users/companies');
      return response.data.map((company: any) => ({
        id: company.id,
        name: company.name,
        registrationNumber: company.registration_number,
        taxId: company.tax_id,
        status: company.status,
        userRole: company.user_role,
        userStatus: company.user_status,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching user companies:', error);
      throw error;
    }
  }

  // Get manager's agents
  static async getManagerAgents(managerId: string): Promise<any[]> {
    if (this.isDemoMode()) {
      return this.getDemoAgents();
    }

    try {
      const response = await apiProxy.get(`/api/v1/users/manager/${managerId}/agents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching manager agents:', error);
      throw error;
    }
  }

  // Create company with role assignment
  static async createCompanyWithRole(companyData: {
    name: string;
    registrationNumber: string;
    taxId?: string;
    industry?: string;
    userRole: UserRole;
    managerEmail?: string;
  }): Promise<void> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Creating company with role', companyData);
      return;
    }

    try {
      await apiProxy.post('/api/v1/companies', companyData);
    } catch (error) {
      console.error('Error creating company with role:', error);
      throw error;
    }
  }

  // Assign agent to manager
  static async assignAgentToManager(managerId: string, agentId: string): Promise<void> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Assigning agent to manager', { managerId, agentId });
      return;
    }

    try {
      await apiProxy.post('/api/v1/users/assign-agent', {
        managerId,
        agentId
      });
    } catch (error) {
      console.error('Error assigning agent to manager:', error);
      throw error;
    }
  }

  // Assign companies to agent
  static async assignCompaniesToAgent(agentId: string, companyIds: string[]): Promise<void> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Assigning companies to agent', { agentId, companyIds });
      return;
    }

    try {
      await apiProxy.post('/api/v1/users/assign-companies', {
        agentId,
        companyIds
      });
    } catch (error) {
      console.error('Error assigning companies to agent:', error);
      throw error;
    }
  }

  // Get agent's companies
  static async getAgentCompanies(agentId: string): Promise<CompanyWithRole[]> {
    if (this.isDemoMode()) {
      return this.getDemoCompanies().filter(company => company.userRole === UserRole.AGENT);
    }

    try {
      const response = await apiProxy.get(`/api/v1/users/agent/${agentId}/companies`);
      return response.data.map((company: any) => ({
        id: company.id,
        name: company.name,
        registrationNumber: company.registration_number,
        taxId: company.tax_id,
        status: company.status,
        userRole: company.user_role,
        userStatus: company.user_status,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching agent companies:', error);
      throw error;
    }
  }

  // Demo data methods
  private static getDemoCompanies(): CompanyWithRole[] {
    return [
      {
        id: '1',
        name: 'SARL Tech Solutions',
        registrationNumber: '12345678',
        taxId: '12345678',
        status: 'active',
        userRole: UserRole.MANAGER,
        userStatus: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'EURL Commerce Plus',
        registrationNumber: '87654321',
        taxId: '87654321',
        status: 'active',
        userRole: UserRole.AGENT,
        userStatus: 'active',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
      },
      {
        id: '3',
        name: 'SNC Services Pro',
        registrationNumber: '11223344',
        taxId: '11223344',
        status: 'active',
        userRole: UserRole.AGENT,
        userStatus: 'active',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
      },
    ];
  }

  private static getDemoAgents(): any[] {
    return [
      {
        id: 'agent1',
        email: 'agent1@example.com',
        firstName: 'Mohammed',
        lastName: 'Alaoui',
        role: UserRole.AGENT,
        status: 'active',
        assignedCompanies: ['2', '3']
      },
      {
        id: 'agent2',
        email: 'agent2@example.com',
        firstName: 'Fatima',
        lastName: 'Benjelloun',
        role: UserRole.AGENT,
        status: 'active',
        assignedCompanies: ['2']
      },
    ];
  }
}
