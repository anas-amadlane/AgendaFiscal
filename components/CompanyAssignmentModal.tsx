import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { X, Building2, User, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedCompanies?: Company[];
}

interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  status?: string;
}

interface CompanyAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  agent: Agent | null;
  onAssignmentComplete?: () => void;
}

export default function CompanyAssignmentModal({ 
  visible, 
  onClose, 
  agent,
  onAssignmentComplete 
}: CompanyAssignmentModalProps) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && agent) {
      fetchCompanies();
      fetchAgentCompanies();
    }
  }, [visible, agent]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      Alert.alert('Erreur', 'Impossible de charger les entreprises');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentCompanies = async () => {
    if (!agent) return;

    try {
      const response = await fetch(`/api/users/${agent.id}/companies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const assignedIds = data.companies?.map((c: Company) => c.id) || [];
        setSelectedCompanyIds(assignedIds);
      }
    } catch (error) {
      console.error('Error fetching agent companies:', error);
    }
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanyIds(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  const handleSaveAssignments = async () => {
    if (!agent) return;

    try {
      setSaving(true);
      const response = await fetch('/api/users/assign-companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: agent.id,
          companyIds: selectedCompanyIds
        })
      });

      if (response.ok) {
        Alert.alert(
          'Succès', 
          `Entreprises assignées à ${agent.firstName} ${agent.lastName}`,
          [{ text: 'OK', onPress: () => {
            onAssignmentComplete?.();
            onClose();
          }}]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Erreur', errorData.message || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Error assigning companies:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'assignation des entreprises');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedCompanyIds([]);
    onClose();
  };

  if (!agent) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.agentInfo}>
              <User size={24} color="#3B82F6" />
              <View style={styles.agentDetails}>
                <Text style={styles.agentName}>
                  {agent.firstName} {agent.lastName}
                </Text>
                <Text style={styles.agentEmail}>{agent.email}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Assigner des entreprises</Text>
          <Text style={styles.subtitle}>
            Sélectionnez les entreprises à assigner à cet agent
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Chargement des entreprises...</Text>
            </View>
          ) : (
            <ScrollView style={styles.companiesList} showsVerticalScrollIndicator={false}>
              {companies.map((company) => {
                const isSelected = selectedCompanyIds.includes(company.id);
                return (
                  <TouchableOpacity
                    key={company.id}
                    style={[styles.companyItem, isSelected && styles.companyItemSelected]}
                    onPress={() => toggleCompanySelection(company.id)}
                  >
                    <View style={styles.companyInfo}>
                      <Building2 size={20} color={isSelected ? "#3B82F6" : "#64748B"} />
                      <View style={styles.companyDetails}>
                        <Text style={[styles.companyName, isSelected && styles.companyNameSelected]}>
                          {company.name}
                        </Text>
                        {company.registrationNumber && (
                          <Text style={styles.companyRegistration}>
                            {company.registrationNumber}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={20} color="#3B82F6" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleClose}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSaveAssignments}
            disabled={saving || selectedCompanyIds.length === 0}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                Assigner ({selectedCompanyIds.length})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentDetails: {
    marginLeft: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  agentEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  companiesList: {
    flex: 1,
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  companyItemSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
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
    color: '#111827',
  },
  companyNameSelected: {
    color: '#3B82F6',
  },
  companyRegistration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
