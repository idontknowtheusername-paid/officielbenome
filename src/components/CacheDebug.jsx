import React, { useState, useEffect } from 'react';
import { localCache } from '@/lib/localCache';

const CacheDebug = () => {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = localCache.getStats();
      setStats(cacheStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Mettre à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  // Ne s'afficher qu'en mode développement
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Bouton toggle */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg"
        title="Cache Debug"
      >
        💾
      </button>

      {/* Panel de debug */}
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-black/90 text-white p-4 rounded-lg shadow-xl min-w-64 backdrop-blur-sm">
          <h3 className="font-bold mb-2 text-sm">Cache Statistics</h3>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Entries:</span>
              <span className="text-green-400">{stats.totalEntries}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="text-blue-400">
                {(stats.totalSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Usage:</span>
              <span className="text-yellow-400">
                {stats.usagePercentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Expired:</span>
              <span className="text-red-400">{stats.expiredEntries}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-600">
            <button
              onClick={() => {
                localCache.cleanup();
                setTimeout(() => setStats(localCache.getStats()), 100);
              }}
              className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
            >
              Cleanup
            </button>
            
            <button
              onClick={() => {
                localCache.clear();
                setTimeout(() => setStats(localCache.getStats()), 100);
              }}
              className="text-xs bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded ml-2"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheDebug;
