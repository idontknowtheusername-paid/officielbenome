// Configuration des tailles d'images par contexte
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  card: { width: 400, height: 300 },
  gallery: { width: 800, height: 600 },
  fullscreen: { width: 1200, height: 900 },
  hero: { width: 1920, height: 1080 }
};

// Configuration de la qualité par contexte
const QUALITY_SETTINGS = {
  low: 60,
  medium: 80,
  high: 95
};

// Optimisation d'images pour de meilleures performances
export const optimizeImageUrl = (url, context = 'gallery', quality = 'medium') => {
  if (!url) return url;

  // Si c'est déjà une URL optimisée, la retourner
  if (url.includes('unsplash.com') || url.includes('cloudinary.com')) {
    return url;
  }

  // Paramètres d'optimisation selon le contexte
  const optimizationParams = {
    hero: {
      width: 1920,
      height: 1080,
      quality: 85,
      format: 'webp'
    },
    gallery: {
      width: 800,
      height: 600,
      quality: 80,
      format: 'webp'
    },
    thumbnail: {
      width: 400,
      height: 300,
      quality: 75,
      format: 'webp'
    },
    avatar: {
      width: 150,
      height: 150,
      quality: 80,
      format: 'webp'
    }
  };

  const params = optimizationParams[context] || optimizationParams.gallery;

  // Si c'est une URL locale ou relative, la retourner telle quelle
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url;
  }

  // Pour les URLs externes, essayer d'optimiser
  try {
    const urlObj = new URL(url);
    
    // Si c'est une image Unsplash, optimiser
    if (urlObj.hostname.includes('unsplash.com')) {
      urlObj.searchParams.set('w', params.width);
      urlObj.searchParams.set('h', params.height);
      urlObj.searchParams.set('q', params.quality);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      return urlObj.toString();
    }

    // Si c'est une image Cloudinary, optimiser
    if (urlObj.hostname.includes('cloudinary.com')) {
      const pathParts = urlObj.pathname.split('/');
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1) {
        pathParts.splice(uploadIndex + 1, 0, `f_${params.format},q_${params.quality},w_${params.width},h_${params.height},c_fill`);
        urlObj.pathname = pathParts.join('/');
        return urlObj.toString();
      }
    }

    // Pour les autres URLs, retourner l'original
    return url;
  } catch (error) {
    // Si l'URL n'est pas valide, retourner l'original
    return url;
  }
};

/**
 * Génère une URL d'image responsive avec plusieurs tailles
 * @param {string} url - URL de l'image originale
 * @param {string} quality - Qualité souhaitée
 * @returns {object} URLs pour différentes tailles d'écran
 */
export const generateResponsiveImageUrls = (url, quality = 'medium') => {
  return {
    mobile: optimizeImageUrl(url, 'card', quality),
    tablet: optimizeImageUrl(url, 'gallery', quality),
    desktop: optimizeImageUrl(url, 'fullscreen', quality),
    large: optimizeImageUrl(url, 'hero', quality)
  };
};

/**
 * Crée un srcset pour les images responsives
 * @param {string} url - URL de l'image originale
 * @param {string} quality - Qualité souhaitée
 * @returns {string} Attribut srcset
 */
export const generateSrcSet = (url, quality = 'medium') => {
  const urls = generateResponsiveImageUrls(url, quality);
  return `${urls.mobile} 400w, ${urls.tablet} 800w, ${urls.desktop} 1200w, ${urls.large} 1920w`;
};

/**
 * Optimise une liste d'images pour un contexte donné
 * @param {Array} images - Liste d'URLs d'images
 * @param {string} context - Contexte d'utilisation
 * @param {string} quality - Qualité souhaitée
 * @returns {Array} Liste d'URLs optimisées
 */
export const optimizeImageList = (images, context = 'gallery', quality = 'medium') => {
  if (!Array.isArray(images)) return [];
  
  return images.map(url => optimizeImageUrl(url, context, quality));
};

/**
 * Détecte automatiquement le meilleur format d'image selon le navigateur
 * @returns {string} Format recommandé ('webp', 'avif', 'jpeg')
 */
export const getOptimalImageFormat = () => {
  if (typeof window === 'undefined') return 'webp';
  
  // Vérifier le support AVIF
  const avifSupported = document.createElement('canvas')
    .toDataURL('image/avif')
    .indexOf('data:image/avif') === 0;
  
  if (avifSupported) return 'avif';
  
  // Vérifier le support WebP
  const webpSupported = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
  
  if (webpSupported) return 'webp';
  
  return 'jpeg';
};

/**
 * Calcule la taille optimale d'image selon la densité de pixels
 * @param {number} baseWidth - Largeur de base
 * @param {number} baseHeight - Hauteur de base
 * @returns {object} Dimensions optimisées
 */
export const calculateOptimalSize = (baseWidth, baseHeight) => {
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const maxPixelRatio = Math.min(pixelRatio, 3); // Limiter à 3x pour éviter les images trop grandes
  
  return {
    width: Math.round(baseWidth * maxPixelRatio),
    height: Math.round(baseHeight * maxPixelRatio)
  };
};

/**
 * Crée une URL d'image avec format automatique
 * @param {string} url - URL de l'image originale
 * @param {string} context - Contexte d'utilisation
 * @param {string} quality - Qualité souhaitée
 * @returns {string} URL optimisée avec format automatique
 */
export const optimizeImageUrlWithAutoFormat = (url, context = 'gallery', quality = 'medium') => {
  const optimizedUrl = optimizeImageUrl(url, context, quality);
  const format = getOptimalImageFormat();
  
  // Ajouter le format automatique si supporté
  if (format === 'webp' || format === 'avif') {
    const separator = optimizedUrl.includes('?') ? '&' : '?';
    return `${optimizedUrl}${separator}fm=${format}`;
  }
  
  return optimizedUrl;
}; 

// Fonction pour précharger les images importantes
export const preloadImage = (src) => {
  if (!src) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

// Fonction pour optimiser les images en arrière-plan
export const optimizeBackgroundImage = (url) => {
  return optimizeImageUrl(url, 'hero', 'high');
};

// Fonction pour créer des placeholders optimisés
export const createImagePlaceholder = (width = 400, height = 300) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3EChargement...%3C/text%3E%3C/svg%3E`;
}; 