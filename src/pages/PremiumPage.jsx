import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Search, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import ListingCard from '@/components/ListingCard';
import { listingService } from '@/services';

// 1. IMPORT DU PULL-TO-REFRESH
import PullToRefresh from 'react-simple-pull-to-refresh';

const PremiumPage = () => {
  const navigate = useNavigate();
  const [premiumListings, setPremiumListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    search: ''
  });

  // 2. FONCTION DE RAFRAÎCHISSEMENT
  const handleRefresh = async () => {
    return new Promise((resolve) => {
      window.location.reload();
      resolve();
    });
  };

  // Charger les annonces premium
  const loadPremiumListings = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le tri par score premium pour la page premium
      const data = await listingService.getPremiumListings(100, true); // true = tri par score
      
      if (data?.data) {
        // Appliquer les filtres
        let filteredListings = data.data;
        
        if (newFilters.category) {
          filteredListings = filteredListings.filter(listing => 
            listing.category === newFilters.category
          );
        }
        
        if (newFilters.minPrice) {
          filteredListings = filteredListings.filter(listing => 
            listing.price >= parseFloat(newFilters.minPrice)
          );
        }
        
        if (newFilters.maxPrice) {
          filteredListings = filteredListings.filter(listing => 
            listing.price <= parseFloat(newFilters.maxPrice)
          );
        }
        
        if (newFilters.location) {
          filteredListings = filteredListings.filter(listing => 
            listing.location?.city?.toLowerCase().includes(newFilters.location.toLowerCase()) ||
            listing.location?.country?.toLowerCase().includes(newFilters.location.toLowerCase())
          );
        }
        
        if (newFilters.search) {
          filteredListings = filteredListings.filter(listing => 
            listing.title.toLowerCase().includes(newFilters.search.toLowerCase()) ||
            listing.description.toLowerCase().includes(newFilters.search.toLowerCase())
          );
        }
        
        // Pagination côté client
        const itemsPerPage = 12;
        const totalItems = filteredListings.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedListings = filteredListings.slice(startIndex, endIndex);
        
        setPremiumListings(paginatedListings);
        setTotalPages(totalPages);
        setHasMore(page < totalPages);
        setCurrentPage(page);
      }
    } catch (e) {
      setError(e?.message || 'Erreur lors du chargement des annonces premium');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPremiumListings(1, filters);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset à la première page
    loadPremiumListings(1, newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPremiumListings(1, filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      search: ''
    };
    setFilters(clearedFilters);
    loadPremiumListings(1, clearedFilters);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadPremiumListings(page, filters);
    }
  };

  const categories = [
    { value: 'real_estate', label: '🏠 Immobilier', color: 'bg-blue-100 text-blue-800' },
    { value: 'automobile', label: '🚗 Automobile', color: 'bg-green-100 text-green-800' },
    { value: 'services', label: '🔧 Services', color: 'bg-purple-100 text-purple-800' },
    { value: 'marketplace', label: '🛍️ Marketplace', color: 'bg-orange-100 text-orange-800' }
  ];

  return (
    // 3. ENVELOPPE PULL TO REFRESH
    <PullToRefresh onRefresh={handleRefresh} pullingContent=''>
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-blue-900/20">
        {/* Header Premium */}
        <motion.section 
          className="relative py-16 md:py-24 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mr-4 hover:bg-amber-100"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </Button>
            </div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex justify-center items-center mb-6">
                <Crown className="h-16 w-16 text-amber-500 mr-4" />
                <Star className="h-12 w-12 text-yellow-500" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Annonces <span className="gradient-text">Premium</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Découvrez notre sélection exclusive d'annonces premium. 
                Qualité garantie, visibilité maximale.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                  <Zap className="h-4 w-4 mr-2" />
                  Mise en avant garantie
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Star className="h-4 w-4 mr-2" />
                  Qualité premium
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                  <Crown className="h-4 w-4 mr-2" />
                  Support prioritaire
                </Badge>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Filtres et Recherche */}
        <section className="py-8 bg-background/50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="bg-card rounded-xl p-6 shadow-lg border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Barre de recherche */}
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher dans les annonces premium..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10 pr-4 py-3"
                    />
                  </form>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Toutes catégories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="number"
                    placeholder="Prix min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-32"
                  />

                  <Input
                    type="number"
                    placeholder="Prix max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-32"
                  />

                  <Input
                    type="text"
                    placeholder="Localisation"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-40"
                  />

                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Effacer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Liste des Annonces Premium */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            {error && (
              <motion.div
                className="text-center text-destructive mb-8 p-4 bg-destructive/10 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Grille des annonces */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 9 }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-card rounded-lg shadow-lg overflow-hidden border border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <div className="h-48 bg-muted animate-pulse" />
                    <div className="p-4">
                      <div className="h-6 w-3/4 bg-muted rounded mb-3 animate-pulse" />
                      <div className="h-4 w-1/2 bg-muted rounded mb-4 animate-pulse" />
                      <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
                    </div>
                  </motion.div>
                ))
              ) : premiumListings.length > 0 ? (
                premiumListings.map((listing, idx) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <ListingCard
                      listing={listing}
                      showActions={false}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="col-span-full text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Aucune annonce premium trouvée
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Essayez de modifier vos filtres ou revenez plus tard
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Effacer les filtres
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center mt-12 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Précédent
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => goToPage(page)}
                    className={currentPage === page 
                      ? "bg-amber-500 hover:bg-amber-600" 
                      : "border-amber-300 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Suivant
                </Button>
              </motion.div>
            )}

            {/* Statistiques */}
            {!loading && premiumListings.length > 0 && (
              <motion.div
                className="text-center mt-8 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p>
                  Affichage de {premiumListings.length} annonces premium 
                  {totalPages > 1 && ` (page ${currentPage} sur ${totalPages})`}
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
};

export default PremiumPage;
