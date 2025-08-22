import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des ressources de traduction
const resources = {
  fr: {
    common: require('../locales/fr/common.json'),
    auth: require('../locales/fr/auth.json'),
    listings: require('../locales/fr/listings.json'),
  },
  en: {
    common: require('../locales/en/common.json'),
    auth: require('../locales/en/auth.json'),
    listings: require('../locales/en/listings.json'),
  },
  // Seulement FR et EN supportés
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    
    // Configuration de l'interpolation
    interpolation: {
      escapeValue: false, // React fait déjà l'échappement
    },
    
    // Configuration de la détection de langue
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Configuration React
    react: {
      useSuspense: false,
    },
    
    // Configuration des namespaces
    defaultNS: 'common',
    ns: ['common', 'auth', 'listings'],
    
      // Configuration des langues supportées
  supportedLngs: ['fr', 'en'],
    
    // Configuration du chargement
    load: 'languageOnly',
    
    // Configuration des clés manquantes
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} in namespace: ${ns} for language: ${lng}`);
      }
    },
  });

export default i18n;
