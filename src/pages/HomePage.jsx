
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Home as HomeIcon, CarFront as CarIcon, Briefcase as BriefcaseIcon, ShoppingBag as ShoppingBagIcon, SearchCode as SearchIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { personalData } from '@/lib/personalData';
import { resolveSearchIntent } from '@/lib/search-intent';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services';
import ListingCard from '@/components/ListingCard';
import HeroCarousel from '@/components/HeroCarousel';
import NewListingsSection from '@/components/NewListingsSection';

import { useHomePageData } from '@/hooks/useHomePageData';


const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Utiliser le hook optimisé pour toutes les données de la HomePage
  const { 
    heroListings, 
    popularListings,
    premiumListings,
    loading,
    error,
    forceRefresh,
    isCacheValid,
    cacheStats
  } = useHomePageData();
  
  // This page is now a redirect or placeholder as MarketplaceHomePage is the main entry.
  // For a portfolio site, this would be the main landing page.
  // For MaxiMarket, we'll keep it simple and perhaps redirect or show a welcome message.

  const categoryCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const categories = [
    { name: "Immobilier", icon: <HomeIcon className="h-10 w-10 mb-3 text-primary" />, path: "/immobilier", description: "Maisons, appartements, terrains." },
    { name: "Automobile", icon: <CarIcon className="h-10 w-10 mb-3 text-primary" />, path: "/automobile", description: "Voitures, motos, utilitaires." },
    { name: "Services Pro", icon: <BriefcaseIcon className="h-10 w-10 mb-3 text-primary" />, path: "/services", description: "Experts qualifiés à votre service." },
    { name: "Marketplace", icon: <ShoppingBagIcon className="h-10 w-10 mb-3 text-primary" />, path: "/marketplace", description: "Produits neufs et d'occasion." }
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-blue-900/20 text-foreground">
      {/* Hero Carousel Section with Floating Categories */}
      <div className="relative">
        <HeroCarousel />

        {/* Floating Category Cards - Mobile only */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 md:hidden">
                <div className="container mx-auto px-4 md:px-6">
                  {/* Titre */}
            <h2 className="text-slate-900 dark:text-white text-center text-base md:text-lg font-bold mb-3 md:mb-4 drop-shadow-lg">
                    Explorez nos catégories
                  </h2>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-xl md:max-w-2xl mx-auto">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.name}
                        custom={index}
                        variants={categoryCardVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleCategoryClick(category.path)}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 md:p-3 rounded-md shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center border border-white/20 dark:border-white/10 hover:border-primary/40 cursor-pointer group"
                      >
                        <div className="text-2xl md:text-3xl mb-1 text-primary dark:text-white">{category.icon}</div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-[10px] md:text-xs mb-2 flex-grow group-hover:text-primary/80 transition-colors line-clamp-1 hidden md:block">
                          {category.description}
                        </p>
                        <div className="w-full text-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                          <span className="text-[10px] md:text-xs font-semibold">Voir</span>
                          <ArrowRight className="ml-0.5 md:ml-1 h-2.5 w-2.5 md:h-3 md:w-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
          </div>
      </div>

      {/* Premium Listings - Masquer si vide */}
      {(loading.premium || premiumListings.length > 0) && (
        <section className="py-8 md:py-12 bg-background/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              ⭐ Annonces <span className="gradient-text">Premium</span>
            </motion.h2>

            {error.premium && (
              <p className="text-center text-destructive mb-8">{error.premium}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {loading.premium &&
                !premiumListings.length &&
                Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-amber-50/80 to-yellow-100/80 rounded-lg shadow-xl overflow-hidden glassmorphic-card border-2 border-amber-300/50"
                  >
                    <div className="h-40 sm:h-48 md:h-56 bg-gradient-to-r from-amber-200/50 to-yellow-200/50 animate-pulse" />
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className="h-6 w-3/4 bg-gradient-to-r from-amber-200/50 to-yellow-200/50 rounded mb-3 animate-pulse" />
                      <div className="h-4 w-1/2 bg-gradient-to-r from-amber-200/50 to-yellow-200/50 rounded mb-4 animate-pulse" />
                      <div className="h-10 w-1/3 bg-gradient-to-r from-amber-300/50 to-yellow-300/50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}

              {premiumListings.slice(0, 10).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions={false}
                />
              ))}
            </div>

            {premiumListings.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
                  onClick={() => navigate("/premium")}
                >
                  Voir Toutes les Annonces Premium{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Listings - Masquer si vide */}
      {(loading.popular || popularListings.length > 0) && (
        <section className="py-5 md:py-7 bg-background/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              🔥 <span className="gradient-text">Annonces Populaires</span>
            </h2>
            {error.popular && (
              <p className="text-center text-destructive mb-8">{error.popular}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {loading.popular &&
                !popularListings.length &&
                Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-card rounded-lg shadow-xl overflow-hidden glassmorphic-card border border-transparent"
                  >
                    <div className="h-40 sm:h-48 md:h-56 bg-muted animate-pulse" />
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className="h-6 w-3/4 bg-muted rounded mb-3 animate-pulse" />
                      <div className="h-4 w-1/2 bg-muted rounded mb-4 animate-pulse" />
                      <div className="h-10 w-1/3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}

              {popularListings.slice(0, 8).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions={false}
                />
              ))}
            </div>
            <div className="text-center mt-6">
              <Button
                size="lg"
                variant="default"
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground"
                onClick={() => navigate("/marketplace?sort=popular&per=24")}
              >
                Voir Toutes les Annonces <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* New Listings Section */}
      <NewListingsSection />

      {/* Call to Action */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {user ? (
              <>Prêt à <span className="gradient-text">Publier</span> ?</>
            ) : (
              <>Prêt à <span className="gradient-text">Rejoindre MaxiMarket</span> ?</>
            )}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {user ? (
              "Publiez votre annonce et touchez des milliers d'acheteurs potentiels en quelques clics."
            ) : (
              "Créez un compte, publiez votre première annonce ou trouvez l'affaire parfaite en quelques clics."
            )}
          </motion.p>
          <motion.div
            className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              onClick={() => {
                if (user) {
                  navigate("/creer-annonce");
                } else {
                  navigate("/connexion", { state: { from: "/creer-annonce" } });
                }
              }}
            >
              Publier une Annonce
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/inscription")}
              >
                Créer un Compte
              </Button>
            )}
            {user && (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/marketplace")}
              >
                Explorer les Annonces
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
