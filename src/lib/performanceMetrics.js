class PerformanceMetrics {
  constructor() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      errors: 0,
      loadTimes: [],
      memoryUsage: [],
      startTime: Date.now()
    };
    
    this.observers = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * Démarrer le monitoring (optionnel)
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitoring mémoire réduit (toutes les 30 secondes au lieu de 5)
    this.monitorMemoryUsage();
    
    // Monitoring réseau simplifié
    this.monitorNetworkRequests();
    
    // Monitoring cache désactivé par défaut
    // this.monitorCachePerformance();
  }

  /**
   * Arrêter le monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Enregistrer un hit de cache
   */
  recordCacheHit(type, key) {
    this.metrics.cacheHits++;
    this.notifyObservers('cacheHit', { type, key, timestamp: Date.now() });
  }

  /**
   * Enregistrer un miss de cache
   */
  recordCacheMiss(type, key) {
    this.metrics.cacheMisses++;
    this.notifyObservers('cacheMiss', { type, key, timestamp: Date.now() });
  }

  /**
   * Enregistrer un appel API
   */
  recordApiCall(endpoint, duration) {
    this.metrics.apiCalls++;
    this.metrics.loadTimes.push(duration);
    
    // Garder seulement les 50 derniers temps de chargement (au lieu de 100)
    if (this.metrics.loadTimes.length > 50) {
      this.metrics.loadTimes.shift();
    }
    
    this.notifyObservers('apiCall', { endpoint, duration, timestamp: Date.now() });
  }

  /**
   * Enregistrer une erreur
   */
  recordError(type, error) {
    this.metrics.errors++;
    this.notifyObservers('error', { type, error, timestamp: Date.now() });
  }

  /**
   * Calculer le ratio de cache hit
   */
  getCacheHitRatio() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }

  /**
   * Obtenir le temps de chargement moyen
   */
  getAverageLoadTime() {
    if (this.metrics.loadTimes.length === 0) return 0;
    const sum = this.metrics.loadTimes.reduce((a, b) => a + b, 0);
    return sum / this.metrics.loadTimes.length;
  }

  /**
   * Obtenir les statistiques complètes
   */
  getStats() {
    const uptime = Date.now() - this.metrics.startTime;
    
    return {
      uptime: Math.floor(uptime / 1000), // en secondes
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      cacheHitRatio: this.getCacheHitRatio(),
      apiCalls: this.metrics.apiCalls,
      errors: this.metrics.errors,
      averageLoadTime: this.getAverageLoadTime(),
      memoryUsage: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] || 0,
      isMonitoring: this.isMonitoring
    };
  }

  /**
   * Monitorer l'utilisation mémoire (réduit)
   */
  monitorMemoryUsage() {
    if (!this.isMonitoring) return;
    
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      this.metrics.memoryUsage.push({
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        timestamp: Date.now()
      });
      
      // Garder seulement les 20 dernières mesures (au lieu de 50)
      if (this.metrics.memoryUsage.length > 20) {
        this.metrics.memoryUsage.shift();
      }
    }
    
    // Monitoring toutes les 30 secondes (au lieu de 5)
    this.monitoringInterval = setTimeout(() => this.monitorMemoryUsage(), 30000);
  }

  /**
   * Monitorer les requêtes réseau (simplifié)
   */
  monitorNetworkRequests() {
    if (!this.isMonitoring) return;
    
    // Intercepter les requêtes fetch seulement si pas déjà fait
    if (window.fetch._monitored) return;
    
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordApiCall(args[0], duration);
        return response;
      } catch (error) {
        this.recordError('network', error);
        throw error;
      }
    };
    
    window.fetch._monitored = true;
  }

  /**
   * Monitorer les performances du cache (désactivé par défaut)
   */
  monitorCachePerformance() {
    if (!this.isMonitoring) return;
    
    // Intercepter les accès localStorage seulement si pas déjà fait
    if (Storage.prototype.getItem._monitored) return;
    
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    
    Storage.prototype.getItem = function(key) {
      const result = originalGetItem.call(this, key);
      if (result && key.startsWith('benome:')) {
        performanceMetrics.recordCacheHit('localStorage', key);
      }
      return result;
    };
    
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('benome:')) {
        performanceMetrics.recordCacheMiss('localStorage', key);
      }
      return originalSetItem.call(this, key, value);
    };
    
    Storage.prototype.getItem._monitored = true;
    Storage.prototype.setItem._monitored = true;
  }

  /**
   * Ajouter un observateur
   */
  addObserver(callback) {
    this.observers.push(callback);
  }

  /**
   * Supprimer un observateur
   */
  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  /**
   * Notifier les observateurs
   */
  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      try {
        observer(event, data);
      } catch (error) {
        // Erreur silencieuse pour éviter les boucles
      }
    });
  }

  /**
   * Exporter les métriques
   */
  exportMetrics() {
    return {
      ...this.metrics,
      cacheHitRatio: this.getCacheHitRatio(),
      averageLoadTime: this.getAverageLoadTime(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * Réinitialiser les métriques
   */
  reset() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      errors: 0,
      loadTimes: [],
      memoryUsage: [],
      startTime: Date.now()
    };
  }
}

// Instance singleton
export const performanceMetrics = new PerformanceMetrics();

// Démarrer le monitoring seulement en mode développement
if (import.meta.env.DEV) {
  // Délai de 5 secondes avant de démarrer le monitoring
  setTimeout(() => {
    performanceMetrics.startMonitoring();
  }, 5000);
} 