# Car Maintenance App - Guide de Developpement

Ce fichier definit les conventions et l'architecture du projet. Il est lu automatiquement par Claude Code a chaque session.

## Etat Actuel du Projet (21 Janvier 2026)

### Fonctionnalites Implementees
- Authentification (Login/Signup avec Supabase)
- Ecran d'accueil avec maintenances a venir
- Gestion des vehicules (ajout, modification)
- Suivi des depenses
- Gestion des documents
- Calendrier des maintenances
- Statistiques/Analytics
- Parametres utilisateur
- Assistant IA (en cours)

### A Faire
- Notifications push
- Mode hors-ligne
- Export des donnees

## Architecture du Projet

```
CarMaintenanceExpo/
├── src/
│   ├── core/                 # Configuration et theme centralises
│   │   ├── config/          # Supabase config
│   │   ├── theme/           # colors, spacing, typography, gradients, shadows
│   │   ├── types/           # Types TypeScript centralises
│   │   └── utils/           # Utilitaires (cache AsyncStorage)
│   │
│   ├── features/            # Modules fonctionnels (1 dossier = 1 feature)
│   │   ├── home/            # Ecran d'accueil + maintenances
│   │   ├── vehicle/         # Formulaire vehicule
│   │   ├── documents/       # Gestion documents/factures
│   │   ├── assistant/       # Assistant IA
│   │   ├── calendar/        # Calendrier maintenances
│   │   ├── expenses/        # Suivi depenses
│   │   ├── analytics/       # Statistiques et graphiques
│   │   ├── settings/        # Parametres utilisateur
│   │   └── auth/            # Login/Signup
│   │
│   ├── shared/              # Composants reutilisables
│   │   └── components/      # Avatar, Card, TabBar, PlaceholderScreen
│   │
│   └── services/            # Logique metier, appels API
│       ├── vehicleService.ts
│       ├── maintenanceService.ts
│       ├── expenseService.ts
│       ├── documentService.ts
│       └── carQueryService.ts  # API externe marques/modeles
│
├── assets/                  # Images, fonts
├── App.tsx                  # Point d'entree
├── app.json                 # Config Expo
└── .env                     # Variables d'environnement (non commite)
```

## Stack Technique

- **Framework**: React Native avec Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **Backend**: Supabase (Auth + Database + Storage)
- **State**: React Hooks + Context API
- **UI**: Composants custom + expo-linear-gradient
- **Charts**: react-native-gifted-charts

## Variables d'Environnement

Creer un fichier `.env` a la racine avec :
```
SUPABASE_URL=https://dahijvkdrsmrgwvosyym.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
```

## Commandes

```bash
npm start          # Demarrer Expo
npm start -- --clear  # Demarrer avec cache vide
npm run ios        # Simulateur iOS
npm run android    # Emulateur Android
npm run lint       # Verifier le code
npm run lint:fix   # Corriger les erreurs ESLint
npm run typecheck  # Verifier les types TypeScript
```

## Conventions de Code

### Nommage
- Composants : PascalCase (`VehicleCard.tsx`)
- Hooks : camelCase + use (`useVehicleData.ts`)
- Services : camelCase (`vehicleService.ts`)
- Types : PascalCase (`Vehicle`, `Profile`)

### Imports (ordre)
1. React / React Native
2. Bibliotheques externes (Expo)
3. Core (theme, config, types, utils)
4. Services
5. Shared components
6. Feature components

### Theme
- Utiliser `@/core/theme` pour colors, spacing, typography
- Ne jamais mettre de couleurs en dur

## Base de Donnees Supabase

### Tables
- `profiles` : Utilisateurs
- `vehicles` : Vehicules
- `maintenance_history` : Historique maintenances
- `maintenance_schedule` : Planification
- `expenses` : Depenses
- `documents` : Factures/documents

## Notes Importantes

1. **Fichier .env** : Non commite, doit etre cree manuellement
2. **Authentication** : Utilise Supabase Auth avec email/password
3. **Cache** : AsyncStorage avec durees predefinies (SHORT, MEDIUM, LONG, WEEK)
