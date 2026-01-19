# Car Maintenance App - Guide de Developpement

Ce fichier definit les conventions et l'architecture du projet. Il est lu automatiquement par Claude Code a chaque session.

## Architecture du Projet

```
CarMaintenanceExpo/
├── src/
│   ├── core/                 # Configuration et theme centralises
│   │   ├── config/          # Supabase, API configs
│   │   ├── theme/           # colors, spacing, typography
│   │   ├── types/           # Types TypeScript centralises
│   │   │   ├── index.ts     # Export centralise
│   │   │   ├── database.ts  # Types Supabase
│   │   │   ├── analytics.ts # Types analytics
│   │   │   └── carQuery.ts  # Types CarQuery API
│   │   └── utils/           # Utilitaires reutilisables
│   │       ├── index.ts
│   │       └── cache.ts     # Cache AsyncStorage generique
│   │
│   ├── features/            # Modules fonctionnels (1 dossier = 1 feature)
│   │   ├── home/            # Ecran d'accueil
│   │   ├── vehicle/         # Formulaire vehicule
│   │   ├── documents/       # Gestion documents
│   │   ├── assistant/       # Assistant IA
│   │   ├── calendar/        # Calendrier maintenances
│   │   ├── expenses/        # Suivi depenses
│   │   ├── analytics/       # Statistiques
│   │   ├── settings/        # Parametres
│   │   └── auth/            # Authentification
│   │
│   ├── shared/              # Composants reutilisables
│   │   └── components/
│   │
│   ├── navigation/          # Configuration React Navigation
│   │
│   └── services/            # Logique metier, appels API
│       ├── index.ts         # Export centralise
│       ├── vehicleService.ts
│       ├── maintenanceService.ts
│       ├── expenseService.ts
│       ├── documentService.ts
│       └── carQueryService.ts  # API externe marques/modeles
│
├── App.tsx                  # Point d'entree
└── app.json                 # Config Expo
```

## Conventions de Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `VehicleCard.tsx` |
| Hooks | camelCase + use | `useVehicleData.ts` |
| Services | camelCase | `vehicleService.ts` |
| Types/Interfaces | PascalCase | `Vehicle`, `BudgetCategory` |
| Constantes | SCREAMING_SNAKE | `MAX_VEHICLES` |
| Fonctions | camelCase | `calculateBudget()` |
| Dossiers features | kebab-case | `home/`, `vehicle-details/` |

## Structure d'un Composant

```typescript
/**
 * Description du composant
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Imports Expo
// Imports theme
import { colors, spacing, typography } from '@/core/theme';
// Imports composants
// Imports types

interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp,
}) => {
  // Hooks en premier
  // Logique
  // Return JSX

  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Utiliser colors, spacing, typography du theme
  },
});
```

## Structure d'une Feature

Chaque nouvelle feature doit suivre cette structure :

```
features/nom-feature/
├── NomFeatureScreen.tsx     # Ecran principal
├── components/              # Composants specifiques
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── index.ts            # Export centralise
├── hooks/                   # Custom hooks
│   └── useNomFeature.ts
├── services/               # Logique metier (optionnel)
│   └── nomFeatureService.ts
└── index.ts                # Export public
```

## Regles de Code

### Obligatoire
- TypeScript strict (pas de `any`)
- Utiliser le theme centralise (jamais de couleurs en dur)
- Exporter via `index.ts` pour chaque dossier
- Composants fonctionnels avec React.FC
- StyleSheet.create() pour tous les styles

### Imports
Ordre des imports :
1. React / React Native
2. Bibliotheques externes (Expo, etc.)
3. Core (theme, config, types, utils)
4. Services
5. Shared components
6. Feature components
7. Types locaux

```typescript
// Exemple d'imports
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/core/theme';
import type { CarMake } from '@/core/types';
import { getCached, setCache } from '@/core/utils';
import { getMakes } from '@/services/carQueryService';
```

### Gestion d'Etat
- useState pour etat local simple
- Context API pour etat partage entre composants
- Supabase pour donnees persistantes

