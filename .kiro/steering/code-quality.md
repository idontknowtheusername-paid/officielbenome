---
inclusion: always
---

# Règles de Qualité de Code

## Avant toute modification
1. **Lire le fichier complet** avant de modifier
2. **Vérifier les dépendances** et imports existants
3. **Tester mentalement** l'impact des changements

## Modifications de code
- **Minimal et ciblé**: Ne modifier QUE ce qui est nécessaire
- **Pas de refactoring** non demandé
- **Préserver la logique** existante sauf si explicitement demandé
- **Garder le style** de code existant (indentation, conventions)

## Imports React
- **TOUJOURS** mettre `import React` en PREMIÈRE ligne des fichiers .jsx
- Ordre des imports:
  1. React et hooks React
  2. Bibliothèques tierces (react-router, etc.)
  3. Composants locaux
  4. Services et utils
  5. Styles

## Gestion d'erreurs
- Utiliser `try/catch` pour les opérations async
- Afficher les erreurs avec `toast` (useToast hook)
- Logger les erreurs en dev avec `console.error`
- Ne jamais laisser une erreur silencieuse

## Performance
- Utiliser `memo` pour les composants lourds
- `useMemo` et `useCallback` pour les calculs/fonctions coûteux
- Lazy loading pour les pages avec `React.lazy()`
- Optimiser les images (WebP, lazy loading)

## Tests avant commit
- Vérifier que le dev server démarre sans erreur
- Tester la fonctionnalité modifiée
- Vérifier qu'aucune régression n'est introduite
