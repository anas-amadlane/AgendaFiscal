import { apiProxy } from './apiProxy';

export interface FiscalCalendarItem {
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
  created_at: string;
  updated_at: string;
}

export class FiscalCalendarService {
  // Check if we're in demo mode
  private static isDemoMode(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
  }

  // Get fiscal calendar data with optional filters
  static async getFiscalCalendar(filters?: {
    categorie?: string;
    sous_categorie?: string;
    type_impot?: string;
    is_tva_assujetti?: boolean;
  }): Promise<FiscalCalendarItem[]> {
    if (this.isDemoMode()) {
      return this.getDemoFiscalCalendar();
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters?.categorie) queryParams.append('categorie', filters.categorie);
      if (filters?.sous_categorie) queryParams.append('sous_categorie', filters.sous_categorie);
      if (filters?.type_impot) queryParams.append('type_impot', filters.type_impot);
      if (filters?.is_tva_assujetti !== undefined) queryParams.append('is_tva_assujetti', filters.is_tva_assujetti.toString());

      const response = await apiProxy.get(`/api/v1/fiscal/calendar?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fiscal calendar:', error);
      throw error;
    }
  }

  // Get unique categories
  static async getCategories(): Promise<string[]> {
    if (this.isDemoMode()) {
      return this.getDemoCategories();
    }

    try {
      const response = await apiProxy.get('/api/v1/fiscal/calendar/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get sub-categories for a given category
  static async getSubCategories(category: string): Promise<string[]> {
    if (this.isDemoMode()) {
      return this.getDemoSubCategories(category);
    }

    try {
      const response = await apiProxy.get(`/api/v1/fiscal/calendar/subcategories/${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      throw error;
    }
  }

  // Get TVA obligations
  static async getTvaObligations(): Promise<FiscalCalendarItem[]> {
    if (this.isDemoMode()) {
      return this.getDemoFiscalCalendar().filter(item => item.is_tva_assujetti);
    }

    try {
      const response = await apiProxy.get('/api/v1/fiscal/calendar/tva');
      return response.data;
    } catch (error) {
      console.error('Error fetching TVA obligations:', error);
      throw error;
    }
  }

  // Create fiscal calendar entry
  static async createFiscalCalendarEntry(entry: Omit<FiscalCalendarItem, 'id' | 'created_at' | 'updated_at'>): Promise<FiscalCalendarItem> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Creating fiscal calendar entry', entry);
      return {
        ...entry,
        id: 'demo-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    try {
      const response = await apiProxy.post('/api/v1/fiscal/calendar', entry);
      return response.data;
    } catch (error) {
      console.error('Error creating fiscal calendar entry:', error);
      throw error;
    }
  }

  // Update fiscal calendar entry
  static async updateFiscalCalendarEntry(id: string, entry: Partial<FiscalCalendarItem>): Promise<FiscalCalendarItem> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Updating fiscal calendar entry', { id, entry });
      return {
        ...entry,
        id,
        updated_at: new Date().toISOString()
      } as FiscalCalendarItem;
    }

    try {
      const response = await apiProxy.put(`/api/v1/fiscal/calendar/${id}`, entry);
      return response.data;
    } catch (error) {
      console.error('Error updating fiscal calendar entry:', error);
      throw error;
    }
  }

  // Delete fiscal calendar entry
  static async deleteFiscalCalendarEntry(id: string): Promise<void> {
    if (this.isDemoMode()) {
      console.log('Demo mode: Deleting fiscal calendar entry', id);
      return;
    }

    try {
      await apiProxy.delete(`/api/v1/fiscal/calendar/${id}`);
    } catch (error) {
      console.error('Error deleting fiscal calendar entry:', error);
      throw error;
    }
  }

  // Demo data methods
  private static getDemoFiscalCalendar(): FiscalCalendarItem[] {
    return [
      {
        id: '1',
        liste: 'Liste 1',
        categorie_personnes: 'Sociétés',
        sous_categorie: 'SARL',
        mois: 'Janvier',
        type_impot: 'IS',
        date_echeance: '2024-01-31',
        periode_declaration: 'Annuelle',
        type_declaration: 'Déclaration',
        formulaire: 'Formulaire 1',
        lien: 'https://example.com/form1',
        commentaire: 'Déclaration IS annuelle',
        is_tva_assujetti: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        liste: 'Liste 2',
        categorie_personnes: 'Sociétés',
        sous_categorie: 'SARL',
        mois: 'Février',
        type_impot: 'TVA',
        date_echeance: '2024-02-20',
        periode_declaration: 'Mensuelle',
        type_declaration: 'Déclaration',
        formulaire: 'Formulaire 2',
        lien: 'https://example.com/form2',
        commentaire: 'Déclaration TVA mensuelle',
        is_tva_assujetti: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        liste: 'Liste 3',
        categorie_personnes: 'Entreprises individuelles',
        sous_categorie: 'Artisan',
        mois: 'Mars',
        type_impot: 'IR',
        date_echeance: '2024-03-31',
        periode_declaration: 'Trimestrielle',
        type_declaration: 'Déclaration',
        formulaire: 'Formulaire 3',
        lien: 'https://example.com/form3',
        commentaire: 'Déclaration IR trimestrielle',
        is_tva_assujetti: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        liste: 'Liste 4',
        categorie_personnes: 'Sociétés',
        sous_categorie: 'SA',
        mois: 'Avril',
        type_impot: 'TVA',
        date_echeance: '2024-04-20',
        periode_declaration: 'Mensuelle',
        type_declaration: 'Déclaration',
        formulaire: 'Formulaire 4',
        lien: 'https://example.com/form4',
        commentaire: 'Déclaration TVA mensuelle SA',
        is_tva_assujetti: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        liste: 'Liste 5',
        categorie_personnes: 'Professions libérales',
        sous_categorie: 'Avocat',
        mois: 'Mai',
        type_impot: 'IR',
        date_echeance: '2024-05-31',
        periode_declaration: 'Annuelle',
        type_declaration: 'Déclaration',
        formulaire: 'Formulaire 5',
        lien: 'https://example.com/form5',
        commentaire: 'Déclaration IR annuelle',
        is_tva_assujetti: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private static getDemoCategories(): string[] {
    return ['Sociétés', 'Entreprises individuelles', 'Professions libérales'];
  }

  private static getDemoSubCategories(category: string): string[] {
    const subCategoriesMap: Record<string, string[]> = {
      'Sociétés': ['SARL', 'SA', 'SNC', 'SCA'],
      'Entreprises individuelles': ['Artisan', 'Commerçant', 'Prestataire de services'],
      'Professions libérales': ['Avocat', 'Médecin', 'Architecte', 'Expert-comptable']
    };

    return subCategoriesMap[category] || [];
  }
}
