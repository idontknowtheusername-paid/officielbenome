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

/**
 * Optimise une URL d'image selon le contexte d'utilisation
 * @param {string} url - URL de l'image originale
 * @param {string} context - Contexte d'utilisation ('thumbnail', 'card', 'gallery', 'fullscreen', 'hero')
 * @param {string} quality - Qualité souhaitée ('low', 'medium', 'high')
 * @returns {string} URL optimisée
 */
export const optimizeImageUrl = (url, context = 'gallery', quality = 'medium') => {
  if (!url) return url;

  const size = IMAGE_SIZES[context] || IMAGE_SIZES.gallery;
  const qualityValue = QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.medium;

  // Optimisation pour Unsplash
  if (url.includes('unsplash.com')) {
    return `${url}?w=${size.width}&h=${size.height}&fit=crop&q=${qualityValue}&auto=format&fm=webp`;
  }

  // Optimisation pour Cloudinary
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${size.width},h_${size.height},c_fill,q_${qualityValue},f_auto/`);
  }

  // Optimisation pour ImageKit
  if (url.includes('imagekit.io')) {
    return `${url}?tr=w-${size.width},h-${size.height},c-at_max,q-${qualityValue}`;
  }

  // Optimisation générique pour les CDN
  if (url.includes('cdn.') || url.includes('static.')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${size.width}&h=${size.height}&q=${qualityValue}`;
  }

  // Retourner l'URL originale si aucun pattern reconnu
  return url;
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