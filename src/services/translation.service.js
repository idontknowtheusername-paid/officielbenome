// Service de traduction automatique avec Google Translate API
// Note: @google-cloud/translate n'est pas compatible avec le build client
// Nous utilisons une approche alternative pour la production

class TranslationService {
  constructor() {
    this.isConfigured = false;
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Configuration pour Google Translate API
    this.googleTranslateConfig = {
      projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: import.meta.env.VITE_GOOGLE_CLOUD_KEY_FILE,
      // Alternative: utiliser une clé API directement
      key: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY,
    };
    
    // Initialiser le service
    this.initialize();
  }
  
  // Initialiser le service
  async initialize() {
    try {
      // Pour la production, nous utiliserons une API REST directe
      // car @google-cloud/translate n'est pas compatible avec le build client
      if (this.googleTranslateConfig.key) {
        this.isConfigured = true;
        this.apiKey = this.googleTranslateConfig.key;
        console.log('Translation service initialized with API key (REST mode)');
      }
      // Mode simulé pour le développement
      else {
        console.warn('Translation service not configured, using mock mode');
        console.info('To enable real translation, set VITE_GOOGLE_TRANSLATE_API_KEY');
        this.isConfigured = false;
      }
      
      return this.isConfigured;
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      this.isConfigured = false;
      return false;
    }
  }
  
  // Générer une clé de cache
  _getCacheKey(text, targetLanguage, sourceLanguage) {
    return `${text}_${sourceLanguage}_${targetLanguage}`;
  }
  
