// Google Analytics 4 - Événements personnalisés pour MaxiMarket

// Initialiser Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('Google Analytics initialisé');
  }
};

// Événements de navigation
export const trackPageView = (page_title, page_location) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title,
      page_location,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de recherche
export const trackSearch = (search_term, category = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term,
      category,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de création d'annonce
export const trackListingCreated = (category, price = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'listing_created', {
      category,
      price,
      currency: 'XOF',
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de vue d'annonce
export const trackListingView = (listing_id, category, price = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'listing_view', {
      listing_id,
      category,
      price,
      currency: 'XOF',
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de contact
export const trackContact = (contact_type, listing_id = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'contact', {
      contact_type, // 'phone', 'whatsapp', 'email', 'form'
      listing_id,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements d'inscription
export const trackSignUp = (method = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de connexion
export const trackLogin = (method = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de favoris
export const trackFavorite = (action, listing_id, category) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'favorite', {
      action, // 'add', 'remove'
      listing_id,
      category,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de paiement
export const trackPayment = (amount, currency = 'XOF', method = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      value: amount,
      currency,
      payment_method: method,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements d'erreur
export const trackError = (error_type, error_message) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error_message,
      fatal: false,
      send_to: 'G-9W7H5FEHVF'
    });
  }
};

// Événements de performance
export const trackPerformance = (metric_name, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric_name,
      value: Math.round(value),
      send_to: 'G-9W7H5FEHVF'
    });
  }
};
