import apiProxy from './apiProxy';
import { 
  CompanyWithRole, 
  CompanyDetails, 
  CompanyUser, 
  UserInvitation, 
  ManagerAgentAssignment,
  UserRole 
} from '@/types/auth';

export class RoleManagementService {
  // Check if we're in demo mode
  private static isDemoMode(): boolean {
    return typeof localStorage !== 'undefined' && localStorage.getItem('demoMode') === 'true';
  }

  // Company management with roles
  static async getUserCompanies(params: any = {}): Promise<CompanyWithRole[]> {
    try {
      if (this.isDemoMode()) {
        // Return demo companies
        return [
          {
            id: 'demo-company-1',
            name: 'SARL Tech Innovation',
            registrationNumber: '12345678',
            taxId: '12345678',
            status: 'active',
            userRole: UserRole.MANAGER,
            userStatus: 'active',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'demo-company-2',
            name: 'SARL Commerce Plus',
            registrationNumber: '87654321',
            taxId: '87654321',
            status: 'active',
            userRole: UserRole.AGENT,
            userStatus: 'active',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          }
        ];
      }

      const response = await apiProxy.getUserCompaniesWithRoles(params);
      return response.companies || [];
    } catch (error) {
      console.error('Error fetching user companies:', error);
      throw error;
    }
  }

