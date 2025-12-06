import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Car, Briefcase, ShoppingBag, ArrowRight,
  Search, TrendingUp, Sparkles, MapPin, PlusCircle
} from 'lucide-react';
import { listingService } from '@/services';
import { useAppMode } from '@/hooks/useAppMode';
import MobilePageLayout from '@/layouts/MobilePageLayout';

// 1. IMPORT DU PULL-TO-REFRESH
import PullToRefresh from 'react-simple-pull-to-refresh';

/* --- CSS GLOBAL --- */
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

/* --- 1. DEFINITION DES CATEGORIES STATIQUES (Ne change pas) --- */
const categoriesDetailed = [
  {
    id: 'immobilier',
    name: 'Immobilier',
    description: 'Maisons, terrains & bureaux.',
    icon: Home,
    path: '/immobilier',
    color: 'text-blue-600'
  },
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Voitures, motos & pièces.',
    icon: Car,
    path: '/automobile',
    color: 'text-emerald-600'
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Experts & Prestations.',
    icon: Briefcase,
    path: '/services',
    color: 'text-purple-600'
  },
  {
    id: 'marketplace',
    name: 'Shopping',
    description: 'Tech, Mode & Maison.',
    icon: ShoppingBag,
    path: '/marketplace',
    color: 'text-orange-600'
  }
];

/* --- TOP RECHERCHES REELLES --- */
const topSearches = [
  { label: 'iPhone', query: 'iPhone', category: 'marketplace' },
  { label: 'Appartement', query: 'appartement', category: 'real_estate' },
  { label: 'Toyota', query: 'Toyota', category: 'automobile' },
  { label: 'Terrain', query: 'terrain', category: 'real_estate' },
  { label: 'Moto', query: 'moto', category: 'automobile' },
  { label: 'Samsung', query: 'Samsung', category: 'marketplace' },
  { label: 'Maison', query: 'maison', category: 'real_estate' },
  { label: 'Électricien', query: 'électricien', category: 'services' }
];

