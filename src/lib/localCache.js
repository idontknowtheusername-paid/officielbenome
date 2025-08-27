import { ttlOptimizer } from './ttlOptimizer';

export class LocalCache {
  constructor(prefix = 'benome') {
    this.prefix = prefix;
    this.maxSize = 10 * 1024 * 1024; // 10MB max (réduit de 50MB)
    this.cleanupInterval = 30 * 60 * 1000; // 30 minutes (au lieu de 5 minutes)
  }

  /**
   * Génère une clé de cache avec préfixe
   */
  _getKey(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * Vérifie si le cache est expiré
   */
  _isExpired(timestamp, ttl) {
    return Date.now() - timestamp > ttl;
  }

  /**
   * Calcule la taille approximative d'un objet
   */
  _getSize(obj) {
    return new Blob([JSON.stringify(obj)]).size;
  }

  /**
   * Nettoie le cache pour libérer de l'espace
   */
  _cleanup() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
    
    if (cacheKeys.length === 0) return;

    // Trier par timestamp (plus ancien en premier)
    const items = cacheKeys.map(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        return { key, timestamp: item.timestamp, size: this._getSize(item) };
      } catch {
        return { key, timestamp: 0, size: 0 };
      }
    }).sort((a, b) => a.timestamp - b.timestamp);

    // Supprimer les éléments les plus anciens jusqu'à libérer assez d'espace
    let currentSize = this._getCurrentCacheSize();
    const targetSize = this.maxSize * 0.7; // Garder 70% du max (au lieu de 80%)

    for (const item of items) {
      if (currentSize <= targetSize) break;
      
      localStorage.removeItem(item.key);
      currentSize -= item.size;
    }
  }

  /**
   * Calcule la taille actuelle du cache
   */
  _getCurrentCacheSize() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
    
    return cacheKeys.reduce((total, key) => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        return total + this._getSize(item);
      } catch {
        return total;
      }
    }, 0);
  }

  /**
   * Stocke des données dans le cache local
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    try {
      const cacheKey = this._getKey(key);
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
        version: '1.0'
      };

      const size = this._getSize(item);
      
      // Vérifier si on a assez d'espace
      if (size > this.maxSize) {
        return false;
      }

      // Nettoyer si nécessaire (seulement si vraiment nécessaire)
      if (this._getCurrentCacheSize() + size > this.maxSize) {
        this._cleanup();
      }

      localStorage.setItem(cacheKey, JSON.stringify(item));
      
      // Enregistrer l'usage pour l'optimisation TTL (simplifié)
      if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
        ttlOptimizer.recordUsage(key, false, Date.now());
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère des données du cache local
   */
  get(key) {
    try {
      const cacheKey = this._getKey(key);
      const item = localStorage.getItem(cacheKey);
      
      if (!item) {
        // Enregistrer un miss pour l'optimisation TTL (simplifié)
        if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
          ttlOptimizer.recordUsage(key, false, Date.now());
        }
        return null;
      }

      const parsed = JSON.parse(item);
      
      // Vérifier l'expiration
      if (this._isExpired(parsed.timestamp, parsed.ttl)) {
        this.delete(key);
        // Enregistrer un miss pour l'optimisation TTL (simplifié)
        if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
          ttlOptimizer.recordUsage(key, false, Date.now());
        }
        return null;
      }

      // Enregistrer un hit pour l'optimisation TTL (simplifié)
      if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
        ttlOptimizer.recordUsage(key, true, Date.now());
      }
      
      return parsed.data;
    } catch (error) {
      this.delete(key); // Supprimer l'entrée corrompue
      return null;
    }
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key) {
    try {
      const cacheKey = this._getKey(key);
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Vide tout le cache
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère les statistiques du cache
   */
  getStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
      
      const stats = {
        totalEntries: cacheKeys.length,
        totalSize: this._getCurrentCacheSize(),
        maxSize: this.maxSize,
        usagePercentage: (this._getCurrentCacheSize() / this.maxSize) * 100
      };

      // Compter les entrées expirées
      let expiredCount = 0;
      cacheKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (this._isExpired(item.timestamp, item.ttl)) {
            expiredCount++;
          }
        } catch {
          expiredCount++;
        }
      });

      stats.expiredEntries = expiredCount;
      return stats;
    } catch (error) {
      return null;
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
      
      let cleanedCount = 0;
      cacheKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (this._isExpired(item.timestamp, item.ttl)) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });

      return cleanedCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtenir les recommandations d'optimisation TTL (simplifié)
   */
  getTTLOptimizations() {
    if (ttlOptimizer && typeof ttlOptimizer.getOptimizationRecommendations === 'function') {
      return ttlOptimizer.getOptimizationRecommendations();
    }
    return [];
  }

  /**
   * Appliquer les optimisations TTL (simplifié)
   */
  applyTTLOptimizations() {
    if (ttlOptimizer && typeof ttlOptimizer.applyOptimizations === 'function') {
      return ttlOptimizer.applyOptimizations();
    }
    return false;
  }
}

// Instance singleton
export const localCache = new LocalCache();

// Nettoyage automatique toutes les 30 minutes (au lieu de 5 minutes)
setInterval(() => {
  localCache.cleanup();
}, 30 * 60 * 1000); 