import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Upload, FileSpreadsheet, Download, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';
import { Enterprise, FormeJuridique, RegimeFiscal } from '@/types/fiscal';

interface ExcelImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (enterprises: Enterprise[]) => void;
}

export default function ExcelImportModal({
  visible,
  onClose,
  onImport
}: ExcelImportModalProps) {
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [previewData, setPreviewData] = useState<Partial<Enterprise>[]>([]);

  const handleDownloadTemplate = () => {
    Alert.alert(
      'Télécharger le modèle',
      'Un fichier Excel modèle sera téléchargé avec les colonnes requises.',
      [{ text: 'OK' }]
    );
  };

  const handleFileUpload = () => {
    // Simulate file upload and parsing
    const mockData: Partial<Enterprise>[] = [
      {
        raisonSociale: 'SARL Digital Solutions',
        identifiantFiscal: '98765432',
        formeJuridique: FormeJuridique.SARL,
        regimeFiscal: RegimeFiscal.IS_TVA,
        secteurActivite: 'Technologies',
        isActive: true
      },
      {
        raisonSociale: 'Consulting Pro',
        identifiantFiscal: '11223344',
        formeJuridique: FormeJuridique.SA,
        regimeFiscal: RegimeFiscal.IS_TVA,
        secteurActivite: 'Conseil',
        isActive: true
      },
      {
        raisonSociale: 'Commerce Express',
        identifiantFiscal: '55667788',
        formeJuridique: FormeJuridique.ENTREPRENEUR_INDIVIDUEL,
        regimeFiscal: RegimeFiscal.IR_TVA,
        secteurActivite: 'Commerce',
        isActive: true
      }
    ];

    setPreviewData(mockData);
    setImportStep('preview');
  };

  const handleConfirmImport = () => {
    const enterprises: Enterprise[] = previewData.map((data, index) => ({
      id: `import-${Date.now()}-${index}`,
      raisonSociale: data.raisonSociale!,
      identifiantFiscal: data.identifiantFiscal!,
      formeJuridique: data.formeJuridique!,
      regimeFiscal: data.regimeFiscal!,
      secteurActivite: data.secteurActivite!,
      dateCreation: new Date(),
      isActive: data.isActive!
    }));

    onImport(enterprises);
    setImportStep('success');
  };

  const handleClose = () => {
    setImportStep('upload');
    setPreviewData([]);
    onClose();
  };

  const renderUploadStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.uploadArea}>
        <FileSpreadsheet size={48} color="#667EEA" />
        <Text style={styles.uploadTitle}>Importer depuis Excel</Text>
        <Text style={styles.uploadSubtitle}>
          Téléchargez le modèle, remplissez-le avec vos données d'entreprises, puis importez-le.
        </Text>
        
        <TouchableOpacity style={styles.templateButton} onPress={handleDownloadTemplate}>
          <Download size={20} color="#667EEA" />
          <Text style={styles.templateButtonText}>Télécharger le modèle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
          <Upload size={20} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Sélectionner le fichier Excel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Info size={20} color="#667EEA" />
          <Text style={styles.infoTitle}>Colonnes requises</Text>
        </View>
        <View style={styles.columnsList}>
          <Text style={styles.columnItem}>• Raison sociale</Text>
          <Text style={styles.columnItem}>• Identifiant fiscal</Text>
          <Text style={styles.columnItem}>• Forme juridique</Text>
          <Text style={styles.columnItem}>• Régime fiscal</Text>
          <Text style={styles.columnItem}>• Secteur d'activité</Text>
          <Text style={styles.columnItem}>• Statut (Actif/Inactif)</Text>
        </View>
      </View>
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Aperçu des données</Text>
        <Text style={styles.previewSubtitle}>
          {previewData.length} entreprise{previewData.length > 1 ? 's' : ''} trouvée{previewData.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView style={styles.previewList} showsVerticalScrollIndicator={false}>
        {previewData.map((enterprise, index) => (
          <View key={index} style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <CheckCircle size={20} color="#48BB78" />
              <Text style={styles.previewCardTitle}>{enterprise.raisonSociale}</Text>
            </View>
            <View style={styles.previewCardDetails}>
              <Text style={styles.previewDetail}>IF: {enterprise.identifiantFiscal}</Text>
              <Text style={styles.previewDetail}>{enterprise.formeJuridique}</Text>
              <Text style={styles.previewDetail}>{enterprise.regimeFiscal}</Text>
              <Text style={styles.previewDetail}>{enterprise.secteurActivite}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.backButton} onPress={() => setImportStep('upload')}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmImport}>
          <Text style={styles.confirmButtonText}>Confirmer l'import</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <CheckCircle size={64} color="#48BB78" />
        <Text style={styles.successTitle}>Import réussi !</Text>
        <Text style={styles.successSubtitle}>
          {previewData.length} entreprise{previewData.length > 1 ? 's ont été ajoutées' : ' a été ajoutée'} avec succès.
        </Text>
        <Text style={styles.successNote}>
          Les calendriers fiscaux ont été automatiquement générés pour chaque entreprise.
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Import Excel</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {importStep === 'upload' && renderUploadStep()}
          {importStep === 'preview' && renderPreviewStep()}
          {importStep === 'success' && renderSuccessStep()}
        </View>

        {importStep === 'success' && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Terminé</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  stepContainer: {
    flex: 1,
    paddingTop: 24
  },
  uploadArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
    marginLeft: 8
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  columnsList: {
    gap: 8
  },
  columnItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  previewHeader: {
    marginBottom: 20
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  previewList: {
    flex: 1,
    marginBottom: 20
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  previewCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  previewCardDetails: {
    gap: 4
  },
  previewDetail: {
    fontSize: 14,
    color: '#6B7280'
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16
  },
  successNote: {
    fontSize: 14,
    color: '#48BB78',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  doneButton: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});