  static async getCompanyDetails(companyId: string): Promise<CompanyDetails> {
    try {
      if (this.isDemoMode()) {
        // Return demo company details
        return {
          company: {
            id: companyId,
            name: 'SARL Tech Innovation',
            registrationNumber: '12345678',
            taxId: '12345678',
            status: 'active',
            userRole: UserRole.MANAGER,
            userStatus: 'active',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          users: [
            {
              id: 'demo-user-1',
              firstName: 'Demo',
              lastName: 'Manager',
              email: 'demo@example.com',
              role: UserRole.MANAGER,
              status: 'active',
              assignedAt: new Date('2024-01-01'),
              assignedByName: 'System',
            }
          ]
        };
      }

      const response = await apiProxy.getCompanyDetailsWithRoles(companyId);
      return response;
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  }

  static async createCompanyWithRole(companyData: {
    name: string;
    registrationNumber?: string;
    taxId?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    industry?: string;
    size?: string;
    userRole: UserRole;
    managerEmail?: string;
  }): Promise<CompanyWithRole> {
    try {
      if (this.isDemoMode()) {
        // Return demo company
        const demoCompany: CompanyWithRole = {
          id: 'demo-company-' + Date.now(),
          name: companyData.name,
          registrationNumber: companyData.registrationNumber || 'DEMO' + Date.now(),
          taxId: companyData.taxId || companyData.registrationNumber || 'DEMO' + Date.now(),
          status: 'active',
          userRole: companyData.userRole,
          userStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return demoCompany;
      }

      const response = await apiProxy.createCompanyWithRole(companyData);
      return response.company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  static async assignUserToCompany(assignmentData: {
    companyId: string;
    userId: string;
    role: UserRole;
  }): Promise<void> {
    try {
      if (this.isDemoMode()) {
        // In demo mode, just return success
        console.log('Demo mode: User assigned to company', assignmentData);
        return;
      }

      await apiProxy.assignUserToCompany(assignmentData);
    } catch (error) {
      console.error('Error assigning user to company:', error);
      throw error;
    }
  }

  static async removeUserFromCompany(companyId: string, userId: string): Promise<void> {
    try {
      if (this.isDemoMode()) {
        // In demo mode, just return success
        console.log('Demo mode: User removed from company', { companyId, userId });
        return;
      }

      await apiProxy.removeUserFromCompany(companyId, userId);
    } catch (error) {
      console.error('Error removing user from company:', error);
      throw error;
    }
  }

  // Manager-Agent assignments
  static async getManagerAgents(managerId: string, params: any = {}): Promise<CompanyUser[]> {
    try {
      if (this.isDemoMode()) {
        // Return demo agents
        return [
          {
            id: 'demo-agent-1',
            firstName: 'Demo',
            lastName: 'Agent',
            email: 'agent@example.com',
            role: UserRole.AGENT,
            status: 'active',
            assignedAt: new Date('2024-01-01'),
            assignedByName: 'Demo Manager',
          }
        ];
      }

      const response = await apiProxy.getManagerAgents(managerId, params);
      return response.agents || [];
    } catch (error) {
      console.error('Error fetching manager agents:', error);
      throw error;
    }
  }

  static async assignAgentToManager(managerId: string, agentId: string, assignmentType: 'all' | 'specific' = 'all'): Promise<ManagerAgentAssignment> {
    try {
      if (this.isDemoMode()) {
        // Return demo assignment
        const demoAssignment: ManagerAgentAssignment = {
          id: 'demo-assignment-' + Date.now(),
          managerId,
          agentId,
          assignmentType,
          status: 'active',
          createdAt: new Date(),
        };
        console.log('Demo mode: Agent assigned to manager', { managerId, agentId, assignmentType });
        return demoAssignment;
      }

      const response = await apiProxy.assignAgentToManager(managerId, agentId);
      return response.assignment;
    } catch (error) {
      console.error('Error assigning agent to manager:', error);
      throw error;
    }
  }

  static async removeAgentFromManager(managerId: string, agentId: string): Promise<void> {
    try {
      if (this.isDemoMode()) {
        console.log('Demo mode: Agent removed from manager', { managerId, agentId });
        return;
      }

      await apiProxy.removeAgentFromManager(managerId, agentId);
    } catch (error) {
      console.error('Error removing agent from manager:', error);
      throw error;
    }
  }

  static async assignCompaniesToAgent(agentId: string, companyIds: string[]): Promise<void> {
    try {
      if (this.isDemoMode()) {
        console.log('Demo mode: Companies assigned to agent', { agentId, companyIds });
        return;
      }

      await apiProxy.assignCompaniesToAgent(agentId, companyIds);
    } catch (error) {
      console.error('Error assigning companies to agent:', error);
      throw error;
    }
  }

  static async getAgentCompanies(agentId: string, params: any = {}): Promise<CompanyWithRole[]> {
    try {
      if (this.isDemoMode()) {
        // Return demo companies for agent
        return [
          {
            id: 'demo-company-1',
            name: 'SARL Tech Innovation',
            registrationNumber: '12345678',
            taxId: '12345678',
            status: 'active',
            userRole: UserRole.AGENT,
            userStatus: 'active',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          }
        ];
      }

      const response = await apiProxy.getAgentCompanies(agentId, params);
      return response.companies || [];
    } catch (error) {
      console.error('Error fetching agent companies:', error);
      throw error;
    }
  }

  // Demo method to get all users (for user management)
  static async getAllUsers(params: any = {}): Promise<any[]> {
    try {
      if (this.isDemoMode()) {
        // Return demo users
        return [
          {
            id: 'demo-user-1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: UserRole.MANAGER,
            isActive: true,
          },
          {
            id: 'demo-user-2',
            email: 'agent@example.com',
            firstName: 'Demo',
            lastName: 'Agent',
            role: UserRole.AGENT,
            isActive: true,
          }
        ];
      }

      // This would normally call the API
      return [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  // Invitations
  static async sendInvitation(invitationData: {
    email: string;
    companyId: string;
    role: UserRole;
    message?: string;
  }): Promise<UserInvitation> {
    try {
      if (this.isDemoMode()) {
        // Return demo invitation
        const demoInvitation: UserInvitation = {
          id: 'demo-invitation-' + Date.now(),
          email: invitationData.email,
          invitedBy: 'demo-user-1',
          companyId: invitationData.companyId,
          role: invitationData.role,
          invitationToken: 'demo-token-' + Date.now(),
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          message: invitationData.message,
          createdAt: new Date(),
        };
        console.log('Demo mode: Invitation sent', invitationData);
        return demoInvitation;
      }

      const response = await apiProxy.sendInvitation(invitationData);
      return response.invitation;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  static async getSentInvitations(params: any = {}): Promise<UserInvitation[]> {
    try {
      if (this.isDemoMode()) {
        // Return demo sent invitations
        return [
          {
            id: 'demo-sent-invitation-1',
            email: 'manager@example.com',
            invitedBy: 'demo-user-1',
            companyId: 'demo-company-1',
            role: UserRole.MANAGER,
            invitationToken: 'demo-token-1',
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          }
        ];
      }

      const response = await apiProxy.getSentInvitations(params);
      return response.invitations || [];
    } catch (error) {
      console.error('Error fetching sent invitations:', error);
      throw error;
    }
  }

  static async getReceivedInvitations(params: any = {}): Promise<UserInvitation[]> {
    try {
      if (this.isDemoMode()) {
        // Return demo received invitations
        return [
          {
            id: 'demo-received-invitation-1',
            email: 'demo@example.com',
            invitedBy: 'demo-user-2',
            companyId: 'demo-company-2',
            role: UserRole.AGENT,
            invitationToken: 'demo-token-2',
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          }
        ];
      }

      const response = await apiProxy.getReceivedInvitations(params);
      return response.invitations || [];
    } catch (error) {
      console.error('Error fetching received invitations:', error);
      throw error;
    }
  }

  static async acceptInvitation(token: string): Promise<void> {
    try {
      if (this.isDemoMode()) {
        console.log('Demo mode: Invitation accepted', token);
        return;
      }

      await apiProxy.acceptInvitation(token);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  static async declineInvitation(token: string): Promise<void> {
    try {
      if (this.isDemoMode()) {
        console.log('Demo mode: Invitation declined', token);
        return;
      }

      await apiProxy.declineInvitation(token);
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  }

  static async cancelInvitation(invitationId: string): Promise<void> {
    try {
      if (this.isDemoMode()) {
        console.log('Demo mode: Invitation canceled', invitationId);
        return;
      }

      await apiProxy.cancelInvitation(invitationId);
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  }

  // Utility functions
  static canAssignUsers(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  }

  static canManageCompany(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  }

  static canViewAllCompanies(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
  }

  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
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
      case UserRole.ADMIN:
        return '#DC2626'; // Red
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
}

export default RoleManagementService;
