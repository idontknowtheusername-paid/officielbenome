#!/bin/bash

# Affiche les informations de débogage
echo "=== Démarrage de l'application ==="
echo "Répertoire courant: $(pwd)"
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Vérifie si le répertoire backend existe
if [ -d "backend" ]; then
  echo "Dossier backend trouvé, navigation vers le dossier backend..."
  cd backend
  
  # Vérifie si le script start.sh existe
  if [ -f "start.sh" ]; then
    echo "Exécution de start.sh..."
    chmod +x start.sh
    ./start.sh
  else
    echo "start.sh non trouvé, tentative de démarrage direct avec Node.js..."
    npm start
  fi
else
  echo "Erreur: Dossier backend introuvable!"
  echo "Contenu du répertoire:"
  ls -la
  exit 1
fi
