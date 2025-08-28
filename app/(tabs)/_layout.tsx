import { Tabs } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Building2, Calendar, Bell, Settings, ChartBar as BarChart3, Shield, Mail, Users } from 'lucide-react-native';
import { UserRole } from '@/types/auth';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function TabsLayout() {
  const { user } = useAuth();
  const { theme, strings, isRTL } = useApp();

  // Determine which tabs to show based on user role
  const isAdmin = user?.role === UserRole.ADMIN;
  
  console.log('🔍 TabsLayout - user role:', user?.role);
  console.log('🔍 TabsLayout - isAdmin:', isAdmin);
  
  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outlineVariant,
            height: 80,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
            fontFamily: 'Inter-Medium',
          }
        }}
      >
      {/* Index route for redirects - always hidden */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      {/* Admin Dashboard - only for admin users */}
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          title: 'Admin',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
          href: isAdmin ? undefined : null,
        }}
      />
      
      {/* Admin Users - only for admin users */}
      <Tabs.Screen
        name="admin-users"
        options={{
          title: 'Users',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
          href: isAdmin ? undefined : null,
        }}
      />
      
      {/* Admin Calendar - only for admin users */}
      <Tabs.Screen
        name="admin-calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
          href: isAdmin ? undefined : null,
        }}
      />
      
      {/* Admin Companies - only for admin users */}
      <Tabs.Screen
        name="admin-companies"
        options={{
          title: 'Companies',
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
          href: isAdmin ? undefined : null,
        }}
      />
      
      {/* Regular Dashboard - only for regular users */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: strings.dashboard,
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
          href: !isAdmin ? undefined : null,
        }}
      />
      
      {/* Regular Enterprises - only for regular users */}
      <Tabs.Screen
        name="enterprises"
        options={{
          title: strings.enterprises,
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
          href: !isAdmin ? undefined : null,
        }}
      />
      
      {/* Regular Calendar - only for regular users */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: strings.calendar,
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
          href: !isAdmin ? undefined : null,
        }}
      />
      
      {/* Notifications - only for regular users */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: strings.notifications,
          tabBarIcon: ({ size, color }) => (
            <Bell size={size} color={color} />
          ),
          href: !isAdmin ? undefined : null,
        }}
      />
      
      {/* Settings - visible to both admin and regular users */}
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.settings,
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      
      {/* Invitations - only for regular users */}
      <Tabs.Screen
        name="invitations"
        options={{
          title: 'Invitations',
          tabBarIcon: ({ size, color }) => (
            <Mail size={size} color={color} />
          ),
          href: !isAdmin ? undefined : null,
        }}
      />
    </Tabs>
    </AuthGuard>
  );
}