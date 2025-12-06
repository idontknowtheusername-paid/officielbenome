import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const HomeAppHeader = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  // États pour gérer le scroll
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Si on est tout en haut, on affiche toujours
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Si on descend (scroll down) -> On cache
        setIsVisible(false);
      } else {
        // Si on remonte (scroll up) -> On affiche
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)] shadow-sm transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full" // C'est ici que la magie opère
      )}
    >
      <div className="flex flex-col gap-3 px-4 pt-3 pb-3">
        
        {/* ÉTAGE 1 : Logo & Actions */}
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="MaxiMarket" className="h-9 w-auto object-contain" />
          </div>
          
          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            {/* Bouton thème */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors active:scale-95"
              aria-label="Changer le thème"
            >
              {darkMode ? <Sun size={20} className="text-foreground" /> : <Moon size={20} className="text-foreground" />}
            </button>

            {/* Bouton notifications - redirige vers messages si connecté */}
            <button 
              onClick={() => navigate(user ? '/notifications' : '/connexion')} 
              className="relative p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors active:scale-95"
              aria-label="Messages"
            >
              <Bell size={20} className="text-foreground" />
              {/* Badge visible seulement si connecté - TODO: connecter au vrai compteur */}
              {user && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-background"></span>
              )}
            </button>
          </div>
        </div>

        {/* ÉTAGE 2 : Barre de Recherche - ouvre la page marketplace avec focus sur recherche */}
        <div 
          onClick={() => navigate('/marketplace?focus=search')}
          className="w-full bg-muted/40 border border-border/50 rounded-xl h-11 px-4 flex items-center gap-3 text-muted-foreground cursor-pointer active:scale-[0.98] transition-transform"
          role="button"
          aria-label="Rechercher"
        >
          <Search size={18} />
          <span className="text-sm font-medium">Rechercher un produit...</span>
        </div>
      </div>
    </header>
  );
};

export default HomeAppHeader;