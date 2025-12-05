import { ttlOptimizer } from './ttlOptimizer';

export class LocalCache {
  constructor(prefix = 'benome') {
    this.prefix = prefix;
    this.maxSize = 10 * 1024 * 1024; // 10MB max
    this.cleanupInterval = 30 * 60 * 1000; // 30 minutes
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
   * Nettoie le cache pour libérer de l'espace (LRU - Least Recently Used)
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

    // Supprimer les éléments les plus anciens
    let currentSize = this._getCurrentCacheSize();
    const targetSize = this.maxSize * 0.7; // Garder 70%

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
      
      // Vérifier si on a assez d'espace (Fail-fast si l'objet est plus gros que tout le cache)
      if (size > this.maxSize) return false;

      // Nettoyer si nécessaire
      if (this._getCurrentCacheSize() + size > this.maxSize) {
        this._cleanup();
      }

      localStorage.setItem(cacheKey, JSON.stringify(item));
      
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
        if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
          ttlOptimizer.recordUsage(key, false, Date.now());
        }
        return null;
      }

      const parsed = JSON.parse(item);
      
      if (this._isExpired(parsed.timestamp, parsed.ttl)) {
        this.delete(key);
        if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
          ttlOptimizer.recordUsage(key, false, Date.now());
        }
        return null;
      }

      if (ttlOptimizer && typeof ttlOptimizer.recordUsage === 'function') {
        ttlOptimizer.recordUsage(key, true, Date.now());
      }
      
      return parsed.data;
    } catch (error) {
      this.delete(key);
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
   * 🔥 NOUVELLE MÉTHODE CRITIQUE
   * Supprime toutes les clés qui contiennent un motif spécifique.
   * Ex: deleteByPattern('listings:') supprimera 'benome:listings:filters...'
   */
  deleteByPattern(pattern) {
    try {
      const keys = Object.keys(localStorage);
      // On ne touche qu'aux clés de notre application
      const appKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
      
      let deletedCount = 0;
      appKeys.forEach(key => {
        // Si la clé contient le motif (ex: 'hero-listings')
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
          deletedCount++;
        }
      });
      return deletedCount;
    } catch (error) {
      console.error('Erreur deleteByPattern:', error);
      return 0;
    }
  }

  /**
   * Vide tout le cache de l'application
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
   * Récupère les statistiques
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

      let expiredCount = 0;
      cacheKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (this._isExpired(item.timestamp, item.ttl)) expiredCount++;
        } catch { expiredCount++; }
      });

      stats.expiredEntries = expiredCount;
      return stats;
    } catch (error) {
      return null;
    }
  }

  /**
   * Nettoie les entrées expirées (Méthode publique)
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

  // --- Méthodes TTL Optimizer (Passthrough) ---
  getTTLOptimizations() {
    if (ttlOptimizer && typeof ttlOptimizer.getOptimizationRecommendations === 'function') {
      return ttlOptimizer.getOptimizationRecommendations();
    }
    return [];
  }

  applyTTLOptimizations() {
    if (ttlOptimizer && typeof ttlOptimizer.applyOptimizations === 'function') {
      return ttlOptimizer.applyOptimizations();
    }
    return false;
  }
}

// Instance singleton
export const localCache = new LocalCache();

// Nettoyage automatique
setInterval(() => {
  localCache.cleanup();
}, 30 * 60 * 1000);