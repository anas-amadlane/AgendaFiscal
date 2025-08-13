import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, UserPlus, Users, Building2, CheckCircle, XCircle, User, Settings } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, CompanyWithRole } from '@/types/auth';
import RoleManagementService from '@/utils/roleManagementService';

interface AgentManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onAgentAssigned?: () => void;
}

export default function AgentManagementModal({
  visible,
  onClose,
  onAgentAssigned
}: AgentManagementModalProps) {
  const { theme, strings, isRTL } = useApp();
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showCompanyAssignment, setShowCompanyAssignment] = useState(false);

  const styles = createStyles(theme, isRTL);

  useEffect(() => {
    if (visible && user) {
      loadData();
    }
  }, [visible, user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load manager's agents
      const agentsData = await RoleManagementService.getManagerAgents(user.id);
      setAgents(agentsData);

      // Load manager's companies
      const companiesData = await RoleManagementService.getUserCompanies();
      setCompanies(companiesData.filter(company => 
        company.userRole === UserRole.MANAGER || company.userRole === UserRole.ADMIN
      ));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = (agent: any) => {
    setSelectedAgent(agent);
    setShowCompanyAssignment(true);
  };

  const handleAssignToCompany = async (companyId: string) => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      await RoleManagementService.assignCompaniesToAgent(selectedAgent.id, [companyId]);
      Alert.alert('Succès', 'Agent assigné à l\'entreprise avec succès');
      setShowCompanyAssignment(false);
      setSelectedAgent(null);
      loadData();
      onAgentAssigned?.();
    } catch (error) {
      console.error('Error assigning agent to company:', error);
      Alert.alert('Erreur', 'Impossible d\'assigner l\'agent à l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = async (agentId: string, agentName: string) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous retirer ${agentName} de vos agents ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await RoleManagementService.removeAgentFromManager(user!.id, agentId);
              Alert.alert('Succès', 'Agent retiré avec succès');
              loadData();
              onAgentAssigned?.();
            } catch (error) {
              console.error('Error removing agent:', error);
              Alert.alert('Erreur', 'Impossible de retirer l\'agent');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: UserRole) => {
    return RoleManagementService.getRoleColor(role);
  };

  const getRoleDisplayName = (role: UserRole) => {
    return RoleManagementService.getRoleDisplayName(role);
  };

  const getAssignmentStatus = (agent: any) => {
    if (agent.assignmentType === 'all') {
      return { text: 'Toutes les entreprises', color: theme.colors.primary };
    } else {
      return { text: 'Entreprises spécifiques', color: theme.colors.secondary };
    }
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
          <Text style={styles.title}>Gestion des agents</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : agents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>Aucun agent assigné</Text>
              <Text style={styles.emptySubtext}>
                Vous pouvez assigner des agents depuis la gestion des utilisateurs
              </Text>
            </View>
          ) : (
            agents.map((agent) => (
              <View key={agent.id} style={styles.agentCard}>
                <View style={styles.agentInfo}>
                  <View style={[
                    styles.agentAvatar,
                    { backgroundColor: getRoleColor(agent.role) }
                  ]}>
                    <Text style={styles.agentInitials}>
                      {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.agentDetails}>
                    <Text style={styles.agentName}>
                      {agent.firstName} {agent.lastName}
                    </Text>
                    <Text style={styles.agentEmail}>{agent.email}</Text>
                    <View style={styles.agentMeta}>
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: getRoleColor(agent.role) }
                      ]}>
                        <Text style={styles.roleBadgeText}>
                          {getRoleDisplayName(agent.role)}
                        </Text>
                      </View>
                      <View style={styles.statusContainer}>
                        {agent.isActive ? (
                          <CheckCircle size={16} color={theme.colors.statusCompleted} />
                        ) : (
                          <XCircle size={16} color={theme.colors.statusOverdue} />
                        )}
                        <Text style={[
                          styles.statusText,
                          { color: agent.isActive ? theme.colors.statusCompleted : theme.colors.statusOverdue }
                        ]}>
                          {agent.isActive ? 'Actif' : 'Inactif'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.assignmentInfo}>
                      <Text style={styles.assignmentLabel}>Type d'assignation :</Text>
                      <Text style={[
                        styles.assignmentType,
                        { color: getAssignmentStatus(agent).color }
                      ]}>
                        {getAssignmentStatus(agent).text}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.agentActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleAssignAgent(agent)}
                  >
                    <Building2 size={16} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Assigner</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveAgent(agent.id, `${agent.firstName} ${agent.lastName}`)}
                  >
                    <XCircle size={16} color={theme.colors.error} />
                    <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                      Retirer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Company Assignment Modal */}
        {showCompanyAssignment && selectedAgent && (
          <View style={styles.assignmentModal}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>
                Assigner {selectedAgent.firstName} {selectedAgent.lastName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCompanyAssignment(false);
                  setSelectedAgent(null);
                }}
              >
                <X size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.companiesList}>
              {companies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={styles.companyOption}
                  onPress={() => handleAssignToCompany(company.id)}
                >
                  <View style={styles.companyInfo}>
                    <Building2 size={20} color={theme.colors.primary} />
                    <View style={styles.companyDetails}>
                      <Text style={styles.companyName}>{company.name}</Text>
                      <Text style={styles.companyStatus}>
                        {company.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <User size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
  content: {
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
  agentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  agentInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  agentInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  agentEmail: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  agentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignmentLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  assignmentType: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  agentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: 6,
  },
  removeButton: {
    borderColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    fontFamily: 'Inter_500Medium',
  },
  assignmentModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
  companiesList: {
    padding: 20,
  },
  companyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyDetails: {
    marginLeft: 12,
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  companyStatus: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
});
