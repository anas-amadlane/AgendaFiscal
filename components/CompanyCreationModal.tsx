import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Building2, Users, Check } from 'lucide-react-native';
import { CompanyRole } from '@/types/auth';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import ModalPicker from '@/components/ModalPicker';

interface CompanyCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCompanyCreated: (companyData: any) => void;
}

export default function CompanyCreationModal({
  visible,
  onClose,
  onCompanyCreated
}: CompanyCreationModalProps) {
  const { theme, strings, isRTL } = useApp();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    categoriePersonnes: '',
    sousCategorie: '',
    role: CompanyRole.MANAGER,
    managerEmail: '',
    isTvaAssujetti: false,
    regimeTva: '',
    prorataDdeduction: false
  });

  // Options for dropdowns
  const categories = [
    'Personne Morale',
    'Personne Physique'
  ];

  const sousCategories: Record<string, string[]> = {
    'Personne Physique': [
      'Entreprise Individuelle',
      'Auto-entrepreneur',
      'Régime CPU (Contribution Professionnelle Unique)'
    ],
    'Personne Morale': [
      'SARL',
      'SARL à associé unique',
      'SA',
      'SAS',
      'SNC',
      'SCS',
      'SCA',
      'SEP',
      'GIE',
      'Succursale',
      'Bureau de liaison'
    ]
  };

  const regimeTvaOptions = [
    'Mensuel',
    'Trimestriel'
  ];

  const roles = [
    { value: CompanyRole.MANAGER, label: 'Manager' },
    { value: CompanyRole.AGENT, label: 'Agent' }
  ];

  // Auto-fill manager email when role changes to Manager
  useEffect(() => {
    if (formData.role === CompanyRole.MANAGER && user?.email) {
      setFormData(prev => ({
        ...prev,
        managerEmail: user.email
      }));
    } else if (formData.role === CompanyRole.AGENT) {
      setFormData(prev => ({
        ...prev,
        managerEmail: ''
      }));
    }
  }, [formData.role, user?.email]);



  const handleCreateCompany = async () => {
    console.log('Creating company with data:', formData);
    
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom de l\'entreprise');
      return;
    }

    if (!formData.categoriePersonnes) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie de personnes');
      return;
    }

    if (!formData.sousCategorie) {
      Alert.alert('Erreur', 'Veuillez sélectionner une sous-catégorie');
      return;
    }

    if (formData.role === CompanyRole.AGENT && !formData.managerEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l\'email du manager');
      return;
    }

    if (formData.isTvaAssujetti && !formData.regimeTva) {
      Alert.alert('Erreur', 'Veuillez sélectionner le régime de TVA');
      return;
    }

    setLoading(true);

    try {
      const companyData = {
        name: formData.name.trim(),
        categoriePersonnes: formData.categoriePersonnes,
        sousCategorie: formData.sousCategorie,
        userRole: formData.role,
        managerEmail: formData.managerEmail.trim(),
        isTvaAssujetti: formData.isTvaAssujetti,
        regimeTva: formData.regimeTva,
        prorataDdeduction: formData.prorataDdeduction
      };

      console.log('Submitting company data:', companyData);
      
      // Call the parent handler
      await onCompanyCreated(companyData);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error: any) {
      console.error('Error creating company:', error);
      
      let errorMessage = 'Impossible de créer l\'entreprise. Veuillez réessayer.';
      
      if (error?.response?.data?.details) {
        // Handle validation errors
        const validationErrors = error.response.data.details;
        errorMessage = validationErrors.map((err: any) => err.msg).join('\n');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoriePersonnes: '',
      sousCategorie: '',
      role: CompanyRole.MANAGER,
      managerEmail: '',
      isTvaAssujetti: false,
      regimeTva: '',
      prorataDdeduction: false
    });
    setDropdownOpen(null);
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setFormData(prev => ({
      ...prev,
      categoriePersonnes: category,
      sousCategorie: '' // Reset sous-categorie when category changes
    }));
  };

  const handleRoleChange = (roleLabel: string) => {
    console.log('Role changed to:', roleLabel);
    const role = roles.find(r => r.label === roleLabel)?.value || CompanyRole.MANAGER;
    setFormData(prev => ({ 
      ...prev, 
      role,
      // Email will be auto-filled by useEffect when role changes to Manager
      managerEmail: role === CompanyRole.MANAGER ? (user?.email || '') : prev.managerEmail
    }));
  };

  const handleRegimeTvaChange = (regime: string) => {
    console.log('Régime TVA changed to:', regime);
    setFormData(prev => ({ ...prev, regimeTva: regime }));
  };

  const handleSousCategorieChange = (sousCategorie: string) => {
    console.log('Sous-catégorie changed to:', sousCategorie);
    setFormData(prev => ({ ...prev, sousCategorie }));
  };

  const styles = createStyles(theme, isRTL);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer une entreprise</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Création en cours...</Text>
            </View>
          ) : (
            <>
              {/* Nom de l'entreprise */}
              <View style={styles.section}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom de l'entreprise *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Ex: SARL Mon Entreprise"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </View>

              {/* Catégorie de Personnes */}
              <View style={styles.section}>
                <ModalPicker
                  label="Catégorie de personnes *"
                  value={formData.categoriePersonnes}
                  options={categories}
                  onSelect={handleCategoryChange}
                  placeholder="Sélectionner une catégorie"
                  fieldName="categoriePersonnes"
                  isOpen={dropdownOpen === 'categoriePersonnes'}
                  onToggle={() => setDropdownOpen(dropdownOpen === 'categoriePersonnes' ? null : 'categoriePersonnes')}
                  onClose={() => setDropdownOpen(null)}
                />
              </View>

              {/* Sous-catégorie (forme juridique) */}
              {formData.categoriePersonnes && (
                <View style={styles.section}>
                  <ModalPicker
                    label="Sous-catégorie (forme juridique) *"
                    value={formData.sousCategorie}
                    options={sousCategories[formData.categoriePersonnes] || []}
                    onSelect={handleSousCategorieChange}
                    placeholder="Sélectionner une sous-catégorie"
                    fieldName="sousCategorie"
                    isOpen={dropdownOpen === 'sousCategorie'}
                    onToggle={() => setDropdownOpen(dropdownOpen === 'sousCategorie' ? null : 'sousCategorie')}
                    onClose={() => setDropdownOpen(null)}
                  />
                </View>
              )}

              {/* Rôle du créateur */}
              <View style={styles.section}>
                <ModalPicker
                  label="Rôle du créateur *"
                  value={roles.find(r => r.value === formData.role)?.label || ''}
                  options={roles.map(r => r.label)}
                  onSelect={handleRoleChange}
                  placeholder="Sélectionner un rôle"
                  fieldName="role"
                  isOpen={dropdownOpen === 'role'}
                  onToggle={() => setDropdownOpen(dropdownOpen === 'role' ? null : 'role')}
                  onClose={() => setDropdownOpen(null)}
                />

                {(formData.role === CompanyRole.AGENT || formData.role === CompanyRole.MANAGER) && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Email du Manager {formData.role === CompanyRole.AGENT ? '*' : '(Auto-rempli)'}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        formData.role === CompanyRole.MANAGER && styles.disabledInput
                      ]}
                      value={formData.managerEmail}
                      onChangeText={(text) => {
                        if (formData.role === CompanyRole.AGENT) {
                          setFormData(prev => ({ ...prev, managerEmail: text }));
                        }
                      }}
                      placeholder={formData.role === CompanyRole.MANAGER ? "Votre email (auto-rempli)" : "manager@entreprise.com"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      editable={formData.role === CompanyRole.AGENT}
                    />
                  </View>
                )}
              </View>

              {/* Assujetti à la TVA */}
              <View style={styles.section}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Assujetti à la TVA</Text>
                  <Switch
                    value={formData.isTvaAssujetti}
                    onValueChange={(value) => {
                      console.log('TVA switch changed to:', value);
                      setFormData(prev => ({ 
                        ...prev, 
                        isTvaAssujetti: value,
                        regimeTva: value ? prev.regimeTva : '',
                        prorataDdeduction: value ? prev.prorataDdeduction : false
                      }));
                    }}
                    trackColor={{ false: '#E2E8F0', true: theme.colors.primary }}
                    thumbColor={formData.isTvaAssujetti ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                {formData.isTvaAssujetti && (
                  <>
                    <ModalPicker
                      label="Régime de TVA *"
                      value={formData.regimeTva}
                      options={regimeTvaOptions}
                      onSelect={handleRegimeTvaChange}
                      placeholder="Sélectionner le régime"
                      fieldName="regimeTva"
                      isOpen={dropdownOpen === 'regimeTva'}
                      onToggle={() => setDropdownOpen(dropdownOpen === 'regimeTva' ? null : 'regimeTva')}
                      onClose={() => setDropdownOpen(null)}
                    />

                    <View style={styles.checkboxContainer}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => {
                          console.log('Prorata de déduction checkbox toggled');
                          setFormData(prev => ({ ...prev, prorataDdeduction: !prev.prorataDdeduction }));
                        }}
                      >
                        {formData.prorataDdeduction && (
                          <Check size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                      <Text style={styles.checkboxLabel}>Soumis au prorata de déduction</Text>
                    </View>
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {!loading && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateCompany}
            >
              <Text style={styles.createButtonText}>Créer l'entreprise</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surface,
  },
  disabledInput: {
    backgroundColor: theme.colors.surfaceVariant,
    color: theme.colors.onSurfaceVariant,
    borderColor: theme.colors.outlineVariant,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
});