/* --- 2. COMPOSANT SKELETON (Affiche des blocs gris pendant le chargement) --- */
const CarouselSkeleton = () => (
  <div className="flex gap-4 px-4 overflow-hidden">
    {[1, 2, 3].map((i) => (
      <div key={i} className="min-w-[150px] bg-gray-200 dark:bg-slate-800 rounded-xl h-44 animate-pulse flex flex-col">
        <div className="h-28 bg-gray-300 dark:bg-slate-700 w-full rounded-t-xl" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/* --- 3. COMPOSANT CAROUSEL GENERIC (Prêt pour vraie data) --- */
const DataCarousel = ({ title, icon: Icon, items, isLoading, link }) => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll logique
  useEffect(() => {
    if (isLoading || !items || items.length === 0) return;

    const container = scrollRef.current;
    if (!container) return;

    const autoScroll = () => {
      if (isPaused) return;
      const isEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
      if (isEnd) container.scrollTo({ left: 0, behavior: 'smooth' });
      else container.scrollBy({ left: 160, behavior: 'smooth' }); // Scroll d'une carte
    };

    const interval = setInterval(autoScroll, 3500); // 3.5 secondes
    return () => clearInterval(interval);
  }, [isPaused, isLoading, items]);

  return (
    <div
      className="mb-8 relative group"
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
    >
      <div className="flex justify-between items-end px-4 mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-primary">
            <Icon size={18} />
          </div>
          {title}
        </h3>
        <Link to={link} className="text-xs font-semibold text-primary hover:text-blue-700 flex items-center">
          Voir tout <ArrowRight size={12} className="ml-1" />
        </Link>
      </div>

      {isLoading ? (
        <CarouselSkeleton />
      ) : items && items.length > 0 ? (
        <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory px-4 pb-4 gap-4 no-scrollbar scroll-smooth">
          {items.map((item) => (
            <div key={item.id} className="snap-center min-w-[150px] max-w-[150px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex-shrink-0 active:scale-95 transition-transform duration-200">
              {/* IMAGE (Logo MaxiMarket si pas d'image ou erreur) */}
              <div className="h-28 w-full relative bg-gray-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 ${item.image_url ? 'hidden' : 'flex'}`}
                >
                  <img src="/logo.png" alt="MaxiMarket" className="w-10 h-10 object-contain opacity-60" />
                </div>

                {/* Badge Conditionnel */}
                {item.is_promoted && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">
                    TOP
                  </span>
                )}
              </div>

              <div className="p-2.5">
                <h4 className="text-xs font-semibold truncate text-gray-800 dark:text-gray-100">{item.title}</h4>
                <p className="text-primary font-bold text-xs mt-1">{item.price} FCFA</p>
                <div className="flex items-center text-gray-400 mt-1.5 text-[9px]">
                  <MapPin size={9} className="mr-1" />
                  <span className="truncate">{item.city || 'Bénin'}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Carte "Voir Plus" */}
          <Link to={link} className="snap-center min-w-[100px] flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors flex-shrink-0">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2"><ArrowRight size={18} /></div>
            <span className="text-[10px] font-medium">Tout voir</span>
          </Link>
          <div className="w-2 flex-shrink-0" />
        </div>
      ) : (
        <div className="px-4 text-sm text-gray-500 italic">Aucune annonce pour le moment.</div>
      )}
    </div>
  );
};

/* --- PAGE PRINCIPALE --- */
const CategoriesPage = () => {
  const navigate = useNavigate();
  const { isAppMode } = useAppMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState({
    immobilier: [],
    automobile: [],
    services: [],
    marketplace: []
  });

  // 2. FONCTION DE RAFRAÎCHISSEMENT
  const handleRefresh = async () => {
    return new Promise((resolve) => {
      window.location.reload();
      resolve();
    });
  };

  // Fonction de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/marketplace?search=${encodeURIComponent(q)}`);
    }
  };

  // Lancer une recherche depuis les top recherches
  const handleTopSearch = (item) => {
    const categoryRoutes = {
      'real_estate': '/immobilier',
      'automobile': '/automobile',
      'services': '/services',
      'marketplace': '/marketplace'
    };
    const route = categoryRoutes[item.category] || '/marketplace';
    navigate(`${route}?search=${encodeURIComponent(item.query)}`);
  };

  // Fetch des vraies données depuis Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [immoRes, autoRes, servicesRes, marketRes] = await Promise.all([
          listingService.getAllListings({ category: 'real_estate', status: 'approved', limit: 6 }),
          listingService.getAllListings({ category: 'automobile', status: 'approved', limit: 6 }),
          listingService.getAllListings({ category: 'services', status: 'approved', limit: 6 }),
          listingService.getAllListings({ category: 'marketplace', status: 'approved', limit: 6 })
        ]);

        const transformData = (listings) => (listings?.data || []).map(item => ({
          id: item.id,
          title: item.title,
          price: item.price?.toLocaleString('fr-FR') || '0',
          city: item.location?.city || 'Bénin',
          image_url: item.images?.[0] || null,
          is_promoted: item.is_featured || item.is_boosted
        }));

        setRealData({
          immobilier: transformData(immoRes),
          automobile: transformData(autoRes),
          services: transformData(servicesRes),
          marketplace: transformData(marketRes)
        });
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Contenu de la page
  const pageContent = (
    // 3. ENVELOPPE PULL TO REFRESH
    <PullToRefresh onRefresh={handleRefresh} pullingContent=''>
      <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 text-foreground ${isAppMode ? 'pb-20' : 'pb-24'}`}>
        <style>{scrollbarHideStyle}</style>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary to-blue-700 pt-8 pb-16 px-4 rounded-b-[30px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="text-white h-24 w-24" /></div>
          <div className="relative z-10 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-1">MaxiiMarket</h1>
            <p className="text-blue-100 text-sm mb-6">Tout trouver, tout vendre.</p>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 shadow-xl focus:ring-4 focus:ring-white/20 outline-none text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
          </div>
        </div>

        {/* TENDANCES */}
        <div className="max-w-xl mx-auto px-4 -mt-6 relative z-20 mb-8">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-orange-500 h-3 w-3" />
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Top Recherches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTopSearch(item)}
                  className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full text-[10px] font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- CARTES PRINCIPALES (V1 OPTIMISÉE HORIZONTALE) --- */}
        <div className="mb-8">
          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nos Univers</h2>
          </div>

          {/* SCROLL HORIZONTAL FLUIDE */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 no-scrollbar">
            {categoriesDetailed.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={category.path}
                  className="snap-center min-w-[260px] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className={`p-2.5 rounded-full bg-gray-50 dark:bg-slate-700 mb-2 ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">
                    {category.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-[10px] mb-3 leading-tight px-2 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="w-full mt-auto bg-gray-50 dark:bg-slate-700/50 py-1.5 rounded-lg text-primary text-xs font-semibold flex justify-center items-center group-hover:bg-primary group-hover:text-white transition-all">
                    Explorer
                  </div>
                </Link>
              );
            })}
            {/* Espace vide fin de scroll */}
            <div className="w-2 flex-shrink-0"></div>
          </div>
        </div>

        {/* --- CAROUSELS PRETS POUR INTEGRATION --- */}
        <div className="space-y-2">
          <DataCarousel
            title="Immobilier"
            icon={Home}
            items={realData.immobilier}
            isLoading={loading}
            link="/immobilier"
          />
          <DataCarousel
            title="Auto & Moto"
            icon={Car}
            items={realData.automobile}
            isLoading={loading}
            link="/automobile"
          />
          <DataCarousel
            title="Bonnes Affaires"
            icon={ShoppingBag}
            items={realData.marketplace}
            isLoading={loading}
            link="/marketplace"
          />
          <DataCarousel
            title="Services"
            icon={Briefcase}
            items={realData.services}
            isLoading={loading}
            link="/services"
          />
        </div>

        {/* CTA VENDEUR */}
        <div className="px-4 mt-6">

          <motion.div

            whileHover={{ scale: 1.02 }}

            whileTap={{ scale: 0.98 }}

            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white p-6 shadow-2xl shadow-gray-900/20"

          >

            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center">

              <div className="bg-white/10 p-3 rounded-full mb-3 backdrop-blur-sm border border-white/10">

                <PlusCircle className="w-8 h-8 text-primary" />

              </div>

              <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">

                Vous avez quelque chose à vendre ?

              </h3>

              <p className="text-gray-400 text-sm mb-6 max-w-xs">

                Transformez vos objets inutilisés en cash. C'est gratuit, rapide et sécurisé sur MaxiMarket.

              </p>

              <button
                onClick={() => navigate('/creer-annonce')}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-lg">+</span> Publier une annonce
              </button>

            </div>

          </motion.div>

        </div>

      </div>
    </PullToRefresh>
  );

  // Si mode app, wrapper avec MobilePageLayout (title=null car la page a son propre header)
  if (isAppMode) {
    return (
      <MobilePageLayout title={null}>
        {pageContent}
      </MobilePageLayout>
    );
  }

  return pageContent;
};

export default CategoriesPage;
