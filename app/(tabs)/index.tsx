import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('🔍 Index - user:', user);
  console.log('🔍 Index - isAuthenticated:', isAuthenticated);
  console.log('🔍 Index - isLoading:', isLoading);

  // Show loading while checking authentication
  if (isLoading) {
    console.log('🔍 Index - showing loading');
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔍 Index - redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on user role
  if (user.role === UserRole.ADMIN) {
    console.log('🔍 Index - redirecting admin to admin-dashboard');
    return <Redirect href="/(tabs)/admin-dashboard" />;
  } else {
    console.log('🔍 Index - redirecting regular user to dashboard');
    return <Redirect href="/(tabs)/dashboard" />;
  }
}