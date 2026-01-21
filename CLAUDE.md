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
│   │   ├── contexts/        # Contexts partages (AuthContext, AppContext)
│   │   ├── theme/           # colors, spacing, typography, gradients, shadows
│   │   ├── types/           # Types TypeScript centralises
│   │   └── utils/           # Utilitaires (cache AsyncStorage)
│   │
│   ├── features/            # Modules fonctionnels ISOLES (1 dossier = 1 feature)
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
│   │   └── components/      # Avatar, Card, TabBar, FeatureErrorBoundary
│   │
│   └── services/            # Logique metier, appels API
│       ├── vehicleService.ts
│       ├── maintenanceService.ts
│       ├── expenseService.ts
│       ├── documentService.ts
│       ├── settingsService.ts
│       └── carQueryService.ts  # API externe marques/modeles
│
├── assets/                  # Images, fonts
├── App.tsx                  # Point d'entree + Providers + Error Boundaries
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

## Regles d'Architecture Modulaire

### Principe d'Isolation des Features

Chaque feature est isolee dans son "cocon" :
- Une erreur dans un module ne crash pas l'app (grace aux Error Boundaries)
- Les features ne s'importent JAMAIS entre elles directement
- Les dependances entre features passent par les Contexts

### Imports Autorises / Interdits

| Depuis | Peut importer | NE PEUT PAS importer |
|--------|---------------|---------------------|
| `features/X` | `@/core/*`, `@/services/*`, `@/shared/*` | `@/features/Y` (autre feature) |
| `services/` | `@/core/*` | `@/features/*` |
| `shared/` | `@/core/*` | `@/features/*`, `@/services/*` |
| `App.tsx` | Tout | - |

### Communication Entre Features

Utiliser les Contexts dans `@/core/contexts/` :

```typescript
// Dans une feature qui a besoin de l'auth :
import { useAuthContext } from '@/core/contexts';
const { profile, signOut } = useAuthContext();

// Dans une feature qui doit naviguer ou ouvrir une modal :
import { useAppContext } from '@/core/contexts';
const { openVehicleForm, navigateToTab } = useAppContext();
```

### Structure d'Export d'une Feature

Chaque feature exporte UNIQUEMENT son Screen principal :

```typescript
// src/features/expenses/index.ts
export { ExpensesScreen } from './ExpensesScreen';
// PAS de hooks, PAS de components internes
```

Les hooks et components internes restent prives a la feature.

### Error Boundaries

Chaque ecran est wrappe dans un `FeatureErrorBoundary` dans App.tsx :

```tsx
<FeatureErrorBoundary featureName="Accueil">
  <HomeScreen />
</FeatureErrorBoundary>
```

Cela permet :
- Afficher un fallback elegant en cas d'erreur
- Ne pas crasher toute l'app si une feature a un bug
- Offrir un bouton "Reessayer" a l'utilisateur

### Checklist Nouvelle Feature

- [ ] Creer le dossier dans `src/features/nom-feature/`
- [ ] Exporter UNIQUEMENT le Screen dans `index.ts`
- [ ] Utiliser `useAuthContext` au lieu d'importer `useAuth`
- [ ] Utiliser `useAppContext` pour la navigation inter-feature
- [ ] Ne JAMAIS importer depuis une autre feature

## Notes Importantes

1. **Fichier .env** : Non commite, doit etre cree manuellement
2. **Authentication** : Utilise Supabase Auth avec email/password
3. **Cache** : AsyncStorage avec durees predefinies (SHORT, MEDIUM, LONG, WEEK)
4. **Isolation** : Les features sont isolees avec Error Boundaries et Contexts
