import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, RegisterData, AuthContextType, UserRole } from '@/types/auth';
import apiProxy from '@/utils/apiProxy';
import { SessionManager } from '@/utils/sessionManager';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session security for production
    SessionManager.initializeSessionTracking();
    
    // Check for stored auth data on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      
      // Production security check
      if (!SessionManager.validateSessionSecurity()) {
        console.log('🚨 Session security validation failed');
        setIsLoading(false);
        return;
      }
      
      // Check for stored auth token
      const storedToken = localStorage.getItem('authToken');
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      
      console.log('📋 Auth state check:', { storedToken: !!storedToken, isDemoMode });
      
      if (storedToken && !isDemoMode) {
        console.log('🔑 Found valid token, checking profile...');
        // Set token in API proxy
        apiProxy.setTokens(storedToken, localStorage.getItem('refreshToken') || '');
        
        try {
          // Try to get user profile from backend
          const profile = await apiProxy.getProfile();
          console.log('✅ Profile fetched successfully:', profile);
          const user: User = {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            status: profile.status || 'active',
            createdAt: new Date(profile.createdAt),
            updatedAt: new Date(profile.updatedAt),
            lastLoginAt: profile.lastLoginAt ? new Date(profile.lastLoginAt) : undefined,
          };
          
          setUser(user);
          setIsLoading(false);
          console.log('✅ User authenticated:', user);
          return;
        } catch (profileError: any) {
          console.error('❌ Profile fetch error:', profileError);
          // If profile fetch fails, clear tokens and continue as unauthenticated
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          apiProxy.clearTokens();
          setIsLoading(false);
          console.log('🧹 Cleared invalid tokens');
          return;
        }
      } else if (isDemoMode && storedToken === 'demo-token') {
        // Production app - clear demo mode data
        console.log('🧹 Clearing demo mode data...');
        localStorage.removeItem('demoMode');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
      
      // No valid authentication found
      console.log('❌ No valid authentication found');
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ Auth check error:', error);
      // Clear invalid tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('demoMode');
      apiProxy.clearTokens();
      
      setIsLoading(false);
      setError('Erreur lors de la vérification de l\'authentification');
    }
  };

  const login = async (credentials: LoginData) => {
    console.log('Login attempt with:', credentials.email);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiProxy.login(credentials);
      console.log('Login response:', response);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        status: response.user.status || 'active',
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt),
        lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
      };

      localStorage.setItem('authToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      // Clear any existing demo mode
      localStorage.removeItem('demoMode');

      console.log('Setting user in context:', user);
      setUser(user);
      setIsLoading(false);
      
      // Update session activity for successful login
      SessionManager.updateActivity();
      console.log('User set, loading set to false');
    } catch (error: any) {
      console.error('Login error:', error);
      console.log('Error message:', error.message);
      console.log('Error status:', error.status);
      
      // Check if it's a network error (backend not available)
      if (error.message.includes('fetch') || error.message.includes('network')) {
        // Production app - no demo mode
        if (false) {
          console.log('User chose demo mode');
          
          const demoUser: User = {
            id: 'demo-1',
            email: credentials.email,
            firstName: 'Demo',
            lastName: 'User',
            role: UserRole.REGULAR,
            status: 'active',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            lastLoginAt: new Date()
          };

          localStorage.setItem('demoMode', 'true');
          localStorage.setItem('authToken', 'demo-token');

          setUser(demoUser);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setError('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
        }
      } else {
        setIsLoading(false);
        // Handle specific backend errors
        if (error.message.includes('Invalid credentials') || error.message.includes('incorrect')) {
          setError('Email ou mot de passe incorrect');
        } else if (error.message.includes('Account inactive')) {
          setError('Compte inactif, veuillez contacter l\'administrateur');
        } else if (error.message.includes('Validation failed')) {
          setError('Données de validation invalides');
        } else {
          setError(error.message || 'Erreur lors de la connexion');
        }
      }
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiProxy.register(data);
      
      const newUser: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        status: response.user.status || 'active',
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt),
        lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
      };

      localStorage.setItem('authToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      // Clear any existing demo mode
      localStorage.removeItem('demoMode');

      setUser(newUser);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Register error:', error);
      console.log('Error message:', error.message);
      console.log('Error status:', error.status);
      
      // Check if it's a network error (backend not available)
      if (error.message.includes('fetch') || error.message.includes('network')) {
        // Production app - no demo mode
        if (false) {
          console.log('User chose demo mode for registration');
          
          const demoUser: User = {
            id: 'demo-' + Date.now(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: UserRole.REGULAR,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          };

          localStorage.setItem('demoMode', 'true');
          localStorage.setItem('authToken', 'demo-token');

          setUser(demoUser);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setError('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
        }
      } else {
        setIsLoading(false);
        // Handle specific backend errors
        if (error.message.includes('User already exists') || error.message.includes('existe déjà') || error.message.includes('already exists')) {
          console.log('Setting user exists error');
          setError('Un utilisateur avec cet email existe déjà');
        } else if (error.message.includes('Validation failed')) {
          setError('Données de validation invalides. Vérifiez vos informations.');
        } else if (error.message.includes('Missing required fields')) {
          setError('Tous les champs obligatoires doivent être remplis');
        } else if (error.message.includes('Trop de tentatives') || error.message.includes('Too many requests')) {
          setError('Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.');
        } else if (error.status === 429) {
          setError('Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.');
        } else {
          setError(error.message || 'Erreur lors de la création du compte');
        }
      }
    }
  };

  const logout = async () => {
    console.log('🔄 AuthContext: Starting logout process...');
    console.log('🔄 AuthContext: Current user:', user);
    console.log('🔄 AuthContext: isAuthenticated:', !!user);
    setIsLoading(true);
    
    try {
      // Always attempt backend logout for security in production
      const hasToken = localStorage.getItem('authToken');
      if (hasToken && hasToken !== 'demo-token') {
        console.log('🌐 AuthContext: Calling backend logout...');
        await apiProxy.logout();
        console.log('✅ AuthContext: Backend logout successful');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Logout error:', error);
      // Continue with logout even if backend call fails
    } finally {
      console.log('🧹 AuthContext: Clearing all authentication data...');
      
      // Comprehensive cleanup for production security
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('demoMode');
      
      // Clear any other potential auth-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });
      
      apiProxy.clearTokens();
      
      // Clear session manager data
      SessionManager.clearSession();
      
      // Clear user state
      setUser(null);
      setError(null);
      
      // Add a small delay to ensure state changes are propagated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsLoading(false);
      console.log('✅ AuthContext: Logout completed successfully');
      console.log('✅ AuthContext: User state after logout:', user);
      console.log('✅ AuthContext: isAuthenticated after logout:', !!user);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}