import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Users, User, Crown } from 'lucide-react-native';
import { UserRole } from '@/types/auth';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
}

export default function RoleBadge({ role, size = 'medium' }: RoleBadgeProps) {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          label: 'Administrateur',
          icon: Crown,
          backgroundColor: '#FEF3C7',
          textColor: '#92400E',
          borderColor: '#F59E0B'
        };
      case UserRole.MANAGER:
        return {
          label: 'Manager',
          icon: Users,
          backgroundColor: '#DBEAFE',
          textColor: '#1E40AF',
          borderColor: '#3B82F6'
        };
      case UserRole.AGENT:
        return {
          label: 'Agent',
          icon: User,
          backgroundColor: '#D1FAE5',
          textColor: '#065F46',
          borderColor: '#10B981'
        };
      case UserRole.REGULAR:
      default:
        return {
          label: 'Utilisateur',
          icon: Shield,
          backgroundColor: '#F3F4F6',
          textColor: '#374151',
          borderColor: '#9CA3AF'
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;
  
  const sizeStyles = {
    small: {
      container: { paddingHorizontal: 6, paddingVertical: 2 },
      text: { fontSize: 10 },
      icon: 12
    },
    medium: {
      container: { paddingHorizontal: 8, paddingVertical: 4 },
      text: { fontSize: 12 },
      icon: 14
    },
    large: {
      container: { paddingHorizontal: 12, paddingVertical: 6 },
      text: { fontSize: 14 },
      icon: 16
    }
  };

  return (
    <View style={[
      styles.container,
      sizeStyles[size].container,
      {
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor
      }
    ]}>
      <Icon size={sizeStyles[size].icon} color={config.textColor} />
      <Text style={[
        styles.text,
        sizeStyles[size].text,
        { color: config.textColor }
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  text: {
    fontWeight: '600',
  },
});
