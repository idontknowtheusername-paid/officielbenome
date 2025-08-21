
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, FolderHeart as HomeIcon, BadgeCent as CarIcon, Briefcase as BriefcaseIcon, ShoppingBag as ShoppingBagIcon, SearchCode as SearchIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { personalData } from '@/lib/personalData';
import { resolveSearchIntent } from '@/lib/search-intent';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services';
import ListingCard from '@/components/ListingCard';
import HeroCarousel from '@/components/HeroCarousel';


const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [popularListings, setPopularListings] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [errorPopular, setErrorPopular] = useState(null);
  
  // État pour les annonces premium
  const [premiumListings, setPremiumListings] = useState([]);
  const [loadingPremium, setLoadingPremium] = useState(true);
  const [errorPremium, setErrorPremium] = useState(null);
  
  // État pour les annonces hero
  const [heroListings, setHeroListings] = useState([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const [errorHero, setErrorHero] = useState(null);
  const [heroInfo, setHeroInfo] = useState({ category: '', hour: 0, timeSlot: '' });

  useEffect(() => {
    let timerId;
    
    const loadPopular = async () => {
      try {
        setLoadingPopular(true);
        const data = await listingService.getTopViewedListings(6);
        setPopularListings(data || []);
      } catch (e) {
        setErrorPopular(e?.message || 'Erreur lors du chargement des annonces populaires');
      } finally {
        setLoadingPopular(false);
      }
    };

    const loadPremium = async () => {
      try {
        setLoadingPremium(true);
        const data = await listingService.getPremiumListings(10);
        setPremiumListings(data?.data || []);
      } catch (e) {
        setErrorPremium(e?.message || 'Erreur lors du chargement des annonces premium');
      } finally {
        setLoadingPremium(false);
      }
    };

    const loadHero = async () => {
      try {
        setLoadingHero(true);
        const data = await listingService.getHeroListings(6);
        setHeroListings(data?.data || []);
        setHeroInfo({
          category: data?.category || '',
          hour: data?.hour || 0,
          timeSlot: data?.rotationInfo?.timeSlot || ''
        });
      } catch (e) {
        setErrorHero(e?.message || 'Erreur lors du chargement des annonces hero');
      } finally {
        setLoadingHero(false);
      }
    };

    // Charger les trois types d'annonces
    loadPopular();
    loadPremium();
    loadHero();
    
    // Rafraichissement periodique toutes les 30 minutes
    timerId = setInterval(() => {
      loadPopular();
      loadPremium();
      loadHero();
    }, 1800000);
    
    return () => clearInterval(timerId);
  }, []);
  
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
      {/* Hero Carousel Section */}
      {loadingHero ? (
        <div className="relative h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Chargement des annonces...</h2>
            <p className="text-gray-300">Préparation de votre expérience personnalisée</p>
          </div>
        </div>
      ) : errorHero ? (
        <div className="relative h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
            <p className="text-gray-300">{errorHero}</p>
          </div>
        </div>
      ) : (
        <>
          <HeroCarousel
            listings={heroListings}
            category={heroInfo.category}
            hour={heroInfo.hour}
            timeSlot={heroInfo.timeSlot}
          />
          
          {/* Barre de recherche flottante */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl px-4" style={{ bottom: '120px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.querySelector('input[name="q"]');
                  const q = input?.value || "";
                  const { section, params } = resolveSearchIntent(q);
                  const usp = new URLSearchParams(params);
                  const path =
                    section === "immobilier"
                      ? "/immobilier"
                      : section === "automobile"
                      ? "/automobile"
                      : section === "services"
                      ? "/services"
                      : "/marketplace";
                  navigate(`${path}?${usp.toString()}`);
                }}
                className="relative"
              >
                <Input
                  name="q"
                  type="search"
                  placeholder="Que recherchez-vous sur MaxiMarket ?"
                  className="w-full py-4 px-6 pr-16 rounded-full text-lg bg-white/10 text-white placeholder-gray-400 border-2 border-transparent focus:border-primary focus:ring-primary focus:outline-none backdrop-blur-md h-16"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 h-12 w-12 p-0"
                >
                  <SearchIcon className="h-6 w-6 text-white" />
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      )}

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explorez nos <span className="gradient-text">Univers</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                custom={index}
                variants={categoryCardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => handleCategoryClick(category.path)}
                className="bg-card p-6 rounded-xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center glassmorphic-card border border-transparent hover:border-primary/50 cursor-pointer group"
              >
                {category.icon}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-5 flex-grow group-hover:text-primary/80 transition-colors">
                  {category.description}
                </p>
                <div className="w-full border border-primary/50 rounded-md px-4 py-2 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  Découvrir{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform inline" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Listings */}
      <section className="py-16 md:py-24 bg-background/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ⭐ Annonces <span className="gradient-text">Premium</span>
          </motion.h2>

          {errorPremium && (
            <p className="text-center text-destructive mb-8">{errorPremium}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {loadingPremium &&
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

            {!loadingPremium && premiumListings.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-2xl font-semibold mb-2">
                  Aucune annonce premium pour le moment
                </h3>
                <p className="text-muted-foreground mb-6">
                  Soyez le premier à passer premium et boostez votre visibilité
                  !
                </p>
                <Button
                  onClick={() => navigate("/creer-annonce")}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Créer une Annonce Premium
                </Button>
              </div>
            )}

            {premiumListings.slice(0, 10).map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions={false}
              />
            ))}
          </div>

          <div className="text-center mt-12">
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
        </div>
      </section>

      {/* Popular Listings */}
      <section className="py-16 md:py-24 bg-background/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Annonces <span className="gradient-text">Populaires</span>
          </h2>
          {errorPopular && (
            <p className="text-center text-destructive mb-8">{errorPopular}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {loadingPopular &&
              !popularListings.length &&
              Array.from({ length: 6 }).map((_, idx) => (
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

            {!loadingPopular && popularListings.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">
                Aucune annonce populaire pour le moment.
              </p>
            )}

            {popularListings.slice(0, 6).map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions={false}
              />
            ))}
          </div>
          <div className="text-center mt-12">
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

      {/* Call to Action */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Prêt à <span className="gradient-text">Rejoindre MaxiMarket</span> ?
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Créez un compte, publiez votre première annonce ou trouvez l'affaire
            parfaite en quelques clics.
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
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/inscription")}
            >
              Créer un Compte
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
