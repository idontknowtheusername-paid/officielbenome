
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Optimisation : Mémoriser la fonction de scroll pour éviter les re-créations
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    // Optimisation : Ajouter l'option passive pour améliorer les performances
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Remettre le scroll en haut à chaque changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Optimisation : Mémoriser les classes CSS pour éviter les recalculs
  const headerClasses = useMemo(() => cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    scrolled ? "py-3 glass-effect" : "py-5 bg-transparent"
  ), [scrolled]);

  // Optimisation : Mémoriser les animations pour éviter les recalculs
  const pageTransition = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-background grid-pattern">
      <header 
        className={headerClasses}
        role="banner"
        aria-label="En-tête principal"
      >
        <Navbar />
      </header>
      
      <main 
        className="flex-grow pt-24 pb-20 md:pb-16"
        role="main"
        aria-label="Contenu principal"
        id="main-content"
      >
        <motion.div
          key={location.pathname}
          {...pageTransition}
        >
          <Outlet />
        </motion.div>
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
