---
inclusion: always
---

# Contexte du Projet MaxiMarket

## Stack Technique
- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Paiements**: Lygos (Mobile Money Afrique)
- **Emails**: Brevo (anciennement Sendinblue)
- **Déploiement**: Vercel

## Architecture
- `/src/pages` - Pages de l'application
- `/src/components` - Composants réutilisables
- `/src/services` - Services API et logique métier
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utilitaires et configurations
- `/src/contexts` - Contexts React (Auth, Theme)

## Règles de Code
- Toujours importer React en premier dans les fichiers .jsx
- Utiliser les hooks personnalisés pour la logique réutilisable
- Préférer les composants fonctionnels avec hooks
- Utiliser React Query pour le cache et les requêtes
- Gérer les erreurs avec try/catch et toast notifications

## Monnaie
- Utiliser **XOF** (Franc CFA) pour tous les prix
- Format: `1 000 XOF` (espace comme séparateur de milliers)

## Langue
- Interface en **français**
- Vouvoiement pour les communications formelles
