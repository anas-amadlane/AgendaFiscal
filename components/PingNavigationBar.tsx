import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Filter, Eye } from 'lucide-react-native';
import { FiscalObligation, StatusObligation } from '@/types/fiscal';
import { getStatusColor } from '@/utils/fiscalCalculations';

interface PingNavigationBarProps {
  pingedDeclarations: FiscalObligation[];
  onDeclarationPress: (declaration: FiscalObligation) => void;
}

export default function PingNavigationBar({
  pingedDeclarations,
  onDeclarationPress
}: PingNavigationBarProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  const filteredDeclarations = pingedDeclarations.filter(declaration => {
    switch (filter) {
      case 'active':
        return declaration.status === StatusObligation.PENDING || declaration.status === StatusObligation.UPCOMING;
      case 'completed':
        return declaration.status === StatusObligation.COMPLETED;
      case 'overdue':
        return declaration.status === StatusObligation.OVERDUE;
      default:
        return true;
    }
  });

  const getFilterCount = (filterType: typeof filter) => {
    return pingedDeclarations.filter(declaration => {
      switch (filterType) {
        case 'active':
          return declaration.status === StatusObligation.PENDING || declaration.status === StatusObligation.UPCOMING;
        case 'completed':
          return declaration.status === StatusObligation.COMPLETED;
        case 'overdue':
          return declaration.status === StatusObligation.OVERDUE;
        default:
          return true;
      }
    }).length;
  };

  if (pingedDeclarations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Déclarations épinglées</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewAllButton}>
            <Eye size={16} color="#3B82F6" />
            <Text style={styles.viewAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#64748B' }]} />
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Toutes ({getFilterCount('all')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.activeTab]}
          onPress={() => setFilter('active')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
            Actives ({getFilterCount('active')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.activeTab]}
          onPress={() => setFilter('completed')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Terminées ({getFilterCount('completed')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'overdue' && styles.activeTab]}
          onPress={() => setFilter('overdue')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.filterText, filter === 'overdue' && styles.activeFilterText]}>
            En retard ({getFilterCount('overdue')})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredDeclarations.map((declaration) => (
          <TouchableOpacity
            key={declaration.id}
            style={styles.declarationCard}
            onPress={() => onDeclarationPress(declaration)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(declaration.status) }]} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {declaration.title}
              </Text>
            </View>
            <Text style={styles.cardId}>N°{declaration.id.slice(-6)}</Text>
            <Text style={styles.cardDate}>
              {declaration.dueDate.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(declaration.status) }]}>
              <Text style={styles.statusText}>{declaration.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  activeTab: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    borderRadius: 8
  },
  filterDot: {
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
  activeFilterText: {
    color: '#0F172A',
    fontWeight: '600'
  },
  scrollView: {
    marginHorizontal: -4
  },
  scrollContent: {
    paddingHorizontal: 4
  },
  declarationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1
  },
  cardId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4
  },
  cardDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});