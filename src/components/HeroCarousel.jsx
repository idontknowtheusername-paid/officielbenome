import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search as SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HeroMockup from '@/components/HeroMockup';
import { cn } from '@/lib/utils';
import { HERO_SLIDES, CAROUSEL_CONFIG, getCategoryColor } from '@/data/heroSlides';
import { useNavigate } from 'react-router-dom';
import { resolveSearchIntent } from '@/lib/search-intent';

// Styles CSS personnalisés pour le hero
const heroStyles = `
  .hero-container {
    position: relative;
    height: 85vh;
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


  .hero-cta {
    margin-top: 2rem;
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
    
    .hero-navigation {
      bottom: 1.5rem;
    }
  }
`;

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(CAROUSEL_CONFIG.pauseOnHover);
  const [currentTime, setCurrentTime] = useState({ hour: new Date().getHours(), timeSlot: '' });

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

    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || !CAROUSEL_CONFIG.loop) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, CAROUSEL_CONFIG.autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pause auto-play au survol
  const handleMouseEnter = useCallback(() => {
    if (CAROUSEL_CONFIG.pauseOnHover) {
      setIsAutoPlaying(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (CAROUSEL_CONFIG.pauseOnHover) {
      setIsAutoPlaying(true);
    }
  }, []);

  // Navigation
  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    if (CAROUSEL_CONFIG.pauseOnHover) {
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 3000);
    }
  }, []);


  // Handler CTA
  const handleCTA = useCallback((link) => {
    navigate(link);
  }, [navigate]);

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <>
      <style>{heroStyles}</style>
      <div 
        className="hero-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Mockup visuel CSS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: CAROUSEL_CONFIG.transitionDuration / 1000, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <HeroMockup 
              gradient={currentSlide.gradient} 
              pattern={currentSlide.pattern}
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay adaptatif */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-[2px]"></div>

        {/* Contenu principal */}
        <div className="hero-content">
          <div className="text-center relative z-10">
            {/* Badge de catégorie et heure */}
            <motion.div
              key={`badges-${currentSlide.id}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hero-badges"
            >
              <Badge className={cn("text-white/90 border-0 text-sm px-4 py-2", getCategoryColor(currentSlide.category))}>
                <span className="mr-2">{currentSlide.categoryIcon}</span>
                {currentSlide.categoryLabel}
              </Badge>
              <Badge variant="outline" className="text-slate-700 dark:text-white/90 border-slate-400/30 dark:border-white/30 text-sm px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {currentTime.timeSlot} • {currentTime.hour}h
              </Badge>
            </motion.div>

            {/* Titre dynamique du slide */}
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-title text-slate-900 dark:text-white"
            >
              {currentSlide.title}
            </motion.h1>

            {/* Sous-titre dynamique */}
            <motion.p
              key={`subtitle-${currentSlide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="hero-subtitle text-slate-700 dark:text-gray-100"
            >
              {currentSlide.subtitle}
            </motion.p>



          </div>
        </div>


      </div>
    </>
  );
};

export default HeroCarousel;
