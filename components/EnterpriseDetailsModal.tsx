import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Building2, Calendar, FileText, Download, Upload, Settings, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { Enterprise, FiscalObligation } from '@/types/fiscal';
import { generateFiscalObligations } from '@/utils/fiscalCalculations';
import { mockEnterprises } from '@/utils/mockData';

interface EnterpriseDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  enterprise: Enterprise;
  onEdit: (enterprise: Enterprise) => void;
  onDelete: (enterpriseId: string) => void;
  onViewCalendar: (enterprise: Enterprise) => void;
}

export default function EnterpriseDetailsModal({
  visible,
  onClose,
  enterprise,
  onEdit,
  onDelete,
  onViewCalendar
}: EnterpriseDetailsModalProps) {
  const [obligations, setObligations] = useState<FiscalObligation[]>([]);

  useEffect(() => {
    if (enterprise) {
      const currentYear = new Date().getFullYear();
      const enterpriseObligations = generateFiscalObligations(enterprise, currentYear);
      setObligations(enterpriseObligations);
    }
  }, [enterprise]);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'entreprise',
      `Êtes-vous sûr de vouloir supprimer "${enterprise.raisonSociale}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            onDelete(enterprise.id);
            onClose();
          }
        }
      ]
    );
  };

  const handleExportCalendar = () => {
    Alert.alert(
      'Exporter le calendrier',
      'Le calendrier fiscal sera exporté au format ICS pour cette entreprise.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Exporter', 
          onPress: () => {
            // Simulate calendar export
            Alert.alert('Succès', 'Calendrier exporté avec succès');
          }
        }
      ]
    );
  };

  const getObligationStats = () => {
    const total = obligations.length;
    const upcoming = obligations.filter(o => {
      const dueDate = o.dueDate instanceof Date ? o.dueDate : new Date(o.dueDate);
      const daysRemaining = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysRemaining > 0 && daysRemaining <= 30;
    }).length;
    const overdue = obligations.filter(o => {
      const dueDate = o.dueDate instanceof Date ? o.dueDate : new Date(o.dueDate);
      const daysRemaining = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysRemaining < 0;
    }).length;

    return { total, upcoming, overdue };
  };

  const stats = getObligationStats();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Building2 size={24} color="#667EEA" />
            </View>
            <View>
              <Text style={styles.title}>{enterprise.raisonSociale}</Text>
              <Text style={styles.subtitle}>IF: {enterprise.identifiantFiscal}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations générales</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Forme juridique</Text>
                <Text style={styles.infoValue}>{enterprise.formeJuridique}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Régime fiscal</Text>
                <Text style={styles.infoValue}>{enterprise.regimeFiscal}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Secteur d'activité</Text>
                <Text style={styles.infoValue}>{enterprise.secteurActivite}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date de création</Text>
                <Text style={styles.infoValue}>
                  {enterprise.dateCreation 
                    ? (enterprise.dateCreation instanceof Date 
                        ? enterprise.dateCreation.toLocaleDateString('fr-FR')
                        : new Date(enterprise.dateCreation).toLocaleDateString('fr-FR'))
                    : 'Non spécifiée'
                  }
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Statut</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: enterprise.isActive ? '#F0FDF4' : '#FEF2F2' 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: enterprise.isActive ? '#16A34A' : '#DC2626' 
                  }]}>
                    {enterprise.isActive ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Obligations fiscales</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#ED8936' }]}>{stats.upcoming}</Text>
                <Text style={styles.statLabel}>À venir</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#F56565' }]}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>En retard</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onViewCalendar(enterprise)}
              >
                <Calendar size={20} color="#667EEA" />
                <Text style={styles.actionText}>Voir le calendrier</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleExportCalendar}
              >
                <Download size={20} color="#48BB78" />
                <Text style={styles.actionText}>Exporter calendrier</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onEdit(enterprise)}
              >
                <Edit3 size={20} color="#ED8936" />
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    'Générer rapport',
                    'Un rapport détaillé des obligations sera généré.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <FileText size={20} color="#8B5CF6" />
                <Text style={styles.actionText}>Générer rapport</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={20} color="#F56565" />
            <Text style={styles.deleteButtonText}>Supprimer l'entreprise</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  section: {
    marginTop: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB'
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280'
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center'
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F56565',
    marginLeft: 8
  }
});