import React, { useState, useEffect } from 'react';
import { localCache } from '@/lib/localCache';
import { swManager } from '@/lib/swManager';
import { cachedListingService } from '@/services/cachedListingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Activity,
  Database
} from 'lucide-react';

export const CacheMonitor = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [swStatus, setSwStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Mise à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    setCacheStats(localCache.getStats());
    setSwStatus(swManager.getStatus());
  };

  const handleClearCache = async () => {
    try {
      cachedListingService.clearCache();
      updateStats();
      console.log('✅ Cache vidé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du vidage du cache:', error);
    }
  };

  const handleCleanupCache = () => {
    try {
      const cleaned = localCache.cleanup();
      updateStats();
      console.log(`🧹 ${cleaned} entrées expirées supprimées`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  };

  const handleUpdateSW = async () => {
    try {
      await swManager.update();
      updateStats();
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du SW:', error);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="w-4 h-4 mr-2" />
          Cache
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Cache Monitor</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Service Worker Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                {swStatus?.isRegistered ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
                Service Worker
              </span>
              <Badge variant={swStatus?.isRegistered ? "default" : "destructive"} className="text-xs">
                {swStatus?.isRegistered ? "Actif" : "Inactif"}
              </Badge>
            </div>
            
            {swStatus?.updateAvailable && (
              <Button
                onClick={handleUpdateSW}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Mettre à jour SW
              </Button>
            )}
          </div>

          {/* Cache Local Stats */}
          {cacheStats && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Cache Local
                </span>
                <span className="text-muted-foreground">
                  {cacheStats.totalEntries} entrées
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Utilisation</span>
                  <span>{cacheStats.usagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={cacheStats.usagePercentage} className="h-1" />
                <div className="text-xs text-muted-foreground">
                  {(cacheStats.totalSize / 1024 / 1024).toFixed(1)}MB / {(cacheStats.maxSize / 1024 / 1024).toFixed(0)}MB
                </div>
              </div>

              {cacheStats.expiredEntries > 0 && (
                <div className="text-xs text-orange-600">
                  ⚠️ {cacheStats.expiredEntries} entrées expirées
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCleanupCache}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Nettoyer
            </Button>
            <Button
              onClick={handleClearCache}
              size="sm"
              variant="destructive"
              className="flex-1 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Vider
            </Button>
          </div>

          {/* Cache Hit Indicator */}
          <div className="text-xs text-muted-foreground text-center">
            Cache hit ratio: {cacheStats ? Math.round((cacheStats.totalEntries - cacheStats.expiredEntries) / cacheStats.totalEntries * 100) : 0}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 