### Gestion des Erreurs
- Try/catch sur tous les appels async
- Messages d'erreur utilisateur en francais
- Console.error pour debug (a retirer en prod)

## Theme

### Couleurs (src/core/theme/colors.ts)
- `background*` : Fonds (Primary, Secondary, Tertiary)
- `text*` : Textes (Primary, Secondary, Tertiary)
- `accent*` : Couleurs d'accent (Primary=bleu, Secondary=vert)
- `state*` : Etats (Success, Warning, Error)

### Spacing (src/core/theme/spacing.ts)
- `xs` (4), `s` (8), `m` (12), `l` (16), `xl` (20), `xxl` (24), `xxxl` (32)
- `screenPaddingHorizontal` (20)
- `tabBarHeight` (80)

### Typography (src/core/theme/typography.ts)
- `h1`, `h2`, `h3` : Titres
- `body`, `bodyBold` : Corps de texte
- `caption`, `small` : Petits textes
- `button`, `tabLabel` : Actions

## Base de Donnees (Supabase)

### Tables principales
- `profiles` : Utilisateurs
- `vehicles` : Vehicules
- `maintenance_history` : Historique maintenances
- `maintenance_schedule` : Planification
- `expenses` : Depenses
- `documents` : Factures/documents

### Acces
```typescript
import { supabase } from '@/core/config/supabase';
```

## Commandes

```bash
# Depuis la racine du projet
npm start          # Demarrer Expo
npm run ios        # Simulateur iOS
npm run android    # Emulateur Android
npm run lint       # Verifier le code
npm run format     # Formater le code

# Depuis CarMaintenanceExpo/
npm run lint:fix   # Corriger les erreurs ESLint
npm run typecheck  # Verifier les types TypeScript
```

## Outils de Qualite

### ESLint + Prettier
- Formatage automatique a la sauvegarde (VS Code)
- Pre-commit hook via Husky (lint-staged)
- Config: `.eslintrc.js` et `.prettierrc`

### Variables d'Environnement
- Fichier `.env` (non commite, contient les secrets)
- Fichier `.env.example` (template a copier)
- Utilisation:
```typescript
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
```

### Alias d'Import
- `@/` pointe vers `src/`
- Exemples:
```typescript
import { colors } from '@/core/theme';
import type { Vehicle } from '@/core/types';
import { getCached } from '@/core/utils';
import { getMakes } from '@/services/carQueryService';
```

## Utilitaires (core/utils)

### Cache (cache.ts)
Utilitaire generique pour le cache AsyncStorage avec versioning.

```typescript
import { getCached, setCache, CACHE_DURATIONS } from '@/core/utils';

// Lire depuis le cache (retourne null si expire ou absent)
const data = await getCached<MyType>('cache_key', CACHE_DURATIONS.WEEK);

// Ecrire dans le cache
await setCache('cache_key', myData);

// Durees predefinies
CACHE_DURATIONS.SHORT   // 5 minutes
CACHE_DURATIONS.MEDIUM  // 1 heure
CACHE_DURATIONS.LONG    // 1 jour
CACHE_DURATIONS.WEEK    // 7 jours
```

## APIs Externes

### CarQuery API (carQueryService.ts)
API gratuite pour recuperer les marques et modeles de vehicules.

```typescript
import { getMakes, getModels } from '@/services/carQueryService';

// Toutes les marques (cachees 7 jours)
const makes = await getMakes();

// Modeles d'une marque (caches 7 jours)
const models = await getModels('peugeot');
```

Les marques populaires francaises sont affichees en priorite.

## Checklist Nouveau Composant

- [ ] Fichier en PascalCase.tsx
- [ ] Interface Props definie
- [ ] Utilise le theme (colors, spacing, typography)
- [ ] Styles avec StyleSheet.create()
- [ ] Exporte dans index.ts du dossier
- [ ] Commentaire JSDoc si complexe

## Checklist Nouvelle Feature

- [ ] Dossier dans src/features/
- [ ] Structure : Screen + components/ + hooks/
- [ ] index.ts avec exports
- [ ] Navigation configuree
- [ ] Types definis si necessaire
