import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Calendar, Plus, Edit, Trash2, Search, Filter, Save, X, Upload, Download } from 'lucide-react-native';
import * as XLSX from 'xlsx';
import ModalPicker from '@/components/ModalPicker';
import apiProxy from '@/utils/apiProxy';

interface FiscalCalendarItem {
  id: string;
  categorie_personnes: string;
  sous_categorie?: string;
  type: string;
  tag: string;
  frequence_declaration: string;
  periode_declaration?: string;
  mois?: string;
  jours?: string;
  detail_declaration?: string;
  formulaire?: string;
  lien?: string;
  commentaire?: string;
  created_at: Date;
  updated_at: Date;
}

interface ExcelImportData {
  categorie_personnes: string;
  sous_categorie?: string;
  type: string;
  tag: string;
  frequence_declaration: string;
  periode_declaration?: string;
  mois?: string;
  jours?: string;
  detail_declaration?: string;
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
  
  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Categories and options
  const [categories] = useState([
    'Personne Morale',
    'Personne Physique'
  ]);

  const [types] = useState([
    'Taxe sur la Valeur Ajoutée',
    'Impôt sur le revenu',
    'Impôt sur le revenu / Impôt sur les Sociétés',
    'Taxe spéciale annuelle sur les véhicules',
    'Droits de Timbre',
    'Taxe Professionnelle',
    'Impôt sur les sociétés',
    'Contribution Sociale de Solidarité',
    'Caisse Nationale de Sécurité Sociale',
    'Délais de Paiement'
  ]);

  const [tags] = useState([
    'TVA',
    'IR',
    'IR / IS',
    'TSAV',
    'DT',
    'TP',
    'IS',
    'CSS',
    'CNSS',
    'DP'
  ]);

  const [frequences] = useState([
    'Mensuel',
    'Trimestriel',
    'Annuel'
  ]);

  const [periodes] = useState([
    'Décembre',
    '4e Trimestre',
    'L\'Année Précédente',
    'Janvier',
    'Février',
    '1e Trimestre',
    'Mars',
    'Avril',
    'Mai',
    '2e Trimestre',
    '2e Acompte N-1',
    'Juin',
    'Juillet',
    'Août',
    '3e Trimestre',
    '3e Acompte N-1',
    'Septembre',
    'Octobre',
    'Novembre',
    '4e Acompte N-1',
    '1e Acompte N-1'
  ]);

  const [mois] = useState([
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]);

  const [jours] = useState(Array.from({length: 31}, (_, i) => (i + 1).toString()));

