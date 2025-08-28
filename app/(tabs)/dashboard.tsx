import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building2, 
  Users, 
  FileText,
  ArrowRight
} from 'lucide-react-native';
import { mockFiscalCalendarEntries } from '@/utils/mockData';
import { FiscalCalendarEntry, getFiscalCalendarEntryStatus } from '@/types/fiscal';
import { getFiscalCalendarStatistics } from '@/utils/fiscalCalculations';

export default function DashboardScreen() {
  const { user, isAuthenticated } = useAuth();
  const [fiscalEntries, setFiscalEntries] = useState<FiscalCalendarEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Later this will come from the API
      setFiscalEntries(mockFiscalCalendarEntries);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const stats = getFiscalCalendarStatistics(fiscalEntries);
  const overdueEntries = fiscalEntries.filter(entry => 
    getFiscalCalendarEntryStatus(entry, new Date()) === 'overdue'
  ).slice(0, 3);
  const dueEntries = fiscalEntries.filter(entry => 
    getFiscalCalendarEntryStatus(entry, new Date()) === 'due'
  ).slice(0, 3);

  const navigateToCalendar = () => router.push('/(tabs)/calendar');
  const navigateToEnterprises = () => router.push('/(tabs)/enterprises');
  const navigateToNotifications = () => router.push('/(tabs)/notifications');

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
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
          
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Bonjour, {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.welcomeSubtext}>
              Voici un aperçu de vos déclarations fiscales
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar size={20} color="#3B82F6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total déclarations</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={20} color="#F59E0B" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.due}</Text>
              <Text style={styles.statLabel}>Échéance proche</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <AlertTriangle size={20} color="#EF4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.overdue}</Text>
              <Text style={styles.statLabel}>En retard</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={navigateToCalendar}>
              <Calendar size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Calendrier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={navigateToEnterprises}>
              <Building2 size={24} color="#10B981" />
              <Text style={styles.actionText}>Entreprises</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={navigateToNotifications}>
              <AlertTriangle size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overdue Declarations */}
        {overdueEntries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Déclarations en retard</Text>
              <TouchableOpacity onPress={navigateToCalendar}>
                <Text style={styles.viewAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            
            {overdueEntries.map((entry) => (
              <View key={entry.id} style={styles.declarationCard}>
                <View style={styles.declarationHeader}>
                  <View style={[styles.tag, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                    <Text style={[styles.tagText, { color: '#EF4444' }]}>{entry.tag}</Text>
                  </View>
                  <AlertTriangle size={16} color="#EF4444" />
                </View>
                <Text style={styles.declarationTitle}>{entry.detail_declaration}</Text>
                <Text style={styles.declarationSubtitle}>
                  {entry.categorie_personnes} • {entry.frequence_declaration}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Due Declarations */}
        {dueEntries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Échéances proches</Text>
              <TouchableOpacity onPress={navigateToCalendar}>
                <Text style={styles.viewAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            
            {dueEntries.map((entry) => (
              <View key={entry.id} style={styles.declarationCard}>
                <View style={styles.declarationHeader}>
                  <View style={[styles.tag, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                    <Text style={[styles.tagText, { color: '#F59E0B' }]}>{entry.tag}</Text>
                  </View>
                  <Clock size={16} color="#F59E0B" />
                </View>
                <Text style={styles.declarationTitle}>{entry.detail_declaration}</Text>
                <Text style={styles.declarationSubtitle}>
                  {entry.categorie_personnes} • {entry.frequence_declaration}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé par catégorie</Text>
          <View style={styles.categoryStats}>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <View key={category} style={styles.categoryStat}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 12,
  },
  logoBar: {
    width: 3,
    height: 20,
    marginBottom: 2,
    borderRadius: 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  welcomeSection: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  declarationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  declarationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  declarationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  declarationSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  categoryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryStat: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '45%',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
});
