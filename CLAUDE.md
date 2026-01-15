# Car Maintenance App - Guide de Developpement

Ce fichier definit les conventions et l'architecture du projet. Il est lu automatiquement par Claude Code a chaque session.

## Architecture du Projet

```
CarMaintenanceExpo/
├── src/
│   ├── core/                 # Configuration et theme centralises
│   │   ├── config/          # Supabase, API configs
│   │   ├── theme/           # colors, spacing, typography
│   │   └── types/           # Types TypeScript
│   │
│   ├── features/            # Modules fonctionnels (1 dossier = 1 feature)
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── components/  # Composants specifiques a la feature
│   │   │   ├── hooks/       # Custom hooks de la feature
│   │   │   └── index.ts
│   │   ├── documents/       # (a implementer)
│   │   ├── assistant/       # (a implementer)
│   │   ├── calendar/        # (a implementer)
│   │   └── settings/        # (a implementer)
│   │
│   ├── shared/              # Composants reutilisables
│   │   └── components/
│   │
│   ├── navigation/          # Configuration React Navigation
│   │
│   └── services/            # Logique metier, appels API
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
3. Core (theme, config, types)
4. Shared components
5. Feature components
6. Types locaux

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
npm start          # Demarrer Expo
npm run ios        # Simulateur iOS
npm run android    # Emulateur Android
npm run web        # Navigateur
```

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
