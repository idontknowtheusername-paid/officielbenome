import { ttlOptimizer } from './ttlOptimizer';

export class LocalCache {
  constructor(prefix = 'benome') {
    this.prefix = prefix;
    this.maxSize = 50 * 1024 * 1024; // 50MB max
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
    const targetSize = this.maxSize * 0.8; // Garder 80% du max

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
        console.warn('⚠️ Données trop volumineuses pour le cache local');
        return false;
      }

      // Nettoyer si nécessaire
      if (this._getCurrentCacheSize() + size > this.maxSize) {
        this._cleanup();
      }

      localStorage.setItem(cacheKey, JSON.stringify(item));
      
      // Enregistrer l'usage pour l'optimisation TTL
      ttlOptimizer.recordUsage(key, false, Date.now());
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde en cache:', error);
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
        // Enregistrer un miss pour l'optimisation TTL
        ttlOptimizer.recordUsage(key, false, Date.now());
        return null;
      }

      const parsed = JSON.parse(item);
      
      // Vérifier l'expiration
      if (this._isExpired(parsed.timestamp, parsed.ttl)) {
        this.delete(key);
        // Enregistrer un miss pour l'optimisation TTL
        ttlOptimizer.recordUsage(key, false, Date.now());
        return null;
      }

      // Enregistrer un hit pour l'optimisation TTL
      ttlOptimizer.recordUsage(key, true, Date.now());
      
      return parsed.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du cache:', error);
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
      console.error('❌ Erreur lors de la suppression du cache:', error);
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
      console.error('❌ Erreur lors du vidage du cache:', error);
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
      console.error('❌ Erreur lors du calcul des statistiques:', error);
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

      console.log(`🧹 Cache nettoyé: ${cleanedCount} entrées supprimées`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage du cache:', error);
      return 0;
    }
  }

  /**
   * Obtenir les recommandations d'optimisation TTL
   */
  getTTLOptimizations() {
    return ttlOptimizer.getOptimizationRecommendations();
  }

  /**
   * Appliquer les optimisations TTL
   */
  applyTTLOptimizations() {
    return ttlOptimizer.applyOptimizations();
  }
}

// Instance singleton
export const localCache = new LocalCache();

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
  localCache.cleanup();
}, 5 * 60 * 1000); 