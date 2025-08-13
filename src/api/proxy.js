// API Proxy Configuration for Agenda Fiscal Frontend
// This file handles all API communication with the backend

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiProxy {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.refreshToken = null;
    this.sessionToken = null;
  }

  // Set authentication tokens
  setTokens(tokens) {
    this.token = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.sessionToken = tokens.sessionToken;
  }

  // Clear authentication tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.sessionToken = null;
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.sessionToken) {
      headers['X-Session-Token'] = this.sessionToken;
    }

    return headers;
  }

  // Make API request with automatic token refresh
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      // Handle token refresh if needed
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry the original request with new token
          config.headers = this.getHeaders();
          const retryResponse = await fetch(url, config);
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Erreur de connexion au serveur');
    }
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Erreur de serveur');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // Refresh authentication tokens
  async refreshTokens() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setTokens(response.tokens);
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setTokens(response.tokens);
    return response;
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

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return await this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // User management endpoints
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/users?${queryString}`);
  }

  async getUserStats() {
    return await this.request('/users/stats');
  }

  async updateUserStatus(userId, isActive) {
    return await this.request(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  // Manager-Agent endpoints
  async getManagerAgents(status = 'active') {
    return await this.request(`/users/agents?status=${status}`);
  }

  async assignAgentToManager(agentId, assignmentType = 'all') {
    return await this.request('/users/agents/assign', {
      method: 'POST',
      body: JSON.stringify({ agentId, assignmentType }),
    });
  }

  async removeAgentAssignment(agentId) {
    return await this.request(`/users/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  async assignCompaniesToAgent(agentId, companyIds) {
    return await this.request(`/users/agents/${agentId}/companies`, {
      method: 'POST',
      body: JSON.stringify({ agentId, companyIds }),
    });
  }

  async getAgentCompanies(agentId) {
    return await this.request(`/users/agents/${agentId}/companies`);
  }

  // Company endpoints
  async getCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/companies?${queryString}`);
  }

  async getCompany(companyId) {
    return await this.request(`/companies/${companyId}`);
  }

  async createCompany(companyData) {
    return await this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(companyId, companyData) {
    return await this.request(`/companies/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(companyId) {
    return await this.request(`/companies/${companyId}`, {
      method: 'DELETE',
    });
  }

  // Fiscal obligations endpoints
  async getObligations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/obligations?${queryString}`);
  }

  async getObligation(obligationId) {
    return await this.request(`/obligations/${obligationId}`);
  }

  async createObligation(obligationData) {
    return await this.request('/obligations', {
      method: 'POST',
      body: JSON.stringify(obligationData),
    });
  }

  async updateObligation(obligationId, obligationData) {
    return await this.request(`/obligations/${obligationId}`, {
      method: 'PUT',
      body: JSON.stringify(obligationData),
    });
  }

  async deleteObligation(obligationId) {
    return await this.request(`/obligations/${obligationId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardConfig() {
    return await this.request('/dashboard/config');
  }

  async saveDashboardConfig(configData) {
    return await this.request('/dashboard/config', {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  }

  async getDashboardStats() {
    return await this.request('/dashboard/stats');
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/notifications?${queryString}`);
  }

  async markNotificationAsRead(notificationId) {
    return await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return await this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // File upload helper
  async uploadFile(file, endpoint) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'X-Session-Token': this.sessionToken,
      },
      body: formData,
    };

    const response = await fetch(url, config);
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const apiProxy = new ApiProxy();

export default apiProxy; 