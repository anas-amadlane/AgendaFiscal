export interface ThemeColors {
  // Couleurs primaires
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Couleurs secondaires
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Couleurs tertiaires
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // Couleurs d'erreur
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Couleurs de fond
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  
  // Couleurs d'outline
  outline: string;
  outlineVariant: string;
  
  // Couleurs d'ombre
  shadow: string;
  scrim: string;
  
  // Couleurs d'inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  
  // Couleurs fiscales spécifiques
  fiscalIS: string;
  fiscalIR: string;
  fiscalTVA: string;
  fiscalCNSS: string;
  fiscalAMO: string;
  fiscalTaxePro: string;
  fiscalTaxeHab: string;
  fiscalDouane: string;
  
  // Couleurs de statut
  statusPending: string;
  statusCompleted: string;
  statusOverdue: string;
  statusUpcoming: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    // Couleurs primaires (Bleu fiscal marocain)
    primary: '#1E40AF',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E3A8A',
    
    // Couleurs secondaires (Vert succès)
    secondary: '#059669',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D1FAE5',
    onSecondaryContainer: '#065F46',
    
    // Couleurs tertiaires (Orange attention)
    tertiary: '#D97706',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FED7AA',
    onTertiaryContainer: '#92400E',
    
    // Couleurs d'erreur (Rouge danger)
    error: '#DC2626',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',
    
    // Couleurs de fond
    background: '#F8FAFC',
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#475569',
    
    // Couleurs d'outline
    outline: '#CBD5E1',
    outlineVariant: '#E2E8F0',
    
    // Couleurs d'ombre
    shadow: '#000000',
    scrim: '#000000',
    
    // Couleurs d'inverse
    inverseSurface: '#1E293B',
    inverseOnSurface: '#F8FAFC',
    inversePrimary: '#93C5FD',
    
    // Couleurs fiscales spécifiques
    fiscalIS: '#1E40AF',      // Bleu
    fiscalIR: '#059669',      // Vert
    fiscalTVA: '#D97706',     // Orange
    fiscalCNSS: '#7C3AED',    // Violet
    fiscalAMO: '#EC4899',     // Rose
    fiscalTaxePro: '#DC2626', // Rouge
    fiscalTaxeHab: '#6B7280', // Gris
    fiscalDouane: '#0D9488',  // Teal
    
    // Couleurs de statut
    statusPending: '#D97706',
    statusCompleted: '#059669',
    statusOverdue: '#DC2626',
    statusUpcoming: '#1E40AF',
  }
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    // Couleurs primaires (Bleu fiscal marocain - version sombre)
    primary: '#60A5FA',
    onPrimary: '#1E3A8A',
    primaryContainer: '#1E40AF',
    onPrimaryContainer: '#DBEAFE',
    
    // Couleurs secondaires (Vert succès - version sombre)
    secondary: '#34D399',
    onSecondary: '#065F46',
    secondaryContainer: '#059669',
    onSecondaryContainer: '#D1FAE5',
    
    // Couleurs tertiaires (Orange attention - version sombre)
    tertiary: '#FBBF24',
    onTertiary: '#92400E',
    tertiaryContainer: '#D97706',
    onTertiaryContainer: '#FED7AA',
    
    // Couleurs d'erreur (Rouge danger - version sombre)
    error: '#F87171',
    onError: '#991B1B',
    errorContainer: '#DC2626',
    onErrorContainer: '#FEE2E2',
    
    // Couleurs de fond
    background: '#0F172A',
    onBackground: '#F8FAFC',
    surface: '#1E293B',
    onSurface: '#F8FAFC',
    surfaceVariant: '#334155',
    onSurfaceVariant: '#CBD5E1',
    
    // Couleurs d'outline
    outline: '#475569',
    outlineVariant: '#334155',
    
    // Couleurs d'ombre
    shadow: '#000000',
    scrim: '#000000',
    
    // Couleurs d'inverse
    inverseSurface: '#F8FAFC',
    inverseOnSurface: '#1E293B',
    inversePrimary: '#1E40AF',
    
    // Couleurs fiscales spécifiques (version sombre)
    fiscalIS: '#60A5FA',      // Bleu
    fiscalIR: '#34D399',      // Vert
    fiscalTVA: '#FBBF24',     // Orange
    fiscalCNSS: '#A78BFA',    // Violet
    fiscalAMO: '#F472B6',     // Rose
    fiscalTaxePro: '#F87171', // Rouge
    fiscalTaxeHab: '#9CA3AF', // Gris
    fiscalDouane: '#5EEAD4',  // Teal
    
    // Couleurs de statut (version sombre)
    statusPending: '#FBBF24',
    statusCompleted: '#34D399',
    statusOverdue: '#F87171',
    statusUpcoming: '#60A5FA',
  }
};

