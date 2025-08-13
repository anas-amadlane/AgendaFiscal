# Agenda Fiscal Marocain

Une application mobile professionnelle pour la gestion des échéances fiscales au Maroc, conçue pour les entrepreneurs et fiduciaires marocains.

## 🎯 Fonctionnalités Principales

### 📊 Gestion Multi-Entreprises
- **Profils complets** : IF, forme juridique, régime fiscal
- **Gestion des entreprises** : Ajout, modification, suppression
- **Import/Export** : Support Excel pour l'import en masse
- **Statuts** : Actif/Inactif avec indicateurs visuels

### 📅 Calendrier Fiscal Intelligent
- **Génération automatique** des échéances selon le régime fiscal
- **Vues multiples** : Jour, Semaine, Mois
- **Historique** : Suivi des obligations terminées
- **Filtres** : Par statut, type d'obligation, entreprise

### 🔔 Système de Notifications Configurables
- **Rappels personnalisables** : J-15, J-7, J-3, J-1
- **Types de notifications** : Push, Email, Sons, Vibrations
- **Notifications intelligentes** : Basées sur les échéances réelles
- **Paramètres granulaires** : Activation/désactivation par type

### 📈 Tableau de Bord Consolidé
- **Indicateurs visuels** : Taux de conformité, échéances urgentes
- **Statistiques en temps réel** : Entreprises, obligations, statuts
- **Graphiques interactifs** : Évolution de la conformité
- **Alertes prioritaires** : Obligations en retard et urgentes

### 🌐 Interface Bilingue
- **Français** : Interface principale
- **Arabe** : Support complet RTL
- **Localisation** : Tous les textes traduits
- **Changement dynamique** : Sans redémarrage

### 🎨 Thèmes Sombre/Clair
- **Material Design 3.0** : Conformité aux standards modernes
- **Couleurs fiscales marocaines** : Palette adaptée au contexte
- **Thème sombre** : Réduction de la fatigue oculaire
- **Changement instantané** : Sans redémarrage

### 📄 Export PDF
- **Rapports de conformité** : Génération automatique
- **Templates professionnels** : Format standardisé
- **Données complètes** : Entreprises, obligations, statistiques
- **Partage facile** : Export et envoi intégrés

## 🏗️ Architecture Technique

### Frontend
- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **Expo Router** pour la navigation
- **Context API** pour la gestion d'état

### Design System
- **Material 3.0** : Composants modernes
- **Couleurs fiscales** : Palette marocaine
- **Typographie** : Inter font family
- **Animations** : Micro-interactions fluides

### Gestion d'État
- **AppContext** : Thème et localisation
- **AuthContext** : Authentification
- **AsyncStorage** : Persistance locale

### Services
- **NotificationService** : Gestion des rappels
- **PDFExport** : Génération de rapports
- **FiscalCalculations** : Logique métier

## 🎨 Design Elements

### Couleurs Fiscales Marocaines
```typescript
// Couleurs par type d'obligation
IS: '#1E40AF'        // Bleu
IR: '#059669'        // Vert
TVA: '#D97706'       // Orange
CNSS: '#7C3AED'      // Violet
AMO: '#EC4899'       // Rose
Taxe Pro: '#DC2626'  // Rouge
```

### Composants Material 3.0
- **Cards** : Élévation et ombres
- **Buttons** : États et animations
- **Switches** : Thème adaptatif
- **Navigation** : Tabs intuitifs

### Responsive Design
- **Multi-appareils** : Mobile, tablette
- **Orientations** : Portrait et paysage
- **Tailles d'écran** : Adaptatif
- **Accessibilité** : Support RTL

## 📱 Écrans Principaux

### 1. Tableau de Bord
- Vue d'ensemble des obligations
- Statistiques en temps réel
- Échéances prioritaires
- Indicateurs de conformité

### 2. Entreprises
- Liste des entreprises gérées
- Ajout/modification d'entreprises
- Import depuis Excel
- Filtres et recherche

### 3. Calendrier
- Vue calendrier des échéances
- Filtres par période
- Historique des obligations
- Navigation temporelle

### 4. Notifications
- Centre de notifications
- Paramètres de rappels
- Historique des alertes
- Configuration des canaux

