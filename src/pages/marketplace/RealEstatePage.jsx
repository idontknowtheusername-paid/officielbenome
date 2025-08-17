
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Search, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useListings, useFavorites } from '@/hooks';
import ListingCard from '@/components/ListingCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const RealEstatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const query = useMemo(() => new URLSearchParams(locationHook.search), [locationHook.search]);
  const initialSearch = query.get('search') || '';
  const initialMinPrice = query.get('minPrice') || '';
  const initialMaxPrice = query.get('maxPrice') || '';
  const initialLocation = query.get('location') || '';
  const [filters, setFilters] = useState({
    search: initialSearch,
    location: initialLocation,
    type: '',
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice
  });

  // Utiliser le hook pour recuperer les annonces immobilieres
  const { 
    listings, 
    loading, 
    error, 
    hasMore, 
    loadMore
  } = useListings('real_estate', filters);

  // Utiliser le hook dédié pour les favoris
  const { toggleFavorite, isToggling } = useFavorites();

  const handleSearch = (e) => {
    e.preventDefault();
    // La recherche se fait automatiquement via le hook
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const handleCreateListing = () => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    navigate('/creer-annonce/real-estate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-green-900/10 text-foreground py-12">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Le Meilleur de l'<span className="gradient-text-emerald">Immobilier</span> en Afrique de l'Ouest
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Appartements, maisons, terrains et locaux commerciaux. Trouvez votre prochaine propriété ou investissement ici.
          </p>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card p-6 rounded-xl shadow-xl mb-12 glassmorphic-card"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-1">Recherche</label>
              <div className="relative">
                <Input 
                  id="search" 
                  type="text" 
                  placeholder="Entrez une ville, quartier, mots-clés..." 
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">Localisation</label>
              <Input 
                id="location" 
                type="text" 
                placeholder="Ville, région..." 
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium mb-1">Prix min</label>
              <Input 
                id="minPrice" 
                type="number" 
                placeholder="0" 
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">Prix max</label>
              <Input 
                id="maxPrice" 
                type="number" 
                placeholder="∞" 
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Create Listing Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-12"
        >
          <Button 
            onClick={handleCreateListing}
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Publier une annonce immobilière
          </Button>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Chargement des annonces...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg text-destructive mb-2">Erreur lors du chargement</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recharger la page
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Réessayer
              </Button>
            </div>
          </motion.div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListingCard 
                  listing={listing} 
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold mb-2">Aucune annonce trouvée</h3>
            <p className="text-muted-foreground mb-6">
              Aucune annonce immobilière ne correspond à vos critères de recherche.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Effacer les filtres
            </Button>
          </motion.div>
        )}
        
        {/* Load More Button */}
        {hasMore && listings.length > 0 && (
          <div className="text-center mt-16">
            <Button 
              onClick={loadMore}
              size="lg" 
              variant="ghost" 
              className="text-primary hover:text-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Charger plus d'annonces <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Stats */}
        {listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground">
              {listings.length} annonce{listings.length > 1 ? 's' : ''} immobilière{listings.length > 1 ? 's' : ''} trouvée{listings.length > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RealEstatePage;
