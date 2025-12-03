/**
 * Configuration des slides du Hero Carousel
 * Mockups CSS/SVG intégrés (aucune image externe nécessaire)
 */

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Trouvez votre bien idéal',
    subtitle: 'Des milliers d\'annonces immobilières à découvrir',
    category: 'real_estate',
    categoryLabel: 'Immobilier',
    categoryIcon: '🏠',
    mockupType: 'gradient-pattern',
    gradient: 'from-gray-100 via-gray-200 to-slate-300 dark:from-gray-900 dark:via-slate-800 dark:to-black',
    pattern: 'dots',
    ctaText: 'Voir les annonces',
    ctaLink: '/marketplace/real-estate'
  },
  {
    id: 'slide-2',
    title: 'Votre voiture vous attend',
    subtitle: 'Large sélection de véhicules d\'occasion et neufs',
    category: 'automobile',
    categoryLabel: 'Automobile',
    categoryIcon: '🚗',
    mockupType: 'gradient-pattern',
    gradient: 'from-blue-50 via-blue-100 to-white dark:from-blue-900 dark:via-blue-950 dark:to-black',
    pattern: 'grid',
    ctaText: 'Découvrir',
    ctaLink: '/marketplace/automobile'
  },
  {
    id: 'slide-3',
    title: 'Services professionnels',
    subtitle: 'Trouvez le prestataire qu\'il vous faut',
    category: 'services',
    categoryLabel: 'Services',
    categoryIcon: '🔧',
    mockupType: 'gradient-pattern',
    gradient: 'from-gray-100 via-gray-200 to-slate-300 dark:from-gray-900 dark:via-slate-800 dark:to-black',
    pattern: 'diagonal',
    ctaText: 'Explorer',
    ctaLink: '/marketplace/services'
  },
  {
    id: 'slide-4',
    title: 'Marketplace générale',
    subtitle: 'Des milliers d\'articles à petits prix',
    category: 'marketplace',
    categoryLabel: 'Marketplace',
    categoryIcon: '🛍️',
    mockupType: 'gradient-pattern',
    gradient: 'from-blue-50 via-blue-100 to-white dark:from-blue-900 dark:via-blue-950 dark:to-black',
    pattern: 'waves',
    ctaText: 'Parcourir',
    ctaLink: '/marketplace'
  },
  {
    id: 'slide-5',
    title: 'Vendre facilement',
    subtitle: 'Publiez votre annonce en quelques clics',
    category: 'general',
    categoryLabel: 'Vendre',
    categoryIcon: '💼',
    mockupType: 'gradient-pattern',
    gradient: 'from-gray-100 via-gray-200 to-slate-300 dark:from-gray-900 dark:via-slate-800 dark:to-black',
    pattern: 'circles',
    ctaText: 'Créer une annonce',
    ctaLink: '/creer-annonce'
  },
  {
    id: 'slide-6',
    title: 'Découvrez MaxiMarket',
    subtitle: 'La plateforme de confiance pour acheter et vendre',
    category: 'general',
    categoryLabel: 'À propos',
    categoryIcon: '⭐',
    mockupType: 'gradient-pattern',
    gradient: 'from-blue-50 via-blue-100 to-white dark:from-blue-900 dark:via-blue-950 dark:to-black',
    pattern: 'mesh',
    ctaText: 'En savoir plus',
    ctaLink: '/a-propos'
  }
];

/**
 * Configuration du carousel
 */
export const CAROUSEL_CONFIG = {
  autoPlayInterval: 8000, // 8 secondes
  transitionDuration: 800, // 0.8 secondes
  pauseOnHover: true,
  showNavigation: true,
  showIndicators: true,
  loop: true
};

/**
 * Obtenir la couleur de catégorie
 */
export const getCategoryColor = (category) => {
  switch (category) {
    case 'real_estate': return 'bg-blue-500';
    case 'automobile': return 'bg-green-500';
    case 'services': return 'bg-purple-500';
    case 'marketplace': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

/**
 * Vérifier si une image existe
 */
export const checkImageExists = (imagePath) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};
