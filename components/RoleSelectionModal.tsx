import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { X, User, Users, Mail } from 'lucide-react-native';

interface RoleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onRoleSelected: (role: 'manager' | 'agent', managerEmail?: string) => void;
  companyName: string;
}

export default function RoleSelectionModal({ 
  visible, 
  onClose, 
  onRoleSelected, 
  companyName 
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'manager' | 'agent' | null>(null);
  const [managerEmail, setManagerEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRoleSelect = (role: 'manager' | 'agent') => {
    setSelectedRole(role);
    setEmailError('');
    if (role === 'manager') {
      setManagerEmail('');
    }
  };

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Erreur', 'Veuillez sélectionner un rôle');
      return;
    }

    if (selectedRole === 'agent') {
      if (!managerEmail.trim()) {
        setEmailError('L\'email du manager est requis');
        return;
      }
      
      if (!validateEmail(managerEmail)) {
        setEmailError('Format d\'email invalide');
        return;
      }

      // Show confirmation for agent role
      Alert.alert(
        'Confirmation',
        `Vous allez créer l'entreprise "${companyName}" en tant qu'agent.\n\nUne invitation sera envoyée à ${managerEmail} pour qu'il devienne le manager de cette entreprise.\n\nVoulez-vous continuer ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Continuer', 
            onPress: () => {
              onRoleSelected(selectedRole, managerEmail);
              handleReset();
            }
          }
        ]
      );
    } else {
      // Show confirmation for manager role
      Alert.alert(
        'Confirmation',
        `Vous allez créer l'entreprise "${companyName}" en tant que manager.\n\nVous pourrez ensuite inviter des agents à rejoindre votre entreprise.\n\nVoulez-vous continuer ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Continuer', 
            onPress: () => {
              onRoleSelected(selectedRole);
              handleReset();
            }
          }
        ]
      );
    }
  };

  const handleReset = () => {
    setSelectedRole(null);
    setManagerEmail('');
    setEmailError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Définir votre rôle</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Pour l'entreprise "{companyName}", quel sera votre rôle ?
          </Text>

          <View style={styles.roleOptions}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'manager' && styles.roleOptionSelected
              ]}
              onPress={() => handleRoleSelect('manager')}
            >
              <View style={styles.roleIconContainer}>
                <User size={24} color={selectedRole === 'manager' ? '#3B82F6' : '#64748B'} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={[
                  styles.roleTitle,
                  selectedRole === 'manager' && styles.roleTitleSelected
                ]}>
                  Manager
                </Text>
                <Text style={styles.roleDescription}>
                  Vous gérez l'entreprise et pouvez inviter des agents
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'agent' && styles.roleOptionSelected
              ]}
              onPress={() => handleRoleSelect('agent')}
            >
              <View style={styles.roleIconContainer}>
                <Users size={24} color={selectedRole === 'agent' ? '#3B82F6' : '#64748B'} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={[
                  styles.roleTitle,
                  selectedRole === 'agent' && styles.roleTitleSelected
                ]}>
                  Agent
                </Text>
                <Text style={styles.roleDescription}>
                  Vous travaillez sous la supervision d'un manager
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {selectedRole === 'agent' && (
            <View style={styles.managerEmailSection}>
              <Text style={styles.emailLabel}>
                <Mail size={16} color="#64748B" /> Email du manager
              </Text>
              <TextInput
                style={[
                  styles.emailInput,
                  emailError ? styles.emailInputError : null
                ]}
                placeholder="email@manager.com"
                value={managerEmail}
                onChangeText={(text) => {
                  setManagerEmail(text);
                  setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : (
                <Text style={styles.helpText}>
                  Une invitation sera envoyée à ce manager pour qu'il confirme son rôle
                </Text>
              )}
            </View>
          )}

          {selectedRole === 'manager' && (
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                En tant que manager, vous pourrez :
              </Text>
              <Text style={styles.bulletPoint}>• Gérer les informations de l'entreprise</Text>
              <Text style={styles.bulletPoint}>• Inviter et gérer des agents</Text>
              <Text style={styles.bulletPoint}>• Assigner des tâches fiscales</Text>
              <Text style={styles.bulletPoint}>• Consulter tous les rapports</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedRole && styles.continueButtonTextDisabled
            ]}>
              Continuer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A'
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    padding: 20
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center'
  },
  roleOptions: {
    gap: 16,
    marginBottom: 24
  },
  roleOption: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0'
  },
  roleOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF'
  },
  roleIconContainer: {
    marginRight: 16
  },
  roleInfo: {
    flex: 1
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4
  },
  roleTitleSelected: {
    color: '#3B82F6'
  },
  roleDescription: {
    fontSize: 14,
    color: '#64748B'
  },
  managerEmailSection: {
    marginBottom: 24
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#0F172A'
  },
  emailInputError: {
    borderColor: '#EF4444'
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4
  },
  helpText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4
  },
  infoSection: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
    marginBottom: 8
  },
  bulletPoint: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    marginBottom: 4
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B'
  },
  continueButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center'
  },
  continueButtonDisabled: {
    backgroundColor: '#94A3B8'
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  continueButtonTextDisabled: {
    color: '#E2E8F0'
  }
});