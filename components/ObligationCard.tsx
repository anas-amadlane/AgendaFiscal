import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { FiscalCalendarEntry, getFiscalCalendarEntryStatus } from '@/types/fiscal';

interface FiscalEntryCardProps {
  entry: FiscalCalendarEntry;
  onPress?: () => void;
}

export default function FiscalEntryCard({ entry, onPress }: FiscalEntryCardProps) {
  const status = getFiscalCalendarEntryStatus(entry, new Date());
  
  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return '#EF4444';
      case 'due':
        return '#F59E0B';
      case 'upcoming':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'overdue':
        return 'En retard';
      case 'due':
        return 'Échéance proche';
      case 'upcoming':
        return 'À venir';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle size={16} color="#EF4444" />;
      case 'due':
        return <Clock size={16} color="#F59E0B" />;
      case 'upcoming':
        return <Calendar size={16} color="#10B981" />;
      default:
        return <Calendar size={16} color="#64748B" />;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'IS':
        return '#3B82F6';
      case 'IR':
        return '#10B981';
      case 'TVA':
        return '#F59E0B';
      case 'CNSS':
        return '#8B5CF6';
      case 'CPU':
        return '#EC4899';
      case 'TP':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={[styles.tag, { backgroundColor: getTagColor(entry.tag) + '20', borderColor: getTagColor(entry.tag) }]}>
            <Text style={[styles.tagText, { color: getTagColor(entry.tag) }]}>{entry.tag}</Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>{entry.detail_declaration}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Catégorie:</Text>
          <Text style={styles.detailValue}>{entry.categorie_personnes}</Text>
        </View>
        
        {entry.sous_categorie && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sous-catégorie:</Text>
            <Text style={styles.detailValue}>{entry.sous_categorie}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{entry.type}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fréquence:</Text>
          <Text style={styles.detailValue}>{entry.frequence_declaration}</Text>
        </View>
        
        {entry.mois && entry.jours && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Échéance:</Text>
            <Text style={styles.detailValue}>{entry.jours}/{entry.mois}</Text>
          </View>
        )}
        
        {entry.formulaire && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Formulaire:</Text>
            <Text style={styles.detailValue}>{entry.formulaire}</Text>
          </View>
        )}
      </View>

      {entry.commentaire && (
        <Text style={styles.comment}>{entry.commentaire}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftSection: {
    flex: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  comment: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
    fontStyle: 'italic',
  },
});