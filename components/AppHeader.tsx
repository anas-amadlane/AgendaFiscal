import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { LucideIcon } from 'lucide-react-native';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: LucideIcon;
    onPress: () => void;
  };
  rightActions?: Array<{
    icon: LucideIcon;
    onPress: () => void;
    badge?: number;
  }>;
  showLogo?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  showLogo = true
}: AppHeaderProps) {
  const { theme, strings, isRTL } = useApp();

  const styles = createStyles(theme, isRTL);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <View style={[styles.logoBar, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.logoBar, { backgroundColor: theme.colors.secondary }]} />
                <View style={[styles.logoBar, { backgroundColor: theme.colors.tertiary }]} />
              </View>
              <View>
                <Text style={styles.appName}>Agenda Fiscal</Text>
                <Text style={styles.appSubtitle}>Marocain</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.headerRight}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.headerButton}
              onPress={action.onPress}
            >
              <action.icon size={20} color={theme.colors.onSurfaceVariant} />
              {action.badge && action.badge > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}>
                  <Text style={styles.badgeText}>{action.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  logoBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Bold',
  },
  appSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onError,
    fontFamily: 'Inter-SemiBold',
  },
  titleSection: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
    textAlign: isRTL ? 'right' : 'left',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textAlign: isRTL ? 'right' : 'left',
  },
});

