import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Building2, Upload, Calendar, MoveHorizontal as MoreHorizontal, Filter, Users, Settings } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import EnterpriseCard from '@/components/EnterpriseCard';
import EnterpriseDetailsModal from '@/components/EnterpriseDetailsModal';
import ExcelImportModal from '@/components/ExcelImportModal';
import EnterpriseCalendarModal from '@/components/EnterpriseCalendarModal';
import AppHeader from '@/components/AppHeader';
import RoleSelectionModal from '@/components/RoleSelectionModal';
import UserManagementModal from '@/components/UserManagementModal';
import AgentManagementModal from '@/components/AgentManagementModal';
import { mockEnterprises } from '@/utils/mockData';
import { Enterprise, FormeJuridique, RegimeFiscal } from '@/types/fiscal';
import { UserRole, CompanyWithRole } from '@/types/auth';
import RoleManagementService from '@/utils/roleManagementService';

export default function Enterprises() {
  const { theme, strings, isRTL } = useApp();
  const { user } = useAuth();
  const [enterprises, setEnterprises] = useState<CompanyWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showAgentManagementModal, setShowAgentManagementModal] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<CompanyWithRole | Enterprise | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [newEnterprise, setNewEnterprise] = useState<Partial<Enterprise>>({
    raisonSociale: '',
    identifiantFiscal: '',
    formeJuridique: FormeJuridique.SARL,
    regimeFiscal: RegimeFiscal.IS_TVA,
    secteurActivite: '',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      loadEnterprises();
    }
  }, [user]);

  const loadEnterprises = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const companies = await RoleManagementService.getUserCompanies();
      setEnterprises(companies);
    } catch (error) {
      console.error('Error loading enterprises:', error);
      // Fallback to mock data for now
      setEnterprises(mockEnterprises.map(enterprise => ({
        id: enterprise.id,
        name: enterprise.raisonSociale,
        registrationNumber: enterprise.identifiantFiscal,
        status: enterprise.isActive ? 'active' : 'inactive',
        userRole: UserRole.MANAGER,
        userStatus: 'active',
        createdAt: enterprise.dateCreation,
        updatedAt: enterprise.dateCreation,
      })));
    } finally {
      setLoading(false);
    }
  };

  const filteredEnterprises = enterprises.filter(enterprise => {
    const matchesSearch = enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enterprise.registrationNumber?.includes(searchTerm);
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && enterprise.status === 'active') ||
                         (filter === 'inactive' && enterprise.status === 'inactive');
    return matchesSearch && matchesFilter;
  });

  const handleAddEnterprise = () => {
    if (!newEnterprise.raisonSociale || !newEnterprise.identifiantFiscal) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Show role selection modal instead of directly creating
    setShowRoleSelectionModal(true);
  };

  const handleRoleSelected = async (role: UserRole, managerEmail?: string) => {
    if (!newEnterprise.raisonSociale || !newEnterprise.identifiantFiscal) return;

    setLoading(true);
    try {
      const companyData = {
        name: newEnterprise.raisonSociale,
        registrationNumber: newEnterprise.identifiantFiscal,
        taxId: newEnterprise.identifiantFiscal,
        industry: newEnterprise.secteurActivite,
        userRole: role,
        managerEmail: managerEmail,
      };

      await RoleManagementService.createCompanyWithRole(companyData);
      
      setNewEnterprise({
        raisonSociale: '',
        identifiantFiscal: '',
        formeJuridique: FormeJuridique.SARL,
        regimeFiscal: RegimeFiscal.IS_TVA,
        secteurActivite: '',
        isActive: true
      });
      setShowAddModal(false);
      setShowRoleSelectionModal(false);
      
      Alert.alert('Succès', 'Entreprise créée avec succès');
      loadEnterprises();
    } catch (error) {
      console.error('Error creating company:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleImportEnterprises = (importedEnterprises: Enterprise[]) => {
    setEnterprises([...enterprises, ...importedEnterprises]);
    Alert.alert('Succès', `${importedEnterprises.length} entreprise(s) importée(s) avec succès`);
  };

  const handleEnterprisePress = (enterprise: CompanyWithRole) => {
    // Convert CompanyWithRole to Enterprise format for the modal
    const enterpriseForModal: Enterprise = {
      id: enterprise.id,
      raisonSociale: enterprise.name,
      identifiantFiscal: enterprise.registrationNumber || enterprise.taxId || '',
      formeJuridique: FormeJuridique.SARL, // Default value for demo
      regimeFiscal: RegimeFiscal.IS_TVA, // Default value for demo
      secteurActivite: 'Technologie', // Default value for demo
      dateCreation: enterprise.createdAt,
      isActive: enterprise.status === 'active',
    };
    setSelectedEnterprise(enterpriseForModal);
    setShowDetailsModal(true);
  };

  const handleEditEnterprise = (enterprise: Enterprise) => {
    setNewEnterprise({
      raisonSociale: enterprise.raisonSociale,
      identifiantFiscal: enterprise.identifiantFiscal,
      formeJuridique: enterprise.formeJuridique,
      regimeFiscal: enterprise.regimeFiscal,
      secteurActivite: enterprise.secteurActivite,
      isActive: enterprise.isActive,
    });
    setShowDetailsModal(false);
    setShowAddModal(true);
  };

  const handleDeleteEnterprise = (enterpriseId: string) => {
    setEnterprises(enterprises.filter(e => e.id !== enterpriseId));
    Alert.alert('Succès', 'Entreprise supprimée avec succès');
  };

  const handleViewCalendar = (enterprise: CompanyWithRole) => {
    // Convert CompanyWithRole to Enterprise format for the calendar modal
    const enterpriseForModal: Enterprise = {
      id: enterprise.id,
      raisonSociale: enterprise.name,
      identifiantFiscal: enterprise.registrationNumber || enterprise.taxId || '',
      formeJuridique: FormeJuridique.SARL, // Default value for demo
      regimeFiscal: RegimeFiscal.IS_TVA, // Default value for demo
      secteurActivite: 'Technologie', // Default value for demo
      dateCreation: enterprise.createdAt,
      isActive: enterprise.status === 'active',
    };
    setSelectedEnterprise(enterpriseForModal);
    setShowDetailsModal(false);
    setShowCalendarModal(true);
  };

  const handleManageUsers = (enterprise: CompanyWithRole) => {
    setSelectedEnterprise(enterprise);
    setShowUserManagementModal(true);
  };

  const canManageUsers = (userRole: UserRole) => {
    return RoleManagementService.canAssignUsers(userRole);
  };

  const styles = createStyles(theme, isRTL);

  const getObligationsCount = (enterpriseId: string) => {
    return Math.floor(Math.random() * 20) + 5;
  };

  const getOverdueCount = (enterpriseId: string) => {
    return Math.floor(Math.random() * 3);
  };

  const activeCount = enterprises.filter(e => e.status === 'active').length;
  const inactiveCount = enterprises.filter(e => e.status === 'inactive').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <AppHeader
        title={strings.enterprises}
        subtitle={`N°${enterprises.length.toString().padStart(8, '0')}`}
        rightActions={[
          {
            icon: Search,
            onPress: () => {},
          },
          {
            icon: Filter,
            onPress: () => {},
          },
          {
            icon: Upload,
            onPress: () => setShowImportModal(true),
          },
          {
            icon: Plus,
            onPress: () => setShowAddModal(true),
          },
        ]}
      />

      {/* Role-based actions */}
      {user && (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) && (
        <View style={styles.roleActions}>
          <TouchableOpacity 
            style={styles.roleActionButton}
            onPress={() => setShowAgentManagementModal(true)}
          >
            <Users size={16} color={theme.colors.primary} />
            <Text style={styles.roleActionText}>Gérer les agents</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Report Operations */}
      <View style={styles.reportSection}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Rapport opérations</Text>
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
          <TouchableOpacity 
            style={[styles.filterItem, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <View style={[styles.statusDot, { backgroundColor: '#64748B' }]} />
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              Toutes ({enterprises.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterItem, filter === 'active' && styles.activeFilter]}
            onPress={() => setFilter('active')}
          >
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
              Actives ({activeCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterItem, filter === 'inactive' && styles.activeFilter]}
            onPress={() => setFilter('inactive')}
          >
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.filterText, filter === 'inactive' && styles.activeFilterText]}>
              Inactives ({inactiveCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou identifiant fiscal..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.enterprisesContainer}>
          {filteredEnterprises.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Building2 size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>
                {searchTerm ? 'Aucune entreprise trouvée' : 'Aucune entreprise'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm ? 'Aucun résultat pour votre recherche' : 'Ajoutez votre première entreprise ou importez depuis Excel'}
              </Text>
              {!searchTerm && (
                <View style={styles.emptyActions}>
                  <TouchableOpacity style={styles.emptyActionButton} onPress={() => setShowAddModal(true)}>
                    <Plus size={20} color="#3B82F6" />
                    <Text style={styles.emptyActionText}>Ajouter une entreprise</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.emptyActionButton} onPress={() => setShowImportModal(true)}>
                    <Upload size={20} color="#10B981" />
                    <Text style={styles.emptyActionText}>Importer depuis Excel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            filteredEnterprises.map((enterprise) => (
              <View key={enterprise.id} style={styles.enterpriseCard}>
                <TouchableOpacity 
                  style={styles.enterpriseContent}
                  onPress={() => handleEnterprisePress(enterprise)}
                >
                  <View style={styles.enterpriseHeader}>
                    <View style={styles.enterpriseInfo}>
                      <Text style={styles.enterpriseName}>{enterprise.name}</Text>
                      <Text style={styles.enterpriseId}>
                        {enterprise.registrationNumber}
                      </Text>
                    </View>
                    <View style={styles.enterpriseStatus}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: enterprise.status === 'active' ? theme.colors.statusCompleted : theme.colors.statusOverdue }
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { color: enterprise.status === 'active' ? theme.colors.statusCompleted : theme.colors.statusOverdue }
                      ]}>
                        {enterprise.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.enterpriseMeta}>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: RoleManagementService.getRoleColor(enterprise.userRole) }
                    ]}>
                      <Text style={styles.roleBadgeText}>
                        {RoleManagementService.getRoleDisplayName(enterprise.userRole)}
                      </Text>
                    </View>
                    <Text style={styles.enterpriseDate}>
                      Créée le {enterprise.createdAt.toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.enterpriseActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewCalendar(enterprise)}
                  >
                    <Calendar size={16} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Calendrier</Text>
                  </TouchableOpacity>
                  
                  {canManageUsers(enterprise.userRole) && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleManageUsers(enterprise)}
                    >
                      <Users size={16} color={theme.colors.secondary} />
                      <Text style={styles.actionButtonText}>Utilisateurs</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditEnterprise(enterprise)}
                  >
                    <Settings size={16} color={theme.colors.tertiary} />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Enterprise Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {newEnterprise.id ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Annuler</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Raison sociale *</Text>
              <TextInput
                style={styles.input}
                value={newEnterprise.raisonSociale}
                onChangeText={(text) => setNewEnterprise({...newEnterprise, raisonSociale: text})}
                placeholder="Ex: SARL Mon Entreprise"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Identifiant fiscal *</Text>
              <TextInput
                style={styles.input}
                value={newEnterprise.identifiantFiscal}
                onChangeText={(text) => setNewEnterprise({...newEnterprise, identifiantFiscal: text})}
                placeholder="Ex: 12345678"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Secteur d'activité *</Text>
              <TextInput
                style={styles.input}
                value={newEnterprise.secteurActivite}
                onChangeText={(text) => setNewEnterprise({...newEnterprise, secteurActivite: text})}
                placeholder="Ex: Commerce, Services, Industrie..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddEnterprise}>
              <Text style={styles.saveButtonText}>
                {newEnterprise.id ? 'Modifier l\'entreprise' : 'Ajouter l\'entreprise'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Enterprise Details Modal */}
      {selectedEnterprise && 'raisonSociale' in selectedEnterprise && (
        <EnterpriseDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          enterprise={selectedEnterprise as Enterprise}
          onEdit={handleEditEnterprise}
          onDelete={handleDeleteEnterprise}
          onViewCalendar={handleViewCalendar}
        />
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportEnterprises}
      />

      {/* Enterprise Calendar Modal */}
      {selectedEnterprise && 'raisonSociale' in selectedEnterprise && (
        <EnterpriseCalendarModal
          visible={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          enterprise={selectedEnterprise as Enterprise}
        />
      )}

      {/* Role Selection Modal */}
      <RoleSelectionModal
        visible={showRoleSelectionModal}
        onClose={() => setShowRoleSelectionModal(false)}
        onRoleSelected={handleRoleSelected}
        companyName={newEnterprise.raisonSociale || ''}
      />

      {/* User Management Modal */}
      {selectedEnterprise && (
        <UserManagementModal
          visible={showUserManagementModal}
          onClose={() => setShowUserManagementModal(false)}
          companyId={selectedEnterprise.id}
          companyName={'name' in selectedEnterprise ? selectedEnterprise.name : selectedEnterprise.raisonSociale}
          onUserAssigned={loadEnterprises}
        />
      )}

      {/* Agent Management Modal */}
      <AgentManagementModal
        visible={showAgentManagementModal}
        onClose={() => setShowAgentManagementModal(false)}
        onAgentAssigned={loadEnterprises}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerLeft: {
    flex: 1
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  logoBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 2
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  importButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleSection: {
    marginBottom: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },
  reportSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
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
    color: '#0F172A'
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8
  },
  reportButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 24
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  activeFilter: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    borderRadius: 8
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
    color: '#64748B'
  },
  activeFilterText: {
    color: '#0F172A',
    fontWeight: '600'
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F172A'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16
  },
  enterprisesContainer: {
    paddingBottom: 20
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 24
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 8
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A'
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B'
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24
  },
  inputGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  roleActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  roleActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    gap: 8,
  },
  roleActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    fontFamily: 'Inter_500Medium',
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
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  enterpriseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  enterpriseContent: {
    padding: 16,
  },
  enterpriseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  enterpriseInfo: {
    flex: 1,
  },
  enterpriseName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  enterpriseId: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  enterpriseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  enterpriseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  enterpriseDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  enterpriseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});