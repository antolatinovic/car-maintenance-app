#!/bin/bash
# Car Maintenance App - Setup Script
# Usage: ./setup.sh

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  Car Maintenance App - Setup"
echo "================================"
echo ""

# 1. Verifier/Installer Homebrew
echo "Verification de Homebrew..."
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}-> Installation de Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Ajouter Homebrew au PATH si necessaire (Apple Silicon)
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo -e "${GREEN}[OK] Homebrew installe${NC}"
fi

# 2. Verifier/Installer Node.js via Homebrew
echo ""
echo "Verification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}-> Installation de Node.js 20...${NC}"
    brew install node@20 || true
    brew link node@20 2>/dev/null || true
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}[OK] Node.js $NODE_VERSION installe${NC}"
fi

# 3. Verifier/Installer Watchman (ameliore les performances d'Expo)
echo ""
echo "Verification de Watchman..."
if ! command -v watchman &> /dev/null; then
    echo -e "${YELLOW}-> Installation de Watchman...${NC}"
    brew install watchman || true
    # Verifier si l'installation a reussi malgre les erreurs de lien
    if command -v watchman &> /dev/null || [[ -f "/usr/local/bin/watchman" ]]; then
        echo -e "${GREEN}[OK] Watchman installe${NC}"
    fi
else
    echo -e "${GREEN}[OK] Watchman installe${NC}"
fi

# 4. Verifier/Installer GitHub CLI (optionnel mais utile)
echo ""
echo "Verification de GitHub CLI..."
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}-> Installation de GitHub CLI...${NC}"
    brew install gh || true
else
    echo -e "${GREEN}[OK] GitHub CLI installe${NC}"
fi

# 5. Installer les dependances npm
echo ""
echo "================================"
echo "Installation des dependances npm..."
echo ""

cd "$SCRIPT_DIR/CarMaintenanceExpo"

if [[ -f "package-lock.json" ]]; then
    npm ci
else
    npm install
fi

# 6. Resume
echo ""
echo "================================"
echo -e "${GREEN}[OK] Setup termine avec succes !${NC}"
echo "================================"
echo ""
echo "Pour lancer l'application :"
echo ""
echo "  cd CarMaintenanceExpo"
echo "  npm start"
echo ""
echo "Commandes disponibles :"
echo "  npm start      - Demarrer Expo"
echo "  npm run ios    - Lancer sur simulateur iOS"
echo "  npm run android - Lancer sur emulateur Android"
echo "  npm run web    - Lancer sur navigateur web"
echo ""
