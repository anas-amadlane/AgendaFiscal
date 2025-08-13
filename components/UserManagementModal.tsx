import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, UserPlus, Search, User, Users, Mail, Building2, Trash2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, CompanyUser } from '@/types/auth';
import RoleManagementService from '@/utils/roleManagementService';

interface UserManagementModalProps {
  visible: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onUserAssigned?: () => void;
}

export default function UserManagementModal({
  visible,
  onClose,
  companyId,
  companyName,
  onUserAssigned
}: UserManagementModalProps) {
  const { theme, strings, isRTL } = useApp();
  const { user } = useAuth();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.AGENT);

  const styles = createStyles(theme, isRTL);

  useEffect(() => {
    if (visible) {
      loadCompanyUsers();
    }
  }, [visible, companyId]);

  const loadCompanyUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const companyDetails = await RoleManagementService.getCompanyDetails(companyId);
      setUsers(companyDetails.users);
    } catch (error) {
      console.error('Error loading company users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail.trim())) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return;
    }

    setLoading(true);
    try {
      // First, try to find if user exists
      const allUsers = await RoleManagementService.getAllUsers({ email: newUserEmail.trim() });
      
      if (allUsers.length > 0) {
        // User exists, assign to company
        await RoleManagementService.assignUserToCompany({
          companyId,
          userId: allUsers[0].id,
          role: selectedRole
        });
      } else {
        // User doesn't exist, send invitation
        await RoleManagementService.sendInvitation({
          email: newUserEmail.trim(),
          companyId,
          role: selectedRole,
          message: `Vous avez été invité à rejoindre l'entreprise "${companyName}" en tant que ${RoleManagementService.getRoleDisplayName(selectedRole)}.`
        });
      }

      Alert.alert('Succès', 'Utilisateur ajouté avec succès');
      setNewUserEmail('');
      setShowAddUser(false);
      loadCompanyUsers();
      onUserAssigned?.();
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous retirer ${userName} de cette entreprise ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await RoleManagementService.removeUserFromCompany(companyId, userId);
              Alert.alert('Succès', 'Utilisateur retiré avec succès');
              loadCompanyUsers();
              onUserAssigned?.();
            } catch (error) {
              console.error('Error removing user:', error);
              Alert.alert('Erreur', 'Impossible de retirer l\'utilisateur');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: UserRole) => {
    return RoleManagementService.getRoleColor(role);
  };

  const getRoleDisplayName = (role: UserRole) => {
    return RoleManagementService.getRoleDisplayName(role);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Gestion des utilisateurs</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Building2 size={20} color={theme.colors.primary} />
          <Text style={styles.companyName}>{companyName}</Text>
        </View>

        {/* Search and Add */}
        <View style={styles.actionsSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddUser(true)}
          >
            <UserPlus size={20} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* Add User Modal */}
        {showAddUser && (
          <View style={styles.addUserSection}>
            <Text style={styles.sectionTitle}>Ajouter un utilisateur</Text>
            
            <View style={styles.emailInputContainer}>
              <Mail size={20} color={theme.colors.onSurfaceVariant} />
              <TextInput
                style={styles.emailInput}
                placeholder="email@utilisateur.com"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>

            <Text style={styles.roleLabel}>Rôle :</Text>
            <View style={styles.roleOptions}>
              {[UserRole.MANAGER, UserRole.AGENT].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    selectedRole === role && styles.selectedRoleOption
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <View style={[
                    styles.roleIcon,
                    { backgroundColor: getRoleColor(role) }
                  ]}>
                    {role === UserRole.MANAGER ? (
                      <Users size={16} color="#FFFFFF" />
                    ) : (
                      <User size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[
                    styles.roleText,
                    selectedRole === role && styles.selectedRoleText
                  ]}>
                    {getRoleDisplayName(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.addUserActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddUser(false);
                  setNewUserEmail('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !newUserEmail.trim() && styles.disabledButton
                ]}
                onPress={handleAddUser}
                disabled={!newUserEmail.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Ajouter</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Users List */}
        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {loading && !showAddUser ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>
                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur dans cette entreprise'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={[
                    styles.userAvatar,
                    { backgroundColor: getRoleColor(user.role) }
                  ]}>
                    <Text style={styles.userInitials}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userRole}>
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: getRoleColor(user.role) }
                      ]}>
                        <Text style={styles.roleBadgeText}>
                          {getRoleDisplayName(user.role)}
                        </Text>
                      </View>
                      <Text style={styles.userStatus}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {user.id !== user?.id && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveUser(user.id, `${user.firstName} ${user.lastName}`)}
                  >
                    <Trash2 size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onBackground,
    fontFamily: 'Inter_600SemiBold',
  },
  placeholder: {
    width: 40,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surfaceVariant,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
    marginLeft: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addUserSection: {
    padding: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  selectedRoleOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  roleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  roleText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  selectedRoleText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  addUserActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_500Medium',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.outlineVariant,
  },
  confirmButtonText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    fontFamily: 'Inter_500Medium',
  },
  usersList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  userRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  userStatus: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  removeButton: {
    padding: 8,
  },
});
