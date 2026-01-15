# Car Maintenance App

Application mobile de suivi d'entretien automobile. Gerez vos vehicules, planifiez les maintenances et suivez vos depenses.

## Technologies

- **Frontend**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Navigation**: React Navigation v7

## Setup rapide

### Prerequis

- macOS
- Xcode (pour iOS) ou Android Studio (pour Android)

### Installation

```bash
# Cloner le projet (ou synchroniser via iCloud)
git clone https://github.com/antolatinovic/car-maintenance-app.git

# Lancer le setup automatique
cd car-maintenance-app
./setup.sh
```

Le script installe automatiquement :
- Homebrew
- Node.js 20
- Watchman
- Dependances npm

### Lancer l'application

```bash
cd CarMaintenanceExpo
npm start
```

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Demarre le serveur Expo |
| `npm run ios` | Lance sur simulateur iOS |
| `npm run android` | Lance sur emulateur Android |
| `npm run web` | Lance sur navigateur web |

## Structure du projet

```
Mobile App car/
├── CarMaintenanceExpo/     # Application React Native (principal)
│   ├── src/
│   │   ├── core/           # Config, theme, types
│   │   ├── features/       # Ecrans et composants par feature
│   │   ├── shared/         # Composants reutilisables
│   │   └── navigation/     # Configuration navigation
│   ├── App.tsx             # Point d'entree
│   └── package.json
│
├── CarMaintenanceApp/      # Version SwiftUI (iOS natif)
├── supabase/               # Schema de base de donnees
├── PRD/                    # Documentation produit
└── setup.sh                # Script de setup automatique
```

## Base de donnees

Le projet utilise Supabase avec les tables suivantes :
- `profiles` - Profils utilisateurs
- `vehicles` - Vehicules
- `maintenance_history` - Historique des maintenances
- `maintenance_schedule` - Planning des maintenances
- `expenses` - Suivi des depenses
- `documents` - Factures et documents

## Multi-Mac

Le dossier est synchronise via iCloud Drive. Sur un nouveau Mac :

```bash
cd "/Users/Antonin/Documents/ClaudeCode/projects/Mobile App car"
./setup.sh
```

## Liens

- [Repository GitHub](https://github.com/antolatinovic/car-maintenance-app)
- [Supabase Dashboard](https://supabase.com/dashboard)
