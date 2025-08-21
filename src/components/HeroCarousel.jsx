import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Eye, Heart } from 'lucide-react';
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

  // Navigation manuelle
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % listings.length);
  }, [listings.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + listings.length) % listings.length);
  }, [listings.length]);

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

  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

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

      {/* Contenu principal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          {/* Badge de catégorie et heure */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center items-center gap-4 mb-6"
          >
            <Badge className={cn("text-white border-0", getCategoryColor(category))}>
              <span className="mr-2">{getCategoryIcon(category)}</span>
              {category === 'real_estate' && 'Immobilier'}
              {category === 'automobile' && 'Automobile'}
              {category === 'services' && 'Services'}
              {category === 'marketplace' && 'Marketplace'}
            </Badge>
            <Badge variant="outline" className="text-white border-white/30">
              <Clock className="h-3 w-3 mr-1" />
              {timeSlot} • {hour}h
            </Badge>
          </motion.div>

          {/* Titre de l'annonce */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto"
          >
            {currentListing.title}
          </motion.h1>

          {/* Prix et localisation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8"
          >
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(currentListing.price)}
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin className="h-5 w-5 mr-2" />
              {currentListing.location?.city}, {currentListing.location?.country}
            </div>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex justify-center items-center gap-6 mb-10 text-gray-300"
          >
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              {currentListing.views_count || 0} vues
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              {currentListing.favorites_count || 0} favoris
            </div>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg transform hover:scale-105 transition-transform duration-300"
              onClick={() => handleListingClick(currentListing)}
            >
              Voir l'annonce
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 shadow-lg transform hover:scale-105 transition-transform duration-300"
              onClick={() => navigate(`/${category}`)}
            >
              Voir plus d'annonces
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      {listings.length > 1 && (
        <>
          {/* Boutons précédent/suivant */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicateurs */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {listings.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-white scale-125" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Compteur */}
          <div className="absolute top-8 right-8 text-white/70 text-sm">
            {currentIndex + 1} / {listings.length}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
