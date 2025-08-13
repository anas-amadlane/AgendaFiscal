import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Search, Bell, Filter, MoveHorizontal as MoreHorizontal, TrendingUp, Activity, Calendar, Clock, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Plus } from 'lucide-react-native';
import StatCard from '@/components/StatCard';
import ObligationCard from '@/components/ObligationCard';
import PingNavigationBar from '@/components/PingNavigationBar';
import PingEcheanceModal from '@/components/PingEcheanceModal';
import AppHeader from '@/components/AppHeader';
import { FiscalObligation, StatusObligation } from '@/types/fiscal';
import { updateObligationStatus } from '@/utils/fiscalCalculations';
import { ReminderData } from '@/components/ReminderModal';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import RoleManagementService from '@/utils/roleManagementService';
import { CompanyWithRole } from '@/types/auth';

export default function Dashboard() {
  const { theme, strings, isRTL } = useApp();
  const { user } = useAuth();
  const [obligations, setObligations] = useState<FiscalObligation[]>([]);
  const [enterprises, setEnterprises] = useState<CompanyWithRole[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingedDeclarations, setPingedDeclarations] = useState<FiscalObligation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user's companies
      const companies = await RoleManagementService.getUserCompanies();
      setEnterprises(companies);
      
      // For now, start with empty obligations for new users
      setObligations([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setEnterprises([]);
      setObligations([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    setRefreshing(false);
  };

  const handleObligationStatusChange = (obligationId: string, newStatus: StatusObligation) => {
    setObligations(prev => prev.map(obligation => 
      obligation.id === obligationId 
        ? { ...obligation, status: newStatus }
        : obligation
    ));
  };

  const handleSetReminder = (reminderData: ReminderData) => {
    // Handle reminder setting logic here
  };

  const handlePingDeclaration = (obligation: FiscalObligation) => {
    setPingedDeclarations(prev => [...prev, obligation]);
  };

  const getEnterpriseNameById = (id: string) => {
    const enterprise = enterprises.find(e => e.id === id);
    return enterprise ? enterprise.name : 'Entreprise inconnue';
  };

  const totalEnterprises = enterprises.length;
  const upcomingObligations = obligations.filter(o => o.status === StatusObligation.UPCOMING).length;
  const pendingObligations = obligations.filter(o => o.status === StatusObligation.PENDING).length;
  const overdueObligations = obligations.filter(o => o.status === StatusObligation.OVERDUE).length;
  const completedObligations = obligations.filter(o => o.status === StatusObligation.COMPLETED).length;

  const urgentObligations = obligations
    .filter(o => o.status === StatusObligation.PENDING || o.status === StatusObligation.OVERDUE)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const complianceRate = obligations.length > 0 ? Math.round((completedObligations / obligations.length) * 100) : 0;

  const styles = createStyles(theme, isRTL);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={strings.dashboardTitle}
        subtitle={`N°${Date.now().toString().slice(-8)}`}
        rightActions={[
          {
            icon: Search,
            onPress: () => {},
          },
          {
            icon: Bell,
            onPress: () => {},
            badge: (pendingObligations + overdueObligations) > 0 ? (pendingObligations + overdueObligations) : undefined,
          },
        ]}
      />

      {/* Ping Navigation Bar */}
      <PingNavigationBar 
        pingedDeclarations={pingedDeclarations}
        onDeclarationPress={(declaration) => {}}
      />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
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
              <Text style={styles.filterText}>Toutes</Text>
            </View>
            <View style={styles.filterItem}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.filterText}>Terminées</Text>
            </View>
            <View style={styles.filterItem}>
              <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.filterText}>Urgentes</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <StatCard
                  title="Entreprises"
                  value={totalEnterprises}
                  icon={Building2}
                  color="#3B82F6"
                  subtitle="Profils actifs"
                />
              </View>
              <View style={styles.statItem}>
                <StatCard
                  title="À venir"
                  value={upcomingObligations}
                  icon={Calendar}
                  color="#10B981"
                  subtitle="Prochaines échéances"
                />
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <StatCard
                  title="Urgentes"
                  value={pendingObligations}
                  icon={Clock}
                  color="#F59E0B"
                  subtitle="Cette semaine"
                />
              </View>
              <View style={styles.statItem}>
                <StatCard
                  title="En retard"
                  value={overdueObligations}
                  icon={AlertCircle}
                  color="#EF4444"
                  subtitle="Action requise"
                />
              </View>
            </View>
          </View>

          {/* Compliance Indicator */}
          <View style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <Text style={styles.complianceTitle}>Taux de conformité</Text>
              <Text style={styles.compliancePercentage}>{complianceRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${complianceRate}%` }]} />
            </View>
            <Text style={styles.complianceSubtitle}>
              {completedObligations} terminées sur {obligations.length}
            </Text>
          </View>
        </View>

        {/* Obligations List */}
        <View style={styles.obligationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Échéances prioritaires</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : obligations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <CheckCircle size={32} color="#10B981" />
              </View>
              <Text style={styles.emptyTitle}>
                {enterprises.length === 0 ? 'Bienvenue !' : 'Aucune obligation'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {enterprises.length === 0 
                  ? 'Commencez par ajouter votre première entreprise pour voir vos obligations fiscales'
                  : 'Toutes vos obligations urgentes sont à jour'
                }
              </Text>
              {enterprises.length === 0 && (
                <TouchableOpacity style={styles.emptyActionButton}>
                  <Plus size={20} color="#3B82F6" />
                  <Text style={styles.emptyActionText}>Ajouter une entreprise</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.obligationsContainer}>
              {urgentObligations.map((obligation) => (
                <ObligationCard
                  key={obligation.id}
                  obligation={obligation}
                  enterpriseName={getEnterpriseNameById(obligation.enterpriseId)}
                  onPress={() => {}}
                  onStatusChange={(status) => handleObligationStatusChange(obligation.id, status)}
                  onSetReminder={handleSetReminder}
                  onPingDeclaration={() => handlePingDeclaration(obligation)}
                  showActions={true}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Ping Modal */}
      <PingEcheanceModal
        visible={showPingModal}
        onClose={() => setShowPingModal(false)}
        enterprises={enterprises}
        onPingDeclaration={handlePingDeclaration}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1
  },
  reportSection: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    color: theme.colors.onSurface,
    fontFamily: 'Inter-SemiBold',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8
  },
  reportButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
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
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Medium',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 16
  },
  statsGrid: {
    gap: 12,
    marginBottom: 16
  },
  statRow: {
    flexDirection: 'row',
    gap: 12
  },
  statItem: {
    flex: 1
  },
  complianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A'
  },
  compliancePercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  complianceSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  obligationsSection: {
    paddingHorizontal: 20,
    marginTop: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A'
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B'
  },
  obligationsContainer: {
    gap: 12
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
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
    marginBottom: 24
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 8
  },
  bottomSpacing: {
    height: 20
  }
});