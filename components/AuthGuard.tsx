import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🔍 AuthGuard - requireAuth:', requireAuth);
  console.log('🔍 AuthGuard - allowedRoles:', allowedRoles);
  console.log('🔍 AuthGuard - isAuthenticated:', isAuthenticated);
  console.log('🔍 AuthGuard - isLoading:', isLoading);
  console.log('🔍 AuthGuard - user:', user);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('🔍 AuthGuard - showing loading');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#64748B' }}>Vérification de l'authentification...</Text>
      </View>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && (!isAuthenticated || !user)) {
    console.log('🚫 AuthGuard: User not authenticated, redirecting to login');
    console.log('🔍 AuthGuard: isAuthenticated =', isAuthenticated);
    console.log('🔍 AuthGuard: user =', user);
    return <Redirect href="/(auth)/login" />;
  }

  // If specific roles are required, check user role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    console.log('🚫 AuthGuard: User role not authorized, redirecting to dashboard');
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // User is authenticated and authorized (or no auth required)
  console.log('✅ AuthGuard: User authenticated and authorized');
  return <>{children}</>;
}
