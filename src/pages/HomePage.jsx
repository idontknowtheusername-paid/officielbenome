
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
import HeroImage from '@/components/HeroImage';


const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [popularListings, setPopularListings] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [errorPopular, setErrorPopular] = useState(null);

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
    loadPopular();
    // Rafraichissement periodique toutes les 30 minutes
    timerId = setInterval(loadPopular, 1800000);
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
      {/* Hero Section */}
      <motion.section 
        className="relative py-24 md:py-40 bg-cover bg-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <HeroImage
          src="https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2070&auto=format&fit=crop"
          alt="Skyline futuriste d'une ville africaine au crépuscule avec des néons"
          className="absolute inset-0 w-full h-full -z-10 opacity-70"
          priority="high"
          showSkeleton={true}
        />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div 
            className="inline-block p-2 bg-primary/20 rounded-full mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <SparklesIcon className="h-10 w-10 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Bienvenue sur <span className="text-primary">{personalData.siteName}</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {personalData.tagline}. Explorez, découvrez, connectez.
          </motion.p>
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="relative">
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.querySelector('input[name="q"]');
                const q = input?.value || '';
                const { section, params } = resolveSearchIntent(q);
                const usp = new URLSearchParams(params);
                const path = section === 'immobilier' ? '/immobilier' : section === 'automobile' ? '/automobile' : section === 'services' ? '/services' : '/marketplace';
                navigate(`${path}?${usp.toString()}`);
              }}>
                <Input 
                  name="q"
                  type="search" 
                  placeholder="Que recherchez-vous sur MaxiMarket ?" 
                  className="w-full py-4 px-6 pr-16 rounded-full text-lg bg-white/10 text-white placeholder-gray-400 border-2 border-transparent focus:border-primary focus:ring-primary focus:outline-none backdrop-blur-md h-16"
                />
                <Button type="submit" size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 h-12 w-12 p-0">
                  <SearchIcon className="h-6 w-6 text-white" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
      </motion.section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ duration:0.5 }}
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
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-muted-foreground text-sm mb-5 flex-grow group-hover:text-primary/80 transition-colors">{category.description}</p>
                <div className="w-full border border-primary/50 rounded-md px-4 py-2 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  Découvrir <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform inline" />
                </div>
              </motion.div>
            ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingPopular && !popularListings.length && (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-card rounded-lg shadow-xl overflow-hidden glassmorphic-card border border-transparent">
                  <div className="h-56 bg-muted animate-pulse" />
                  <div className="p-6">
                    <div className="h-6 w-3/4 bg-muted rounded mb-3 animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded mb-4 animate-pulse" />
                    <div className="h-10 w-1/3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))
            )}

            {!loadingPopular && popularListings.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">Aucune annonce populaire pour le moment.</p>
            )}

            {popularListings.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} showActions={false} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="default"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground"
              onClick={() => navigate('/marketplace?sort=popular&per=24')}
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
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ duration:0.5 }}
          >
                         Prêt à <span className="gradient-text">Rejoindre MaxiMarket</span> ?
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ duration:0.5, delay:0.2 }}
          >
            Créez un compte, publiez votre première annonce ou trouvez l'affaire parfaite en quelques clics.
          </motion.p>
          <motion.div 
            className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4"
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ duration:0.5, delay:0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              onClick={() => {
                if (user) {
                  navigate('/creer-annonce');
                } else {
                  navigate('/connexion', { state: { from: '/creer-annonce' } });
                }
              }}
            >
              Publier une Annonce
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => navigate('/inscription')}
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
