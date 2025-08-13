import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Building2, Calendar, CircleAlert as AlertCircle, TrendingUp } from 'lucide-react-native';
import { Enterprise } from '@/types/fiscal';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  upcomingObligations?: number;
  overdueObligations?: number;
  onPress: () => void;
}

export default function EnterpriseCard({ 
  enterprise, 
  upcomingObligations = 0, 
  overdueObligations = 0,
  onPress 
}: EnterpriseCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Building2 size={20} color="#3B82F6" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{enterprise.raisonSociale}</Text>
          <Text style={styles.identifier}>N°{enterprise.identifiantFiscal}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: enterprise.isActive ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusText}>{enterprise.isActive ? 'Actif' : 'Inactif'}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Forme juridique</Text>
          <Text style={styles.detailValue}>{enterprise.formeJuridique}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Régime fiscal</Text>
          <Text style={styles.detailValue}>{enterprise.regimeFiscal}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Secteur</Text>
          <Text style={styles.detailValue}>{enterprise.secteurActivite}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statText}>{upcomingObligations} à venir</Text>
          </View>
          {overdueObligations > 0 && (
            <View style={styles.stat}>
              <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.statText, { color: '#EF4444' }]}>{overdueObligations} en retard</Text>
            </View>
          )}
        </View>
        <View style={styles.performanceIndicator}>
          <TrendingUp size={16} color="#10B981" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4
  },
  identifier: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B'
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
  details: {
    marginBottom: 16,
    gap: 8
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B'
  },
  performanceIndicator: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center'
  }
});