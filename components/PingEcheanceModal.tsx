import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Plus, Building2, Calendar, FileText, Search } from 'lucide-react-native';
import { Enterprise, FiscalObligation, TypeObligation, StatusObligation, CategoryObligation } from '@/types/fiscal';

interface PingEcheanceModalProps {
  visible: boolean;
  onClose: () => void;
  enterprises: Enterprise[];
  onPingDeclaration: (obligation: FiscalObligation) => void;
}

export default function PingEcheanceModal({
  visible,
  onClose,
  enterprises,
  onPingDeclaration
}: PingEcheanceModalProps) {
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [selectedType, setSelectedType] = useState<TypeObligation | null>(null);

  const obligationTypes = [
    { type: TypeObligation.IS, label: 'Impôt sur les Sociétés', color: '#3B82F6' },
    { type: TypeObligation.IR, label: 'Impôt sur le Revenu', color: '#10B981' },
    { type: TypeObligation.TVA, label: 'Taxe sur la Valeur Ajoutée', color: '#F59E0B' },
    { type: TypeObligation.CNSS, label: 'Caisse Nationale de Sécurité Sociale', color: '#8B5CF6' },
    { type: TypeObligation.TAXE_PROFESSIONNELLE, label: 'Taxe Professionnelle', color: '#EF4444' },
  ];

  const handlePingDeclaration = () => {
    if (!selectedEnterprise || !selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner une entreprise et un type d\'obligation');
      return;
    }

    // Create a mock obligation for the ping
    const mockObligation: FiscalObligation = {
      id: `ping-${Date.now()}`,
      enterpriseId: selectedEnterprise.id,
      type: selectedType,
      title: `${selectedType} - ${selectedEnterprise.raisonSociale}`,
      description: `Obligation ${selectedType} pour ${selectedEnterprise.raisonSociale}`,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: StatusObligation.UPCOMING,
      alertDays: [15, 7, 3, 1],
      category: CategoryObligation.DECLARATION
    };

    onPingDeclaration(mockObligation);
    setSelectedEnterprise(null);
    setSelectedType(null);
    onClose();
    Alert.alert('Succès', 'Déclaration épinglée avec succès');
  };

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
            <Text style={styles.title}>Épingler une déclaration</Text>
            <Text style={styles.subtitle}>Sélectionnez une entreprise et un type</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Building2 size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Sélectionner une entreprise</Text>
            </View>
            <View style={styles.enterprisesList}>
              {enterprises.map((enterprise) => (
                <TouchableOpacity
                  key={enterprise.id}
                  style={[
                    styles.enterpriseCard,
                    selectedEnterprise?.id === enterprise.id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedEnterprise(enterprise)}
                >
                  <View style={styles.enterpriseHeader}>
                    <Text style={styles.enterpriseName}>{enterprise.raisonSociale}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: enterprise.isActive ? '#10B981' : '#EF4444' 
                    }]}>
                      <Text style={styles.statusText}>
                        {enterprise.isActive ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.enterpriseId}>IF: {enterprise.identifiantFiscal}</Text>
                  <Text style={styles.enterpriseDetails}>
                    {enterprise.formeJuridique} • {enterprise.secteurActivite}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Type d'obligation</Text>
            </View>
            <View style={styles.typesList}>
              {obligationTypes.map((obligation) => (
                <TouchableOpacity
                  key={obligation.type}
                  style={[
                    styles.typeCard,
                    selectedType === obligation.type && styles.selectedCard
                  ]}
                  onPress={() => setSelectedType(obligation.type)}
                >
                  <View style={styles.typeHeader}>
                    <View style={[styles.typeDot, { backgroundColor: obligation.color }]} />
                    <Text style={styles.typeLabel}>{obligation.type}</Text>
                  </View>
                  <Text style={styles.typeDescription}>{obligation.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.pingButton,
              (!selectedEnterprise || !selectedType) && styles.disabledButton
            ]} 
            onPress={handlePingDeclaration}
            disabled={!selectedEnterprise || !selectedType}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.pingButtonText}>Épingler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B'
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  section: {
    marginTop: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8
  },
  enterprisesList: {
    gap: 12
  },
  enterpriseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  selectedCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF'
  },
  enterpriseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  enterpriseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  enterpriseId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4
  },
  enterpriseDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569'
  },
  typesList: {
    gap: 12
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  typeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A'
  },
  typeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B'
  },
  pingButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: {
    backgroundColor: '#94A3B8'
  },
  pingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
  }
});