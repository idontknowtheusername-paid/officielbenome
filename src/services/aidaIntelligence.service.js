// Service d'intelligence avancée pour AIDA
import { supabase } from '@/lib/supabase';

class AIDAIntelligenceService {
  constructor() {
    this.userContext = null;
    this.marketData = null;
    this.recommendations = [];
  }

  // Analyser le contexte utilisateur
  async analyzeUserContext(userId, currentPage, searchHistory) {
    try {
      console.log('🧠 AIDA analyse le contexte utilisateur...');
      
      const context = {
        user: null,
        preferences: {},
        behavior: {},
        marketInsights: {}
      };

      // Récupérer les données utilisateur
      if (userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        context.user = userData;
      }

      // Analyser l'historique de recherche
      if (searchHistory && searchHistory.length > 0) {
        context.behavior = this.analyzeSearchBehavior(searchHistory);
        context.preferences = this.extractUserPreferences(searchHistory);
      }

      // Analyser la page actuelle
      context.currentPage = this.analyzeCurrentPage(currentPage);

      // Récupérer les insights du marché
      context.marketInsights = await this.getMarketInsights();

      this.userContext = context;
      return context;
    } catch (error) {
      console.error('Erreur analyse contexte:', error);
      return null;
    }
  }

  // Analyser le comportement de recherche
  analyzeSearchBehavior(searchHistory) {
    const behavior = {
      categories: {},
      locations: {},
      priceRanges: {},
      frequency: searchHistory.length,
      lastSearch: searchHistory[searchHistory.length - 1]?.timestamp
    };

    searchHistory.forEach(search => {
      // Analyser les catégories
      if (search.category) {
        behavior.categories[search.category] = (behavior.categories[search.category] || 0) + 1;
      }

      // Analyser les localisations
      if (search.location) {
        behavior.locations[search.location] = (behavior.locations[search.location] || 0) + 1;
      }

      // Analyser les prix
      if (search.priceRange) {
        behavior.priceRanges[search.priceRange] = (behavior.priceRanges[search.priceRange] || 0) + 1;
      }
    });

    return behavior;
  }

  // Extraire les préférences utilisateur
  extractUserPreferences(searchHistory) {
    const preferences = {
      favoriteCategories: [],
      preferredLocations: [],
      budgetRange: null,
      searchPatterns: []
    };

    if (searchHistory.length > 0) {
      // Catégories préférées
      const categoryCount = {};
      searchHistory.forEach(search => {
        if (search.category) {
          categoryCount[search.category] = (categoryCount[search.category] || 0) + 1;
        }
      });
      preferences.favoriteCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      // Localisations préférées
      const locationCount = {};
      searchHistory.forEach(search => {
        if (search.location) {
          locationCount[search.location] = (locationCount[search.location] || 0) + 1;
        }
      });
      preferences.preferredLocations = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([location]) => location);
    }

