import { UserRole, CompanyRole, CompanyWithRole } from '@/types/auth';
import apiProxy from './apiProxy';

export class RoleManagementService {
  // Check if we're in demo mode - disabled for production
  private static isDemoMode(): boolean {
    return false; // Always require real authentication in production
  }

  static canViewAllCompanies(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
  }

  static canAssignUsers(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
  }

  static getRoleDisplayName(role: UserRole | CompanyRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.REGULAR:
        return 'Utilisateur';
      case CompanyRole.MANAGER:
        return 'Manager';
      case CompanyRole.AGENT:
        return 'Agent';
      case CompanyRole.OWNER:
        return 'Propriétaire';
      default:
        return 'Inconnu';
    }
  }

  static getRoleColor(role: UserRole | CompanyRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return '#DC2626'; // Red
      case UserRole.REGULAR:
        return '#6B7280'; // Gray
      case CompanyRole.MANAGER:
        return '#1E40AF'; // Blue
      case CompanyRole.AGENT:
        return '#059669'; // Green
      case CompanyRole.OWNER:
        return '#7C3AED'; // Purple
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
      const response = await apiProxy.get('/companies');
      console.log('🔍 RoleManagementService: API Response:', response);
      console.log('🔍 RoleManagementService: Response structure:', {
        hasData: 'data' in response,
        hasCompanies: 'companies' in response,
        keys: Object.keys(response)
      });
      
      // Handle both possible response structures
      const companies = response.companies || response.data || [];
      return companies.map((company: any) => ({
        id: company.id,
        name: company.name,

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
      const response = await apiProxy.get(`/users/manager/${managerId}/agents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching manager agents:', error);
      throw error;
    }
  }

  // Create company with role assignment
  static async createCompanyWithRole(companyData: {
    name: string;
    categoriePersonnes?: string;
    sousCategorie?: string;
    userRole: UserRole;
    managerEmail?: string;
    isTvaAssujetti?: boolean;
    regimeTva?: string;
    prorataDdeduction?: boolean;
  }): Promise<void> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Creating company with role', companyData);
      return;
    }

    try {
      // Transform the data to match backend expectations
      console.log('🔍 RoleManagementService: Input userRole:', companyData.userRole);
      console.log('🔍 RoleManagementService: CompanyRole.MANAGER:', CompanyRole.MANAGER);
      console.log('🔍 RoleManagementService: Comparison result:', companyData.userRole === CompanyRole.MANAGER);
      
      const transformedData = {
        name: companyData.name,
        userRole: companyData.userRole === CompanyRole.MANAGER ? 'manager' : 'agent',
        managerEmail: companyData.managerEmail || '',
        categoriePersonnes: companyData.categoriePersonnes || null,
        sousCategorie: companyData.sousCategorie || null,
        isTvaAssujetti: companyData.isTvaAssujetti || false,
        regimeTva: companyData.regimeTva || null,
        prorataDdeduction: companyData.prorataDdeduction || false
      };

      console.log('🔍 RoleManagementService: Sending data to backend:', JSON.stringify(transformedData, null, 2));
      await apiProxy.createCompanyWithRole(transformedData);
    } catch (error) {
      console.error('Error creating company with role:', error);
      
      // Log detailed error information
      if (error.details) {
        console.error('Validation errors:', error.details);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      
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
      await apiProxy.post('/users/assign-agent', {
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
      await apiProxy.post('/users/assign-companies', {
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
      const response = await apiProxy.get(`/users/agent/${agentId}/companies`);
      return response.data.map((company: any) => ({
        id: company.id,
        name: company.name,

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

        status: 'active',
        userRole: UserRole.MANAGER,
        userStatus: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'EURL Commerce Plus',

        status: 'active',
        userRole: UserRole.AGENT,
        userStatus: 'active',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
      },
      {
        id: '3',
        name: 'SNC Services Pro',

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

export default RoleManagementService;
