#!/bin/bash

# Script de déploiement automatisé pour Vercel
# Usage: ./scripts/deploy-vercel.sh

set -e

echo "🚀 Démarrage du déploiement Vercel pour MaxiMarket..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
rm -rf dist/ build/ .vercel/

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

# Build de production
echo "🏗️ Build de production..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le build a échoué"
    exit 1
fi

echo "✅ Build réussi !"

# Déploiement sur Vercel
echo "🚀 Déploiement sur Vercel..."
vercel --prod --yes

echo "🎉 Déploiement terminé avec succès !"
echo "🌐 Votre application est maintenant en ligne sur Vercel"
echo "📊 Consultez le dashboard Vercel pour plus de détails"
