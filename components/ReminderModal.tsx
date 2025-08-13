import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { X, Clock, Calendar, Volume2, Bell } from 'lucide-react-native';
import { FiscalObligation } from '@/types/fiscal';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  obligation: FiscalObligation;
  onSetReminder: (reminderData: ReminderData) => void;
}

export interface ReminderData {
  date: Date;
  time: string;
  tone: string;
  message: string;
}

export default function ReminderModal({
  visible,
  onClose,
  obligation,
  onSetReminder
}: ReminderModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedTone, setSelectedTone] = useState('default');

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const tones = [
    { id: 'default', name: 'Défaut', icon: '🔔' },
    { id: 'urgent', name: 'Urgent', icon: '🚨' },
    { id: 'gentle', name: 'Doux', icon: '🎵' },
    { id: 'professional', name: 'Professionnel', icon: '💼' },
    { id: 'chime', name: 'Carillon', icon: '🎶' }
  ];

  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push(date);
    }
    
    return options;
  };

  const handleSetReminder = () => {
    const reminderDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    reminderDateTime.setHours(parseInt(hours), parseInt(minutes));

    const reminderData: ReminderData = {
      date: reminderDateTime,
      time: selectedTime,
      tone: selectedTone,
      message: `Rappel: ${obligation.title} - Échéance le ${obligation.dueDate.toLocaleDateString('fr-FR')}`
    };

    onSetReminder(reminderData);
    
    if (Platform.OS === 'web') {
      // Web notification simulation
      Alert.alert(
        'Rappel programmé',
        `Rappel programmé pour le ${reminderDateTime.toLocaleDateString('fr-FR')} à ${selectedTime}`,
        [{ text: 'OK' }]
      );
    } else {
      // Native notification would be scheduled here
      Alert.alert(
        'Rappel programmé',
        `Rappel programmé pour le ${reminderDateTime.toLocaleDateString('fr-FR')} à ${selectedTime}`,
        [{ text: 'OK' }]
      );
    }
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Programmer un rappel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.obligationInfo}>
            <Text style={styles.obligationTitle}>{obligation.title}</Text>
            <Text style={styles.obligationDescription}>{obligation.description}</Text>
            <Text style={styles.dueDate}>
              Échéance: {obligation.dueDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Date du rappel</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {getDateOptions().map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dateOption, isSelected && styles.selectedOption]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dateDay, isSelected && styles.selectedText]}>
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.selectedText]}>
                      {date.getDate()}
                    </Text>
                    {isToday && <Text style={styles.todayLabel}>Aujourd'hui</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Heure du rappel</Text>
            </View>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeOption, selectedTime === time && styles.selectedOption]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.selectedText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Volume2 size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Tonalité</Text>
            </View>
            <View style={styles.toneGrid}>
              {tones.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={[styles.toneOption, selectedTone === tone.id && styles.selectedOption]}
                  onPress={() => setSelectedTone(tone.id)}
                >
                  <Text style={styles.toneIcon}>{tone.icon}</Text>
                  <Text style={[styles.toneText, selectedTone === tone.id && styles.selectedText]}>
                    {tone.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.setButton} onPress={handleSetReminder}>
            <Bell size={16} color="#FFFFFF" />
            <Text style={styles.setButtonText}>Programmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937'
  },
  closeButton: {
    padding: 4
  },
  content: {
    flex: 1,
    padding: 20
  },
  obligationInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  obligationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  obligationDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  dueDate: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500'
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8
  },
  dateScroll: {
    marginHorizontal: -4
  },
  dateOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  selectedText: {
    color: '#FFFFFF'
  },
  todayLabel: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '500'
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  timeOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937'
  },
  toneGrid: {
    gap: 8
  },
  toneOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  toneIcon: {
    fontSize: 20,
    marginRight: 12
  },
  toneText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280'
  },
  setButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  setButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8
  }
});