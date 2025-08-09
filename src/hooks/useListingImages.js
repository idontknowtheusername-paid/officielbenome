import { useMemo } from 'react';

export const useListingImages = (listing) => {
  const images = useMemo(() => {
    // Si l'annonce a des images, les utiliser
    if (listing?.images && listing.images.length > 0) {
      return listing.images;
    }

    // Images par défaut selon la catégorie
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

    return defaultImages[category] || defaultImages.marketplace;
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