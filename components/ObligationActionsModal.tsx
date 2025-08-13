import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, CircleCheck as CheckCircle, Clock } from 'lucide-react-native';
import { FiscalObligation } from '@/types/fiscal';
import ReminderModal, { ReminderData } from './ReminderModal';

interface ObligationActionsModalProps {
  visible: boolean;
  onClose: () => void;
  obligation: FiscalObligation;
  onMarkCompleted: () => void;
  onSetReminder: (reminderData: ReminderData) => void;
}

export default function ObligationActionsModal({
  visible,
  onClose,
  obligation,
  onMarkCompleted,
  onSetReminder
}: ObligationActionsModalProps) {
  const [showReminderModal, setShowReminderModal] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleSetReminder = () => {
    setShowReminderModal(true);
  };

  const handleReminderSet = (reminderData: ReminderData) => {
    onSetReminder(reminderData);
    setShowReminderModal(false);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Actions</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.obligationInfo}>
              <Text style={styles.obligationTitle}>{obligation.title}</Text>
              <Text style={styles.obligationDescription}>{obligation.description}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleAction(onMarkCompleted)}
              >
                <CheckCircle size={20} color="#48BB78" />
                <Text style={styles.actionText}>Marquer comme terminé</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.reminderButton]}
                onPress={handleSetReminder}
              >
                <Clock size={20} color="#667EEA" />
                <Text style={styles.actionText}>Programmer un rappel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        obligation={obligation}
        onSetReminder={handleReminderSet}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  closeButton: {
    padding: 4
  },
  obligationInfo: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  obligationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  obligationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  actions: {
    padding: 24,
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB'
  },
  completeButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  reminderButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12
  }
});