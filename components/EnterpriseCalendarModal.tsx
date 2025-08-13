import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Calendar, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react-native';
import { Enterprise, FiscalObligation, TypeObligation } from '@/types/fiscal';
import { generateFiscalObligations, getObligationColor } from '@/utils/fiscalCalculations';
import ObligationCard from './ObligationCard';

interface EnterpriseCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  enterprise: Enterprise;
}

export default function EnterpriseCalendarModal({
  visible,
  onClose,
  enterprise
}: EnterpriseCalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [obligations, setObligations] = useState<FiscalObligation[]>([]);
  const [selectedType, setSelectedType] = useState<TypeObligation | 'all'>('all');

  useEffect(() => {
    if (enterprise) {
      const currentYear = new Date().getFullYear();
      const enterpriseObligations = generateFiscalObligations(enterprise, currentYear);
      setObligations(enterpriseObligations);
    }
  }, [enterprise]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getObligationsForPeriod = () => {
    return obligations.filter(obligation => {
      const obligationDate = new Date(obligation.dueDate);
      
      if (selectedType !== 'all' && obligation.type !== selectedType) {
        return false;
      }

      if (viewMode === 'month') {
        return obligationDate.getMonth() === selectedDate.getMonth() && 
               obligationDate.getFullYear() === selectedDate.getFullYear();
      } else {
        return obligationDate.getFullYear() === selectedDate.getFullYear();
      }
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const getDateRangeText = () => {
    if (viewMode === 'month') {
      return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else {
      return selectedDate.getFullYear().toString();
    }
  };

  const obligationTypes = [
    { key: 'all' as const, label: 'Toutes', color: '#6B7280' },
    { key: TypeObligation.IS, label: 'IS', color: getObligationColor(TypeObligation.IS) },
    { key: TypeObligation.IR, label: 'IR', color: getObligationColor(TypeObligation.IR) },
    { key: TypeObligation.TVA, label: 'TVA', color: getObligationColor(TypeObligation.TVA) },
    { key: TypeObligation.CNSS, label: 'CNSS', color: getObligationColor(TypeObligation.CNSS) },
  ];

  const filteredObligations = getObligationsForPeriod();

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
            <Text style={styles.title}>Calendrier Fiscal</Text>
            <Text style={styles.subtitle}>{enterprise.raisonSociale}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
              onPress={() => setViewMode('month')}
            >
              <Text style={[styles.viewModeText, viewMode === 'month' && styles.activeViewModeText]}>
                Mois
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'year' && styles.activeViewMode]}
              onPress={() => setViewMode('year')}
            >
              <Text style={[styles.viewModeText, viewMode === 'year' && styles.activeViewModeText]}>
                Année
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.exportButton}>
            <Download size={16} color="#667EEA" />
            <Text style={styles.exportText}>Exporter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateDate('prev')}>
            <ChevronLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{getDateRangeText()}</Text>
            <Text style={styles.obligationCount}>
              {filteredObligations.length} obligation{filteredObligations.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.navButton} onPress={() => navigateDate('next')}>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {obligationTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.filterChip,
                  selectedType === type.key && styles.activeFilter,
                  selectedType === type.key && { backgroundColor: type.color }
                ]}
                onPress={() => setSelectedType(type.key)}
              >
                <View style={[styles.filterDot, { backgroundColor: type.color }]} />
                <Text style={[
                  styles.filterText,
                  selectedType === type.key && styles.activeFilterText
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.obligationsContainer}>
            {filteredObligations.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Aucune obligation</Text>
                <Text style={styles.emptySubtitle}>
                  Aucune obligation fiscale pour cette période
                </Text>
              </View>
            ) : (
              filteredObligations.map((obligation) => (
                <ObligationCard
                  key={obligation.id}
                  obligation={obligation}
                  enterpriseName={enterprise.raisonSociale}
                  onPress={() => {}}
                />
              ))
            )}
          </View>
        </ScrollView>
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
    flex: 1
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  activeViewMode: {
    backgroundColor: '#667EEA'
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  activeViewModeText: {
    color: '#FFFFFF'
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
    marginLeft: 8
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF'
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB'
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
    marginBottom: 4
  },
  obligationCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280'
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  filterScroll: {
    flexDirection: 'row'
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8
  },
  activeFilter: {
    backgroundColor: '#667EEA'
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  activeFilterText: {
    color: '#FFFFFF'
  },
  scrollView: {
    flex: 1
  },
  obligationsContainer: {
    padding: 20
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  }
});