    return preferences;
  }

  // Analyser la page actuelle
  analyzeCurrentPage(currentPage) {
    const analysis = {
      type: 'unknown',
      context: {},
      opportunities: []
    };

    if (currentPage) {
      // Analyser l'URL
      if (currentPage.includes('/annonce/')) {
        analysis.type = 'listing_detail';
        analysis.context = {
          listingId: currentPage.split('/annonce/')[1],
          action: 'viewing_listing'
        };
        analysis.opportunities = [
          'suggest_similar_listings',
          'suggest_contact_seller',
          'suggest_related_categories'
        ];
      } else if (currentPage.includes('/marketplace')) {
        analysis.type = 'marketplace';
        analysis.context = {
          action: 'browsing_marketplace'
        };
        analysis.opportunities = [
          'suggest_popular_categories',
          'suggest_trending_items',
          'suggest_user_preferences'
        ];
      } else if (currentPage.includes('/immobilier')) {
        analysis.type = 'real_estate';
        analysis.context = {
          action: 'browsing_real_estate'
        };
        analysis.opportunities = [
          'suggest_property_types',
          'suggest_locations',
          'suggest_price_ranges'
        ];
      }
    }

    return analysis;
  }

  // Récupérer les insights du marché
  async getMarketInsights() {
    try {
      const insights = {
        trendingCategories: [],
        popularLocations: [],
        priceTrends: {},
        newListings: 0
      };

      // Récupérer les catégories tendance
      const { data: trendingData } = await supabase
        .from('listings')
        .select('category, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'approved');

      if (trendingData) {
        const categoryCount = {};
        trendingData.forEach(listing => {
          categoryCount[listing.category] = (categoryCount[listing.category] || 0) + 1;
        });
        insights.trendingCategories = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category]) => category);
      }

      // Compter les nouvelles annonces
      const { count: newListingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'approved');

      insights.newListings = newListingsCount || 0;

      return insights;
    } catch (error) {
      console.error('Erreur récupération insights:', error);
      return {};
    }
  }

  // Générer des recommandations personnalisées
  async generateRecommendations(userContext, currentQuery) {
    try {
      console.log('🎯 AIDA génère des recommandations personnalisées...');
      
      const recommendations = {
        immediate: [],
        contextual: [],
        trending: [],
        personalized: []
      };

      // Recommandations immédiates basées sur la requête
      if (currentQuery) {
        recommendations.immediate = await this.getImmediateRecommendations(currentQuery);
      }

      // Recommandations contextuelles basées sur la page
      if (userContext?.currentPage) {
        recommendations.contextual = await this.getContextualRecommendations(userContext.currentPage);
      }

      // Recommandations tendance
      if (userContext?.marketInsights) {
        recommendations.trending = this.getTrendingRecommendations(userContext.marketInsights);
      }

      // Recommandations personnalisées
      if (userContext?.preferences) {
        recommendations.personalized = await this.getPersonalizedRecommendations(userContext.preferences);
      }

      this.recommendations = recommendations;
      return recommendations;
    } catch (error) {
      console.error('Erreur génération recommandations:', error);
      return {};
    }
  }

  // Recommandations immédiates
  async getImmediateRecommendations(query) {
    const recommendations = [];
    
    // Analyser la requête pour des mots-clés
    const keywords = query.toLowerCase().split(' ');
    
    if (keywords.includes('immobilier') || keywords.includes('maison') || keywords.includes('appartement')) {
      recommendations.push(
        { type: 'category', value: 'Immobilier à Dakar', icon: '🏠' },
        { type: 'category', value: 'Terrains constructibles', icon: '🏗️' },
        { type: 'category', value: 'Appartements 2 chambres', icon: '🏢' }
      );
    }
    
    if (keywords.includes('voiture') || keywords.includes('auto') || keywords.includes('moto')) {
      recommendations.push(
        { type: 'category', value: 'Voitures d\'occasion', icon: '🚗' },
        { type: 'category', value: 'Motos économiques', icon: '🏍️' },
        { type: 'category', value: 'Pièces détachées', icon: '🔧' }
      );
    }

    return recommendations;
  }

  // Recommandations contextuelles
  async getContextualRecommendations(currentPage) {
    const recommendations = [];

    if (currentPage.type === 'listing_detail') {
      recommendations.push(
        { type: 'action', value: 'Contacter le vendeur', icon: '📞' },
        { type: 'action', value: 'Voir des annonces similaires', icon: '🔍' },
        { type: 'action', value: 'Partager cette annonce', icon: '📤' }
      );
    }

    if (currentPage.type === 'marketplace') {
      recommendations.push(
        { type: 'category', value: 'Nouvelles annonces', icon: '🆕' },
        { type: 'category', value: 'Promotions', icon: '🏷️' },
        { type: 'category', value: 'Annonces populaires', icon: '🔥' }
      );
    }

    return recommendations;
  }

  // Recommandations tendance
  getTrendingRecommendations(marketInsights) {
    const recommendations = [];

    if (marketInsights.trendingCategories) {
      marketInsights.trendingCategories.forEach(category => {
        recommendations.push({
          type: 'trending',
          value: `${category} (tendance)`,
          icon: '📈'
        });
      });
    }

    if (marketInsights.newListings > 0) {
      recommendations.push({
        type: 'info',
        value: `${marketInsights.newListings} nouvelles annonces aujourd'hui`,
        icon: '🆕'
      });
    }

    return recommendations;
  }

  // Recommandations personnalisées
  async getPersonalizedRecommendations(preferences) {
    const recommendations = [];

    if (preferences.favoriteCategories) {
      preferences.favoriteCategories.forEach(category => {
        recommendations.push({
          type: 'personalized',
          value: `Nouveaux ${category}`,
          icon: '⭐'
        });
      });
    }

    if (preferences.preferredLocations) {
      preferences.preferredLocations.forEach(location => {
        recommendations.push({
          type: 'personalized',
          value: `Annonces à ${location}`,
          icon: '📍'
        });
      });
    }

    return recommendations;
  }

  // Obtenir des étapes de thinking avancées
  getAdvancedThinkingSteps(userContext, currentQuery) {
    const steps = [
      {
        title: 'Analyse du contexte',
        description: 'Étude de la page actuelle et de l\'historique utilisateur',
        duration: 1500,
        progress: 0
      },
      {
        title: 'Recherche d\'informations',
        description: 'Collecte de données pertinentes et insights du marché',
        duration: 2000,
        progress: 0
      },
      {
        title: 'Génération de recommandations',
        description: 'Création de suggestions personnalisées',
        duration: 1800,
        progress: 0
      },
      {
        title: 'Optimisation de la réponse',
        description: 'Affinage et personnalisation du message',
        duration: 1200,
        progress: 0
      }
    ];

    // Adapter les étapes selon le contexte
    if (userContext?.currentPage?.type === 'listing_detail') {
      steps.splice(1, 0, {
        title: 'Analyse de l\'annonce',
        description: 'Étude des détails et recherche d\'alternatives',
        duration: 1600,
        progress: 0
      });
    }

    if (currentQuery && currentQuery.includes('prix')) {
      steps.splice(2, 0, {
        title: 'Analyse des prix',
        description: 'Comparaison avec le marché et estimation',
        duration: 1400,
        progress: 0
      });
    }

    return steps;
  }
}

export const aidaIntelligenceService = new AIDAIntelligenceService();
