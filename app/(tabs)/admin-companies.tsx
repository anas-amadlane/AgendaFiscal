import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Building2, Search, Filter, Users, UserCheck, UserX, Plus, Edit, Trash2, Eye } from 'lucide-react-native';

interface CompanyWithUsers {
  id: string;
  name: string;
  registrationNumber?: string;
  taxId?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  managers: CompanyUser[];
  agents: CompanyUser[];
  totalUsers: number;
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
}

export default function AdminCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyWithUsers[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithUsers[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithUsers | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/admin/companies');
      
      // Mock data
      const mockCompanies: CompanyWithUsers[] = [
        {
          id: '1',
          name: 'TechCorp Solutions',
          registrationNumber: 'RC123456',
          taxId: 'TAX789012',
          status: 'active',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          managers: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@techcorp.com',
              role: 'owner',
              status: 'active',
              assignedAt: new Date('2024-01-15'),
              lastLoginAt: new Date('2024-01-20')
            },
            {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@techcorp.com',
              role: 'manager',
              status: 'active',
              assignedAt: new Date('2024-01-16'),
              lastLoginAt: new Date('2024-01-21')
            }
          ],
          agents: [
            {
              id: '3',
              firstName: 'Bob',
              lastName: 'Johnson',
              email: 'bob@techcorp.com',
              role: 'agent',
              status: 'active',
              assignedAt: new Date('2024-01-17'),
              lastLoginAt: new Date('2024-01-19')
            }
          ],
          totalUsers: 3
        },
        {
          id: '2',
          name: 'Global Industries',
          registrationNumber: 'RC654321',
          taxId: 'TAX210987',
          status: 'active',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          managers: [
            {
              id: '4',
              firstName: 'Alice',
              lastName: 'Brown',
              email: 'alice@global.com',
              role: 'owner',
              status: 'active',
              assignedAt: new Date('2024-01-10'),
              lastLoginAt: new Date('2024-01-22')
            }
          ],
          agents: [
            {
              id: '5',
              firstName: 'Charlie',
              lastName: 'Wilson',
              email: 'charlie@global.com',
              role: 'agent',
              status: 'active',
              assignedAt: new Date('2024-01-11'),
              lastLoginAt: new Date('2024-01-18')
            },
            {
              id: '6',
              firstName: 'Diana',
              lastName: 'Miller',
              email: 'diana@global.com',
              role: 'agent',
              status: 'pending',
              assignedAt: new Date('2024-01-12'),
              lastLoginAt: new Date('2024-01-17')
            }
          ],
          totalUsers: 3
        },
        {
          id: '3',
          name: 'Inactive Corp',
          registrationNumber: 'RC111111',
          taxId: 'TAX111111',
          status: 'inactive',
          createdAt: new Date('2023-12-01'),
          updatedAt: new Date('2024-01-05'),
          managers: [],
          agents: [],
          totalUsers: 0
        }
      ];

      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Error', 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const openCompanyDetails = (company: CompanyWithUsers) => {
    setSelectedCompany(company);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCompany(null);
  };

  const handleDeleteCompany = async (company: CompanyWithUsers) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${company.name}"? This will also remove all user associations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await fetch(`/api/v1/admin/companies/${company.id}`, {
              //   method: 'DELETE'
              // });

              // Update local state
              setCompanies(companies.filter(c => c.id !== company.id));

              Alert.alert('Success', 'Company deleted successfully');
            } catch (error) {
              console.error('Error deleting company:', error);
              Alert.alert('Error', 'Failed to delete company');
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

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Company Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
        {filteredCompanies.map((company) => (
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
                <Text style={styles.statText}>{company.managers.length} managers</Text>
              </View>
              <View style={styles.statItem}>
                <UserX size={16} color="#EF4444" />
                <Text style={styles.statText}>{company.agents.length} agents</Text>
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
                onPress={() => {/* TODO: Edit company */}}
              >
                <Edit size={16} color="#10B981" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteCompany(company)}
              >
                <Trash2 size={16} color="#EF4444" />
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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

            {selectedCompany && (
              <>
                {/* Company Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Company Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedCompany.name}</Text>
                  </View>
                  
                  {selectedCompany.registrationNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Registration Number:</Text>
                      <Text style={styles.detailValue}>{selectedCompany.registrationNumber}</Text>
                    </View>
                  )}
                  
                  {selectedCompany.taxId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tax ID:</Text>
                      <Text style={styles.detailValue}>{selectedCompany.taxId}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedCompany.status) }]}>
                      <Text style={styles.statusText}>{selectedCompany.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>{selectedCompany.createdAt.toLocaleDateString()}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Updated:</Text>
                    <Text style={styles.detailValue}>{selectedCompany.updatedAt.toLocaleDateString()}</Text>
                  </View>
                </View>

                {/* Managers */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Managers ({selectedCompany.managers.length})</Text>
                  
                  {selectedCompany.managers.length > 0 ? (
                    selectedCompany.managers.map((manager) => (
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
                        </View>
                        <View style={styles.userActions}>
                          <TouchableOpacity style={styles.userActionButton}>
                            <Edit size={14} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No managers assigned</Text>
                  )}
                </View>

                {/* Agents */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Agents ({selectedCompany.agents.length})</Text>
                  
                  {selectedCompany.agents.length > 0 ? (
                    selectedCompany.agents.map((agent) => (
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
                              Last login: {agent.lastLoginAt.toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.userActions}>
                          <TouchableOpacity style={styles.userActionButton}>
                            <Edit size={14} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No agents assigned</Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.addUserButton}>
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addUserButtonText}>Add User</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
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
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
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
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    color: '#EF4444',
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
  userActions: {
    marginLeft: 12,
  },
  userActionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  modalActions: {
    marginTop: 20,
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addUserButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
