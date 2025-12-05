
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Search, ArrowRight, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useListings } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const GeneralMarketplacePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialSort = query.get('sort') || '';
  const initialPer = parseInt(query.get('per') || '12', 10);
  const initialSearch = query.get('search') || '';
  const initialMinPrice = query.get('minPrice') || '';
  const initialMaxPrice = query.get('maxPrice') || '';
  const initialLocation = query.get('location') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    location: initialLocation,
    category: '',
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    condition: '',
    sort: initialSort,
    per: isNaN(initialPer) ? 12 : Math.min(Math.max(initialPer, 6), 48)
  });

  // Utiliser le hook pour recuperer les annonces marketplace
  const { 
    listings, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    toggleFavorite 
  } = useListings('marketplace', filters);

  const handleSearch = (e) => {
    e.preventDefault();
    // La recherche se fait automatiquement via le hook
  };

  // Tri local si sort=popular (par securite si le service ne le fait pas)
  const sortedListings = useMemo(() => {
    if (filters.sort === 'popular') {
      return [...listings].sort((a, b) => (b?.views_count || 0) - (a?.views_count || 0));
    }
    return listings;
  }, [filters.sort, listings]);

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
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    });
  };

  const handleCreateListing = () => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    navigate('/creer-annonce/marketplace');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-900/10 text-foreground py-12">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Le Meilleur <span className="gradient-text-orange">Marketplace</span> en Afrique de l'Ouest
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Téléphones, vêtements, meubles, livres et bien plus. Achetez et vendez en toute sécurité.
          </p>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card p-6 rounded-xl shadow-xl mb-12 glassmorphic-card"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-1">Recherche</label>
              <div className="relative">
                <Input 
                  id="search" 
                  type="text" 
                  placeholder="Produit, marque, mots-clés..." 
                  className="pl-10 h-12 text-base"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">Localisation</label>
              <Input 
                id="location" 
                type="text" 
                placeholder="Ville, quartier..." 
                className="h-12 text-base"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">Catégorie</label>
              <select 
                id="category" 
                className="w-full h-12 rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Toutes catégories</option>
                <option value="telephonie">Téléphonie</option>
                <option value="informatique">Informatique</option>
                <option value="vetements">Vêtements</option>
                <option value="chaussures">Chaussures</option>
                <option value="accessoires">Accessoires</option>
                <option value="mobilier">Mobilier</option>
                <option value="electromenager">Électroménager</option>
                <option value="livres">Livres</option>
                <option value="sport">Sport</option>
                <option value="beaute">Beauté</option>
                <option value="jouets">Jouets</option>
                <option value="bricolage">Bricolage</option>
                <option value="jardinage">Jardinage</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="condition" className="block text-sm font-medium mb-1">État</label>
              <select 
                id="condition" 
                className="w-full h-12 rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">Tous états</option>
                <option value="neuf">Neuf</option>
                <option value="excellent">Excellent</option>
                <option value="bon">Bon</option>
                <option value="moyen">Moyen</option>
                <option value="usage">Usage</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="price-range" className="block text-sm font-medium mb-1">Prix (FCFA)</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  placeholder="Min" 
                  className="h-12 text-base"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <Input 
                  type="number" 
                  placeholder="Max" 
                  className="h-12 text-base"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="h-12 text-base flex-1 bg-primary hover:bg-primary/90">
                <Filter className="mr-2 h-5 w-5" /> Rechercher
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 px-3"
                onClick={clearFilters}
              >
                Effacer
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Create Listing Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 text-center"
        >
          <Button 
            onClick={handleCreateListing}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
          >
            🛍️ Vendre un produit
          </Button>
        </motion.div>

        {/* Loading State */}
        {loading && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Chargement des produits...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg text-destructive mb-2">Erreur lors du chargement</p>
            <p className="text-muted-foreground mb-4">
              {typeof error === 'string' ? error : error?.message || 'Une erreur est survenue'}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recharger la page
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
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
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Aucun produit ne correspond à vos critères de recherche.
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
                  Charger plus de produits <ArrowRight className="ml-2 h-5 w-5" />
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
              {listings.length} produit{listings.length > 1 ? 's' : ''} trouvé{listings.length > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GeneralMarketplacePage;