  // Gérer le cache
  _manageCache() {
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  // Traduire un texte avec Google Translate API
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    if (!text || typeof text !== 'string') {
      return text;
    }
    
    // Vérifier le cache
    const cacheKey = this._getCacheKey(text, targetLanguage, sourceLanguage);
    if (this.cache.has(cacheKey)) {
      this.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    this.cacheMisses++;
    
    try {
      let translation = text;
      
      if (this.isConfigured && this.apiKey) {
        // Utiliser Google Translate API via REST
        try {
          const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: text,
              source: sourceLanguage,
              target: targetLanguage,
            }),
          });
          
          const data = await response.json();
          if (data.data && data.data.translations && data.data.translations[0]) {
            translation = data.data.translations[0].translatedText;
          } else {
            throw new Error('Invalid response from Google Translate API');
          }
        } catch (apiError) {
          console.warn('Google Translate API error, falling back to mock translation:', apiError);
          translation = this._mockTranslate(text, targetLanguage, sourceLanguage);
        }
      } else {
        // Traduction simulée pour le développement
        translation = this._mockTranslate(text, targetLanguage, sourceLanguage);
      }
      
      // Mettre en cache
      this.cache.set(cacheKey, translation);
      this._manageCache();
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      
      // En cas d'erreur avec l'API, utiliser la traduction simulée
      if (this.isConfigured) {
        console.warn('Falling back to mock translation due to API error');
        const mockTranslation = this._mockTranslate(text, targetLanguage, sourceLanguage);
        this.cache.set(cacheKey, mockTranslation);
        this._manageCache();
        return mockTranslation;
      }
      
      return text; // Retourner le texte original en cas d'erreur
    }
  }
  
  // Traduction simulée pour le développement
  _mockTranslate(text, targetLanguage, sourceLanguage) {
    // Dictionnaire de traductions simulées pour les tests
    const mockTranslations = {
      'fr-en': {
        'Bonjour': 'Hello',
        'Merci': 'Thank you',
        'Au revoir': 'Goodbye',
        'Bienvenue': 'Welcome',
        'Accueil': 'Home',
        'Marketplace': 'Marketplace',
        'Immobilier': 'Real Estate',
        'Automobile': 'Automotive',
        'Services': 'Services',
        'Blog': 'Blog',
        'Contact': 'Contact',
        'À propos': 'About',
        'Connexion': 'Login',
        'Inscription': 'Sign up',
        'Rechercher': 'Search',
        'Filtrer': 'Filter',
        'Trier': 'Sort',
        'Prix': 'Price',
        'Description': 'Description',
        'Localisation': 'Location',
        'Catégorie': 'Category',
        'État': 'Condition',
        'Neuf': 'New',
        'Occasion': 'Used',
        'Reconditionné': 'Refurbished',
        'Négociable': 'Negotiable',
        'Vues': 'Views',
        'Favoris': 'Favorites',
        'Partages': 'Shares',
        'Publié par': 'Posted by',
        'Publié le': 'Posted on',
        'Contacter le vendeur': 'Contact seller',
        'Signaler l\'annonce': 'Report listing',
        'Partager l\'annonce': 'Share listing',
        'Annonces similaires': 'Similar listings',
        'Annonces connexes': 'Related listings',
        'Aucune description disponible': 'No description available',
        'Prix sur demande': 'Price on request',
        'Localisation non spécifiée': 'Location not specified',
        'Date inconnue': 'Unknown date',
        'Aucune donnée disponible': 'No data available',
        'Erreur de traduction': 'Translation error',
        'Traduction en cours...': 'Translating...',
        'Traduit automatiquement': 'Automatically translated',
        'Affichage en langue originale': 'Showing in original language',
        'Réessayer': 'Retry',
        'Erreur de réseau': 'Network error',
        'Vérifiez votre connexion': 'Check your connection',
        'Trop de tentatives': 'Too many attempts',
        'Veuillez réessayer plus tard': 'Please try again later',
      },
      'en-fr': {
        'Hello': 'Bonjour',
        'Thank you': 'Merci',
        'Goodbye': 'Au revoir',
        'Welcome': 'Bienvenue',
        'Home': 'Accueil',
        'Marketplace': 'Marketplace',
        'Real Estate': 'Immobilier',
        'Automotive': 'Automobile',
        'Services': 'Services',
        'Blog': 'Blog',
        'Contact': 'Contact',
        'About': 'À propos',
        'Login': 'Connexion',
        'Sign up': 'Inscription',
        'Search': 'Rechercher',
        'Filter': 'Filtrer',
        'Sort': 'Trier',
        'Price': 'Prix',
        'Description': 'Description',
        'Location': 'Localisation',
        'Category': 'Catégorie',
        'Condition': 'État',
        'New': 'Neuf',
        'Used': 'Occasion',
        'Refurbished': 'Reconditionné',
        'Negotiable': 'Négociable',
        'Views': 'Vues',
        'Favorites': 'Favoris',
        'Shares': 'Partages',
        'Posted by': 'Publié par',
        'Posted on': 'Publié le',
        'Contact seller': 'Contacter le vendeur',
        'Report listing': 'Signaler l\'annonce',
        'Share listing': 'Partager l\'annonce',
        'Similar listings': 'Annonces similaires',
        'Related listings': 'Annonces connexes',
        'No description available': 'Aucune description disponible',
        'Price on request': 'Prix sur demande',
        'Location not specified': 'Localisation non spécifiée',
        'Unknown date': 'Date inconnue',
        'No data available': 'Aucune donnée disponible',
        'Translation error': 'Erreur de traduction',
        'Translating...': 'Traduction en cours...',
        'Automatically translated': 'Traduit automatiquement',
        'Showing in original language': 'Affichage en langue originale',
        'Retry': 'Réessayer',
        'Network error': 'Erreur de réseau',
        'Check your connection': 'Vérifiez votre connexion',
        'Too many attempts': 'Trop de tentatives',
        'Please try again later': 'Veuillez réessayer plus tard',
      }
    };
    
    const key = `${sourceLanguage}-${targetLanguage}`;
    const translations = mockTranslations[key] || {};
    
    // Chercher une traduction exacte
    if (translations[text]) {
      return translations[text];
    }
    
    // Si pas de traduction exacte, retourner le texte original avec un indicateur
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  }
  
  // Traduire un objet complet
  async translateObject(obj, targetLanguage, sourceLanguage = 'auto') {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const translatedObj = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        translatedObj[key] = await this.translateText(value, targetLanguage, sourceLanguage);
      } else if (typeof value === 'object' && value !== null) {
        translatedObj[key] = await this.translateObject(value, targetLanguage, sourceLanguage);
      } else {
        translatedObj[key] = value;
      }
    }
    
    return translatedObj;
  }
  
  // Traduire une annonce complète
  async translateListing(listing, targetLanguage, sourceLanguage = 'fr') {
    if (!listing) {
      return listing;
    }
    
    const translatableFields = {
      title: listing.title,
      description: listing.description,
      location: listing.location,
      tags: listing.tags,
    };
    
    const translatedFields = await this.translateObject(
      translatableFields, 
      targetLanguage, 
      sourceLanguage
    );
    
    return {
      ...listing,
      ...translatedFields,
      original_language: sourceLanguage,
      translated_language: targetLanguage,
      is_translated: true,
    };
  }
  
  // Traduire une liste d'annonces
  async translateListings(listings, targetLanguage, sourceLanguage = 'fr') {
    if (!Array.isArray(listings)) {
      return listings;
    }
    
    const translatedListings = [];
    
    for (const listing of listings) {
      const translatedListing = await this.translateListing(
        listing, 
        targetLanguage, 
        sourceLanguage
      );
      translatedListings.push(translatedListing);
    }
    
    return translatedListings;
  }
  
  // Vérifier si une langue est supportée
  isLanguageSupported(language) {
    const supportedLanguages = ['fr', 'en'];
    return supportedLanguages.includes(language);
  }
  
  // Obtenir les langues supportées
  getSupportedLanguages() {
    return ['fr', 'en'];
  }
  
  // Vider le cache
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  // Obtenir les statistiques du cache
  getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      totalRequests,
      hitRate: totalRequests > 0 ? this.cacheHits / totalRequests : 0,
    };
  }
  
  // Tester la connexion à l'API
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: 'Translation service not configured' };
    }
    
    try {
      const testText = 'Hello world';
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: testText,
          source: 'en',
          target: 'fr',
        }),
      });
      
      const data = await response.json();
      if (data.data && data.data.translations && data.data.translations[0]) {
        const translation = data.data.translations[0].translatedText;
        return { 
          success: true, 
          message: 'API connection successful',
          test: { original: testText, translated: translation }
        };
      } else {
        throw new Error('Invalid response from Google Translate API');
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'API connection failed',
        error: error.message 
      };
    }
  }
}

// Instance singleton
export const translationService = new TranslationService();
