import React, { useState, useEffect } from 'react';
import { performanceMetrics } from '@/lib/performanceMetrics';
import { localCache } from '@/lib/localCache';
import { swManager } from '@/lib/swManager';
import { cachedListingService } from '@/services/cachedListingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, 
  RefreshCw, 
  Download,
  Activity,
  Database,
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  Settings
} from 'lucide-react';

export const AdvancedCacheMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [swStatus, setSwStatus] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const updateData = () => {
      setMetrics(performanceMetrics.getStats());
      setCacheStats(localCache.getStats());
      setSwStatus(swManager.getStatus());
    };

    // Mise à jour initiale
    updateData();

    // Mise à jour toutes les 2 secondes
    const interval = setInterval(updateData, 2000);

    // Observateur pour les données en temps réel
    const observer = (event, data) => {
      setRealTimeData(prev => {
        const newData = [...prev, { event, data, timestamp: Date.now() }];
        // Garder seulement les 50 derniers événements
        return newData.slice(-50);
      });
    };

    performanceMetrics.addObserver(observer);

    return () => {
      clearInterval(interval);
      performanceMetrics.removeObserver(observer);
    };
  }, [isVisible]);

  const handleExportMetrics = () => {
    const data = performanceMetrics.exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cache-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetMetrics = () => {
    performanceMetrics.reset();
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <BarChart3 className="w-4 h-4 mr-2" />
          Métriques
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Métriques Avancées</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={handleExportMetrics}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Exporter les métriques"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
              <TabsTrigger value="realtime" className="text-xs">Temps réel</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
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
              </div>

              {/* Cache Hit Ratio */}
              {metrics && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Cache Hit Ratio</span>
                    <span className="font-semibold">{metrics.cacheHitRatio.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cacheHitRatio} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {metrics.cacheHits} hits / {metrics.cacheMisses} misses
                  </div>
                </div>
              )}

              {/* Temps de chargement moyen */}
              {metrics && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Temps moyen
                    </span>
                    <span className="font-semibold">{metrics.averageLoadTime.toFixed(0)}ms</span>
                  </div>
                </div>
              )}

              {/* Utilisation mémoire */}
              {metrics && metrics.memoryUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Mémoire utilisée</span>
                    <span>{formatBytes(metrics.memoryUsage.used || 0)}</span>
                  </div>
                </div>
              )}

              {/* Uptime */}
              {metrics && (
                <div className="text-xs text-muted-foreground">
                  Uptime: {formatUptime(metrics.uptime)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {/* Statistiques détaillées */}
              {metrics && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <div className="font-semibold">{metrics.apiCalls}</div>
                      <div className="text-muted-foreground">Appels API</div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="font-semibold">{metrics.errors}</div>
                      <div className="text-muted-foreground">Erreurs</div>
                    </div>
                  </div>

                  {/* Cache local stats */}
                  {cacheStats && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold">Cache Local</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="font-semibold">{cacheStats.totalEntries}</div>
                          <div className="text-muted-foreground">Entrées</div>
                        </div>
                        <div>
                          <div className="font-semibold">{formatBytes(cacheStats.totalSize)}</div>
                          <div className="text-muted-foreground">Taille</div>
                        </div>
                      </div>
                      <Progress value={cacheStats.usagePercentage} className="h-1" />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleResetMetrics}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
                <Button
                  onClick={() => cachedListingService.clearCache()}
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Vider
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              {/* Événements en temps réel */}
              <div className="text-xs font-semibold mb-2">Événements récents</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {realTimeData.slice(-10).reverse().map((item, index) => (
                  <div key={index} className="text-xs p-1 bg-muted rounded">
                    <div className="flex justify-between">
                      <span className="font-mono">{item.event}</span>
                      <span className="text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {item.data && (
                      <div className="text-muted-foreground truncate">
                        {JSON.stringify(item.data).substring(0, 50)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 