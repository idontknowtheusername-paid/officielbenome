import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import { useAppMode } from '@/hooks/useAppMode'; // On utilise ton hook
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // ICI : C'est cette variable qui fait la différence entre "Site Mobile" et "App Native"
  const { isAppMode } = useAppMode();

  // Vérifier si on est sur une page spécifique pour cacher le footer
  const isProfilePage = location.pathname.startsWith('/profile');
  const isBoostPage = location.pathname.startsWith('/boost');
  const isTransactionsPage = location.pathname.startsWith('/transactions');
  const isAdminPage = location.pathname.startsWith('/admin');
  const shouldHideFooter = isProfilePage || isBoostPage || isTransactionsPage || isAdminPage;

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const headerClasses = useMemo(() => cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    scrolled ? "py-3 glass-effect" : "py-5 bg-transparent"
  ), [scrolled]);

  const pageTransition = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-background grid-pattern">
      
      {/* CORRECTION MAJEURE :
         On affiche la Navbar SI on n'est PAS en mode App.
         Donc :
         - Sur PC : Visible
         - Sur Site Mobile (Chrome) : Visible ✅ (C'est ce que tu voulais)
         - Sur App Native : Caché ❌ (Pour laisser place aux headers natifs)
      */}
      {!isAppMode && (
        <header 
          className={headerClasses}
          role="banner"
          aria-label="En-tête principal"
        >
          <Navbar />
        </header>
      )}
      
      <main 
        className={cn(
          "flex-grow",
          // Si on est en App Mode ou sur la Home, pas de padding top.
          // Sinon (Site Web classique), on garde le padding top pour ne pas être sous la Navbar.
          (isAppMode || location.pathname === "/") ? "" : "pt-24"
        )}
        role="main"
        aria-label="Contenu principal"
        id="main-content"
      >
        {/* Padding bottom seulement si on est en App Mode (à cause de la BottomNav) */}
        <div className={isAppMode ? 'pb-24' : ''}>
          <motion.div
            key={location.pathname}
            {...pageTransition}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
      
      {/* Le Footer s'affiche sur le site Web (Mobile & PC), mais pas sur l'App Native */}
      {!shouldHideFooter && !isAppMode && <Footer />}

      {/* La Navigation du bas.
         Choix stratégique : Veux-tu l'afficher sur le site mobile aussi ou juste l'App ?
         Souvent, même le site mobile a une BottomNav aujourd'hui.
         Mais si tu veux "Juste l'App", ajoute la condition {isAppMode && <BottomNavigation />}
         Ici je laisse comme tu avais (visible sur mobile en général via CSS du composant)
         ou je peux forcer isAppMode. 
      */}
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
