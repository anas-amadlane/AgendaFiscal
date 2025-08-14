import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Calendar, Plus, Edit, Trash2, Search, Filter, Save, X, Upload, Download } from 'lucide-react-native';
import * as XLSX from 'xlsx';

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

interface ExcelImportData {
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
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

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
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

             const response = await fetch('http://localhost:3001/api/v1/fiscal/calendar', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Convert database format to frontend format
        const items: FiscalCalendarItem[] = result.data.map((item: any) => ({
          id: item.id,
          liste: item.liste,
          categorie_personnes: item.categorie_personnes,
          sous_categorie: item.sous_categorie,
          mois: item.mois,
          type_impot: item.type_impot,
          date_echeance: item.date_echeance,
          periode_declaration: item.periode_declaration,
          type_declaration: item.type_declaration,
          formulaire: item.formulaire,
          lien: item.lien,
          commentaire: item.commentaire,
          is_tva_assujetti: item.is_tva_assujetti,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at)
        }));

        setCalendarItems(items);
      } else {
        throw new Error(result.error || 'Failed to load calendar data');
      }
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
       // Get auth token
       const token = localStorage.getItem('authToken');
       if (!token) {
         throw new Error('No authentication token found');
       }

       const url = modalType === 'edit' 
         ? `http://localhost:3001/api/v1/fiscal/admin/calendar/${selectedItem?.id}`
         : 'http://localhost:3001/api/v1/fiscal/admin/calendar';

       const response = await fetch(url, {
         method: modalType === 'edit' ? 'PUT' : 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(formData)
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
       }

       const result = await response.json();
       
       if (result.success) {
         // Reload the calendar data to get the updated list
         await loadCalendarData();
         
         Alert.alert('Success', result.message || `Calendar item ${modalType === 'edit' ? 'updated' : 'created'} successfully`);
         closeModal();
       } else {
         throw new Error(result.error || 'Operation failed');
       }
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
               // Get auth token
               const token = localStorage.getItem('authToken');
               if (!token) {
                 throw new Error('No authentication token found');
               }

               const response = await fetch(`http://localhost:3001/api/v1/fiscal/admin/calendar/${item.id}`, {
                 method: 'DELETE',
                 headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
                 }
               });

               if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
               }

               const result = await response.json();
               
               if (result.success) {
                 // Reload the calendar data to get the updated list
                 await loadCalendarData();
                 
                 Alert.alert('Success', result.message || 'Calendar item deleted successfully');
               } else {
                 throw new Error(result.error || 'Delete failed');
               }
            } catch (error) {
              console.error('Error deleting calendar item:', error);
              Alert.alert('Error', 'Failed to delete calendar item');
            }
          }
        }
      ]
    );
  };

  const handleImportExcel = () => {
    setImportModalVisible(true);
  };

  const processExcelData = (data: any[]): ExcelImportData[] => {
    console.log('Processing Excel data, input length:', data.length);
    console.log('Sample input row:', data[0]);
    
    const processed = data.map((row, index) => {
      // Convert Excel date number to string if needed
      let dateEcheance = row['Date d\'échéance'] || row['date_echeance'] || '';
      
      // Debug: Log the original date value for first few rows
      if (index < 5) {
        console.log(`Row ${index} original date:`, dateEcheance, 'Type:', typeof dateEcheance);
      }
      
      // Handle different date formats
      if (typeof dateEcheance === 'number') {
        // Convert Excel date number to readable format
        const excelDate = new Date((dateEcheance - 25569) * 86400 * 1000);
        dateEcheance = excelDate.toLocaleDateString('fr-FR');
        if (index < 5) {
          console.log(`Row ${index} converted date:`, dateEcheance);
        }
      } else if (typeof dateEcheance === 'string' && dateEcheance.trim() === '') {
        // If empty string, try to use a default date or skip this row
        dateEcheance = '31/12/2024'; // Default date for empty fields
        if (index < 5) {
          console.log(`Row ${index} using default date:`, dateEcheance);
        }
      }
      
      const processedRow = {
        liste: String(row['Liste'] || row['liste'] || (index + 1)),
        categorie_personnes: String(row['Catégorie de Personnes'] || row['categorie_personnes'] || ''),
        sous_categorie: String(row['Sous-Catégorie'] || row['sous_categorie'] || ''),
        mois: String(row['Mois'] || row['mois'] || ''),
        type_impot: String(row['Type d\'Impôt'] || row['type_impot'] || ''),
        date_echeance: String(dateEcheance),
        periode_declaration: String(row['Période déclaration'] || row['periode_declaration'] || ''),
        type_declaration: String(row['Type de déclaration'] || row['type_declaration'] || ''),
        formulaire: String(row['Formulaire'] || row['formulaire'] || ''),
        lien: String(row['Lien'] || row['lien'] || ''),
        commentaire: String(row['Commentaire'] || row['commentaire'] || '')
      };
      
      if (index < 3) {
        console.log(`Row ${index} processed:`, processedRow);
      }
      
      return processedRow;
    });
    
    console.log('Processed data length:', processed.length);
    return processed;
  };

  const importExcelData = async (fileData: any[]) => {
    try {
      console.log('importExcelData called with:', fileData.length, 'items');
      setImporting(true);
      
      // Process the Excel data
      const processedData = processExcelData(fileData);
      console.log('Processed data:', processedData.length, 'items');
      
                    // Validate required fields
        const validData = processedData.filter(item => {
          const isValid = item.liste && item.categorie_personnes && item.type_impot && item.date_echeance;
          if (!isValid) {
            console.log('Invalid item:', {
              liste: item.liste,
              categorie_personnes: item.categorie_personnes,
              type_impot: item.type_impot,
              date_echeance: item.date_echeance,
              hasListe: !!item.liste,
              hasCategorie: !!item.categorie_personnes,
              hasTypeImpot: !!item.type_impot,
              hasDateEcheance: !!item.date_echeance
            });
          }
          return isValid;
        });
        console.log('Valid data:', validData.length, 'items');

      if (validData.length === 0) {
        Alert.alert('Error', 'No valid data found in the Excel file. Please check the format.');
        return;
      }

      // Convert to FiscalCalendarItem format
      const newItems: FiscalCalendarItem[] = validData.map((item, index) => ({
        id: Date.now().toString() + index,
        ...item,
        is_tva_assujetti: item.type_impot.toLowerCase().includes('tva'),
        created_at: new Date(),
        updated_at: new Date()
      }));
      console.log('New items created:', newItems.length);

             // Get auth token
       const token = localStorage.getItem('authToken');
       if (!token) {
         throw new Error('No authentication token found');
       }

       // Call the real API
       const response = await fetch('http://localhost:3001/api/v1/fiscal/admin/calendar/import', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ items: newItems })
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
       }

       const result = await response.json();
       
       if (result.success) {
         console.log('Import result:', result.data);
         
         // Reload the calendar data to get the updated list
         await loadCalendarData();
         
                  Alert.alert(
           'Import Successful', 
           result.message || `Successfully imported ${result.data.imported} calendar items.`
         );
       } else {
         throw new Error(result.error || 'Import failed');
       }
       
       setImportModalVisible(false);
    } catch (error) {
      console.error('Error importing Excel data:', error);
      Alert.alert('Error', 'Failed to import Excel data. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickAndImportExcel = async () => {
    try {
      setImporting(true);
      console.log('Starting Excel import process...');
      
      // Create a file input element for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv';
      
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          console.log('No file selected');
          setImporting(false);
          return;
        }

        try {
          console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);

          // Read the file
          const arrayBuffer = await file.arrayBuffer();
          console.log('File read successfully, buffer size:', arrayBuffer.byteLength);
          
          // Parse Excel file
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          console.log('Workbook parsed, sheets:', workbook.SheetNames);
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          console.log('Using sheet:', sheetName);
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log('JSON data length:', jsonData.length);
          console.log('First few rows:', jsonData.slice(0, 3));
          
          if (jsonData.length < 2) {
            Alert.alert('Error', 'Excel file is empty or has no data rows');
            setImporting(false);
            return;
          }

          // Get headers from first row
          const headers = jsonData[0] as string[];
          console.log('Headers found:', headers);

          // Convert data rows to objects
          const dataRows = jsonData.slice(1) as any[][];
          console.log('Data rows count:', dataRows.length);
          
          const processedData = dataRows.map((row, index) => {
            const rowData: any = {};
            headers.forEach((header, colIndex) => {
              if (header && row[colIndex] !== undefined) {
                rowData[header] = row[colIndex];
              }
            });
            return rowData;
          });

          console.log('Processed data count:', processedData.length);
          console.log('First processed row:', processedData[0]);
          console.log('Last processed row:', processedData[processedData.length - 1]);

          // Import the processed data
          console.log('Calling importExcelData with', processedData.length, 'items');
          await importExcelData(processedData);
          
        } catch (error) {
          console.error('Error processing Excel file:', error);
          Alert.alert('Error', `Failed to process Excel file: ${error.message}`);
        } finally {
          setImporting(false);
        }
      };

      // Trigger file selection
      input.click();
      
    } catch (error) {
      console.error('Error picking Excel file:', error);
      Alert.alert('Error', 'Failed to pick Excel file. Please try again.');
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Create template data based on the structure you showed
      const templateData = [
        {
          'Liste': '1',
          'Catégorie de Personnes': 'Personne Morale',
          'Sous-Catégorie': '',
          'Mois': 'Janvier',
          'Type d\'Impôt': 'Taxe sur la Valeur Ajoutée',
          'Date d\'échéance': '31-janv.',
          'Période déclaration': 'Décembre',
          'Type de déclaration': 'TVA Déclaration du Chiffre d\'Affaires',
          'Formulaire': 'ADC080B-25I',
          'Lien': 'https://www.tax.gov.ma/wps/wcm/connect/2aabc75b-959e-4753-a152-3441104acaf7/adc_080b_25i.pdf?MOD=AJPERES',
          'Commentaire': 'Télédéclaration mensuelle et télépaiement de la TVA pour le mois précédent doivent être effectués avant l\'expiration du mois suivant pour les redevables assujettis selon le régime de la déclaration mensuelle (Articles 110, 111, 112 et 115 du CGI imprimés ADC080B-25I, ADC082B-24I, ADC081B-24I).'
        },
        {
          'Liste': '14',
          'Catégorie de Personnes': 'Personne Physique',
          'Sous-Catégorie': 'Auto-entrepreneur',
          'Mois': 'Janvier',
          'Type d\'Impôt': 'Impôt sur le revenu (IR)',
          'Date d\'échéance': '31-janv.',
          'Période déclaration': '4ème Trimestre',
          'Type de déclaration': 'Versement IR sur Chiffre d\'Affaires',
          'Formulaire': '',
          'Lien': '',
          'Commentaire': 'Versement de l\'impôt dû titre du trimestre précédent prévu par l\'article 82 bis du CGI par les personnes physiques exerçant leurs activités à titre individuel dans le cadre de l\'auto-entrepreneur au taux de : - 0,5% du chiffre d\'affaires encaissé et dont le montant ne dépasse pas 500 000 DH pour les activités commerciales, industrielles et artisanales ; - 1% du chiffre d\'affaires encaissé et dont le montant ne dépasse pas 200 000 DH pour les prestataires de services'
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Fiscal Calendar Template');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Convert to base64 for download
      const base64 = btoa(String.fromCharCode(...new Uint8Array(excelBuffer)));

      // Create download link
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = 'fiscal_calendar_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Alert.alert('Success', 'Template downloaded successfully!');
    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert('Error', 'Failed to download template. Please try again.');
    }
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
        <Text style={styles.title}>Fiscal Calendar Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={downloadTemplate}
          >
            <Download size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleImportExcel}
          >
            <Upload size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openModal('create')}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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

      {/* Import Excel Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Excel Calendar</Text>
              <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.importDescription}>
              Import fiscal calendar data from an Excel file. The file should contain the following columns:
            </Text>

            <ScrollView style={styles.importColumnsList}>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text style={styles.requiredField}>Liste</Text>
                <Text> (Required)</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text style={styles.requiredField}>Catégorie de Personnes</Text>
                <Text> (Required)</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Sous-Catégorie</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Mois</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text style={styles.requiredField}>Type d'Impôt</Text>
                <Text> (Required)</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text style={styles.requiredField}>Date d'échéance</Text>
                <Text> (Required)</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Période déclaration</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Type de déclaration</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Formulaire</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Lien</Text>
              </Text>
              <Text style={styles.importColumn}>
                <Text>• </Text>
                <Text>Commentaire</Text>
              </Text>
            </ScrollView>

            <View style={styles.importActions}>
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={downloadTemplate}
              >
                <Download size={16} color="#3B82F6" />
                <Text style={styles.templateButtonText}>Download Template</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.importButton, importing && styles.importButtonDisabled]}
                onPress={pickAndImportExcel}
                disabled={importing}
              >
                <Upload size={16} color="#FFFFFF" />
                <Text style={styles.importButtonText}>
                  {importing ? 'Importing...' : 'Import Excel File'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Test Import Button for Quick Testing */}
            <TouchableOpacity 
              style={[styles.testButton]}
              onPress={() => {
                 console.log('Test Import button clicked!');
                 Alert.alert('Test', 'Test Import button clicked!');
                 const testData = [
                   {
                     'Liste': '1',
                     'Catégorie de Personnes': 'Personne Morale',
                     'Sous-Catégorie': '',
                     'Mois': 'Janvier',
                     'Type d\'Impôt': 'Taxe sur la Valeur Ajoutée',
                     'Date d\'échéance': '31-janv.',
                     'Période déclaration': 'Décembre',
                     'Type de déclaration': 'TVA Déclaration du Chiffre d\'Affaires',
                     'Formulaire': 'ADC080B-25I',
                     'Lien': 'https://www.tax.gov.ma/wps/wcm/connect/2aabc75b-959e-4753-a152-3441104acaf7/adc_080b_25i.pdf?MOD=AJPERES',
                     'Commentaire': 'Télédéclaration mensuelle et télépaiement de la TVA pour le mois précédent doivent être effectués avant l\'expiration du mois suivant pour les redevables assujettis selon le régime de la déclaration mensuelle (Articles 110, 111, 112 et 115 du CGI imprimés ADC080B-25I, ADC082B-24I, ADC081B-24I).'
                   },
                   {
                     'Liste': '14',
                     'Catégorie de Personnes': 'Personne Physique',
                     'Sous-Catégorie': 'Auto-entrepreneur',
                     'Mois': 'Janvier',
                     'Type d\'Impôt': 'Impôt sur le revenu (IR)',
                     'Date d\'échéance': '31-janv.',
                     'Période déclaration': '4ème Trimestre',
                     'Type de déclaration': 'Versement IR sur Chiffre d\'Affaires',
                     'Formulaire': '',
                     'Lien': '',
                     'Commentaire': 'Versement de l\'impôt dû titre du trimestre précédent prévu par l\'article 82 bis du CGI par les personnes physiques exerçant leurs activités à titre individuel dans le cadre de l\'auto-entrepreneur au taux de : - 0,5% du chiffre d\'affaires encaissé et dont le montant ne dépasse pas 500 000 DH pour les activités commerciales, industrielles et artisanales ; - 1% du chiffre d\'affaires encaissé et dont le montant ne dépasse pas 200 000 DH pour les prestataires de services'
                   }
                 ];
                 console.log('Test data:', testData);
                 importExcelData(testData);
               }}
             >
               <Text style={styles.testButtonText}>Test Import (Mock Data)</Text>
             </TouchableOpacity>
          </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'left',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  importDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  importColumnsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  importColumn: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  requiredField: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  importActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    flex: 1,
  },
  importButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  importButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  testButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
