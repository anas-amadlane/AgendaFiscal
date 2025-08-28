// Session Management for Production Security
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly ACTIVITY_KEY = 'lastActivity';
  
  // Update last activity timestamp
  static updateActivity(): void {
    const now = Date.now().toString();
    localStorage.setItem(this.ACTIVITY_KEY, now);
  }
  
  // Check if session is expired
  static isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem(this.ACTIVITY_KEY);
    if (!lastActivity) {
      return true;
    }
    
    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    return timeSinceActivity > this.SESSION_TIMEOUT;
  }
  
  // Clear session data
  static clearSession(): void {
    // Clear all auth-related localStorage
    const keysToRemove = ['authToken', 'refreshToken', 'demoMode', this.ACTIVITY_KEY];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear any other potential auth-related storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('token') || key.includes('session')) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Validate session security
  static validateSessionSecurity(): boolean {
    const token = localStorage.getItem('authToken');
    
    // No demo tokens in production
    if (token === 'demo-token') {
      console.warn('🚨 Demo token detected in production - clearing session');
      this.clearSession();
      return false;
    }
    
    // Check for session timeout
    if (this.isSessionExpired()) {
      console.warn('🚨 Session expired - clearing session');
      this.clearSession();
      return false;
    }
    
    return true;
  }
  
  // Initialize session tracking
  static initializeSessionTracking(): void {
    // Update activity on page load
    this.updateActivity();
    
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), true);
    });
    
    // Check session periodically
    setInterval(() => {
      if (!this.validateSessionSecurity()) {
        // Force logout if session is invalid
        window.location.reload();
      }
    }, 60000); // Check every minute
  }
}
