class ApiProxy {
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Token management
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Request helper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle token refresh if needed
      if (response.status === 401 && this.refreshToken) {
        return this.handleTokenRefresh(endpoint, options);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Token refresh handling
  async handleTokenRefresh(originalEndpoint, originalOptions) {
    if (this.isRefreshing) {
      // Wait for the current refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      // Update tokens
      this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);

      // Retry original request
      const result = await this.request(originalEndpoint, originalOptions);

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => {
        resolve(this.request(originalEndpoint, originalOptions));
      });
      this.failedQueue = [];

      return result;
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearTokens();
      
      // Reject all queued requests
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedQueue = [];

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store tokens
    this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken() {
    const data = await this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    
    this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // User management endpoints
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/all?${queryString}`);
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async updateUserStatus(userId, status) {
    return this.request(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getManagerAgents(managerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/manager/${managerId}/agents?${queryString}`);
  }

  async assignAgentToManager(managerId, agentId) {
    return this.request('/users/assign-agent', {
      method: 'POST',
      body: JSON.stringify({ managerId, agentId }),
    });
  }

  async removeAgentFromManager(managerId, agentId) {
    return this.request(`/users/manager/${managerId}/agent/${agentId}`, {
      method: 'DELETE',
    });
  }

  async assignCompaniesToAgent(agentId, companyIds) {
    return this.request('/users/assign-companies', {
      method: 'POST',
      body: JSON.stringify({ agentId, companyIds }),
    });
  }

  async getAgentCompanies(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/agent/${agentId}/companies?${queryString}`);
  }

  // Company endpoints (to be implemented)
  async getCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/companies?${queryString}`);
  }

  async getCompany(companyId) {
    return this.request(`/companies/${companyId}`);
  }

  async createCompany(companyData) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(companyId, companyData) {
    return this.request(`/companies/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(companyId) {
    return this.request(`/companies/${companyId}`, {
      method: 'DELETE',
    });
  }

  // Fiscal obligations endpoints (to be implemented)
  async getFiscalObligations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/fiscal-obligations?${queryString}`);
  }

  async getFiscalObligation(obligationId) {
    return this.request(`/fiscal-obligations/${obligationId}`);
  }

  async createFiscalObligation(obligationData) {
    return this.request('/fiscal-obligations', {
      method: 'POST',
      body: JSON.stringify(obligationData),
    });
  }

  async updateFiscalObligation(obligationId, obligationData) {
    return this.request(`/fiscal-obligations/${obligationId}`, {
      method: 'PUT',
      body: JSON.stringify(obligationData),
    });
  }

  async deleteFiscalObligation(obligationId) {
    return this.request(`/fiscal-obligations/${obligationId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard configurations endpoints (to be implemented)
  async getDashboardConfigurations() {
    return this.request('/dashboard-configurations');
  }

  async getDashboardConfiguration(configId) {
    return this.request(`/dashboard-configurations/${configId}`);
  }

  async createDashboardConfiguration(configData) {
    return this.request('/dashboard-configurations', {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  }

  async updateDashboardConfiguration(configId, configData) {
    return this.request(`/dashboard-configurations/${configId}`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  async deleteDashboardConfiguration(configId) {
    return this.request(`/dashboard-configurations/${configId}`, {
      method: 'DELETE',
    });
  }

  // Notifications endpoints (to be implemented)
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications?${queryString}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // File upload endpoints (to be implemented)
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // ===== ROLE MANAGEMENT & INVITATIONS =====

  // Create company with role selection
  async createCompanyWithRole(companyData) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  }

  // Get user's companies with roles
  async getUserCompaniesWithRoles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/companies${queryString ? `?${queryString}` : ''}`, {
      method: 'GET'
    });
  }

  // Get company details with user roles
  async getCompanyDetailsWithRoles(companyId) {
    return this.request(`/companies/${companyId}`, {
      method: 'GET'
    });
  }

  // Assign user to company
  async assignUserToCompany(assignmentData) {
    return this.request('/companies/assign-user', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  // Remove user from company
  async removeUserFromCompany(companyId, userId) {
    return this.request(`/companies/${companyId}/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Send invitation
  async sendInvitation(invitationData) {
    return this.request('/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData)
    });
  }

  // Get sent invitations
  async getSentInvitations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/invitations/sent${queryString ? `?${queryString}` : ''}`, {
      method: 'GET'
    });
  }

  // Get received invitations
  async getReceivedInvitations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/invitations/received${queryString ? `?${queryString}` : ''}`, {
      method: 'GET'
    });
  }

  // Accept invitation
  async acceptInvitation(token) {
    return this.request(`/invitations/accept/${token}`, {
      method: 'POST'
    });
  }

  // Decline invitation
  async declineInvitation(token) {
    return this.request(`/invitations/decline/${token}`, {
      method: 'POST'
    });
  }

  // Cancel invitation
  async cancelInvitation(invitationId) {
    return this.request(`/invitations/${invitationId}`, {
      method: 'DELETE'
    });
  }
}

// Create singleton instance
const apiProxy = new ApiProxy();

export default apiProxy; 