import { useMemo } from 'react';
import { optimizeImageList } from '@/utils/imageOptimizer';

export const useListingImages = (listing) => {
  const images = useMemo(() => {
    // Si l'annonce a des images, les utiliser en priorité
    if (listing?.images && listing.images.length > 0) {
      // Filtrer et valider les images
      const validImages = listing.images
        .map(img => {
          // Si c'est une chaîne (URL directe)
          if (typeof img === 'string') return img;
          
          // Si c'est un objet avec une URL
          if (img?.url) return img.url;
          
          // Si c'est un objet avec un fichier (preview)
          if (img?.file) return URL.createObjectURL(img.file);
          
          // Si c'est un objet avec une source
          if (img?.src) return img.src;
          
          // Si c'est un objet avec displayUrl
          if (img?.displayUrl) return img.displayUrl;
          
          return null;
        })
        .filter(Boolean);
      
      // Si on a des images valides, les retourner
      if (validImages.length > 0) {
        return validImages;
      }
    }

    // Images par défaut selon la catégorie (fallback)
    const defaultImages = {
      real_estate: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop'
      ],
      automobile: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
      ],
      services: [
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      ],
      marketplace: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
      ]
    };

    // Déterminer la catégorie
    let category = listing?.category;
    
    // Mapper les catégories du dashboard vers les catégories standard
    if (category) {
      const categoryMap = {
        'immobilier': 'real_estate',
        'automobile': 'automobile',
        'services': 'services',
        'marketplace': 'marketplace'
      };
      category = categoryMap[category.toLowerCase()] || category;
    }

    const rawImages = defaultImages[category] || defaultImages.marketplace;
    
    // Optimiser les images selon le contexte
    return optimizeImageList(rawImages, 'gallery', 'medium');
  }, [listing?.images, listing?.category]);

  const mainImage = useMemo(() => images[0], [images]);
  const hasMultipleImages = useMemo(() => images.length > 1, [images]);

  return {
    images,
    mainImage,
    hasMultipleImages,
    imageCount: images.length
  };
}; 