### 5. Paramètres
- Profil utilisateur
- Préférences d'affichage
- Configuration des notifications
- Export/Import de données

## 🔧 Installation et Configuration

### Prérequis
```bash
Node.js >= 18
npm ou yarn
Expo CLI
```

### Installation
```bash
# Cloner le repository
git clone [repository-url]
cd agenda-fiscal-marocain

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### Configuration
1. **Variables d'environnement** : Copier `.env.example`
2. **Base de données** : Configurer la connexion
3. **Notifications** : Configurer les clés push
4. **Export PDF** : Installer les dépendances

## 📊 Types d'Obligations Supportés

### Impôts
- **IS** : Impôt sur les Sociétés
- **IR** : Impôt sur le Revenu
- **TVA** : Taxe sur la Valeur Ajoutée

### Cotisations Sociales
- **CNSS** : Caisse Nationale de Sécurité Sociale
- **AMO** : Assurance Maladie Obligatoire

### Taxes
- **Taxe Professionnelle** : Taxe annuelle
- **Taxe d'Habitation** : Taxe locale
- **Droits de Douane** : Import/Export

## 🏢 Formes Juridiques Supportées

- **SARL** : Société à Responsabilité Limitée
- **SA** : Société Anonyme
- **SNC** : Société en Nom Collectif
- **SCS** : Société en Commandite Simple
- **SCA** : Société en Commandite par Actions
- **SUARL** : Société Unipersonnelle à Responsabilité Limitée
- **Entrepreneur Individuel**
- **Association**
- **Coopérative**

## 🔔 Système de Notifications

### Types de Rappels
- **J-15** : Rappel précoce
- **J-7** : Rappel hebdomadaire
- **J-3** : Rappel urgent
- **J-1** : Rappel final
- **J+0** : Échéance du jour
- **J+n** : Obligations en retard

### Canaux de Notification
- **Push** : Notifications mobiles
- **Email** : Rappels par email
- **Sons** : Alertes sonores
- **Vibrations** : Vibrations tactiles

## 📄 Export et Rapports

### Types de Rapports
- **Rapport de conformité** : Par entreprise
- **Rapport consolidé** : Toutes les entreprises
- **Rapport périodique** : Par période
- **Rapport de retard** : Obligations en retard

### Formats Supportés
- **PDF** : Format standard
- **Excel** : Données structurées
- **CSV** : Import/Export

## 🔐 Sécurité

### Authentification
- **JWT** : Tokens sécurisés
- **Biométrie** : Authentification biométrique
- **Sessions** : Gestion des sessions
- **Permissions** : Rôles et droits

### Données
- **Chiffrement** : Données sensibles
- **Sauvegarde** : Synchronisation sécurisée
- **Audit** : Traçabilité des actions

## 🚀 Roadmap

### Version 1.1
- [ ] Intégration API fiscale marocaine
- [ ] Notifications push natives
- [ ] Synchronisation cloud
- [ ] Mode hors ligne

### Version 1.2
- [ ] Intelligence artificielle
- [ ] Prédiction des échéances
- [ ] Optimisation fiscale
- [ ] Intégration comptabilité

### Version 1.3
- [ ] Application web
- [ ] API publique
- [ ] Intégrations tierces
- [ ] Marketplace d'extensions

## 🤝 Contribution

### Guidelines
1. **Fork** le repository
2. **Créer** une branche feature
3. **Développer** avec TypeScript
4. **Tester** les fonctionnalités
5. **Soumettre** une pull request

### Standards
- **ESLint** : Linting du code
- **Prettier** : Formatage
- **TypeScript** : Types stricts
- **Tests** : Couverture minimale

## 📞 Support

### Contact
- **Email** : support@agenda-fiscal.ma
- **Téléphone** : +212 XXX XXX XXX
- **Site web** : https://agenda-fiscal.ma

### Documentation
- **Guide utilisateur** : `/docs/user-guide`
- **API Reference** : `/docs/api`
- **Changelog** : `/CHANGELOG.md`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Agenda Fiscal Marocain** - Simplifiez la gestion de vos obligations fiscales au Maroc 🇲🇦

