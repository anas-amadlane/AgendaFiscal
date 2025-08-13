import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, Globe, Shield, Download, Upload, CircleHelp as HelpCircle, Mail, Info, ChevronRight, Search, MoveHorizontal as MoreHorizontal, User, LogOut, CreditCard as Edit3, Users, Sun, Languages } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import AgentManagementModal from '@/components/AgentManagementModal';
import UserManagementModal from '@/components/UserManagementModal';
import RoleBadge from '@/components/RoleBadge';
import AppHeader from '@/components/AppHeader';
import { UserRole } from '@/types/auth';
import { defaultNotificationSettings, NotificationSettings } from '@/utils/notificationService';

export default function SettingsScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, strings, isRTL, toggleTheme, setLanguage, language } = useApp();
  const [showAgentManagement, setShowAgentManagement] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [preferences, setPreferences] = useState({
    autoSync: true,
    biometricAuth: false
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLanguageChange = () => {
    const newLanguage = language === 'fr' ? 'ar' : 'fr';
    setLanguage(newLanguage);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Modifier le profil',
      'Fonctionnalité de modification du profil disponible prochainement',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exporter les données',
      'Voulez-vous exporter toutes vos données d\'entreprises et d\'obligations?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Exporter', onPress: () => {
          Alert.alert('Succès', 'Données exportées avec succès');
        }}
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Importer les données',
      'Sélectionnez un fichier de données à importer',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Importer', onPress: () => {
          Alert.alert('Succès', 'Données importées avec succès');
        }}
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightElement 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon size={20} color="#64748B" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && <ChevronRight size={20} color="#64748B" />)}
    </TouchableOpacity>
  );

  const styles = createStyles(theme, isRTL);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={strings.settings}
        subtitle={`N°${Date.now().toString().slice(-8)}`}
        rightActions={[
          {
            icon: Search,
            onPress: () => {},
          },
          {
            icon: MoreHorizontal,
            onPress: () => {},
          },
        ]}
      />

      {/* Report Operations */}
      <View style={styles.reportSection}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Configuration système</Text>
          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.reportButton}>
              <Search size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <MoreHorizontal size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Filters */}
        <View style={styles.statusFilters}>
          <View style={styles.filterItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.filterText}>Connecté</Text>
          </View>
          <View style={styles.filterItem}>
            <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.filterText}>Synchronisation</Text>
          </View>
          <View style={styles.filterItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.filterText}>Sécurité</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Profil utilisateur</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <User size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email}</Text>
                  <View style={styles.profileRoleContainer}>
                    {user?.role && <RoleBadge role={user.role} size="small" />}
                  </View>
                  {user?.company && (
                    <Text style={[styles.profileCompany, { color: theme.colors.primary }]}>{user.company}</Text>
                  )}
                </View>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primaryContainer }]} onPress={handleEditProfile}>
                  <Edit3 size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.profileMeta}>
                <Text style={[styles.profileMetaText, { color: theme.colors.onSurfaceVariant }]}>
                  Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Date inconnue'}
                </Text>
                {user?.lastLoginAt && (
                  <Text style={[styles.profileMetaText, { color: theme.colors.onSurfaceVariant }]}>
                    Dernière connexion: {new Date(user.lastLoginAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{strings.notifications}</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={Bell}
              title="Notifications push"
              subtitle="Recevez des alertes sur votre appareil"
              onPress={() => handleNotificationChange('pushNotifications')}
              showArrow={false}
              rightElement={
                <Switch
                  value={notificationSettings.pushNotifications}
                  onValueChange={() => handleNotificationChange('pushNotifications')}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
                  thumbColor={notificationSettings.pushNotifications ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
              }
            />
            <SettingItem
              icon={Mail}
              title="Notifications email"
              subtitle="Recevez des rappels par email"
              onPress={() => handleNotificationChange('emailNotifications')}
              showArrow={false}
              rightElement={
                <Switch
                  value={notificationSettings.emailNotifications}
                  onValueChange={() => handleNotificationChange('emailNotifications')}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
                  thumbColor={notificationSettings.emailNotifications ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
              }
            />
            <SettingItem
              icon={Bell}
              title="Sons et vibrations"
              subtitle="Activer les sons et vibrations"
              onPress={() => handleNotificationChange('soundEnabled')}
              showArrow={false}
              rightElement={
                <Switch
                  value={notificationSettings.soundEnabled}
                  onValueChange={() => handleNotificationChange('soundEnabled')}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
                  thumbColor={notificationSettings.soundEnabled ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Préférences</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={theme.isDark ? Sun : Moon}
              title={theme.isDark ? strings.lightTheme : strings.darkTheme}
              subtitle={theme.isDark ? "Passer au thème clair" : "Passer au thème sombre"}
              onPress={toggleTheme}
              showArrow={false}
              rightElement={
                <Switch
                  value={theme.isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
                  thumbColor={theme.isDark ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
              }
            />
            <SettingItem
              icon={Languages}
              title={strings.language}
              subtitle={language === 'fr' ? 'Français' : 'العربية'}
              onPress={handleLanguageChange}
            />
            <SettingItem
              icon={Shield}
              title="Authentification biométrique"
              subtitle="Sécurisez l'accès à l'app"
              onPress={() => handlePreferenceChange('biometricAuth')}
              showArrow={false}
              rightElement={
                <Switch
                  value={preferences.biometricAuth}
                  onValueChange={() => handlePreferenceChange('biometricAuth')}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
                  thumbColor={preferences.biometricAuth ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Données</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={Download}
              title="Exporter les données"
              subtitle="Sauvegardez vos données"
              onPress={handleExportData}
            />
            <SettingItem
              icon={Upload}
              title="Importer les données"
              subtitle="Restaurez vos données"
              onPress={handleImportData}
            />
          </View>
        </View>

        {/* Management Section - Only for Managers and Admins */}
        {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Gestion</Text>
            <View style={styles.settingsGroup}>
              {user?.role === UserRole.MANAGER && (
                <SettingItem
                  icon={Users}
                  title="Gestion des agents"
                  subtitle="Assigner des entreprises aux agents"
                  onPress={() => setShowAgentManagement(true)}
                />
              )}
              {user?.role === UserRole.ADMIN && (
                <SettingItem
                  icon={Users}
                  title="Gestion des utilisateurs"
                  subtitle="Gérer tous les utilisateurs du système"
                  onPress={() => setShowUserManagement(true)}
                />
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={HelpCircle}
              title="Centre d'aide"
              subtitle="FAQ et guides d'utilisation"
              onPress={() => Alert.alert('Centre d\'aide', 'Fonctionnalité disponible prochainement')}
            />
            <SettingItem
              icon={Mail}
              title="Nous contacter"
              subtitle="Support technique"
              onPress={() => Alert.alert('Contact', 'Email: support@agenda-fiscal.ma')}
            />
            <SettingItem
              icon={Info}
              title="À propos"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('À propos', 'Agenda Fiscal Marocain v1.0.0\nDéveloppé pour les professionnels marocains')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Compte</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={LogOut}
              title="Déconnexion"
              subtitle="Se déconnecter de l'application"
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>

      {/* Agent Management Modal */}
      <AgentManagementModal
        visible={showAgentManagement}
        onClose={() => setShowAgentManagement(false)}
      />

      {/* User Management Modal */}
      <UserManagementModal
        visible={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  reportSection: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter-SemiBold',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8
  },
  reportButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 24
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  settingIcon: {
    marginRight: 12
  },
  settingContent: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B'
  },
  profileCard: {
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2
  },
  profileRoleContainer: {
    marginVertical: 4,
  },
  profileCompany: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6'
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileMeta: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    gap: 4
  },
  profileMetaText: {
    fontSize: 12,
    color: '#64748B'
  }
});