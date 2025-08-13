import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { User, CompanyRole } from '@/types/auth';
import { Users, Building2, UserCheck, UserX, TrendingUp, Activity } from 'lucide-react-native';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  totalManagers: number;
  totalAgents: number;
}

interface CompanyWithUsers {
  id: string;
  name: string;
  status: string;
  managers: User[];
  agents: User[];
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalManagers: 0,
    totalAgents: 0
  });
  const [companies, setCompanies] = useState<CompanyWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const statsResponse = await fetch('/api/v1/admin/stats');
      // const companiesResponse = await fetch('/api/v1/admin/companies');
      
      // Mock data for now
      const mockStats: AdminStats = {
        totalUsers: 156,
        activeUsers: 142,
        totalCompanies: 23,
        activeCompanies: 21,
        totalManagers: 45,
        totalAgents: 67
      };

      const mockCompanies: CompanyWithUsers[] = [
        {
          id: '1',
          name: 'TechCorp Solutions',
          status: 'active',
          managers: [
            { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@techcorp.com', role: 'regular', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@techcorp.com', role: 'regular', status: 'active', createdAt: new Date(), updatedAt: new Date() }
          ],
          agents: [
            { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@techcorp.com', role: 'regular', status: 'active', createdAt: new Date(), updatedAt: new Date() }
          ],
          totalUsers: 3
        },
        {
          id: '2',
          name: 'Global Industries',
          status: 'active',
          managers: [
            { id: '4', firstName: 'Alice', lastName: 'Brown', email: 'alice@global.com', role: 'regular', status: 'active', createdAt: new Date(), updatedAt: new Date() }
          ],
          agents: [
            { id: '5', firstName: 'Charlie', lastName: 'Wilson', email: 'charlie@global.com', role: 'regular', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: '6', firstName: 'Diana', lastName: 'Miller', email: 'diana@global.com', role: 'regular', status: 'active', createdAt: new Date(), updatedAt: new Date() }
          ],
          totalUsers: 3
        }
      ];

      setStats(mockStats);
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateToUsers = () => router.push('/(tabs)/admin-users');
  const navigateToCalendar = () => router.push('/(tabs)/admin-calendar');
  const navigateToCompanies = () => router.push('/(tabs)/admin-companies');

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user.firstName}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={navigateToUsers}>
          <Users size={24} color="#3B82F6" />
          <Text style={styles.actionText}>Manage Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToCalendar}>
          <Activity size={24} color="#10B981" />
          <Text style={styles.actionText}>Fiscal Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToCompanies}>
          <Building2 size={24} color="#F59E0B" />
          <Text style={styles.actionText}>Companies</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>System Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Users size={20} color="#3B82F6" />
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statSubtext}>{stats.activeUsers} active</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Building2 size={20} color="#10B981" />
              <Text style={styles.statLabel}>Companies</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalCompanies}</Text>
            <Text style={styles.statSubtext}>{stats.activeCompanies} active</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <UserCheck size={20} color="#F59E0B" />
              <Text style={styles.statLabel}>Managers</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalManagers}</Text>
            <Text style={styles.statSubtext}>Active managers</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <UserX size={20} color="#EF4444" />
              <Text style={styles.statLabel}>Agents</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalAgents}</Text>
            <Text style={styles.statSubtext}>Active agents</Text>
          </View>
        </View>
      </View>

      {/* Companies Overview */}
      <View style={styles.companiesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Companies</Text>
          <TouchableOpacity onPress={navigateToCompanies}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {companies.map((company) => (
          <View key={company.id} style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <Text style={styles.companyName}>{company.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: company.status === 'active' ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.statusText}>{company.status}</Text>
              </View>
            </View>

            <View style={styles.companyStats}>
              <View style={styles.companyStat}>
                <Text style={styles.companyStatLabel}>Managers:</Text>
                <Text style={styles.companyStatValue}>{company.managers.length}</Text>
              </View>
              <View style={styles.companyStat}>
                <Text style={styles.companyStatLabel}>Agents:</Text>
                <Text style={styles.companyStatValue}>{company.agents.length}</Text>
              </View>
              <View style={styles.companyStat}>
                <Text style={styles.companyStatLabel}>Total:</Text>
                <Text style={styles.companyStatValue}>{company.totalUsers}</Text>
              </View>
            </View>

            <View style={styles.companyUsers}>
              <Text style={styles.usersLabel}>Managers:</Text>
              <View style={styles.usersList}>
                {company.managers.map((manager) => (
                  <Text key={manager.id} style={styles.userName}>
                    {manager.firstName} {manager.lastName}
                  </Text>
                ))}
              </View>

              <Text style={styles.usersLabel}>Agents:</Text>
              <View style={styles.usersList}>
                {company.agents.map((agent) => (
                  <Text key={agent.id} style={styles.userName}>
                    {agent.firstName} {agent.lastName}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  companiesContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
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
    marginBottom: 12,
    gap: 16,
  },
  companyStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyStatLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  companyStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  companyUsers: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  usersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  usersList: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
});
