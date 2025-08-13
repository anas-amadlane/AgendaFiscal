import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Calendar, Plus, Edit, Trash2, Search, Filter, Save, X } from 'lucide-react-native';

interface FiscalCalendarItem {
  id: string;
  liste: string;
  categorie_personnes: string;
  sous_categorie?: string;
  mois?: string;
  type_impot: string;
  date_echeance: string;
  periode_declaration?: string;
  type_declaration?: string;
  formulaire?: string;
  lien?: string;
  commentaire?: string;
  is_tva_assujetti: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Category {
  id: string;
  name: string;
  subCategories: string[];
}

export default function AdminCalendar() {
  const { user } = useAuth();
  const [calendarItems, setCalendarItems] = useState<FiscalCalendarItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FiscalCalendarItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FiscalCalendarItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [loading, setLoading] = useState(true);

  // Categories and options
  const [categories] = useState<Category[]>([
    {
      id: '1',
      name: 'Entreprises',
      subCategories: ['SARL', 'SA', 'SNC', 'EI', 'Auto-entrepreneur']
    },
    {
      id: '2',
      name: 'Professions Libérales',
      subCategories: ['Médecin', 'Avocat', 'Architecte', 'Expert-comptable']
    },
    {
      id: '3',
      name: 'Commerçants',
      subCategories: ['Détail', 'Gros', 'Import/Export']
    }
  ]);

  const [tvaOptions] = useState([
    'Assujetti TVA',
    'Non assujetti TVA',
    'Exonéré TVA',
    'TVA sur encaissements'
  ]);

  // Form state
  const [formData, setFormData] = useState({
    liste: '',
    categorie_personnes: '',
    sous_categorie: '',
    mois: '',
    type_impot: '',
    date_echeance: '',
    periode_declaration: '',
    type_declaration: '',
    formulaire: '',
    lien: '',
    commentaire: '',
    is_tva_assujetti: false,
    tva_option: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    loadCalendarData();
  }, [user]);

  // Filter items based on search query
  useEffect(() => {
    const filtered = calendarItems.filter(item => 
      item.liste.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categorie_personnes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type_impot.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, calendarItems]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/admin/fiscal-calendar');
      
      // Mock data
      const mockItems: FiscalCalendarItem[] = [
        {
          id: '1',
          liste: 'Déclaration TVA',
          categorie_personnes: 'Entreprises',
          sous_categorie: 'SARL',
          mois: 'Mensuel',
          type_impot: 'TVA',
          date_echeance: '2024-02-20',
          periode_declaration: 'Janvier 2024',
          type_declaration: 'CA3',
          formulaire: 'CA3',
          lien: 'https://www.impots.gouv.ma',
          commentaire: 'Déclaration mensuelle TVA',
          is_tva_assujetti: true,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: '2',
          liste: 'Déclaration IS',
          categorie_personnes: 'Entreprises',
          sous_categorie: 'SA',
          mois: 'Trimestriel',
          type_impot: 'Impôt sur les Sociétés',
          date_echeance: '2024-03-31',
          periode_declaration: 'Q1 2024',
          type_declaration: 'IS',
          formulaire: 'IS',
          lien: 'https://www.impots.gouv.ma',
          commentaire: 'Déclaration trimestrielle IS',
          is_tva_assujetti: false,
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-10')
        }
      ];

      setCalendarItems(mockItems);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'create' | 'edit', item?: FiscalCalendarItem) => {
    setModalType(type);
    setModalVisible(true);

    if (type === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        liste: item.liste,
        categorie_personnes: item.categorie_personnes,
        sous_categorie: item.sous_categorie || '',
        mois: item.mois || '',
        type_impot: item.type_impot,
        date_echeance: item.date_echeance,
        periode_declaration: item.periode_declaration || '',
        type_declaration: item.type_declaration || '',
        formulaire: item.formulaire || '',
        lien: item.lien || '',
        commentaire: item.commentaire || '',
        is_tva_assujetti: item.is_tva_assujetti,
        tva_option: ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        liste: '',
        categorie_personnes: '',
        sous_categorie: '',
        mois: '',
        type_impot: '',
        date_echeance: '',
        periode_declaration: '',
        type_declaration: '',
        formulaire: '',
        lien: '',
        commentaire: '',
        is_tva_assujetti: false,
        tva_option: ''
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleSave = async () => {
    if (!formData.liste || !formData.categorie_personnes || !formData.type_impot || !formData.date_echeance) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        ...formData,
        id: modalType === 'edit' ? selectedItem?.id : undefined
      };

      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/admin/fiscal-calendar', {
      //   method: modalType === 'edit' ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(itemData)
      // });

      if (modalType === 'edit' && selectedItem) {
        // Update local state
        setCalendarItems(calendarItems.map(item => 
          item.id === selectedItem.id 
            ? { ...item, ...formData, updated_at: new Date() }
            : item
        ));
      } else {
        // Add new item
        const newItem: FiscalCalendarItem = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date(),
          updated_at: new Date()
        };
        setCalendarItems([...calendarItems, newItem]);
      }

      Alert.alert('Success', `Calendar item ${modalType === 'edit' ? 'updated' : 'created'} successfully`);
      closeModal();
    } catch (error) {
      console.error('Error saving calendar item:', error);
      Alert.alert('Error', `Failed to ${modalType} calendar item`);
    }
  };

  const handleDelete = async (item: FiscalCalendarItem) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${item.liste}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await fetch(`/api/v1/admin/fiscal-calendar/${item.id}`, {
              //   method: 'DELETE'
              // });

              // Update local state
              setCalendarItems(calendarItems.filter(i => i.id !== item.id));

              Alert.alert('Success', 'Calendar item deleted successfully');
            } catch (error) {
              console.error('Error deleting calendar item:', error);
              Alert.alert('Error', 'Failed to delete calendar item');
            }
          }
        }
      ]
    );
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.name === formData.categorie_personnes);
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fiscal Calendar Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => openModal('create')}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search calendar items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Calendar Items List */}
      <ScrollView style={styles.itemsList}>
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.liste}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openModal('edit', item)}
                >
                  <Edit size={16} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{item.categorie_personnes}</Text>
              </View>
              {item.sous_categorie && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sub-category:</Text>
                  <Text style={styles.detailValue}>{item.sous_categorie}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tax Type:</Text>
                <Text style={styles.detailValue}>{item.type_impot}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>{item.date_echeance}</Text>
              </View>
              {item.is_tva_assujetti && (
                <View style={styles.tvaBadge}>
                  <Text style={styles.tvaText}>TVA Subject</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'create' ? 'Create Calendar Item' : 'Edit Calendar Item'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Required Fields */}
            <Text style={styles.sectionTitle}>Required Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Liste *"
              value={formData.liste}
              onChangeText={(text) => setFormData({...formData, liste: text})}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.categorie_personnes === category.name && styles.categoryOptionSelected
                    ]}
                    onPress={() => setFormData({...formData, categorie_personnes: category.name, sous_categorie: ''})}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      formData.categorie_personnes === category.name && styles.categoryOptionTextSelected
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {getSelectedCategory() && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Sub-category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                  {getSelectedCategory()!.subCategories.map((subCat) => (
                    <TouchableOpacity
                      key={subCat}
                      style={[
                        styles.categoryOption,
                        formData.sous_categorie === subCat && styles.categoryOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, sous_categorie: subCat})}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.sous_categorie === subCat && styles.categoryOptionTextSelected
                      ]}>
                        {subCat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Type d'impôt *"
              value={formData.type_impot}
              onChangeText={(text) => setFormData({...formData, type_impot: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Date d'échéance * (YYYY-MM-DD)"
              value={formData.date_echeance}
              onChangeText={(text) => setFormData({...formData, date_echeance: text})}
            />

            {/* Optional Fields */}
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Mois"
              value={formData.mois}
              onChangeText={(text) => setFormData({...formData, mois: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Période de déclaration"
              value={formData.periode_declaration}
              onChangeText={(text) => setFormData({...formData, periode_declaration: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Type de déclaration"
              value={formData.type_declaration}
              onChangeText={(text) => setFormData({...formData, type_declaration: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Formulaire"
              value={formData.formulaire}
              onChangeText={(text) => setFormData({...formData, formulaire: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Lien"
              value={formData.lien}
              onChangeText={(text) => setFormData({...formData, lien: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Commentaire"
              value={formData.commentaire}
              onChangeText={(text) => setFormData({...formData, commentaire: text})}
              multiline
              numberOfLines={3}
            />

            {/* TVA Section */}
            <Text style={styles.sectionTitle}>TVA Configuration</Text>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Subject to TVA</Text>
              <Switch
                value={formData.is_tva_assujetti}
                onValueChange={(value) => setFormData({...formData, is_tva_assujetti: value})}
                trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                thumbColor={formData.is_tva_assujetti ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            {formData.is_tva_assujetti && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>TVA Option</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                  {tvaOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.categoryOption,
                        formData.tva_option === option && styles.categoryOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, tva_option: option})}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.tva_option === option && styles.categoryOptionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save size={16} color="#FFFFFF" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    padding: 4,
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  tvaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  tvaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '95%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  saveIcon: {
    marginRight: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
