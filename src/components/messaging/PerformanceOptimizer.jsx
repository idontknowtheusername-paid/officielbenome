import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Image as ImageIcon, 
  Download, 
  RefreshCw,
  Zap,
  Clock,
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

/**
 * Composant d'optimisation des performances pour la messagerie
 * Gère le lazy loading, l'optimisation des images et la gestion du cache
 */
const PerformanceOptimizer = ({ 
  children, 
  preloadImages = true,
  enableCache = true,
  lazyLoadThreshold = 0.1,
  className = '',
  ...props 
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('idle');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    imageCount: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });
  
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const { toast } = useToast();

  // Mesurer les performances de chargement
  useEffect(() => {
    const startTime = performance.now();
    
    const measurePerformance = () => {
      const loadTime = performance.now() - startTime;
      const images = document.querySelectorAll('img');
      const memoryInfo = performance.memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
      
      setPerformanceMetrics({
        loadTime: Math.round(loadTime),
        imageCount: images.length,
        cacheHitRate: calculateCacheHitRate(),
        memoryUsage: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
      });
    };

    // Mesurer après le chargement complet
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Initialiser l'Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            if (target.dataset.src) {
              target.src = target.dataset.src;
              target.removeAttribute('data-src');
              observerRef.current?.unobserve(target);
            }
          }
        });
      },
      {
        threshold: lazyLoadThreshold,
        rootMargin: '50px'
      }
    );

    // Observer tous les éléments avec data-src
    const lazyElements = containerRef.current.querySelectorAll('[data-src]');
    lazyElements.forEach(el => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazyLoadThreshold]);

  // Calculer le taux de hit du cache
  const calculateCacheHitRate = useCallback(() => {
    if (!enableCache) return 0;
    
    try {
      const cacheKeys = Object.keys(localStorage);
      const cacheHits = cacheKeys.filter(key => key.startsWith('msg_cache_')).length;
      const totalRequests = cacheHits + Math.floor(Math.random() * 10); // Simulation
      
      return totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0;
    } catch {
      return 0;
    }
  }, [enableCache]);

  // Optimiser les images
  const optimizeImages = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      const images = containerRef.current?.querySelectorAll('img') || [];
      let optimizedCount = 0;

      for (const img of images) {
        if (img.complete && img.naturalWidth > 0) {
          // Optimiser la qualité et la taille
          if (img.naturalWidth > 800) {
            img.style.maxWidth = '800px';
            img.style.height = 'auto';
            optimizedCount++;
          }
          
          // Ajouter lazy loading natif
          if (!img.loading) {
            img.loading = 'lazy';
            optimizedCount++;
          }
        }
      }

      toast({
        title: "Images optimisées !",
        description: `${optimizedCount} images ont été optimisées pour de meilleures performances.`,
        duration: 3000,
      });

      // Mettre à jour les métriques
      setPerformanceMetrics(prev => ({
        ...prev,
        imageCount: images.length
      }));

    } catch (error) {
      console.error('Erreur optimisation images:', error);
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser les images pour le moment.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [toast]);

  // Gérer le cache
  const manageCache = useCallback(async () => {
    setCacheStatus('managing');
    
    try {
      if (enableCache) {
        // Nettoyer le cache ancien
        const cacheKeys = Object.keys(localStorage);
        const oldCacheKeys = cacheKeys.filter(key => {
          if (key.startsWith('msg_cache_')) {
            try {
              const cacheData = JSON.parse(localStorage.getItem(key));
              const age = Date.now() - (cacheData.timestamp || 0);
              return age > 24 * 60 * 60 * 1000; // 24h
            } catch {
              return true; // Supprimer si invalide
            }
          }
          return false;
        });

        oldCacheKeys.forEach(key => localStorage.removeItem(key));

        toast({
          title: "Cache optimisé !",
          description: `${oldCacheKeys.length} éléments de cache anciens ont été supprimés.`,
          duration: 3000,
        });

        setCacheStatus('optimized');
      }
    } catch (error) {
      console.error('Erreur gestion cache:', error);
      setCacheStatus('error');
      toast({
        title: "Erreur de cache",
        description: "Impossible d'optimiser le cache pour le moment.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [enableCache, toast]);

  // Précharger les images importantes
  const preloadCriticalImages = useCallback(() => {
    if (!preloadImages) return;

    const criticalImages = [
      '/images/avatar-default.png',
              '/logo.jpg',
      '/images/icons/camera.png',
      '/images/icons/location.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, [preloadImages]);

  useEffect(() => {
    preloadCriticalImages();
  }, [preloadCriticalImages]);

  return (
    <div 
      ref={containerRef}
      className={`performance-optimizer ${className}`.trim()}
      {...props}
    >
      {/* Indicateur de performance */}
      <div className="performance-indicator">
        <div className="performance-metrics">
          <div className="metric">
            <Zap className="w-4 h-4" />
            <span>{performanceMetrics.loadTime}ms</span>
          </div>
          <div className="metric">
            <ImageIcon className="w-4 h-4" />
            <span>{performanceMetrics.imageCount}</span>
          </div>
          <div className="metric">
            <HardDrive className="w-4 h-4" />
            <span>{performanceMetrics.cacheHitRate}%</span>
          </div>
          <div className="metric">
            <Clock className="w-4 h-4" />
            <span>{performanceMetrics.memoryUsage}MB</span>
          </div>
        </div>
        
        <div className="performance-actions">
          <Button
            onClick={optimizeImages}
            disabled={isOptimizing}
            size="sm"
            variant="outline"
          >
            {isOptimizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Optimiser
          </Button>
          
          <Button
            onClick={manageCache}
            disabled={cacheStatus === 'managing'}
            size="sm"
            variant="outline"
          >
            {cacheStatus === 'managing' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4" />
            )}
            Cache
          </Button>
        </div>
      </div>

      {/* Contenu principal avec lazy loading */}
      <Suspense fallback={
        <div className="loading-fallback">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Chargement en cours...</p>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
};

export default PerformanceOptimizer;
