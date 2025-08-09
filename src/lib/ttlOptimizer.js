class TTLOptimizer {
  constructor() {
    this.usagePatterns = new Map();
    this.optimizations = new Map();
    this.isOptimizing = false;
  }

  /**
   * Enregistrer l'usage d'une clé de cache
   */
  recordUsage(cacheKey, hit, timestamp) {
    if (!this.usagePatterns.has(cacheKey)) {
      this.usagePatterns.set(cacheKey, {
        hits: 0,
        misses: 0,
        lastAccess: timestamp,
        accessTimes: [],
        totalAccesses: 0
      });
    }

    const pattern = this.usagePatterns.get(cacheKey);
    pattern.totalAccesses++;
    pattern.lastAccess = timestamp;
    pattern.accessTimes.push(timestamp);

    if (hit) {
      pattern.hits++;
    } else {
      pattern.misses++;
    }

    // Garder seulement les 100 derniers accès
    if (pattern.accessTimes.length > 100) {
      pattern.accessTimes.shift();
    }

    // Optimiser si nécessaire
    this.optimizeTTL(cacheKey);
  }

  /**
   * Calculer l'intervalle d'accès moyen
   */
  calculateAverageInterval(accessTimes) {
    if (accessTimes.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < accessTimes.length; i++) {
      intervals.push(accessTimes[i] - accessTimes[i - 1]);
    }

    const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return average;
  }

  /**
   * Calculer le ratio de fraîcheur
   */
  calculateFreshnessRatio(pattern) {
    const total = pattern.hits + pattern.misses;
    if (total === 0) return 0;

    // Ratio basé sur les hits récents vs anciens
    const recentHits = pattern.hits;
    const recentMisses = pattern.misses;
    
    return recentHits / (recentHits + recentMisses);
  }

  /**
   * Optimiser le TTL pour une clé spécifique
   */
  optimizeTTL(cacheKey) {
    const pattern = this.usagePatterns.get(cacheKey);
    if (!pattern || pattern.totalAccesses < 10) return;

    const averageInterval = this.calculateAverageInterval(pattern.accessTimes);
    const freshnessRatio = this.calculateFreshnessRatio(pattern);
    const currentTTL = this.getCurrentTTL(cacheKey);

    // Calculer le nouveau TTL optimal
    let optimalTTL = currentTTL;

    // Si les accès sont fréquents et le ratio de fraîcheur est élevé
    if (averageInterval < 5 * 60 * 1000 && freshnessRatio > 0.8) {
      // Augmenter le TTL
      optimalTTL = Math.min(currentTTL * 1.5, 30 * 60 * 1000); // Max 30 minutes
    }
    // Si les accès sont rares et le ratio de fraîcheur est faible
    else if (averageInterval > 15 * 60 * 1000 && freshnessRatio < 0.3) {
      // Diminuer le TTL
      optimalTTL = Math.max(currentTTL * 0.7, 1 * 60 * 1000); // Min 1 minute
    }
    // Si les accès sont très fréquents
    else if (averageInterval < 1 * 60 * 1000) {
      // TTL très court pour les données très dynamiques
      optimalTTL = Math.max(averageInterval * 2, 30 * 1000); // Min 30 secondes
    }

    // Appliquer l'optimisation
    this.optimizations.set(cacheKey, {
      currentTTL,
      optimalTTL,
      averageInterval,
      freshnessRatio,
      lastOptimized: Date.now()
    });

    console.log(`🔧 TTL optimisé pour ${cacheKey}:`, {
      current: `${currentTTL / 1000}s`,
      optimal: `${optimalTTL / 1000}s`,
      interval: `${averageInterval / 1000}s`,
      ratio: `${(freshnessRatio * 100).toFixed(1)}%`
    });
  }

  /**
   * Obtenir le TTL actuel pour une clé
   */
  getCurrentTTL(cacheKey) {
    // TTL par défaut selon le type de données
    if (cacheKey.includes('categories')) return 10 * 60 * 1000; // 10 minutes
    if (cacheKey.includes('listings')) return 2 * 60 * 1000; // 2 minutes
    if (cacheKey.includes('userListings')) return 1 * 60 * 1000; // 1 minute
    if (cacheKey.includes('search')) return 5 * 60 * 1000; // 5 minutes
    
    return 5 * 60 * 1000; // 5 minutes par défaut
  }

  /**
   * Obtenir le TTL optimal pour une clé
   */
  getOptimalTTL(cacheKey) {
    const optimization = this.optimizations.get(cacheKey);
    if (optimization) {
      return optimization.optimalTTL;
    }
    return this.getCurrentTTL(cacheKey);
  }

  /**
   * Obtenir les recommandations d'optimisation
   */
  getOptimizationRecommendations() {
    const recommendations = [];

    for (const [cacheKey, optimization] of this.optimizations) {
      const improvement = ((optimization.optimalTTL - optimization.currentTTL) / optimization.currentTTL) * 100;
      
      if (Math.abs(improvement) > 10) { // Seulement si l'amélioration est significative
        recommendations.push({
          cacheKey,
          currentTTL: optimization.currentTTL,
          optimalTTL: optimization.optimalTTL,
          improvement: improvement.toFixed(1),
          averageInterval: optimization.averageInterval,
          freshnessRatio: optimization.freshnessRatio
        });
      }
    }

    return recommendations.sort((a, b) => Math.abs(b.improvement) - Math.abs(a.improvement));
  }

  /**
   * Appliquer toutes les optimisations
   */
  applyOptimizations() {
    const recommendations = this.getOptimizationRecommendations();
    let appliedCount = 0;

    for (const rec of recommendations) {
      // Ici on pourrait mettre à jour les TTL dans la configuration
      // Pour l'instant, on log les changements
      console.log(`✅ Optimisation appliquée pour ${rec.cacheKey}:`, {
        from: `${rec.currentTTL / 1000}s`,
        to: `${rec.optimalTTL / 1000}s`,
        improvement: `${rec.improvement}%`
      });
      appliedCount++;
    }

    return appliedCount;
  }

  /**
   * Obtenir les statistiques d'optimisation
   */
  getOptimizationStats() {
    const totalPatterns = this.usagePatterns.size;
    const totalOptimizations = this.optimizations.size;
    const recommendations = this.getOptimizationRecommendations();

    return {
      totalPatterns,
      totalOptimizations,
      activeRecommendations: recommendations.length,
      averageImprovement: recommendations.length > 0 
        ? recommendations.reduce((sum, rec) => sum + Math.abs(parseFloat(rec.improvement)), 0) / recommendations.length
        : 0
    };
  }

  /**
   * Réinitialiser les optimisations
   */
  reset() {
    this.usagePatterns.clear();
    this.optimizations.clear();
    console.log('🔄 Optimisations TTL réinitialisées');
  }
}

// Instance singleton
export const ttlOptimizer = new TTLOptimizer(); 