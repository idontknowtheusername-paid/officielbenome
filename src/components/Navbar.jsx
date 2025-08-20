import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Car, Briefcase, ShoppingBag, UserCircle, Settings, Sun, Moon, Search, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { personalData } from '@/lib/personalData';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { user } = useAuth();

  // Optimisation : Mémoriser les éléments de navigation pour éviter les re-renders
  const navItems = useMemo(() => [
    { name: 'Immobilier', path: '/immobilier', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'Automobile', path: '/automobile', icon: <Car className="mr-2 h-4 w-4" /> },
    { name: 'Services', path: '/services', icon: <Briefcase className="mr-2 h-4 w-4" /> },
    { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
  ], []);

  // Optimisation : Mémoriser les animations pour éviter les recalculs
  const mobileMenuVariants = useMemo(() => ({
    closed: { opacity: 0, x: "-100%" },
    open: { opacity: 1, x: "0%", transition: { duration: 0.3, ease: "easeInOut" } }
  }), []);

  // Optimisation : Mémoriser les classes CSS
  const navLinkClasses = useMemo(() => "text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center", []);
  const activeNavLinkClasses = useMemo(() => "text-primary bg-primary/10", []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Optimisation : Mémoriser le logo pour éviter les re-renders
  const Logo = useMemo(() => (
    <Link to="/" className="flex items-center space-x-2" aria-label="Accueil MaxiMarket">
      <span className="text-2xl font-bold gradient-text">{personalData.siteName}</span>
    </Link>
  ), []);

  return (
    <header role="banner" aria-label="Navigation principale">
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled || isOpen ? 'bg-background/95 shadow-lg backdrop-blur-md' : 'bg-transparent'}`}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {Logo}
            </motion.div>

            {/* Desktop Navigation */}
            <nav role="navigation" aria-label="Navigation desktop" className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                  aria-current={({ isActive }) => isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                aria-label="Changer de thème"
                type="button"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                aria-label="Rechercher"
                type="button"
              >
                 <Search className="h-5 w-5" />
              </Button>
              {!user && (
                <>
                  <Button asChild className="hidden md:inline-flex btn-gradient-primary">
                    <Link to="/connexion" aria-label="Se connecter">
                      <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Connexion
                    </Link>
                  </Button>
                  <Button asChild className="hidden md:inline-flex btn-gradient-secondary">
                    <Link to="/inscription" aria-label="S'inscrire">
                      <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Inscription
                    </Link>
                  </Button>
                </>
              )}
              {user && user.role === 'admin' ? (
                <Button asChild className="hidden md:inline-flex btn-secondary">
                  <Link to="/admin" aria-label="Accéder à l'administration">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> Admin
                  </Link>
                </Button>
              ) : user && (
                <>
                  <Button asChild className="hidden md:inline-flex btn-gradient-primary">
                    <Link to="/messages" aria-label="Accéder aux messages">
                      <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" /> Messages
                    </Link>
                  </Button>
                  <Button asChild className="hidden md:inline-flex btn-gradient-primary">
                    <Link to="/profile" aria-label="Accéder à mon compte">
                      <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> Mon Compte
                    </Link>
                  </Button>
                </>
              )}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(!isOpen)} 
                  aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  aria-expanded={isOpen}
                  type="button"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed inset-0 top-20 bg-background/95 backdrop-blur-md z-40 p-4 space-y-3 border-t border-border"
            role="navigation"
            aria-label="Menu mobile"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `${navLinkClasses} text-base w-full justify-start ${isActive ? activeNavLinkClasses : ''}`}
                aria-current={({ isActive }) => isActive ? 'page' : undefined}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            {!user && (
              <>
                <NavLink 
                  to="/connexion" 
                  onClick={() => setIsOpen(false)} 
                  className={`${navLinkClasses} text-base w-full justify-start`}
                  aria-label="Se connecter"
                >
                    <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Connexion
                </NavLink>
                <NavLink 
                  to="/inscription" 
                  onClick={() => setIsOpen(false)} 
                  className={`${navLinkClasses} text-base w-full justify-start`}
                  aria-label="S'inscrire"
                >
                    <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Inscription
                </NavLink>
              </>
            )}
            {user && user.role === 'admin' ? (
              <NavLink 
                to="/admin" 
                onClick={() => setIsOpen(false)} 
                className={({isActive}) => `${navLinkClasses} text-base w-full justify-start ${isActive ? activeNavLinkClasses : ''}`}
                aria-label="Accéder à l'administration"
              >
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> Admin
              </NavLink>
            ) : user && (
              <>
                <NavLink 
                  to="/messages" 
                  onClick={() => setIsOpen(false)} 
                  className={({isActive}) => `${navLinkClasses} text-base w-full justify-start ${isActive ? activeNavLinkClasses : ''}`}
                  aria-label="Accéder aux messages"
                >
                  <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" /> Messages
                </NavLink>
                <NavLink 
                  to="/profile" 
                  onClick={() => setIsOpen(false)} 
                  className={({isActive}) => `${navLinkClasses} text-base w-full justify-start ${isActive ? activeNavLinkClasses : ''}`}
                  aria-label="Accéder à mon compte"
                >
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> Mon Compte
                </NavLink>
              </>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
