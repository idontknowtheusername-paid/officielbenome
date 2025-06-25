#!/bin/bash

# Définit le mode bash pour s'arrêter en cas d'erreur
set -e

# Affiche la version de Node.js
echo "Node.js version: $(node -v)"

# Affiche la version de npm
echo "npm version: $(npm -v)"

# Affiche les variables d'environnement
echo "Environment variables:"
echo "NODE_ENV: ${NODE_ENV}"
echo "PORT: ${PORT}"

# Installe les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Exécute la commande de démarrage
echo "Starting the application..."
exec node server.js
