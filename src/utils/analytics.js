// Google Analytics 4 - Event Tracking

export const GA_TRACKING_ID = 'G-9W7H5FEHVF';

// Page view
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Event tracking
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Événements spécifiques MaxiMarket
export const trackListingView = (listingId, category) => {
  event({
    action: 'view_listing',
    category: 'Engagement',
    label: `${category} - ${listingId}`,
  });
};

export const trackListingCreate = (category) => {
  event({
    action: 'create_listing',
    category: 'Conversion',
    label: category,
  });
};

export const trackSearch = (query, category) => {
  event({
    action: 'search',
    category: 'Engagement',
    label: `${category} - ${query}`,
  });
};

export const trackContact = (listingId, method) => {
  event({
    action: 'contact_seller',
    category: 'Conversion',
    label: `${method} - ${listingId}`,
  });
};

export const trackSignup = (method) => {
  event({
    action: 'sign_up',
    category: 'Conversion',
    label: method,
  });
};

export const trackLogin = (method) => {
  event({
    action: 'login',
    category: 'Engagement',
    label: method,
  });
};

export const trackShare = (platform, listingId) => {
  event({
    action: 'share',
    category: 'Engagement',
    label: `${platform} - ${listingId}`,
  });
};

export const trackBoost = (listingId, packageType) => {
  event({
    action: 'boost_listing',
    category: 'Revenue',
    label: `${packageType} - ${listingId}`,
  });
};

export const trackFavorite = (listingId, action) => {
  event({
    action: action === 'add' ? 'add_to_favorites' : 'remove_from_favorites',
    category: 'Engagement',
    label: listingId,
  });
};
