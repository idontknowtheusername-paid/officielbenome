import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useListingImages } from '@/hooks';
import OptimizedImage from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

const HeroCarousel = ({ listings = [], category, hour, timeSlot, onListingClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

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

  // Gestion du clic sur une annonce
  const handleListingClick = useCallback((listing) => {
    if (onListingClick) {
      onListingClick(listing);
    } else {
      navigate(`/annonce/${listing.id}`);
    }
  }, [navigate, onListingClick]);



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

  return (
    <div 
      className="relative h-screen overflow-hidden"
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

      {/* Contenu principal - Simplifié pour ne montrer que l'image en arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          {/* Badge de catégorie et heure - Discret en haut */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center items-center gap-4 mb-8"
          >
            <Badge className={cn("text-white/80 border-0 text-sm", getCategoryColor(category))}>
              <span className="mr-1">{getCategoryIcon(category)}</span>
              {category === 'real_estate' && 'Immobilier'}
              {category === 'automobile' && 'Automobile'}
              {category === 'services' && 'Services'}
              {category === 'marketplace' && 'Marketplace'}
            </Badge>
            <Badge variant="outline" className="text-white/80 border-white/20 text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {timeSlot} • {hour}h
            </Badge>
          </motion.div>

          {/* Titre principal du site - Plus visible */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Bienvenue sur{" "}
            <span className="gradient-text">MaxiMarket</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-32 max-w-3xl mx-auto"
          >
            Explorez, découvrez, connectez. Votre marketplace de confiance.
          </motion.p>

          {/* Indicateur discret de l'annonce en cours - Plus bas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="text-white/60 text-sm mb-4"
          >
            Découvrez : {currentListing.title}
          </motion.div>

          {/* Bouton discret pour voir l'annonce - Plus bas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="flex justify-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 border border-white/20"
              onClick={() => handleListingClick(currentListing)}
            >
              Voir cette annonce
            </Button>
          </motion.div>

        </div>
      </div>

      {/* Indicateurs discrets - Seulement les points de navigation */}
      {listings.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
          {listings.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                index === currentIndex 
                  ? "bg-white scale-125" 
                  : "bg-white/30 hover:bg-white/50"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
