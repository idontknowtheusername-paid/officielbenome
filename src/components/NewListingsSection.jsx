import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ListingCard from '@/components/ListingCard';
import { listingService } from '@/services';

const NewListingsSection = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Charger les vraies nouvelles annonces
  useEffect(() => {
    loadNewListings();
  }, []);

  const loadNewListings = async () => {
    try {
      setLoading(true);
      
      const response = await listingService.getAllListings({
        limit: 50, // Charger plus d'annonces pour avoir un bon pool de rotation
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      
      // getAllListings retourne { data: [...], count, hasMore }
      const allListings = response?.data || [];
      
      // Filtrer pour exclure les annonces premium (éviter double affichage)
      const nonPremiumListings = allListings.filter(
        listing => !listing.is_featured && !listing.is_boosted
      );
      
      setListings(nonPremiumListings);
    } catch (error) {
      console.error('❌ Erreur chargement nouvelles annonces:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Rotation horaire intelligente (change toutes les heures)
  useEffect(() => {
    if (listings.length <= 10) return;

    // Calculer l'index basé sur l'heure actuelle
    const updateRotation = () => {
      const now = new Date();
      const hourOfDay = now.getHours();
      const totalPages = Math.ceil(listings.length / 10);
      
      // Rotation basée sur l'heure (0-23h) modulo nombre de pages
      const pageIndex = hourOfDay % totalPages;
      setCurrentIndex(pageIndex * 10);
    };

    // Initialiser la rotation
    updateRotation();

    // Vérifier toutes les minutes si l'heure a changé
    const interval = setInterval(() => {
      updateRotation();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [listings.length]);

  // Afficher 10 annonces à partir de currentIndex
  const displayedListings = listings.slice(currentIndex, currentIndex + 10);

  if (loading) {
    return (
      <section className="py-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-2">✨ Nouvelles Annonces</h2>
            <p className="text-muted-foreground">Découvrez les dernières offres</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayedListings.length === 0) {
    return null;
  }

  return (
    <section className="py-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            ✨ Nouvelles Annonces
          </h2>
          <p className="text-muted-foreground text-lg">
            Découvrez les dernières offres de notre communauté
          </p>
        </motion.div>

        {/* Grid 2x2 mobile, 4 colonnes desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {displayedListings.map((listing, index) => (
            <motion.div
              key={`${listing.id}-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListingCard
                listing={listing}
                showActions={false}
                showNewBadge={true}
              />
            </motion.div>
          ))}
        </div>

        {/* Indicateur de rotation */}
        {listings.length > 10 && (
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: Math.ceil(listings.length / 10) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 10)}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 10) === i
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewListingsSection;
