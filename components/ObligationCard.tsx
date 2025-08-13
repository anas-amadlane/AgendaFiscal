import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { FiscalObligation, StatusObligation } from '@/types/fiscal';
import { getObligationColor, getStatusColor, calculateDaysRemaining } from '@/utils/fiscalCalculations';
import ObligationActionsModal from './ObligationActionsModal';
import { ReminderData } from './ReminderModal';

interface ObligationCardProps {
  obligation: FiscalObligation;
  enterpriseName: string;
  onPress: () => void;
  onStatusChange?: (status: StatusObligation) => void;
  onSetReminder?: (reminderData: ReminderData) => void;
  onPingDeclaration?: () => void;
  showActions?: boolean;
}

export default function ObligationCard({ 
  obligation, 
  enterpriseName, 
  onPress,
  onStatusChange,
  onSetReminder,
  onPingDeclaration,
  showActions = false
}: ObligationCardProps) {
  const [showActionsModal, setShowActionsModal] = useState(false);
  const daysRemaining = calculateDaysRemaining(obligation.dueDate);
  const typeColor = getObligationColor(obligation.type);
  const statusColor = getStatusColor(obligation.status);
  
  const getStatusIcon = () => {
    switch (obligation.status) {
      case StatusObligation.COMPLETED:
        return <CheckCircle size={16} color="#10B981" />;
      case StatusObligation.OVERDUE:
        return <AlertCircle size={16} color="#EF4444" />;
      default:
        return <Clock size={16} color="#F59E0B" />;
    }
  };

  const getDaysText = () => {
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} jours de retard`;
    } else if (daysRemaining === 0) {
      return "Échéance aujourd'hui";
    } else {
      return `${daysRemaining} jours restants`;
    }
  };

  const getUrgencyStyle = () => {
    if (daysRemaining < 0) {
      return styles.overdueCard;
    } else if (daysRemaining <= 3) {
      return styles.urgentCard;
    }
    return {};
  };

  const handleMarkCompleted = () => {
    onStatusChange?.(StatusObligation.COMPLETED);
  };

  const handleSetReminder = (reminderData: ReminderData) => {
    onSetReminder?.(reminderData);
  };

  const handlePingDeclaration = () => {
    onPingDeclaration?.();
  };

  return (
    <>
      <TouchableOpacity style={[styles.card, getUrgencyStyle()]} onPress={onPress}>
        <View style={styles.header}>
          <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{obligation.title}</Text>
            <Text style={styles.enterprise}>N°{obligation.id.slice(-6)} • {enterpriseName}</Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            {showActions && (
              <TouchableOpacity 
                style={styles.actionsButton}
                onPress={() => setShowActionsModal(true)}
              >
                <MoreHorizontal size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.description}>{obligation.description}</Text>
          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Échéance</Text>
              <Text style={styles.metaValue}>
                {obligation.dueDate.toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Statut</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{obligation.status}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Délai</Text>
              <Text style={[styles.metaValue, { 
                color: daysRemaining < 0 ? '#EF4444' : daysRemaining <= 3 ? '#F59E0B' : '#64748B' 
              }]}>
                {getDaysText()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <ObligationActionsModal
        visible={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        obligation={obligation}
        onMarkCompleted={handleMarkCompleted}
        onSetReminder={handleSetReminder}
        onPingDeclaration={handlePingDeclaration}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  urgentCard: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB'
  },
  overdueCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
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
  enterprise: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12
  },
  actionsButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC'
  },
  details: {
    gap: 12
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20
  },
  metaInfo: {
    gap: 8
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B'
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A'
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
  }
});