// Service de traduction automatique avec Google Translate API
// Version simplifiée et robuste pour éviter les erreurs de page blanche

class TranslationService {
  constructor() {
    this.isConfigured = false;
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Configuration pour Google Translate API
    this.googleTranslateConfig = {
      key: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY,
    };
    
    // Initialiser le service de manière synchrone
    this._initializeSync();
  }
  
  // Initialiser le service de manière synchrone
  _initializeSync() {
    try {
      if (this.googleTranslateConfig.key) {
        this.isConfigured = true;
        this.apiKey = this.googleTranslateConfig.key;
        console.log('Translation service initialized with API key (REST mode)');
      } else {
        console.warn('Translation service not configured, using mock mode');
        console.info('To enable real translation, set VITE_GOOGLE_TRANSLATE_API_KEY');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      this.isConfigured = false;
    }
  }

  // Initialiser le service (méthode async pour compatibilité)
  async initialize() {
    return this._initializeSync();
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
          console.log(`🌍 Traduction réelle: "${text}" (${sourceLanguage} → ${targetLanguage})`);
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
            console.log(`✅ Traduit: "${text}" → "${translation}"`);
          } else {
            throw new Error('Invalid response from Google Translate API');
          }
        } catch (apiError) {
          console.warn('❌ Google Translate API error, falling back to mock translation:', apiError);
          translation = this._mockTranslate(text, targetLanguage, sourceLanguage);
        }
      } else {
        // Traduction simulée pour le développement
        console.log(`🎭 Traduction simulée: "${text}" (${sourceLanguage} → ${targetLanguage})`);
        translation = this._mockTranslate(text, targetLanguage, sourceLanguage);
      }
      
      // Mettre en cache
      this.cache.set(cacheKey, translation);
      this._manageCache();
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Retourner le texte original en cas d'erreur
    }
  }
  
  // Traduction simulée pour le développement
  _mockTranslate(text, targetLanguage, sourceLanguage) {
    const translations = {
      'fr': {
        'en': {
          'Bonjour': 'Hello',
          'Merci': 'Thank you',
          'Au revoir': 'Goodbye',
          'Bienvenue': 'Welcome',
          'Annonce': 'Listing',
          'Prix': 'Price',
          'Description': 'Description',
          'Titre': 'Title',
          'Catégorie': 'Category',
          'Localisation': 'Location',
          'Date': 'Date',
          'Contact': 'Contact',
          'Détails': 'Details',
          'Voir plus': 'See more',
          'Ajouter aux favoris': 'Add to favorites',
          'Partager': 'Share',
          'Signaler': 'Report',
          'Modifier': 'Edit',
          'Supprimer': 'Delete',
          'Confirmer': 'Confirm',
          'Annuler': 'Cancel',
          'Sauvegarder': 'Save',
          'Rechercher': 'Search',
          'Filtrer': 'Filter',
          'Trier': 'Sort',
          'Nouveau': 'New',
          'Populaire': 'Popular',
          'Récent': 'Recent',
          'Ancien': 'Old',
          'Cher': 'Expensive',
          'Bon marché': 'Cheap',
          'Disponible': 'Available',
          'Vendu': 'Sold',
          'En location': 'For rent',
          'À vendre': 'For sale',
          'Immobilier': 'Real estate',
          'Automobile': 'Automotive',
          'Services': 'Services',
          'Marketplace': 'Marketplace',
          'Découvrir': 'Discover',
          'Voir toutes les annonces': 'View all listings',
          'Annonces populaires': 'Popular listings',
          'Voir toutes les annonces premium': 'View all premium listings',
        }
      },
      'en': {
        'fr': {
          'Hello': 'Bonjour',
          'Thank you': 'Merci',
          'Goodbye': 'Au revoir',
          'Welcome': 'Bienvenue',
          'Listing': 'Annonce',
          'Price': 'Prix',
          'Description': 'Description',
          'Title': 'Titre',
          'Category': 'Catégorie',
          'Location': 'Localisation',
          'Date': 'Date',
          'Contact': 'Contact',
          'Details': 'Détails',
          'See more': 'Voir plus',
          'Add to favorites': 'Ajouter aux favoris',
          'Share': 'Partager',
          'Report': 'Signaler',
          'Edit': 'Modifier',
          'Delete': 'Supprimer',
          'Confirm': 'Confirmer',
          'Cancel': 'Annuler',
          'Save': 'Sauvegarder',
          'Search': 'Rechercher',
          'Filter': 'Filtrer',
          'Sort': 'Trier',
          'New': 'Nouveau',
          'Popular': 'Populaire',
          'Recent': 'Récent',
          'Old': 'Ancien',
          'Expensive': 'Cher',
          'Cheap': 'Bon marché',
          'Available': 'Disponible',
          'Sold': 'Vendu',
          'For rent': 'En location',
          'For sale': 'À vendre',
          'Real estate': 'Immobilier',
          'Automotive': 'Automobile',
          'Services': 'Services',
          'Marketplace': 'Marketplace',
          'Discover': 'Découvrir',
          'View all listings': 'Voir toutes les annonces',
          'Popular listings': 'Annonces populaires',
          'View all premium listings': 'Voir toutes les annonces premium',
        }
      }
    };
    
    const translationMap = translations[sourceLanguage]?.[targetLanguage];
    if (translationMap && translationMap[text]) {
      return translationMap[text];
    }
    
    // Si pas de traduction exacte, retourner le texte original
    return text;
  }
  
  // Traduire un objet (annonce, etc.)
  async translateObject(obj, targetLanguage, sourceLanguage = 'fr') {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const translatedObj = { ...obj };
    
    // Traduire les champs de texte
    const textFields = ['title', 'description', 'category', 'location'];
    
    for (const field of textFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        translatedObj[field] = await this.translateText(obj[field], targetLanguage, sourceLanguage);
      }
    }
    
    // Ajouter des métadonnées de traduction
    translatedObj.translation_metadata = {
      original_language: sourceLanguage,
      translated_language: targetLanguage,
      is_translated: true,
    };
    
    return translatedObj;
  }
  
  // Traduire une liste d'annonces
  async translateListings(listings, targetLanguage, sourceLanguage = 'fr') {
    if (!Array.isArray(listings)) {
      return listings;
    }
    
    const translatedListings = [];
    
    for (const listing of listings) {
      const translatedListing = await this.translateObject(
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

// Export de la classe pour les tests
export { TranslationService };
