# Étape de construction
FROM node:18-alpine AS builder

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le reste du code source
COPY . .

# Compiler l'application si nécessaire
RUN npm run build

# Étape de production
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Installer les dépendances de production uniquement
RUN npm ci --only=production

# Exposer le port de l'application
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
