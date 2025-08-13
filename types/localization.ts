export type Language = 'fr' | 'ar';

export interface LocalizedStrings {
  // Navigation
  dashboard: string;
  enterprises: string;
  calendar: string;
  notifications: string;
  settings: string;
  
  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  enterprisesCount: string;
  upcomingObligations: string;
  urgentObligations: string;
  overdueObligations: string;
  complianceRate: string;
  priorityDeadlines: string;
  viewAll: string;
  excellentWork: string;
  allObligationsUpToDate: string;
  
  // Enterprises
  myEnterprises: string;
  addEnterprise: string;
  editEnterprise: string;
  deleteEnterprise: string;
  enterpriseName: string;
  fiscalIdentifier: string;
  legalForm: string;
  fiscalRegime: string;
  activitySector: string;
  active: string;
  inactive: string;
  all: string;
  searchEnterprise: string;
  noEnterprises: string;
  noEnterprisesFound: string;
  addFirstEnterprise: string;
  importFromExcel: string;
  
  // Calendar
  fiscalCalendar: string;
  day: string;
  week: string;
  month: string;
  history: string;
  noDeadlines: string;
  noObligationsForPeriod: string;
  completed: string;
  overdue: string;
  
  // Obligations
  obligations: string;
  obligation: string;
  declaration: string;
  payment: string;
  deposit: string;
  regularization: string;
  pending: string;
  completed: string;
  overdue: string;
  upcoming: string;
  
  // Fiscal Types
  is: string;
  ir: string;
  tva: string;
  cnss: string;
  amo: string;
  professionalTax: string;
  housingTax: string;
  customsDuties: string;
  
  // Legal Forms
  sarl: string;
  sa: string;
  snc: string;
  scs: string;
  sca: string;
  suarl: string;
  individualEntrepreneur: string;
  association: string;
  cooperative: string;
  
  // Fiscal Regimes
  isTva: string;
  irTva: string;
  isExempt: string;
  irExempt: string;
  autoEntrepreneur: string;
  
  // Actions
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  confirm: string;
  close: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  
  // Notifications
  notifications: string;
  markAsRead: string;
  markAllAsRead: string;
  noNotifications: string;
  
  // Settings
  settings: string;
  language: string;
  theme: string;
  lightTheme: string;
  darkTheme: string;
  notifications: string;
  reminderSettings: string;
  exportSettings: string;
  about: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  yes: string;
  no: string;
  ok: string;
  retry: string;
}

