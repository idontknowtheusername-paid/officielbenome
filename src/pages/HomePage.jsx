import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home as HomeIcon, CarFront as CarIcon, Briefcase as BriefcaseIcon, ShoppingBag as ShoppingBagIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ListingCard from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ui/Skeleton';
import HeroCarousel from '@/components/HeroCarousel';
import NewListingsSection from '@/components/NewListingsSection';
import { useHomePageData } from '@/hooks/useHomePageData';

// 1. IMPORT DU PULL-TO-REFRESH
import PullToRefresh from 'react-simple-pull-to-refresh';

// --- IMPORTS APP NATIVE ---
import { useAppMode } from '@/hooks/useAppMode';
import HomeAppHeader from '@/components/HomeAppHeader';

/* --- 1. LE CONTENU PUR (Indépendant du Layout) --- */
const HomeContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Hook de données
  const { 
    popularListings,
    premiumListings,
    loading,
    error,
    forceRefresh // 2. On récupère la fonction magique de ton hook
  } = useHomePageData();

  // 3. FONCTION DE RAFRAÎCHISSEMENT
  // Cette fonction est appelée quand l'utilisateur tire vers le bas
  const handleRefresh = async () => {
    // On appelle forceRefresh qui est déjà dans ton hook useHomePageData
    // Cela va vider le cache et recharger les données proprement
    await forceRefresh();
  };

  const categoryCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const categories = [
    { name: "Immobilier", icon: <HomeIcon className="h-10 w-10 mb-3 text-primary" />, path: "/immobilier", description: "Maisons, appartements, terrains." },
    { name: "Auto", icon: <CarIcon className="h-10 w-10 mb-3 text-primary" />, path: "/automobile", description: "Voitures, motos." },
    { name: "Services", icon: <BriefcaseIcon className="h-10 w-10 mb-3 text-primary" />, path: "/services", description: "Experts qualifiés." },
    { name: "Shopping", icon: <ShoppingBagIcon className="h-10 w-10 mb-3 text-primary" />, path: "/marketplace", description: "Produits divers." }
  ];

  return (
    // 4. ENVELOPPE PULL TO REFRESH
    // On enveloppe tout le contenu visuel. 
    // pullingContent='' permet d'éviter d'afficher un texte par défaut moche, la flèche suffit.
    <PullToRefresh onRefresh={handleRefresh} pullingContent=''>
      
      {/* Note : On retire le padding global ici, il sera géré par le parent */}
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-blue-900/20 text-foreground">
        
        {/* Hero Carousel + Categories Flottantes */}
        <div className="relative">
          <HeroCarousel />

          {/* Floating Category Cards - Mobile only */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 md:hidden">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="text-slate-900 dark:text-white text-center text-base md:text-lg font-bold mb-3 md:mb-4 drop-shadow-lg">
                Explorez nos catégories
              </h2>
              <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-xl md:max-w-2xl mx-auto">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    custom={index}
                    variants={categoryCardVariants}
                    initial="hidden" animate="visible"
                    onClick={() => navigate(category.path)}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 md:p-3 rounded-md shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center border border-white/20 dark:border-white/10 hover:border-primary/40 cursor-pointer group"
                  >
                    <div className="text-2xl md:text-3xl mb-1 text-primary dark:text-white">{category.icon}</div>
                    <h3 className="text-xs md:text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-muted-foreground text-[10px] md:text-xs mb-2 flex-grow group-hover:text-primary/80 transition-colors line-clamp-1 hidden md:block">{category.description}</p>
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

        {/* Premium Listings */}
        {(loading.premium || premiumListings.length > 0) && (
          <section className="py-8 md:py-12 bg-background/30">
            <div className="container mx-auto px-4 md:px-6">
              <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                ⭐ Annonces <span className="gradient-text">Premium</span>
              </motion.h2>

              {error.premium && <p className="text-center text-destructive mb-8">{error.premium}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {loading.premium && !premiumListings.length && Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-amber-50/80 to-yellow-100/80 rounded-lg shadow-xl overflow-hidden h-64 animate-pulse border-2 border-amber-300/50" />
                ))}
                {premiumListings.slice(0, 10).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showActions={false} />
                ))}
              </div>
              
              {premiumListings.length > 0 && (
                <div className="text-center mt-8">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg" onClick={() => navigate("/premium")}>
                    Voir tout Premium <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Popular Listings */}
        {(loading.popular || popularListings.length > 0) && (
          <section className="py-5 md:py-7 bg-background/30">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">🔥 <span className="gradient-text">Populaires</span></h2>
              {error.popular && <p className="text-center text-destructive mb-8">{error.popular}</p>}
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {loading.popular && !popularListings.length && Array.from({ length: 4 }).map((_, idx) => <ListingCardSkeleton key={idx} />)}
                {popularListings.slice(0, 8).map((listing) => <ListingCard key={listing.id} listing={listing} showActions={false} />)}
              </div>
              
              <div className="text-center mt-6">
                <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground" onClick={() => navigate("/marketplace?sort=popular")}>
                  Voir tout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
        )}

        <NewListingsSection />

        {/* CTA */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {user ? <>Prêt à <span className="gradient-text">Publier</span> ?</> : <>Prêt à <span className="gradient-text">Rejoindre</span> ?</>}
            </motion.h2>
            <motion.p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {user ? "Publiez votre annonce et touchez des milliers d'acheteurs." : "Créez un compte et commencez l'aventure."}
            </motion.p>
            <motion.div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => navigate(user ? "/creer-annonce" : "/connexion", { state: { from: "/creer-annonce" } })}>
                Publier une Annonce
              </Button>
              {!user && <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/inscription")}>Créer un Compte</Button>}
            </motion.div>
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
};

/* --- 2. LE COMPOSANT PRINCIPAL (SWITCHER) --- */
const HomePage = () => {
  const { isAppMode } = useAppMode();

  // CAS 1 : MODE APP NATIVE
  if (isAppMode) {
    return (
      // On ajoute un wrapper div pour gérer le padding bottom de la nav mobile
      // On n'utilise PAS MobilePageLayout ici pour garder le Hero Carousel en "Full Width"
      <div className="pb-20 bg-background">
        <HomeAppHeader />
        <HomeContent />
      </div>
    );
  }

  // CAS 2 : MODE WEB (Layout standard sans padding spécifique en bas)
  return (
    <HomeContent />
  );
};

export default HomePage;