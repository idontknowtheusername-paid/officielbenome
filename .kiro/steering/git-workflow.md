---
inclusion: always
---

# Workflow Git

## Messages de commit
Format: `type: description courte`

Types:
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `refactor:` - Refactoring sans changement de fonctionnalité
- `style:` - Changements de style (CSS, formatting)
- `docs:` - Documentation uniquement
- `chore:` - Tâches de maintenance

Exemples:
- `feat: ajout système de paiement Lygos`
- `fix: correction erreur import React`
- `refactor: optimisation composant MessageList`

## Avant de commit
1. Vérifier les fichiers modifiés: `git status`
2. Tester que l'app fonctionne
3. Pas de `console.log` oubliés
4. Pas de fichiers de test temporaires

## Fichiers à ne JAMAIS commiter
- `.env.local` (déjà dans .gitignore)
- `node_modules/` (déjà dans .gitignore)
- Fichiers de backup (*.backup, *.old)
- Fichiers temporaires de l'IDE

## Branches
- `main` - Production stable
- `dev` - Développement en cours
- `feature/*` - Nouvelles fonctionnalités
- `fix/*` - Corrections de bugs

## En cas de problème
- Revenir en arrière: `git reset --hard <commit>`
- Annuler dernier commit: `git reset --soft HEAD~1`
- Forcer le push (avec précaution): `git push --force`