export const frenchStrings: LocalizedStrings = {
  // Navigation
  dashboard: 'Tableau de bord',
  enterprises: 'Entreprises',
  calendar: 'Calendrier',
  notifications: 'Notifications',
  settings: 'Paramètres',
  
  // Dashboard
  dashboardTitle: 'Tableau de bord',
  dashboardSubtitle: 'Vue d\'ensemble de vos obligations fiscales',
  enterprisesCount: 'Entreprises',
  upcomingObligations: 'À venir',
  urgentObligations: 'Urgentes',
  overdueObligations: 'En retard',
  complianceRate: 'Taux de conformité',
  priorityDeadlines: 'Échéances prioritaires',
  viewAll: 'Voir tout',
  excellentWork: 'Excellent travail !',
  allObligationsUpToDate: 'Toutes vos obligations urgentes sont à jour',
  
  // Enterprises
  myEnterprises: 'Mes Entreprises',
  addEnterprise: 'Ajouter une entreprise',
  editEnterprise: 'Modifier l\'entreprise',
  deleteEnterprise: 'Supprimer l\'entreprise',
  enterpriseName: 'Raison sociale',
  fiscalIdentifier: 'Identifiant fiscal',
  legalForm: 'Forme juridique',
  fiscalRegime: 'Régime fiscal',
  activitySector: 'Secteur d\'activité',
  active: 'Actif',
  inactive: 'Inactif',
  all: 'Toutes',
  searchEnterprise: 'Rechercher par nom ou identifiant fiscal...',
  noEnterprises: 'Aucune entreprise',
  noEnterprisesFound: 'Aucune entreprise trouvée',
  addFirstEnterprise: 'Ajoutez votre première entreprise ou importez depuis Excel',
  importFromExcel: 'Importer depuis Excel',
  
  // Calendar
  fiscalCalendar: 'Calendrier Fiscal',
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
  history: 'Historique',
  noDeadlines: 'Aucune échéance',
  noObligationsForPeriod: 'Aucune obligation fiscale pour cette période',
  completed: 'Terminées',
  overdue: 'En retard',
  
  // Obligations
  obligations: 'Obligations',
  obligation: 'Obligation',
  declaration: 'Déclaration',
  payment: 'Paiement',
  deposit: 'Dépôt',
  regularization: 'Régularisation',
  pending: 'En attente',
  completed: 'Terminé',
  overdue: 'En retard',
  upcoming: 'À venir',
  
  // Fiscal Types
  is: 'IS',
  ir: 'IR',
  tva: 'TVA',
  cnss: 'CNSS',
  amo: 'AMO',
  professionalTax: 'Taxe Professionnelle',
  housingTax: 'Taxe d\'Habitation',
  customsDuties: 'Droits de Douane',
  
  // Legal Forms
  sarl: 'SARL',
  sa: 'SA',
  snc: 'SNC',
  scs: 'SCS',
  sca: 'SCA',
  suarl: 'SUARL',
  individualEntrepreneur: 'Entrepreneur Individuel',
  association: 'Association',
  cooperative: 'Coopérative',
  
  // Fiscal Regimes
  isTva: 'IS + TVA',
  irTva: 'IR + TVA',
  isExempt: 'IS Exonéré',
  irExempt: 'IR Exonéré',
  autoEntrepreneur: 'Auto-Entrepreneur',
  
  // Actions
  save: 'Enregistrer',
  cancel: 'Annuler',
  edit: 'Modifier',
  delete: 'Supprimer',
  confirm: 'Confirmer',
  close: 'Fermer',
  search: 'Rechercher',
  filter: 'Filtrer',
  export: 'Exporter',
  import: 'Importer',
  
  // Notifications
  notifications: 'Notifications',
  markAsRead: 'Marquer comme lu',
  markAllAsRead: 'Tout marquer comme lu',
  noNotifications: 'Aucune notification',
  
  // Settings
  settings: 'Paramètres',
  language: 'Langue',
  theme: 'Thème',
  lightTheme: 'Thème clair',
  darkTheme: 'Thème sombre',
  notifications: 'Notifications',
  reminderSettings: 'Paramètres de rappel',
  exportSettings: 'Paramètres d\'export',
  about: 'À propos',
  
  // Common
  loading: 'Chargement...',
  error: 'Erreur',
  success: 'Succès',
  warning: 'Attention',
  info: 'Information',
  yes: 'Oui',
  no: 'Non',
  ok: 'OK',
  retry: 'Réessayer',
};

