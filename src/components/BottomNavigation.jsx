import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Car, Briefcase, ShoppingBag, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNavigation = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Immobilier', path: '/immobilier', icon: Home },
    { name: 'Auto', path: '/automobile', icon: Car },
    { name: 'Services', path: '/services', icon: Briefcase },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full py-2 px-1 touch-target transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`
              }
              aria-label={item.name}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
        
        {user ? (
          <NavLink
            to="/messages"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full py-2 px-1 touch-target transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`
            }
            aria-label="Messages"
          >
            <MessageSquare className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Messages</span>
          </NavLink>
        ) : (
          <NavLink
            to="/connexion"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full py-2 px-1 touch-target transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`
            }
            aria-label="Connexion"
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Connexion</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};
