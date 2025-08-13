import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Filter, History, Search, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import ObligationCard from '@/components/ObligationCard';
import { mockEnterprises, generateMockObligations } from '@/utils/mockData';
import { FiscalObligation, StatusObligation } from '@/types/fiscal';
import { updateObligationStatus } from '@/utils/fiscalCalculations';

export default function CalendarScreen() {
  const [obligations, setObligations] = useState<FiscalObligation[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const mockObligations = generateMockObligations();
    const updatedObligations = mockObligations.map(obligation => ({
      ...obligation,
      status: updateObligationStatus(obligation)
    }));
    setObligations(updatedObligations);
  }, []);

  const getEnterpriseNameById = (id: string) => {
    const enterprise = mockEnterprises.find(e => e.id === id);
    return enterprise ? enterprise.raisonSociale : 'Entreprise inconnue';
  };

  const getObligationsForMonth = (date: Date) => {
    const filteredObligations = obligations.filter(obligation => {
      const obligationDate = new Date(obligation.dueDate);
      const matchesMonth = obligationDate.getMonth() === date.getMonth() && 
                          obligationDate.getFullYear() === date.getFullYear();
      
      // If showing history, include all obligations, otherwise exclude completed ones
      if (showHistory) {
        return matchesMonth;
      } else {
        return matchesMonth && obligation.status !== StatusObligation.COMPLETED;
      }
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return filteredObligations;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getDateRangeText = () => {
    if (viewMode === 'month') {
      return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
    } else {
      return selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  };

  const obligationsToShow = getObligationsForMonth(selectedDate);
  const completedCount = obligationsToShow.filter(o => o.status === StatusObligation.COMPLETED).length;
  const totalCount = obligationsToShow.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <View style={[styles.logoBar, { backgroundColor: '#3B82F6' }]} />
                <View style={[styles.logoBar, { backgroundColor: '#10B981' }]} />
                <View style={[styles.logoBar, { backgroundColor: '#F59E0B' }]} />
              </View>
              <View>
                <Text style={styles.appName}>Agenda Fiscal</Text>
                <Text style={styles.appSubtitle}>Marocain</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Filter size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Calendrier Fiscal</Text>
          <Text style={styles.subtitle}>N°{obligationsToShow.length.toString().padStart(8, '0')}</Text>
        </View>
      </View>

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
          <View style={styles.filterItem}>
            <View style={[styles.statusDot, { backgroundColor: '#64748B' }]} />
            <Text style={styles.filterText}>Toutes ({totalCount})</Text>
          </View>
          <View style={styles.filterItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.filterText}>Terminées ({completedCount})</Text>
          </View>
          <View style={styles.filterItem}>
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.filterText}>En retard ({obligationsToShow.filter(o => o.status === StatusObligation.OVERDUE).length})</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.viewModeContainer}>
          {(['day', 'week', 'month'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewModeButton, viewMode === mode && styles.activeViewMode]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewModeText, viewMode === mode && styles.activeViewModeText]}>
                {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.historyButton, showHistory && styles.activeHistory]}
          onPress={() => setShowHistory(!showHistory)}
        >
          <History size={16} color={showHistory ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.historyText, showHistory && styles.activeHistoryText]}>
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateDate('prev')}>
          <ChevronLeft size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{getDateRangeText()}</Text>
          {showHistory && completedCount > 0 && (
            <Text style={styles.historyInfo}>
              {completedCount} terminée{completedCount > 1 ? 's' : ''} sur {totalCount}
            </Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.navButton} onPress={() => navigateDate('next')}>
          <ChevronRight size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.obligationsContainer}>
          <Text style={styles.sectionTitle}>
            {obligationsToShow.length} échéance{obligationsToShow.length > 1 ? 's' : ''}
            {showHistory && ' (avec historique)'}
          </Text>
          
          {obligationsToShow.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Calendar size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Aucune échéance</Text>
              <Text style={styles.emptySubtitle}>
                Aucune obligation fiscale pour cette période
              </Text>
            </View>
          ) : (
            obligationsToShow.map((obligation) => (
              <ObligationCard
                key={obligation.id}
                obligation={obligation}
                enterpriseName={getEnterpriseNameById(obligation.enterpriseId)}
                onPress={() => {}}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
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
    color: '#64748B'
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center'
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    marginRight: 12
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  activeViewMode: {
    backgroundColor: '#3B82F6'
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B'
  },
  activeViewModeText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activeHistory: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8
  },
  activeHistoryText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textTransform: 'capitalize'
  },
  historyInfo: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '500'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20
  },
  obligationsContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16
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
    textAlign: 'center'
  }
});