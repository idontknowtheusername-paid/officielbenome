# 📊 Sections HomePage - Configuration Optimisée

## Vue d'ensemble

La HomePage affiche 4 sections distinctes avec des stratégies de rotation et d'affichage optimisées pour éviter les doublons et maximiser la visibilité.

---

## 🎠 1. Hero Carousel (Haut de page)

**Fonction**: `getHeroListings(6)`  
**Nombre d'annonces**: 6  
**Stratégie**: Rotation horaire intelligente par catégorie  
**Cache**: 30 minutes

### Rotation par heure
- **6h-12h** : Immobilier (recherche de logements le matin)
- **12h-18h** : Automobile (achats/ventes l'après-midi)  
- **18h-22h** : Marketplace (achats en ligne le soir)
- **22h-6h** : Services (services professionnels la nuit)

### Système de fallback (5 niveaux)
1. Annonces premium de la catégorie actuelle
2. Annonces populaires de la catégorie actuelle
3. Annonces premium d'autres catégories
4. Annonces récentes de toutes catégories
5. Données de test (si aucune annonce)

---

## ⭐ 2. Annonces Premium

**Fonction**: `getPremiumListings(10)`  
**Nombre d'annonces**: 10  
**Stratégie**: Rotation quotidienne équitable  
**Cache**: 25 minutes

### Critères d'affichage
- `is_featured = true` OU `is_boosted = true`
- `status = 'approved'` uniquement
- Rotation basée sur le jour de l'année pour équité

### Score premium (pour tri)
- Priorité du package (40%)
- Type de premium (30%)
- Temps restant (20%)
- Fréquence de mise à jour (10%)

---

## 🔥 3. Annonces Populaires

**Fonction**: `getTopViewedListings(10)`  
**Nombre d'annonces**: 10 ✅ (augmenté de 6 à 10)  
**Stratégie**: Tri par nombre de vues  
**Cache**: 20 minutes

### Critères d'affichage
- **EXCLUT** les annonces premium (`is_featured = false` ET `is_boosted = false`)
- Triées par `views_count` décroissant
- `status = 'approved'` uniquement
- **Évite le double affichage** avec la section Premium

### Grid responsive
- Mobile: 2 colonnes
- Tablet: 2 colonnes
- Desktop: 3 colonnes
- XL: 5 colonnes

---

## ✨ 4. Nouvelles Annonces

**Fonction**: `getAllListings({ limit: 50 })`  
**Nombre d'annonces**: 50 chargées, 10 affichées à la fois  
**Stratégie**: Rotation horaire automatique ✅  
**Cache**: Aucun (données fraîches)

### Critères d'affichage
- **EXCLUT** les annonces premium (`is_featured = false` ET `is_boosted = false`) ✅
- Triées par `created_at` décroissant (les plus récentes)
- Affiche 10 annonces à la fois
- **Rotation horaire** : Change toutes les heures selon l'heure actuelle ✅
- Badge "Nouveau" vert sur chaque carte

### Rotation horaire
```javascript
// L'index change selon l'heure (0-23h)
const hourOfDay = new Date().getHours();
const totalPages = Math.ceil(listings.length / 10);
const pageIndex = hourOfDay % totalPages;
```

### Grid responsive
- Mobile: 2 colonnes (2x2)
- Desktop: 4 colonnes

### Indicateurs de pagination
- Points cliquables en bas
- Point actif plus large et coloré
- Navigation manuelle possible

---

## 🎯 Résumé des optimisations

### Éviter les doublons
1. **Premium** : Affiche uniquement `is_featured` OU `is_boosted`
2. **Populaires** : Exclut les premium (`is_featured = false` ET `is_boosted = false`)
3. **Nouvelles** : Exclut les premium (`is_featured = false` ET `is_boosted = false`)
4. **Hero** : Peut contenir des premium (priorité haute)

### Stratégies de rotation
- **Hero** : Rotation horaire par catégorie (change chaque heure)
- **Premium** : Rotation quotidienne (change chaque jour)
- **Populaires** : Tri fixe par vues (pas de rotation)
- **Nouvelles** : Rotation horaire (change chaque heure)

### Performance
- Cache intelligent avec TTL optimisés
- Chargement progressif (Hero → Populaires + Premium en parallèle)
- Préchargement des images hero
- Vérification automatique du cache toutes les 10 minutes

---

## 📈 Statistiques d'affichage

| Section | Nombre | Rotation | Cache | Exclut Premium |
|---------|--------|----------|-------|----------------|
| Hero | 6 | Horaire | 30min | Non |
| Premium | 10 | Quotidienne | 25min | N/A |
| Populaires | 10 | Aucune | 20min | ✅ Oui |
| Nouvelles | 10/50 | Horaire | Non | ✅ Oui |

**Total affiché simultanément** : 36 annonces  
**Total unique** : Aucun doublon entre Premium/Populaires/Nouvelles

---

## 🔧 Fichiers modifiés

1. `src/pages/HomePage.jsx` - Grid populaires 3→5 colonnes XL, limit 6→10
2. `src/hooks/useHomePageData.js` - Limit populaires 6→10
3. `src/services/listing.service.js` - Limit populaires 6→10
4. `src/services/cachedListingService.js` - Limit populaires 6→10
5. `src/components/NewListingsSection.jsx` - Exclusion premium + rotation horaire

---

## ✅ Validation

- [x] Populaires passés de 6 à 10 annonces
- [x] Nouvelles annonces excluent les premium
- [x] Rotation horaire au lieu de 5 secondes
- [x] Aucun doublon entre sections
- [x] Performance optimisée avec cache
- [x] Grid responsive adapté

Date de mise à jour : 29 novembre 2025
