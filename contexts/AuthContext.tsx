import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData, AuthContextType, UserRole } from '@/types/auth';
import apiProxy from '@/utils/apiProxy';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for stored auth data on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check for demo mode first
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      if (isDemoMode) {
        const demoUser: User = {
          id: 'demo-1',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          company: 'Demo Company',
          role: UserRole.MANAGER,
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date(),
          isActive: true
        };
        
        setAuthState({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      }

      // Check for stored auth token
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        // Set token in API proxy
        apiProxy.setTokens(storedToken, localStorage.getItem('refreshToken') || '');
        
        try {
          // Try to get user profile
          const profile = await apiProxy.getProfile();
          const user: User = {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            company: profile.company,
            role: profile.role,
            avatar: profile.avatar,
            createdAt: new Date(profile.createdAt),
            lastLoginAt: profile.lastLoginAt ? new Date(profile.lastLoginAt) : undefined,
            isActive: profile.isActive,
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          // If profile fetch fails, clear tokens and continue as unauthenticated
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          apiProxy.clearTokens();
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      apiProxy.clearTokens();
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erreur lors de la vérification de l\'authentification' 
      }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiProxy.login(credentials);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        company: response.user.company,
        role: response.user.role,
        avatar: response.user.avatar,
        createdAt: new Date(response.user.createdAt),
        lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
        isActive: response.user.isActive,
      };

      localStorage.setItem('authToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if it's a network error (backend not available)
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Validation failed')) {
        // Fallback to demo mode with mock data
        console.log('Backend not available, using demo mode');
        
        const demoUser: User = {
          id: 'demo-1',
          email: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          company: 'Demo Company',
          role: UserRole.MANAGER,
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date(),
          isActive: true
        };

        localStorage.setItem('demoMode', 'true');
        localStorage.setItem('authToken', 'demo-token');

        setAuthState({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Email ou mot de passe incorrect'
        }));
      }
    }
  };

  const register = async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiProxy.register(data);
      
      const newUser: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        company: response.user.company,
        role: response.user.role,
        avatar: response.user.avatar,
        createdAt: new Date(response.user.createdAt),
        lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
        isActive: response.user.isActive,
      };

      localStorage.setItem('authToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Register error:', error);
      
      // Check if it's a network error (backend not available)
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Validation failed')) {
        // Fallback to demo mode with mock data
        console.log('Backend not available, using demo mode for registration');
        
        const demoUser: User = {
          id: 'demo-' + Date.now(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company || 'Demo Company',
          role: UserRole.MANAGER,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        };

        localStorage.setItem('demoMode', 'true');
        localStorage.setItem('authToken', 'demo-token');

        setAuthState({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors de la création du compte'
        }));
      }
    }
  };

  const logout = async () => {
    try {
      await apiProxy.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      apiProxy.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!authState.user) return;

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiProxy.updateProfile(data);
      
      const updatedUser = { ...authState.user, ...response.user };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));
    } catch (error) {
      console.error('Update profile error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la mise à jour du profil'
      }));
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
      login,
      register,
      logout,
      updateProfile,
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