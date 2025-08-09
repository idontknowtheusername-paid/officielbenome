# Système de Galerie d'Images MaxiMarket

## Vue d'ensemble

Le système de galerie d'images de MaxiMarket offre une expérience utilisateur complète avec navigation tactile, clavier et souris. Il comprend deux composants principaux :

1. **ImageGallery** - Galerie complète pour les pages de détail
2. **MiniImageGallery** - Galerie compacte pour les cartes d'annonces

## Composants

### ImageGallery

**Fichier :** `src/components/ImageGallery.jsx`

**Fonctionnalités :**
- ✅ Navigation par flèches (gauche/droite)
- ✅ Swiping tactile (mobile)
- ✅ Navigation clavier (flèches, échap, espace)
- ✅ Mode plein écran avec zoom
- ✅ Indicateurs de navigation
- ✅ Compteur d'images
- ✅ Animations fluides avec Framer Motion
- ✅ Support drag & drop en mode zoom
- ✅ Instructions utilisateur

**Utilisation :**
```jsx
import ImageGallery from '@/components/ImageGallery';

<ImageGallery 
  images={images} 
  title="Titre de l'annonce"
/>
```

**Contrôles :**
- **Souris :** Clic pour plein écran, flèches au survol
- **Clavier :** ← → Navigation, Échap fermer, Espace zoom
- **Tactile :** Swipe gauche/droite
- **Zoom :** Clic sur image ou bouton zoom

### MiniImageGallery

**Fichier :** `src/components/MiniImageGallery.jsx`

**Fonctionnalités :**
- ✅ Auto-play au survol
- ✅ Navigation par flèches
- ✅ Indicateurs compacts
- ✅ Compteur d'images
- ✅ Transitions fluides

**Utilisation :**
```jsx
import MiniImageGallery from '@/components/MiniImageGallery';

<MiniImageGallery 
  images={images} 
  title="Titre de l'annonce"
  className="h-48"
/>
```

## Hook useListingImages

**Fichier :** `src/hooks/useListingImages.js`

**Fonctionnalités :**
- ✅ Gestion centralisée des images d'annonces
- ✅ Images par défaut par catégorie
- ✅ Mapping des catégories
- ✅ Optimisation des performances

**Utilisation :**
```jsx
import { useListingImages } from '@/hooks';

const { images, mainImage, hasMultipleImages, imageCount } = useListingImages(listing);
```

**Retour :**
- `images` : Tableau d'images (réelles ou par défaut)
- `mainImage` : Première image
- `hasMultipleImages` : Booléen si plusieurs images
- `imageCount` : Nombre total d'images

## Images par Défaut

### Immobilier
- Appartement moderne
- Maison avec jardin
- Intérieur élégant
- Vue extérieure

### Automobile
- Voiture moderne
- Véhicule de luxe
- Détails moteur
- Vue latérale

### Services
- Bureau professionnel
- Outils de travail
- Équipement spécialisé
- Environnement de travail

### Marketplace
- Produits divers
- Articles de consommation
- Électronique
- Mode et accessoires

## Intégration

### Pages de Détail
```jsx
// ListingDetailPage.jsx
import ImageGallery from '@/components/ImageGallery';
import { useListingImages } from '@/hooks';

const { images } = useListingImages(listing);

<ImageGallery images={images} title={listing.title} />
```

### Cartes d'Annonces
```jsx
// ListingCard.jsx
import MiniImageGallery from '@/components/MiniImageGallery';
import { useListingImages } from '@/hooks';

const { images } = useListingImages(listing);

<MiniImageGallery images={images} title={listing.title} />
```

### Dashboard Admin
```jsx
// dashboard/ListingCard.jsx
import MiniImageGallery from '@/components/MiniImageGallery';

<MiniImageGallery 
  images={listing.images || [listing.image]}
  title={listing.title}
  className="h-48"
/>
```

## Responsive Design

### Mobile
- Swiping tactile optimisé
- Boutons tactiles plus grands
- Interface simplifiée

### Desktop
- Navigation au survol
- Contrôles clavier complets
- Interface riche

### Tablette
- Support hybride
- Adaptation automatique
- Expérience optimisée

## Performance

### Optimisations
- ✅ Lazy loading des images
- ✅ Mémoisation avec useMemo
- ✅ Composants optimisés
- ✅ Gestion d'état efficace

### Chargement
- Images par défaut immédiates
- Images réelles en arrière-plan
- Transitions fluides
- Fallback gracieux

## Accessibilité

### Support Clavier
- Navigation complète
- Raccourcis intuitifs
- Focus visible
- Annonces d'état

### Lecteurs d'Écran
- Labels descriptifs
- Rôles ARIA appropriés
- Navigation logique
- Informations contextuelles

### Contraste
- Interface haute visibilité
- Textes lisibles
- Indicateurs clairs
- Adaptation automatique

## Maintenance

### Ajout d'Images
1. Modifier `useListingImages.js`
2. Ajouter URLs dans `defaultImages`
3. Tester sur toutes les catégories

### Modification de l'Interface
1. Éditer `ImageGallery.jsx` ou `MiniImageGallery.jsx`
2. Tester responsive
3. Vérifier accessibilité

### Nouvelles Catégories
1. Ajouter dans `useListingImages.js`
2. Définir images par défaut
3. Tester intégration

## Dépannage

### Problèmes Courants

**Images ne s'affichent pas :**
- Vérifier URLs dans `useListingImages.js`
- Contrôler format des images
- Tester fallback

**Navigation ne fonctionne pas :**
- Vérifier événements tactiles
- Contrôler gestion clavier
- Tester sur différents appareils

**Performance lente :**
- Optimiser taille des images
- Vérifier lazy loading
- Contrôler re-renders

### Debug
```jsx
// Activer logs de debug
console.log('Images:', images);
console.log('Current index:', currentIndex);
console.log('Is fullscreen:', isFullscreen);
```

## Évolutions Futures

### Fonctionnalités Prévues
- [ ] Upload d'images multiples
- [ ] Redimensionnement automatique
- [ ] Compression intelligente
- [ ] Cache d'images
- [ ] Préchargement
- [ ] Mode diaporama
- [ ] Partage d'images
- [ ] Filtres et effets

### Améliorations Techniques
- [ ] WebP support
- [ ] Service Worker cache
- [ ] Lazy loading avancé
- [ ] Optimisation réseau
- [ ] Métriques de performance

---

**Dernière mise à jour :** Décembre 2024  
**Version :** 1.0.0  
**Auteur :** Équipe MaxiMarket 