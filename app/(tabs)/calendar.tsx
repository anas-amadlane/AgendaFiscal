import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Filter, Eye, EyeOff, Check, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import apiProxy from '@/utils/apiProxy';
import { FiscalObligation } from '@/types/fiscal';
import { 
  getFiscalObligationStatus, 
  getFiscalObligationsForPeriod, 
  getFiscalObligationStatistics, 
  getObligationTypeColor, 
  getPriorityColor 
} from '@/utils/fiscalCalculations';

interface Company {
  id: string;
  name: string;
  categorie_personnes: string;
}

type ViewMode = 'year' | 'month' | 'week' | 'day';
type StatusFilter = 'all' | 'upcoming' | 'due' | 'overdue';

export default function CalendarScreen() {
  const { user } = useAuth();
  const { theme } = useApp();
  
  const [fiscalObligations, setFiscalObligations] = useState<FiscalObligation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Calendar view state
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Filter state
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  
  // Editing state
  const [editingObligation, setEditingObligation] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Modal state
  const [selectedObligation, setSelectedObligation] = useState<FiscalObligation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch fiscal obligations and companies
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch companies first
      const companiesData = await apiProxy.get('/companies');
      const companiesArray = Array.isArray(companiesData) 
        ? companiesData 
        : (companiesData?.companies || []);
      setCompanies(companiesArray);

      // Fetch fiscal obligations with a high limit to get all obligations
      const obligationsData = await apiProxy.getFiscalObligations({ limit: 20000 });
      const obligations = obligationsData?.data || [];
      setFiscalObligations(obligations);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
      setFiscalObligations([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Update obligation status
  const updateObligationStatus = async (obligationId: string, newStatus: 'pending' | 'completed' | 'overdue' | 'cancelled') => {
    setUpdating(true);
    try {
      await apiProxy.updateFiscalObligation(obligationId, { status: newStatus });
      
      // Update local state
      setFiscalObligations(prev => 
        prev.map(obligation => 
          obligation.id === obligationId 
            ? { ...obligation, status: newStatus }
            : obligation
        )
      );
      
      setEditingObligation(null);
      Alert.alert('Succès', 'Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    } finally {
      setUpdating(false);
    }
  };

  // Update obligation priority
  const updateObligationPriority = async (obligationId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    setUpdating(true);
    try {
      await apiProxy.updateFiscalObligation(obligationId, { priority: newPriority });
      
      // Update local state
      setFiscalObligations(prev => 
        prev.map(obligation => 
          obligation.id === obligationId 
            ? { ...obligation, priority: newPriority }
            : obligation
        )
      );
      
      setEditingObligation(null);
      Alert.alert('Succès', 'Priorité mise à jour avec succès');
    } catch (error) {
      console.error('Error updating priority:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la priorité');
    } finally {
      setUpdating(false);
    }
  };

  // Handle status change
  const handleStatusChange = (obligationId: string, currentStatus: 'pending' | 'completed' | 'overdue' | 'cancelled') => {
    const newStatus: 'pending' | 'completed' = currentStatus === 'pending' ? 'completed' : 'pending';
    updateObligationStatus(obligationId, newStatus);
  };

  // Handle priority change
  const handlePriorityChange = (obligationId: string, currentPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(currentPriority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    const newPriority = priorities[nextIndex];
    updateObligationPriority(obligationId, newPriority);
  };

  // Handle obligation selection
  const handleObligationPress = (obligation: FiscalObligation) => {
    setSelectedObligation(obligation);
    setModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedObligation(null);
  };

  // Handle status toggle in modal
  const handleStatusToggle = () => {
    if (selectedObligation) {
      const newStatus: 'pending' | 'completed' = selectedObligation.status === 'pending' ? 'completed' : 'pending';
      updateObligationStatus(selectedObligation.id, newStatus);
      // Update the selected obligation in modal
      setSelectedObligation(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle priority toggle in modal
  const handlePriorityToggle = () => {
    if (selectedObligation) {
      const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];
      const currentIndex = priorities.indexOf(selectedObligation.priority);
      const nextIndex = (currentIndex + 1) % priorities.length;
      const newPriority = priorities[nextIndex];
      updateObligationPriority(selectedObligation.id, newPriority);
      // Update the selected obligation in modal
      setSelectedObligation(prev => prev ? { ...prev, priority: newPriority } : null);
    }
  };

  // Get filtered fiscal obligations
  const getFilteredFiscalObligations = useMemo(() => {
    let filtered = fiscalObligations;

    // Filter by selected company
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(obligation => obligation.company_id === selectedCompany);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(obligation => {
        const status = getFiscalObligationStatus(obligation, new Date());
        return status === selectedStatus;
      });
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(obligation => obligation.obligation_type === selectedType);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(obligation => obligation.priority === selectedPriority);
    }

    return filtered.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [fiscalObligations, selectedCompany, selectedStatus, selectedType, selectedPriority]);

  // Get entries for current view
  const getEntriesForCurrentView = () => {
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const currentWeek = getWeekOfYear(selectedDate);
    const currentDay = selectedDate.getDate();

    return getFiscalObligationsForPeriod(
      getFilteredFiscalObligations,
      currentYear,
      viewMode === 'month' ? currentMonth : undefined,
      viewMode === 'week' ? currentWeek : undefined,
      viewMode === 'day' ? currentDay : undefined
    );
  };

  // Helper function to get week of year
  const getWeekOfYear = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  // Get display text for current view
  const getViewDisplayText = () => {
    switch (viewMode) {
      case 'year':
        return selectedDate.getFullYear().toString();
      case 'month':
        return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      case 'day':
        return selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      default:
        return '';
    }
  };

  // Get unique values for filters
  const getUniqueValues = (key: keyof FiscalObligation) => {
    const values = new Set(getFilteredFiscalObligations.map(obligation => obligation[key]).filter((value): value is string => Boolean(value) && typeof value === 'string'));
    return Array.from(values).sort();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#EF4444';
      case 'due':
        return '#F59E0B';
      case 'upcoming':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const stats = getFiscalObligationStatistics(getFilteredFiscalObligations);
  const currentViewEntries = getEntriesForCurrentView();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Chargement du calendrier fiscal...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Calendrier Fiscal
        </Text>
      </View>

      {/* View Mode Selector */}
      <View style={[styles.viewModeContainer, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['year', 'month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeButton,
                viewMode === mode && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[
                styles.viewModeText,
                { color: viewMode === mode ? '#FFFFFF' : theme.colors.onSurface }
              ]}>
                {mode === 'year' ? 'Année' : mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Calendar Navigation */}
      <View style={[styles.calendarHeader, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
          <ChevronLeft size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        
        <Text style={[styles.calendarTitle, { color: theme.colors.onSurface }]}>
          {getViewDisplayText()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
          <ChevronRight size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Company Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>Entreprise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCompany === 'all' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedCompany('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: selectedCompany === 'all' ? '#FFFFFF' : theme.colors.onSurface }
                ]}>
                  Toutes
                </Text>
              </TouchableOpacity>
              {companies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={[
                    styles.filterChip,
                    selectedCompany === company.id && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedCompany(company.id)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedCompany === company.id ? '#FFFFFF' : theme.colors.onSurface }
                  ]}>
                    {company.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>Statut</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['all', 'upcoming', 'due', 'overdue'] as StatusFilter[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    selectedStatus === status && { backgroundColor: getStatusColor(status) }
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedStatus === status ? '#FFFFFF' : theme.colors.onSurface }
                  ]}>
                    {status === 'all' ? 'Tous' : status === 'upcoming' ? 'À venir' : status === 'due' ? 'Échéance' : 'Critique'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedType === 'all' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedType('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: selectedType === 'all' ? '#FFFFFF' : theme.colors.onSurface }
                ]}>
                  Tous
                </Text>
              </TouchableOpacity>
              {getUniqueValues('obligation_type').map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && { backgroundColor: getObligationTypeColor(type) }
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <View style={[styles.typeDot, { backgroundColor: getObligationTypeColor(type) }]} />
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedType === type ? '#FFFFFF' : theme.colors.onSurface }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Priority Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>Priorité</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedPriority === 'all' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedPriority('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: selectedPriority === 'all' ? '#FFFFFF' : theme.colors.onSurface }
                ]}>
                  Toutes
                </Text>
              </TouchableOpacity>
              {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterChip,
                    selectedPriority === priority && { backgroundColor: getPriorityColor(priority) }
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedPriority === priority ? '#FFFFFF' : theme.colors.onSurface }
                  ]}>
                    {priority === 'low' ? 'Faible' : priority === 'medium' ? 'Moyenne' : priority === 'high' ? 'Élevée' : 'Urgente'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Summary Stats */}
      <View style={[styles.summaryStats, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.upcoming}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>À venir</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.due}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Échéance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.overdue}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Critique</Text>
        </View>
      </View>

      {/* Calendar Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentViewEntries.length > 0 ? (
          currentViewEntries.map(obligation => {
            const status = getFiscalObligationStatus(obligation, new Date());
            const dueDate = new Date(obligation.due_date);
            
            return (
              <TouchableOpacity 
                key={obligation.id} 
                style={[styles.obligationCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleObligationPress(obligation)}
                activeOpacity={0.7}
              >
                <View style={styles.obligationHeader}>
                  <View style={styles.obligationInfo}>
                    <Text style={[styles.obligationTitle, { color: theme.colors.onSurface }]}>
                      {obligation.title}
                    </Text>
                    <Text style={[styles.obligationCompany, { color: theme.colors.onSurfaceVariant }]}>
                      {obligation.company_name} - {obligation.obligation_type}
                    </Text>
                  </View>
                  
                  <View style={styles.obligationActions}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                      <Text style={styles.statusText}>
                        {status === 'upcoming' ? 'À venir' : status === 'due' ? 'Échéance' : 'Critique'}
                      </Text>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: getObligationTypeColor(obligation.obligation_type) }]}>
                      <Text style={styles.typeText}>
                        {obligation.obligation_type}
                      </Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(obligation.priority) }]}>
                      <Text style={styles.priorityText}>
                        {obligation.priority === 'low' ? 'Faible' : obligation.priority === 'medium' ? 'Moyenne' : obligation.priority === 'high' ? 'Élevée' : 'Urgente'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.obligationDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Type:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {obligation.obligation_type}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Échéance:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {dueDate.toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Priorité:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {obligation.priority === 'low' ? 'Faible' : obligation.priority === 'medium' ? 'Moyenne' : obligation.priority === 'high' ? 'Élevée' : 'Urgente'}
                    </Text>
                  </View>
                  
                  {obligation.description && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Description:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                        {obligation.description}
                      </Text>
                    </View>
                  )}
                  
                  {obligation.amount && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Montant:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                        {obligation.amount.toLocaleString('fr-FR')} {obligation.currency || 'MAD'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Aucune obligation fiscale pour cette période
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Obligation Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {selectedObligation && (
            <>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>Fermer</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                  Détails de l'obligation
                </Text>
                <View style={{ width: 50 }} />
              </View>

              {/* Modal Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Obligation Title */}
                <View style={[styles.modalSection, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.onSurface }]}>
                    {selectedObligation.title}
                  </Text>
                  <Text style={[styles.modalSectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {selectedObligation.company_name} - {selectedObligation.obligation_type}
                  </Text>
                </View>

                {/* Status and Priority Badges */}
                <View style={[styles.modalSection, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.modalBadgesContainer}>
                    <View style={[styles.modalBadge, { backgroundColor: getStatusColor(getFiscalObligationStatus(selectedObligation, new Date())) }]}>
                      <Text style={styles.modalBadgeText}>
                        {getFiscalObligationStatus(selectedObligation, new Date()) === 'upcoming' ? 'À venir' : 
                         getFiscalObligationStatus(selectedObligation, new Date()) === 'due' ? 'Échéance' : 'Critique'}
                      </Text>
                    </View>
                    <View style={[styles.modalBadge, { backgroundColor: getPriorityColor(selectedObligation.priority) }]}>
                      <Text style={styles.modalBadgeText}>
                        {selectedObligation.priority === 'low' ? 'Faible' : 
                         selectedObligation.priority === 'medium' ? 'Moyenne' : 
                         selectedObligation.priority === 'high' ? 'Élevée' : 'Urgente'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Obligation Details */}
                <View style={[styles.modalSection, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.onSurface }]}>Informations</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Type:</Text>
                    <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                      {selectedObligation.obligation_type}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Échéance:</Text>
                    <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                      {new Date(selectedObligation.due_date).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Statut:</Text>
                    <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                      {selectedObligation.status === 'pending' ? 'En attente' : 
                       selectedObligation.status === 'completed' ? 'Terminé' : 
                       selectedObligation.status === 'overdue' ? 'En retard' : 'Annulé'}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Priorité:</Text>
                    <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                      {selectedObligation.priority === 'low' ? 'Faible' : 
                       selectedObligation.priority === 'medium' ? 'Moyenne' : 
                       selectedObligation.priority === 'high' ? 'Élevée' : 'Urgente'}
                    </Text>
                  </View>

                  {selectedObligation.description && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Description:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {selectedObligation.description}
                      </Text>
                    </View>
                  )}

                  {selectedObligation.amount && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Montant:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {selectedObligation.amount.toLocaleString('fr-FR')} {selectedObligation.currency || 'MAD'}
                      </Text>
                    </View>
                  )}

                  {selectedObligation.periode_declaration && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Période:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {selectedObligation.periode_declaration}
                      </Text>
                    </View>
                  )}

                  {selectedObligation.lien && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Lien:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {selectedObligation.lien}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Company Information */}
                <View style={[styles.modalSection, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.onSurface }]}>Entreprise</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Nom:</Text>
                    <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                      {selectedObligation.company_name}
                    </Text>
                  </View>

                  {selectedObligation.categorie_personnes && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Catégorie:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {selectedObligation.categorie_personnes}
                      </Text>
                    </View>
                  )}

                  {selectedObligation.sous_categorie && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Sous-catégorie:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {selectedObligation.sous_categorie}
                      </Text>
                    </View>
                  )}
                </View>

                {/* System Information */}
                <View style={[styles.modalSection, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.onSurface }]}>Système</Text>
                  
                  {selectedObligation.created_at && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Créé le:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {new Date(selectedObligation.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  )}

                  {selectedObligation.last_edited && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: theme.colors.onSurfaceVariant }]}>Modifié le:</Text>
                      <Text style={[styles.modalDetailValue, { color: theme.colors.onSurface }]}>
                        {new Date(selectedObligation.last_edited).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Toggle Buttons */}
              <View style={[styles.modalFooter, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity 
                  style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleStatusToggle}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Check size={20} color="white" />
                      <Text style={styles.toggleButtonText}>
                        {selectedObligation.status === 'pending' ? 'Marquer comme terminé' : 'Marquer comme en attente'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.toggleButton, { backgroundColor: theme.colors.secondary }]}
                  onPress={handlePriorityToggle}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Edit3 size={20} color="white" />
                      <Text style={styles.toggleButtonText}>
                        Changer priorité
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  viewModeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterGroup: {
    marginRight: 24,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  obligationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  obligationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  obligationInfo: {
    flex: 1,
    marginRight: 12,
  },
  obligationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  obligationCompany: {
    fontSize: 14,
    fontWeight: '500',
  },
  obligationActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  obligationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalSection: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalSectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});