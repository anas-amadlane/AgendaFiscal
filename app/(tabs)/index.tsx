import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on user role
  if (user?.role === 'admin') {
    return <Redirect href="/(tabs)/admin-dashboard" />;
  } else {
    return <Redirect href="/(tabs)/dashboard" />;
  }
}