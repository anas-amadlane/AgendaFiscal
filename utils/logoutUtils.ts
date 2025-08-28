// Utility functions for robust logout functionality
import { SessionManager } from './sessionManager';

export class LogoutUtils {
  /**
   * Performs a complete logout cleanup
   * This is a fallback function to ensure all auth data is cleared
   */
  static performCompleteLogout(): void {
    console.log('🧹 LogoutUtils: Performing complete logout cleanup...');
    
    try {
      // Clear SessionManager data
      SessionManager.clearSession();
      
      // Clear all localStorage auth-related data
      const authKeys = [
        'authToken',
        'refreshToken', 
        'demoMode',
        'lastActivity',
        'sessionData',
        'userData',
        'user',
        'auth',
        'session',
        'token'
      ];
      
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Could not remove ${key} from localStorage:`, e);
        }
      });
      
      // Clear any other potential auth-related storage with pattern matching
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.toLowerCase().includes('auth') || 
              key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('session') ||
              key.toLowerCase().includes('user') ||
              key.toLowerCase().includes('login')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Error clearing pattern-matched localStorage items:', e);
      }
      
      // Clear sessionStorage as well
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear sessionStorage:', e);
      }
      
      console.log('✅ LogoutUtils: Complete logout cleanup finished');
      
      // Verify cleanup was successful
      const remainingAuthItems = Object.keys(localStorage).filter(key => 
        key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('session') ||
        key.toLowerCase().includes('user')
      );
      
      if (remainingAuthItems.length > 0) {
        console.warn('⚠️ LogoutUtils: Some auth items remain after cleanup:', remainingAuthItems);
      } else {
        console.log('✅ LogoutUtils: All auth items successfully cleared');
      }
      
    } catch (error) {
      console.error('❌ LogoutUtils: Error during logout cleanup:', error);
    }
  }
  
  /**
   * Forces a hard redirect to login page
   * Used as a fallback when normal navigation fails
   */
  static forceRedirectToLogin(): void {
    console.log('🔄 LogoutUtils: Forcing redirect to login page...');
    try {
      // Try multiple methods to ensure redirect happens
      if (typeof window !== 'undefined') {
        // Try multiple redirect methods
        try {
          window.location.href = '/(auth)/login';
        } catch (e1) {
          try {
            window.location.replace('/(auth)/login');
          } catch (e2) {
            try {
              window.location.assign('/(auth)/login');
            } catch (e3) {
              console.error('All redirect methods failed:', { e1, e2, e3 });
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ LogoutUtils: Error during forced redirect:', error);
    }
  }
  
  /**
   * Complete logout with cleanup and redirect
   */
  static async performCompleteLogoutWithRedirect(router: any): Promise<void> {
    console.log('🚪 LogoutUtils: Starting complete logout with redirect...');
    
    // Perform cleanup
    this.performCompleteLogout();
    
    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Try router navigation first
      router.replace('/(auth)/login');
      console.log('✅ LogoutUtils: Router redirect successful');
    } catch (routerError) {
      console.error('❌ LogoutUtils: Router redirect failed, trying fallback:', routerError);
      // Fallback to hard redirect
      this.forceRedirectToLogin();
    }
  }
}
