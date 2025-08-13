import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Building2, Users, Calendar, Check, ChevronDown } from 'lucide-react-native';
import { UserRole } from '@/types/auth';
import { useApp } from '@/contexts/AppContext';
import { FiscalCalendarService, FiscalCalendarItem } from '@/utils/fiscalCalendarService';

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
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showFiscalSelection, setShowFiscalSelection] = useState(false);
  const [showTvaSelection, setShowTvaSelection] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    industry: '',
    userRole: UserRole.MANAGER,
    managerEmail: '',
    selectedCategories: [] as string[],
    selectedSubCategories: [] as string[],
    isTvaAssujetti: false,
    selectedTvaItems: [] as string[]
  });

  const [fiscalCalendarData, setFiscalCalendarData] = useState<FiscalCalendarItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [tvaItems, setTvaItems] = useState<FiscalCalendarItem[]>([]);

  useEffect(() => {
    if (visible) {
      loadFiscalCalendarData();
    }
  }, [visible]);

  const loadFiscalCalendarData = async () => {
    setLoading(true);
    try {
      // Load fiscal calendar data from the service
      const calendarData = await FiscalCalendarService.getFiscalCalendar();
      setFiscalCalendarData(calendarData);
      
      // Extract unique categories and sub-categories
      const uniqueCategories = await FiscalCalendarService.getCategories();
      const tvaItems = calendarData.filter(item => item.is_tva_assujetti);
      
      setCategories(uniqueCategories);
      setTvaItems(tvaItems);
    } catch (error) {
      console.error('Error loading fiscal calendar data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données fiscales');
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async (category: string) => {
    try {
      const subCats = await FiscalCalendarService.getSubCategories(category);
      setSubCategories(subCats);
    } catch (error) {
      console.error('Error loading sub-categories:', error);
    }
  };

  const handleCreateCompany = () => {
    if (!formData.name || !formData.registrationNumber) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.userRole === UserRole.AGENT && !formData.managerEmail) {
      Alert.alert('Erreur', 'Veuillez saisir l\'email du manager');
      return;
    }

    if (formData.selectedCategories.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une catégorie');
      return;
    }

    const companyData = {
      name: formData.name,
      registrationNumber: formData.registrationNumber,
      industry: formData.industry,
      userRole: formData.userRole,
      managerEmail: formData.managerEmail,
      selectedCategories: formData.selectedCategories,
      selectedSubCategories: formData.selectedSubCategories,
      isTvaAssujetti: formData.isTvaAssujetti,
      selectedTvaItems: formData.selectedTvaItems
    };

    onCompanyCreated(companyData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      registrationNumber: '',
      industry: '',
      userRole: UserRole.MANAGER,
      managerEmail: '',
      selectedCategories: [],
      selectedSubCategories: [],
      isTvaAssujetti: false,
      selectedTvaItems: []
    });
    setShowRoleSelection(false);
    setShowFiscalSelection(false);
    setShowTvaSelection(false);
  };

  const toggleCategory = async (category: string) => {
    const newSelectedCategories = formData.selectedCategories.includes(category)
      ? formData.selectedCategories.filter(c => c !== category)
      : [...formData.selectedCategories, category];

    setFormData(prev => ({
      ...prev,
      selectedCategories: newSelectedCategories,
      selectedSubCategories: [] // Reset sub-categories when categories change
    }));

    // Load sub-categories for the newly selected category
    if (!formData.selectedCategories.includes(category)) {
      await loadSubCategories(category);
    }
  };

  const toggleSubCategory = (subCategory: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubCategories: prev.selectedSubCategories.includes(subCategory)
        ? prev.selectedSubCategories.filter(sc => sc !== subCategory)
        : [...prev.selectedSubCategories, subCategory]
    }));
  };

  const toggleTvaItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTvaItems: prev.selectedTvaItems.includes(itemId)
        ? prev.selectedTvaItems.filter(id => id !== itemId)
        : [...prev.selectedTvaItems, itemId]
    }));
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
              <Text style={styles.loadingText}>Chargement des données fiscales...</Text>
            </View>
          ) : (
            <>
              {/* Basic Company Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations de l'entreprise</Text>
                
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

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Identifiant fiscal *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.registrationNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, registrationNumber: text }))}
                    placeholder="Ex: 12345678"
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Secteur d'activité</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.industry}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, industry: text }))}
                    placeholder="Ex: Commerce, Services, Industrie..."
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rôle du créateur</Text>
                
                <TouchableOpacity 
                  style={styles.roleSelector}
                  onPress={() => setShowRoleSelection(!showRoleSelection)}
                >
                  <View style={styles.roleInfo}>
                    <Users size={20} color={theme.colors.primary} />
                    <Text style={styles.roleText}>
                      {formData.userRole === UserRole.MANAGER ? 'Manager' : 'Agent'}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {showRoleSelection && (
                  <View style={styles.roleOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.roleOption,
                        formData.userRole === UserRole.MANAGER && styles.selectedRoleOption
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, userRole: UserRole.MANAGER }));
                        setShowRoleSelection(false);
                      }}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        formData.userRole === UserRole.MANAGER && styles.selectedRoleOptionText
                      ]}>
                        Manager
                      </Text>
                      {formData.userRole === UserRole.MANAGER && (
                        <Check size={16} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.roleOption,
                        formData.userRole === UserRole.AGENT && styles.selectedRoleOption
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, userRole: UserRole.AGENT }));
                        setShowRoleSelection(false);
                      }}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        formData.userRole === UserRole.AGENT && styles.selectedRoleOptionText
                      ]}>
                        Agent
                      </Text>
                      {formData.userRole === UserRole.AGENT && (
                        <Check size={16} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {formData.userRole === UserRole.AGENT && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email du manager *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.managerEmail}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, managerEmail: text }))}
                      placeholder="manager@entreprise.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                    />
                  </View>
                )}
              </View>

              {/* Fiscal Calendar Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Calendrier fiscal</Text>
                
                <TouchableOpacity 
                  style={styles.fiscalSelector}
                  onPress={() => setShowFiscalSelection(!showFiscalSelection)}
                >
                  <View style={styles.fiscalInfo}>
                    <Calendar size={20} color={theme.colors.primary} />
                    <Text style={styles.fiscalText}>
                      {formData.selectedCategories.length > 0 
                        ? `${formData.selectedCategories.length} catégorie(s) sélectionnée(s)`
                        : 'Sélectionner les catégories'
                      }
                    </Text>
                  </View>
                  <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {showFiscalSelection && (
                  <View style={styles.fiscalOptions}>
                    <Text style={styles.fiscalSubtitle}>Catégories de personnes</Text>
                    {categories.map(category => (
                      <TouchableOpacity 
                        key={category}
                        style={[
                          styles.fiscalOption,
                          formData.selectedCategories.includes(category) && styles.selectedFiscalOption
                        ]}
                        onPress={() => toggleCategory(category)}
                      >
                        <Text style={[
                          styles.fiscalOptionText,
                          formData.selectedCategories.includes(category) && styles.selectedFiscalOptionText
                        ]}>
                          {category}
                        </Text>
                        {formData.selectedCategories.includes(category) && (
                          <Check size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}

                    {formData.selectedCategories.length > 0 && subCategories.length > 0 && (
                      <>
                        <Text style={styles.fiscalSubtitle}>Sous-catégories</Text>
                        {subCategories.map(subCategory => (
                          <TouchableOpacity 
                            key={subCategory}
                            style={[
                              styles.fiscalOption,
                              formData.selectedSubCategories.includes(subCategory) && styles.selectedFiscalOption
                            ]}
                            onPress={() => toggleSubCategory(subCategory)}
                          >
                            <Text style={[
                              styles.fiscalOptionText,
                              formData.selectedSubCategories.includes(subCategory) && styles.selectedFiscalOptionText
                            ]}>
                              {subCategory}
                            </Text>
                            {formData.selectedSubCategories.includes(subCategory) && (
                              <Check size={16} color={theme.colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                )}

                {/* TVA Assujetti Selection */}
                <TouchableOpacity 
                  style={styles.tvaSelector}
                  onPress={() => setShowTvaSelection(!showTvaSelection)}
                >
                  <View style={styles.tvaInfo}>
                    <Building2 size={20} color={theme.colors.primary} />
                    <Text style={styles.tvaText}>
                      {formData.isTvaAssujetti ? 'Assujetti TVA' : 'Non assujetti TVA'}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>

                {showTvaSelection && (
                  <View style={styles.tvaOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.tvaOption,
                        !formData.isTvaAssujetti && styles.selectedTvaOption
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          isTvaAssujetti: false,
                          selectedTvaItems: []
                        }));
                        setShowTvaSelection(false);
                      }}
                    >
                      <Text style={[
                        styles.tvaOptionText,
                        !formData.isTvaAssujetti && styles.selectedTvaOptionText
                      ]}>
                        Non assujetti TVA
                      </Text>
                      {!formData.isTvaAssujetti && (
                        <Check size={16} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.tvaOption,
                        formData.isTvaAssujetti && styles.selectedTvaOption
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, isTvaAssujetti: true }));
                        setShowTvaSelection(false);
                      }}
                    >
                      <Text style={[
                        styles.tvaOptionText,
                        formData.isTvaAssujetti && styles.selectedTvaOptionText
                      ]}>
                        Assujetti TVA
                      </Text>
                      {formData.isTvaAssujetti && (
                        <Check size={16} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>

                    {formData.isTvaAssujetti && tvaItems.length > 0 && (
                      <View style={styles.tvaItemsContainer}>
                        <Text style={styles.tvaItemsTitle}>Obligations TVA disponibles</Text>
                        {tvaItems.map(item => (
                          <TouchableOpacity 
                            key={item.id}
                            style={[
                              styles.tvaItem,
                              formData.selectedTvaItems.includes(item.id) && styles.selectedTvaItem
                            ]}
                            onPress={() => toggleTvaItem(item.id)}
                          >
                            <Text style={[
                              styles.tvaItemText,
                              formData.selectedTvaItems.includes(item.id) && styles.selectedTvaItemText
                            ]}>
                              {item.type_impot} - {item.periode_declaration} ({item.mois})
                            </Text>
                            {formData.selectedTvaItems.includes(item.id) && (
                              <Check size={16} color={theme.colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
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
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    fontFamily: 'Inter_400Regular',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  roleOptions: {
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  selectedRoleOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  roleOptionText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  selectedRoleOptionText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  fiscalSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    marginBottom: 12,
  },
  fiscalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fiscalText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  fiscalOptions: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fiscalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  fiscalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  selectedFiscalOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  fiscalOptionText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  selectedFiscalOptionText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  tvaSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  tvaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tvaText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  tvaOptions: {
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  tvaOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  selectedTvaOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  tvaOptionText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  selectedTvaOptionText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  tvaItemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tvaItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  tvaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedTvaItem: {
    backgroundColor: theme.colors.primaryContainer,
  },
  tvaItemText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  selectedTvaItemText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter_600SemiBold',
  },
  createButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
});