  // Form state
  const [formData, setFormData] = useState({
    categorie_personnes: '',
    sous_categorie: '',
    type: '',
    tag: '',
    frequence_declaration: '',
    periode_declaration: '',
    mois: '',
    jours: '',
    detail_declaration: '',
    formulaire: '',
    lien: '',
    commentaire: ''
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
       (item.categorie_personnes?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
       (item.type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
       (item.tag?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
       (item.periode_declaration?.toLowerCase() || '').includes(searchQuery.toLowerCase())
     );
     setFilteredItems(filtered);
   }, [searchQuery, calendarItems]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      const result = await apiProxy.getAdminCalendar();
      
      if (result.success) {
        // Convert database format to frontend format
        const items: FiscalCalendarItem[] = result.data.map((item: any) => ({
          id: item.id || '',
          categorie_personnes: item.categorie_personnes || '',
          sous_categorie: item.sous_categorie || '',
          type: item.type || '',
          tag: item.tag || '',
          frequence_declaration: item.frequence_declaration || '',
          periode_declaration: item.periode_declaration || '',
          mois: item.mois || '',
          jours: item.jours || '',
          detail_declaration: item.detail_declaration || '',
          formulaire: item.formulaire || '',
          lien: item.lien || '',
          commentaire: item.commentaire || '',
          created_at: new Date(item.created_at || Date.now()),
          updated_at: new Date(item.updated_at || Date.now())
        }));

        setCalendarItems(items);
      } else {
        throw new Error(result.error || 'Failed to load calendar data');
      }
    } catch (error: unknown) {
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
        categorie_personnes: item.categorie_personnes,
        sous_categorie: item.sous_categorie || '',
        type: item.type || '',
        tag: item.tag || '',
        frequence_declaration: item.frequence_declaration || '',
        periode_declaration: item.periode_declaration || '',
        mois: item.mois || '',
        jours: item.jours || '',
        detail_declaration: item.detail_declaration || '',
        formulaire: item.formulaire || '',
        lien: item.lien || '',
        commentaire: item.commentaire || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        categorie_personnes: '',
        sous_categorie: '',
        type: '',
        tag: '',
        frequence_declaration: '',
        periode_declaration: '',
        mois: '',
        jours: '',
        detail_declaration: '',
        formulaire: '',
        lien: '',
        commentaire: ''
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleSave = async () => {
    if (!formData.categorie_personnes || !formData.type || !formData.tag || !formData.frequence_declaration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

         try {
       let result;
       
       if (modalType === 'edit') {
         result = await apiProxy.updateAdminCalendarEntry(selectedItem?.id, formData);
       } else {
         result = await apiProxy.createAdminCalendarEntry(formData);
       }
       
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
      `Are you sure you want to delete "${item.type}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
                     onPress: async () => {
             try {
               const result = await apiProxy.deleteAdminCalendarEntry(item.id);
               
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
    console.log('Available columns:', Object.keys(data[0] || {}));
    
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
      
      // Get the raw values first
      const rawCategorie = row['Catégorie de Personnes'] || row['categorie_personnes'] || row['Catégorie'] || '';
      const rawType = row['Type'] || row['type'] || '';
      const rawTag = row['Tag'] || row['tag'] || '';
      const rawFrequence = row['Fréquence de déclaration'] || row['frequence_declaration'] || row['Fréquence'] || row['frequence'] || '';
      
      // Provide default values for missing required fields
      let frequence_declaration = String(rawFrequence);
      if (!frequence_declaration || frequence_declaration.trim() === '') {
        // Try to infer frequency from type or provide default
        if (rawType.includes('TVA')) {
          frequence_declaration = 'Mensuel';
        } else if (rawType.includes('IR') || rawType.includes('Impôt')) {
          frequence_declaration = 'Trimestriel';
        } else {
          frequence_declaration = 'Annuel'; // Default fallback
        }
        console.log(`Row ${index}: Inferred frequency "${frequence_declaration}" for type "${rawType}"`);
      }
      
      const processedRow = {
        categorie_personnes: String(rawCategorie),
        sous_categorie: String(row['Sous-Catégorie'] || row['sous_categorie'] || ''),
        type: String(rawType),
        tag: String(rawTag),
        frequence_declaration: frequence_declaration,
        periode_declaration: String(row['Période déclaration'] || row['periode_declaration'] || ''),
        mois: String(row['Mois'] || row['mois'] || ''),
        jours: String(row['Jours'] || row['jours'] || ''),
        detail_declaration: String(row['Detail déclaration'] || row['detail_declaration'] || ''),
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
      
                             // Validate required fields with better error reporting
         const validData = processedData.filter(item => {
           const missingFields = [];
           
           if (!item.categorie_personnes || item.categorie_personnes.trim() === '') {
             missingFields.push('Catégorie de Personnes');
           }
           if (!item.type || item.type.trim() === '') {
             missingFields.push('Type');
           }
           if (!item.tag || item.tag.trim() === '') {
             missingFields.push('Tag');
           }
           if (!item.frequence_declaration || item.frequence_declaration.trim() === '') {
             missingFields.push('Fréquence de déclaration');
           }
           
           const isValid = missingFields.length === 0;
           if (!isValid) {
             console.log('Invalid item:', {
               categorie_personnes: item.categorie_personnes,
               type: item.type,
               tag: item.tag,
               frequence_declaration: item.frequence_declaration,
               missingFields: missingFields
             });
           }
           return isValid;
         });
        console.log('Valid data:', validData.length, 'items');

      if (validData.length === 0) {
        const totalItems = processedData.length;
        const invalidItems = processedData.length - validData.length;
        Alert.alert(
          'Import Failed', 
          `No valid data found in the Excel file.\n\nTotal items: ${totalItems}\nValid items: ${validData.length}\nInvalid items: ${invalidItems}\n\nPlease check that your Excel file has the required columns: Catégorie de Personnes, Type, Tag, and Fréquence de déclaration.`
        );
        return;
      }

             // Convert to FiscalCalendarItem format
       const newItems: FiscalCalendarItem[] = validData.map((item, index) => ({
         id: Date.now().toString() + index,
         ...item,
         created_at: new Date(),
         updated_at: new Date()
       }));
      console.log('New items created:', newItems.length);

             // Call the real API
       const result = await apiProxy.importAdminCalendar({ items: newItems });
       
       if (result.success) {
         console.log('Import result:', result.data);
         
         // Reload the calendar data to get the updated list
         await loadCalendarData();
         
                  const totalItems = processedData.length;
         const invalidItems = totalItems - validData.length;
         const importedItems = result.data.imported;
         
         Alert.alert(
           'Import Successful', 
           `Import completed successfully!\n\nTotal items processed: ${totalItems}\nValid items: ${validData.length}\nInvalid items: ${invalidItems}\nSuccessfully imported: ${importedItems}\n\n${result.message || ''}`
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
          
        } catch (error: unknown) {
          console.error('Error processing Excel file:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          Alert.alert('Error', `Failed to process Excel file: ${errorMessage}`);
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
             // Create template data based on the new structure
       const templateData = [
         {
           'Catégorie de Personnes': 'Personne Morale',
           'Sous-Catégorie': 'SARL',
           'Type': 'Taxe sur la Valeur Ajoutée',
           'Tag': 'TVA',
           'Fréquence de déclaration': 'Mensuel',
           'Période déclaration': 'Décembre',
           'Mois': 'Janvier',
           'Jours': '20',
           'Detail déclaration': 'TVA Déclaration du Chiffre d\'Affaires',
           'Formulaire': 'ADC080B-25I',
           'Lien': 'https://www.tax.gov.ma/wps/wcm/connect/2aabc75b-959e-4753-a152-3441104acaf7/adc_080b_25i.pdf?MOD=AJPERES',
           'Commentaire': 'Télédéclaration mensuelle et télépaiement de la TVA pour le mois précédent doivent être effectués avant l\'expiration du mois suivant pour les redevables assujettis selon le régime de la déclaration mensuelle (Articles 110, 111, 112 et 115 du CGI imprimés ADC080B-25I, ADC082B-24I, ADC081B-24I).'
         },
         {
           'Catégorie de Personnes': 'Personne Physique',
           'Sous-Catégorie': 'Auto-entrepreneur',
           'Type': 'Impôt sur le revenu',
           'Tag': 'IR',
           'Fréquence de déclaration': 'Trimestriel',
           'Période déclaration': '4e Trimestre',
           'Mois': 'Janvier',
           'Jours': '31',
           'Detail déclaration': 'Versement IR sur Chiffre d\'Affaires',
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
    return categories.includes(formData.categorie_personnes);
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
         {filteredItems.map((item) => {
           // Get current year
           const currentYear = new Date().getFullYear();
           
           // Create title: TYPE - periode declaration
           const title = item.periode_declaration 
             ? `${item.type} - ${item.periode_declaration}`
             : item.type;
           
           // Create date: jours/mois/current year
           const date = item.jours && item.mois 
             ? `${item.jours}/${item.mois}/${currentYear}`
             : '';
           
           return (
             <View key={item.id} style={styles.itemCard}>
               <View style={styles.itemHeader}>
                 <Text style={styles.itemTitle}>{title}</Text>
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
                   <Text style={styles.detailLabel}>Tag:</Text>
                   <Text style={styles.detailValue}>{item.tag}</Text>
                 </View>
                 <View style={styles.detailRow}>
                   <Text style={styles.detailLabel}>Frequency:</Text>
                   <Text style={styles.detailValue}>{item.frequence_declaration}</Text>
                 </View>
                 {date && (
                   <View style={styles.detailRow}>
                     <Text style={styles.detailLabel}>Due Date:</Text>
                     <Text style={styles.detailValue}>{date}</Text>
                   </View>
                 )}
               </View>
             </View>
           );
         })}
       </ScrollView>

             {/* Create/Edit Modal */}
               <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownOpen(null)}
          >
            <ScrollView 
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
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
             
                                       <ModalPicker
              label="Catégorie de Personnes *"
              value={formData.categorie_personnes}
              options={categories}
              onSelect={(value) => setFormData({...formData, categorie_personnes: value, sous_categorie: ''})}
              placeholder="Select Category"
              fieldName="categorie_personnes"
              isOpen={dropdownOpen === 'categorie_personnes'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'categorie_personnes' ? null : 'categorie_personnes')}
              onClose={() => setDropdownOpen(null)}
            />

             <TextInput
               style={styles.input}
               placeholder="Sous-Catégorie"
               value={formData.sous_categorie}
               onChangeText={(text) => setFormData({...formData, sous_categorie: text})}
             />

                                       <ModalPicker
              label="Type *"
              value={formData.type}
              options={types}
              onSelect={(value) => setFormData({...formData, type: value})}
              placeholder="Select Type"
              fieldName="type"
              isOpen={dropdownOpen === 'type'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'type' ? null : 'type')}
              onClose={() => setDropdownOpen(null)}
            />

             <ModalPicker
              label="Tag *"
              value={formData.tag}
              options={tags}
              onSelect={(value) => setFormData({...formData, tag: value})}
              placeholder="Select Tag"
              fieldName="tag"
              isOpen={dropdownOpen === 'tag'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'tag' ? null : 'tag')}
              onClose={() => setDropdownOpen(null)}
            />

             <ModalPicker
              label="Fréquence de déclaration *"
              value={formData.frequence_declaration}
              options={frequences}
              onSelect={(value) => setFormData({...formData, frequence_declaration: value})}
              placeholder="Select Frequency"
              fieldName="frequence_declaration"
              isOpen={dropdownOpen === 'frequence_declaration'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'frequence_declaration' ? null : 'frequence_declaration')}
              onClose={() => setDropdownOpen(null)}
            />

             {/* Optional Fields */}
             <Text style={styles.sectionTitle}>Additional Information</Text>

             <ModalPicker
              label="Période déclaration"
              value={formData.periode_declaration}
              options={periodes}
              onSelect={(value) => setFormData({...formData, periode_declaration: value})}
              placeholder="Select Period"
              fieldName="periode_declaration"
              isOpen={dropdownOpen === 'periode_declaration'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'periode_declaration' ? null : 'periode_declaration')}
              onClose={() => setDropdownOpen(null)}
            />

             <ModalPicker
              label="Mois"
              value={formData.mois}
              options={mois}
              onSelect={(value) => setFormData({...formData, mois: value})}
              placeholder="Select Month"
              fieldName="mois"
              isOpen={dropdownOpen === 'mois'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'mois' ? null : 'mois')}
              onClose={() => setDropdownOpen(null)}
            />

             <ModalPicker
              label="Jours"
              value={formData.jours}
              options={jours}
              onSelect={(value) => setFormData({...formData, jours: value})}
              placeholder="Select Day"
              fieldName="jours"
              isOpen={dropdownOpen === 'jours'}
              onToggle={() => setDropdownOpen(dropdownOpen === 'jours' ? null : 'jours')}
              onClose={() => setDropdownOpen(null)}
            />

             <TextInput
               style={[styles.input, styles.textArea]}
               placeholder="Detail déclaration"
               value={formData.detail_declaration}
               onChangeText={(text) => setFormData({...formData, detail_declaration: text})}
               multiline
               numberOfLines={3}
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
        </TouchableOpacity>
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
                 <Text style={styles.requiredField}>Catégorie de Personnes</Text>
                 <Text> (Required)</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text>Sous-Catégorie</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text style={styles.requiredField}>Type</Text>
                 <Text> (Required)</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text style={styles.requiredField}>Tag</Text>
                 <Text> (Required)</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text style={styles.requiredField}>Fréquence de déclaration</Text>
                 <Text> (Required)</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text>Période déclaration</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text>Mois</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text>Jours</Text>
               </Text>
               <Text style={styles.importColumn}>
                 <Text>• </Text>
                 <Text>Detail déclaration</Text>
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
                 
                 // Test data with missing frequence_declaration to test the inference logic
                 const testData = [
                    {
                      'Catégorie de Personnes': 'Personne Morale',
                      'Sous-Catégorie': 'SARL',
                      'Type': 'Taxe sur la Valeur Ajoutée',
                      'Tag': 'TVA',
                      'Fréquence de déclaration': '', // Missing to test inference
                      'Période déclaration': 'Décembre',
                      'Mois': 'Janvier',
                      'Jours': '20',
                      'Detail déclaration': 'TVA Déclaration du Chiffre d\'Affaires',
                      'Formulaire': 'ADC080B-25I',
                      'Lien': 'https://www.tax.gov.ma/wps/wcm/connect/2aabc75b-959e-4753-a152-3441104acaf7/adc_080b_25i.pdf?MOD=AJPERES',
                      'Commentaire': 'Télédéclaration mensuelle et télépaiement de la TVA pour le mois précédent doivent être effectués avant l\'expiration du mois suivant pour les redevables assujettis selon le régime de la déclaration mensuelle (Articles 110, 111, 112 et 115 du CGI imprimés ADC080B-25I, ADC082B-24I, ADC081B-24I).'
                    },
                    {
                      'Catégorie de Personnes': 'Personne Physique',
                      'Sous-Catégorie': 'Auto-entrepreneur',
                      'Type': 'Impôt sur le revenu',
                      'Tag': 'IR',
                      'Fréquence de déclaration': '', // Missing to test inference
                      'Période déclaration': '4e Trimestre',
                      'Mois': 'Janvier',
                      'Jours': '31',
                      'Detail déclaration': 'Versement IR sur Chiffre d\'Affaires',
                      'Formulaire': '',
                      'Lien': '',
                      'Commentaire': 'Versement de l\'impôt dû titre du trimestre précédent prévu par l\'article 82 bis du CGI par les personnes physiques exerçant leurs activités à titre individuel dans le cadre de l\'auto-entrepreneur au taux de : - 0,5% du chiffre d\'affaires encaissé et dont le montant ne dépasse pas 500 000 DH pour les activités commerciales, industrielles et artisanales ; - 1% du chiffre d\'affaires encaissé et dont le montant ne dépasse pas 200 000 DH pour les prestataires de services'
                    },
                    {
                      'Catégorie de Personnes': 'Personne Morale',
                      'Sous-Catégorie': 'SA',
                      'Type': 'Impôt sur les sociétés',
                      'Tag': 'IS',
                      'Fréquence de déclaration': '', // Missing to test inference
                      'Période déclaration': 'Annuel',
                      'Mois': 'Mars',
                      'Jours': '31',
                      'Detail déclaration': 'Déclaration annuelle IS',
                      'Formulaire': 'IS205',
                      'Lien': '',
                      'Commentaire': 'Déclaration annuelle de l\'impôt sur les sociétés'
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
    position: 'relative',
    zIndex: 10,
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
