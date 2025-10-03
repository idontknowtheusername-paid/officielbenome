/**
 * Configuration des slides du Hero Carousel
 * Images statiques pour performance optimale (0 requête DB)
 */

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Trouvez votre bien idéal',
    subtitle: 'Des milliers d\'annonces immobilières à découvrir',
    category: 'real_estate',
    categoryLabel: 'Immobilier',
    categoryIcon: '🏠',
    image: '/hero-slides/slide-1.jpg',
    // Fallback: gradient si l'image n'est pas encore uploadée
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
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
    image: '/hero-slides/slide-2.jpg',
    gradient: 'from-green-600 via-green-500 to-emerald-500',
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
    image: '/hero-slides/slide-3.jpg',
    gradient: 'from-purple-600 via-purple-500 to-pink-500',
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
    image: '/hero-slides/slide-4.jpg',
    gradient: 'from-orange-600 via-orange-500 to-yellow-500',
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
    image: '/hero-slides/slide-5.jpg',
    gradient: 'from-indigo-600 via-indigo-500 to-blue-500',
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
    image: '/hero-slides/slide-6.jpg',
    gradient: 'from-pink-600 via-rose-500 to-red-500',
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
