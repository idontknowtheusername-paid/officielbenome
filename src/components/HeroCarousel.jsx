import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useListingImages } from '@/hooks';
import OptimizedImage from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

// Styles CSS personnalisés pour le hero
const heroStyles = `
  .hero-container {
    position: relative;
    height: 100vh;
    overflow: hidden;
  }
  
  .hero-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 1rem 4rem;
  }
  
  .hero-badges {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
  
  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    line-height: 1.6;
    margin-bottom: 3rem;
    max-width: 48rem;
  }
  
  .hero-navigation {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.75rem;
    z-index: 50;
  }
  
  .hero-search {
    position: absolute;
    bottom: 8rem;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 42rem;
    padding: 0 1rem;
    z-index: 20;
  }
  
  @media (max-width: 768px) {
    .hero-content {
      padding: 0 1rem 8rem;
    }
    
    .hero-badges {
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    
    .hero-title {
      margin-bottom: 1rem;
      font-size: clamp(2rem, 8vw, 3rem);
    }
    
    .hero-subtitle {
      margin-bottom: 2rem;
      font-size: clamp(1rem, 4vw, 1.25rem);
    }
    
    .hero-search {
      bottom: 6rem;
      max-width: 90%;
    }
    
    .hero-navigation {
      bottom: 2rem;
    }
  }
  
  @media (max-width: 480px) {
    .hero-content {
      padding: 0 0.75rem 7rem;
    }
    
    .hero-badges {
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .hero-title {
      margin-bottom: 0.75rem;
      font-size: clamp(1.75rem, 10vw, 2.5rem);
    }
    
    .hero-subtitle {
      margin-bottom: 1.5rem;
      font-size: clamp(0.9rem, 5vw, 1.1rem);
    }
    
    .hero-search {
      bottom: 5rem;
      max-width: 95%;
      padding: 0 0.5rem;
    }
    
    .hero-navigation {
      bottom: 1.5rem;
    }
  }
`;

const HeroCarousel = ({ listings = [], category, hour, timeSlot }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState({ hour: hour, timeSlot: timeSlot });

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const getTimeSlot = (hour) => {
        if (hour >= 6 && hour < 12) return 'matin';
        if (hour >= 12 && hour < 18) return 'après-midi';
        if (hour >= 18 && hour < 22) return 'soirée';
        return 'nuit';
      };
      
      setCurrentTime({
        hour: currentHour,
        timeSlot: getTimeSlot(currentHour)
      });
    };

    // Mise à jour immédiate
    updateTime();

    // Mise à jour chaque minute
    const timeInterval = setInterval(updateTime, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Auto-play toutes les 8 secondes
  useEffect(() => {
    if (!isAutoPlaying || listings.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % listings.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, listings.length]);

  // Pause auto-play au survol
  const handleMouseEnter = useCallback(() => setIsAutoPlaying(false), []);
  const handleMouseLeave = useCallback(() => setIsAutoPlaying(true), []);



  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);





  // Icône de catégorie
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'real_estate': return '🏠';
      case 'automobile': return '🚗';
      case 'services': return '🔧';
      case 'marketplace': return '🛍️';
      default: return '📋';
    }
  };

  // Couleur de catégorie
  const getCategoryColor = (category) => {
    switch (category) {
      case 'real_estate': return 'bg-blue-500';
      case 'automobile': return 'bg-green-500';
      case 'services': return 'bg-purple-500';
      case 'marketplace': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Libellé de catégorie
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'real_estate': return 'Immobilier';
      case 'automobile': return 'Automobile';
      case 'services': return 'Services';
      case 'marketplace': return 'Marketplace';
      default: return 'Annonces';
    }
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="relative h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Aucune annonce disponible</h2>
          <p className="text-gray-300">Revenez plus tard pour découvrir de nouvelles annonces</p>
        </div>
      </div>
    );
  }

  const currentListing = listings[currentIndex];
  const currentCategory = currentListing?.category || category;

  return (
    <>
      <style>{heroStyles}</style>
      <div 
        className="hero-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Image de fond */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentListing.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={currentListing.images?.[0] || currentListing.image_url}
            alt={currentListing.title}
            className="w-full h-full object-cover"
            context="hero"
            quality="high"
            priority="high"
            showSkeleton={true}
            enableHeroAnimations={true}
            showOverlay={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Contenu principal - Utilise les nouvelles classes CSS */}
      <div className="hero-content">
        <div className="text-center relative z-10">
          {/* Badge de catégorie et heure - Utilise les nouvelles classes */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hero-badges"
          >
            <Badge className={cn("text-white/90 border-0 text-sm px-4 py-2", getCategoryColor(currentCategory))}>
              <span className="mr-2">{getCategoryIcon(currentCategory)}</span>
              {getCategoryLabel(currentCategory)}
            </Badge>
            <Badge variant="outline" className="text-white/90 border-white/30 text-sm px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {currentTime.timeSlot} • {currentTime.hour}h
            </Badge>
          </motion.div>

          {/* Titre principal du site - Utilise les nouvelles classes */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hero-title text-white"
          >
            Bienvenue sur{" "}
            <span className="gradient-text">MaxiMarket</span>
          </motion.h1>

          {/* Sous-titre - Utilise les nouvelles classes */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="hero-subtitle text-gray-200"
          >
            Explorez, découvrez, connectez. Votre marketplace de confiance.
          </motion.p>
        </div>
      </div>

      {/* Indicateurs de navigation - Utilise les nouvelles classes */}
      {listings.length > 1 && (
        <div className="hero-navigation">
          {listings.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 cursor-pointer",
                index === currentIndex 
                  ? "bg-white scale-110 shadow-lg" 
                  : "bg-white/40 hover:bg-white/60 hover:scale-105"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default HeroCarousel;
