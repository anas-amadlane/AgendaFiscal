import apiProxy from './apiProxy';
import { CompanyRole, CompanyUserRole } from '@/types/auth';

export class CompanyRoleService {
  private static instance: CompanyRoleService;

  static getInstance(): CompanyRoleService {
    if (!CompanyRoleService.instance) {
      CompanyRoleService.instance = new CompanyRoleService();
    }
    return CompanyRoleService.instance;
  }

  // Get user's role in a specific company
  async getUserCompanyRole(userId: string, companyId: string): Promise<CompanyUserRole | null> {
    try {
      const response = await apiProxy.request(`/companies/${companyId}/users/${userId}/role`, {
        method: 'GET'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user company role:', error);
      return null;
    }
  }

  // Assign a role to a user in a company
  async assignUserToCompany(
    companyId: string, 
    userId: string, 
    role: CompanyRole, 
    assignedBy: string
  ): Promise<CompanyUserRole> {
    const response = await apiProxy.request(`/companies/${companyId}/users`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        role,
        assignedBy
      })
    });
    return response.data;
  }

  // Update user's role in a company
  async updateUserCompanyRole(
    companyId: string,
    userId: string,
    role: CompanyRole,
    updatedBy: string
  ): Promise<CompanyUserRole> {
    const response = await apiProxy.request(`/companies/${companyId}/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({
        role,
        updatedBy
      })
    });
    return response.data;
  }

  // Remove user from company
  async removeUserFromCompany(companyId: string, userId: string): Promise<void> {
    await apiProxy.request(`/companies/${companyId}/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Get all users in a company with their roles
  async getCompanyUsers(companyId: string): Promise<CompanyUserRole[]> {
    const response = await apiProxy.request(`/companies/${companyId}/users`, {
      method: 'GET'
    });
    return response.data;
  }

  // Get all companies where a user has a role
  async getUserCompanies(userId: string): Promise<CompanyUserRole[]> {
    const response = await apiProxy.request(`/users/${userId}/companies`, {
      method: 'GET'
    });
    return response.data;
  }

  // Check if user is manager in a company
  async isUserManager(userId: string, companyId: string): Promise<boolean> {
    const role = await this.getUserCompanyRole(userId, companyId);
    return role?.role === CompanyRole.MANAGER || role?.role === CompanyRole.OWNER;
  }

  // Check if user is agent in a company
  async isUserAgent(userId: string, companyId: string): Promise<boolean> {
    const role = await this.getUserCompanyRole(userId, companyId);
    return role?.role === CompanyRole.AGENT;
  }

  // Get managers for a company
  async getCompanyManagers(companyId: string): Promise<CompanyUserRole[]> {
    const users = await this.getCompanyUsers(companyId);
    return users.filter(user => 
      user.role === CompanyRole.MANAGER || user.role === CompanyRole.OWNER
    );
  }

  // Get agents for a company
  async getCompanyAgents(companyId: string): Promise<CompanyUserRole[]> {
    const users = await this.getCompanyUsers(companyId);
    return users.filter(user => user.role === CompanyRole.AGENT);
  }
}

export default CompanyRoleService.getInstance();