export const arabicStrings: LocalizedStrings = {
  // Navigation
  dashboard: 'لوحة التحكم',
  enterprises: 'المؤسسات',
  calendar: 'التقويم',
  notifications: 'الإشعارات',
  settings: 'الإعدادات',
  
  // Dashboard
  dashboardTitle: 'لوحة التحكم',
  dashboardSubtitle: 'نظرة عامة على التزاماتك الضريبية',
  enterprisesCount: 'المؤسسات',
  upcomingObligations: 'قادمة',
  urgentObligations: 'عاجلة',
  overdueObligations: 'متأخرة',
  complianceRate: 'معدل الامتثال',
  priorityDeadlines: 'المواعيد النهائية ذات الأولوية',
  viewAll: 'عرض الكل',
  excellentWork: 'عمل ممتاز !',
  allObligationsUpToDate: 'جميع التزاماتك العاجلة محدثة',
  
  // Enterprises
  myEnterprises: 'مؤسساتي',
  addEnterprise: 'إضافة مؤسسة',
  editEnterprise: 'تعديل المؤسسة',
  deleteEnterprise: 'حذف المؤسسة',
  enterpriseName: 'الاسم التجاري',
  fiscalIdentifier: 'الرقم الضريبي',
  legalForm: 'الشكل القانوني',
  fiscalRegime: 'النظام الضريبي',
  activitySector: 'قطاع النشاط',
  active: 'نشط',
  inactive: 'غير نشط',
  all: 'الكل',
  searchEnterprise: 'البحث بالاسم أو الرقم الضريبي...',
  noEnterprises: 'لا توجد مؤسسات',
  noEnterprisesFound: 'لم يتم العثور على مؤسسات',
  addFirstEnterprise: 'أضف مؤسستك الأولى أو استورد من Excel',
  importFromExcel: 'استيراد من Excel',
  
  // Calendar
  fiscalCalendar: 'التقويم الضريبي',
  day: 'يوم',
  week: 'أسبوع',
  month: 'شهر',
  history: 'التاريخ',
  noDeadlines: 'لا توجد مواعيد نهائية',
  noObligationsForPeriod: 'لا توجد التزامات ضريبية لهذه الفترة',
  completed: 'مكتملة',
  overdue: 'متأخرة',
  
  // Obligations
  obligations: 'الالتزامات',
  obligation: 'التزام',
  declaration: 'إعلان',
  payment: 'دفع',
  deposit: 'إيداع',
  regularization: 'تنظيم',
  pending: 'في الانتظار',
  completed: 'مكتمل',
  overdue: 'متأخر',
  upcoming: 'قادم',
  
  // Fiscal Types
  is: 'ضريبة الشركات',
  ir: 'ضريبة الدخل',
  tva: 'ضريبة القيمة المضافة',
  cnss: 'الصندوق الوطني للضمان الاجتماعي',
  amo: 'التأمين الإجباري الأساسي',
  professionalTax: 'الضريبة المهنية',
  housingTax: 'ضريبة السكن',
  customsDuties: 'رسوم الجمارك',
  
  // Legal Forms
  sarl: 'شركة ذات مسؤولية محدودة',
  sa: 'شركة مساهمة',
  snc: 'شركة تضامن',
  scs: 'شركة تضامن محدودة',
  sca: 'شركة تضامن بالأسهم',
  suarl: 'شركة ذات مسؤولية محدودة واحدة',
  individualEntrepreneur: 'رجل أعمال فردي',
  association: 'جمعية',
  cooperative: 'تعاونية',
  
  // Fiscal Regimes
  isTva: 'ضريبة الشركات + ضريبة القيمة المضافة',
  irTva: 'ضريبة الدخل + ضريبة القيمة المضافة',
  isExempt: 'ضريبة الشركات معفاة',
  irExempt: 'ضريبة الدخل معفاة',
  autoEntrepreneur: 'رجل أعمال ذاتي',
  
  // Actions
  save: 'حفظ',
  cancel: 'إلغاء',
  edit: 'تعديل',
  delete: 'حذف',
  confirm: 'تأكيد',
  close: 'إغلاق',
  search: 'بحث',
  filter: 'تصفية',
  export: 'تصدير',
  import: 'استيراد',
  
  // Notifications
  notifications: 'الإشعارات',
  markAsRead: 'تحديد كمقروء',
  markAllAsRead: 'تحديد الكل كمقروء',
  noNotifications: 'لا توجد إشعارات',
  
  // Settings
  settings: 'الإعدادات',
  language: 'اللغة',
  theme: 'المظهر',
  lightTheme: 'مظهر فاتح',
  darkTheme: 'مظهر داكن',
  notifications: 'الإشعارات',
  reminderSettings: 'إعدادات التذكير',
  exportSettings: 'إعدادات التصدير',
  about: 'حول',
  
  // Common
  loading: 'جاري التحميل...',
  error: 'خطأ',
  success: 'نجح',
  warning: 'تحذير',
  info: 'معلومات',
  yes: 'نعم',
  no: 'لا',
  ok: 'موافق',
  retry: 'إعادة المحاولة',
};

export const getLocalizedStrings = (language: Language): LocalizedStrings => {
  return language === 'ar' ? arabicStrings : frenchStrings;
};

