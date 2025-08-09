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
  }

  /**
   * Démarrer le monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorMemoryUsage();
    this.monitorNetworkRequests();
    this.monitorCachePerformance();
    
    console.log('📊 Monitoring de performance démarré');
  }

  /**
   * Arrêter le monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('📊 Monitoring de performance arrêté');
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
    
    // Garder seulement les 100 derniers temps de chargement
    if (this.metrics.loadTimes.length > 100) {
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
   * Monitorer l'utilisation mémoire
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
      
      // Garder seulement les 50 dernières mesures
      if (this.metrics.memoryUsage.length > 50) {
        this.metrics.memoryUsage.shift();
      }
    }
    
    setTimeout(() => this.monitorMemoryUsage(), 5000); // Toutes les 5 secondes
  }

  /**
   * Monitorer les requêtes réseau
   */
  monitorNetworkRequests() {
    if (!this.isMonitoring) return;
    
    // Intercepter les requêtes fetch
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
  }

  /**
   * Monitorer les performances du cache
   */
  monitorCachePerformance() {
    if (!this.isMonitoring) return;
    
    // Intercepter les accès localStorage
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
        console.error('Erreur dans l\'observateur de métriques:', error);
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
    
    console.log('📊 Métriques réinitialisées');
  }
}

// Instance singleton
export const performanceMetrics = new PerformanceMetrics();

// Démarrer automatiquement le monitoring
performanceMetrics.startMonitoring(); 