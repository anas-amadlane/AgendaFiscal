import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { UserRole } from '@/types/auth';
import { Building2, Search, Filter, Users, UserCheck, UserX, Edit, Eye } from 'lucide-react-native';

interface CompanyWithUsers {
  id: string;
  name: string;
  registrationNumber?: string;
  taxId?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  createdByName?: string;
  totalUsers: number;
  ownersCount: number;
  managersCount: number;
  agentsCount: number;
}

interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'manager' | 'agent';
  status: 'active' | 'inactive' | 'pending';
  assignedAt: Date;
  lastLoginAt?: Date;
  assignedByName?: string;
}

interface CompanyDetails {
  company: {
    id: string;
    name: string;
    registrationNumber?: string;
    taxId?: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
    createdByName?: string;
  };
  users: {
    owners: CompanyUser[];
    managers: CompanyUser[];
    agents: CompanyUser[];
    total: number;
  };
}

export default function AdminCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyWithUsers[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithUsers[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithUsers | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    registrationNumber: '',
    taxId: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.replace('/(tabs)');
      return;
    }
    loadCompanies();
  }, [user]);

  // Filter companies based on search query
  useEffect(() => {
    const filtered = companies.filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.taxId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/v1/companies/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanies(data.companies);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Error', 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3001/api/v1/companies/admin/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanyDetails(data);
    } catch (error) {
      console.error('Error loading company details:', error);
      Alert.alert('Error', 'Failed to load company details');
    }
  };

  const openCompanyDetails = async (company: CompanyWithUsers) => {
    setSelectedCompany(company);
    await loadCompanyDetails(company.id);
    setModalVisible(true);
  };

  const openEditModal = (company: CompanyWithUsers) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name,
      registrationNumber: company.registrationNumber || '',
      taxId: company.taxId || '',
      status: company.status
    });
    setEditModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditModalVisible(false);
    setSelectedCompany(null);
    setCompanyDetails(null);
  };

  const handleEditCompany = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3001/api/v1/companies/admin/${selectedCompany?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update company');
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      closeModal();
      loadCompanies(); // Reload companies list
    } catch (error) {
      console.error('Error updating company:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update company';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleToggleStatus = async (company: CompanyWithUsers) => {
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';

    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} "${company.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              const token = localStorage.getItem('authToken');
              
              const response = await fetch(`http://localhost:3001/api/v1/companies/admin/${company.id}/status`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${action} company`);
              }

              const data = await response.json();
              Alert.alert('Success', data.message);
              loadCompanies(); // Reload companies list
            } catch (error) {
              console.error(`Error ${action}ing company:`, error);
              const errorMessage = error instanceof Error ? error.message : `Failed to ${action} company`;
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#EF4444';
      case 'suspended': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#EF4444';
      case 'manager': return '#F59E0B';
      case 'agent': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getStatusColorForUser = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#64748B';
    }
  };

  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Company Management</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Companies List */}
      <ScrollView style={styles.companiesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading companies...</Text>
          </View>
        ) : filteredCompanies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No companies found</Text>
          </View>
        ) : (
          filteredCompanies.map((company) => (
            <View key={company.id} style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <View style={styles.companyMeta}>
                    {company.registrationNumber && (
                      <Text style={styles.companyMetaText}>
                        RC: {company.registrationNumber}
                      </Text>
                    )}
                    {company.taxId && (
                      <Text style={styles.companyMetaText}>
                        Tax ID: {company.taxId}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.companyStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(company.status) }]}>
                    <Text style={styles.statusText}>{company.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.companyStats}>
                <View style={styles.statItem}>
                  <Users size={16} color="#3B82F6" />
                  <Text style={styles.statText}>{company.totalUsers} users</Text>
                </View>
                <View style={styles.statItem}>
                  <UserCheck size={16} color="#F59E0B" />
                  <Text style={styles.statText}>{company.managersCount} managers</Text>
                </View>
                <View style={styles.statItem}>
                  <UserX size={16} color="#EF4444" />
                  <Text style={styles.statText}>{company.agentsCount} agents</Text>
                </View>
              </View>

              <View style={styles.companyActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openCompanyDetails(company)}
                >
                  <Eye size={16} color="#3B82F6" />
                  <Text style={styles.actionText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditModal(company)}
                >
                  <Edit size={16} color="#10B981" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Company Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCompany?.name}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            {companyDetails && (
              <>
                {/* Company Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Company Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{companyDetails.company.name}</Text>
                  </View>
                  
                  {companyDetails.company.registrationNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Registration Number:</Text>
                      <Text style={styles.detailValue}>{companyDetails.company.registrationNumber}</Text>
                    </View>
                  )}
                  
                  {companyDetails.company.taxId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tax ID:</Text>
                      <Text style={styles.detailValue}>{companyDetails.company.taxId}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(companyDetails.company.status) }]}>
                      <Text style={styles.statusText}>{companyDetails.company.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>{new Date(companyDetails.company.createdAt).toLocaleDateString()}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Updated:</Text>
                    <Text style={styles.detailValue}>{new Date(companyDetails.company.updatedAt).toLocaleDateString()}</Text>
                  </View>

                  {companyDetails.company.createdByName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created By:</Text>
                      <Text style={styles.detailValue}>{companyDetails.company.createdByName}</Text>
                    </View>
                  )}
                </View>

                {/* Owners */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Owners ({companyDetails.users.owners.length})</Text>
                  
                  {companyDetails.users.owners.length > 0 ? (
                    companyDetails.users.owners.map((owner) => (
                      <View key={owner.id} style={styles.userCard}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {owner.firstName} {owner.lastName}
                          </Text>
                          <Text style={styles.userEmail}>{owner.email}</Text>
                          <View style={styles.userMeta}>
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(owner.role) }]}>
                              <Text style={styles.roleText}>{owner.role}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColorForUser(owner.status) }]}>
                              <Text style={styles.statusText}>{owner.status}</Text>
                            </View>
                          </View>
                          {owner.lastLoginAt && (
                            <Text style={styles.lastLoginText}>
                              Last login: {new Date(owner.lastLoginAt).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No owners assigned</Text>
                  )}
                </View>

                {/* Managers */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Managers ({companyDetails.users.managers.length})</Text>
                  
                  {companyDetails.users.managers.length > 0 ? (
                    companyDetails.users.managers.map((manager) => (
                      <View key={manager.id} style={styles.userCard}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {manager.firstName} {manager.lastName}
                          </Text>
                          <Text style={styles.userEmail}>{manager.email}</Text>
                          <View style={styles.userMeta}>
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(manager.role) }]}>
                              <Text style={styles.roleText}>{manager.role}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColorForUser(manager.status) }]}>
                              <Text style={styles.statusText}>{manager.status}</Text>
                            </View>
                          </View>
                          {manager.lastLoginAt && (
                            <Text style={styles.lastLoginText}>
                              Last login: {new Date(manager.lastLoginAt).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No managers assigned</Text>
                  )}
                </View>

                {/* Agents */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Agents ({companyDetails.users.agents.length})</Text>
                  
                  {companyDetails.users.agents.length > 0 ? (
                    companyDetails.users.agents.map((agent) => (
                      <View key={agent.id} style={styles.userCard}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {agent.firstName} {agent.lastName}
                          </Text>
                          <Text style={styles.userEmail}>{agent.email}</Text>
                          <View style={styles.userMeta}>
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(agent.role) }]}>
                              <Text style={styles.roleText}>{agent.role}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColorForUser(agent.status) }]}>
                              <Text style={styles.statusText}>{agent.status}</Text>
                            </View>
                          </View>
                          {agent.lastLoginAt && (
                            <Text style={styles.lastLoginText}>
                              Last login: {new Date(agent.lastLoginAt).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No agents assigned</Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Company</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Registration Number"
              value={editForm.registrationNumber}
              onChangeText={(text) => setEditForm({...editForm, registrationNumber: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Tax ID"
              value={editForm.taxId}
              onChangeText={(text) => setEditForm({...editForm, taxId: text})}
            />

            <View style={styles.statusToggle}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={styles.statusToggleContainer}>
                <Text style={styles.statusToggleText}>
                  {editForm.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={editForm.status === 'active'}
                  onValueChange={(value) => setEditForm({...editForm, status: value ? 'active' : 'inactive'})}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor={editForm.status === 'active' ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleEditCompany}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    padding: 4,
  },
  companiesList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  companyMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  companyStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  companyStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  companyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '95%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastLoginText: {
    fontSize: 10,
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1E293B',
  },
  statusToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
