import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  Home,
  Car,
  Briefcase,
  ShoppingBag,
  Settings
} from 'lucide-react';

/**
 * Navigation principale simplifiée
 * Logique centralisée et interface claire
 */
const SimplifiedMainNavigation = memo(({ onClose }) => {
  const navigate = useNavigate();
  
  // Navigation items mémorisés
  const navItems = useMemo(() => [
    { 
      name: 'Accueil', 
      path: '/', 
      icon: <Home className="h-4 w-4" />,
      color: 'bg-blue-500'
    },
    { 
      name: 'Immobilier', 
      path: '/immobilier', 
      icon: <Home className="h-4 w-4" />,
      color: 'bg-green-500'
    },
    { 
      name: 'Automobile', 
      path: '/automobile', 
      icon: <Car className="h-4 w-4" />,
      color: 'bg-red-500'
    },
    { 
      name: 'Services', 
      path: '/services', 
      icon: <Briefcase className="h-4 w-4" />,
      color: 'bg-purple-500'
    },
    { 
      name: 'Marketplace', 
      path: '/marketplace', 
      icon: <ShoppingBag className="h-4 w-4" />,
      color: 'bg-orange-500'
    },
    { 
      name: 'Mon Compte', 
      path: '/profile', 
      icon: <Settings className="h-4 w-4" />,
      color: 'bg-gray-500'
    },
  ], []);
  
  // Handler de navigation simplifié
  const handleNavigation = useCallback((path) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);
  
  return (
    <div className="bg-card border-b border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Navigation Grid */}
      <div className="grid grid-cols-2 gap-3">
        {navItems.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </div>
    </div>
  );
});

// ========================================
// COMPOSANT NAVIGATION ITEM
// ========================================
const NavigationItem = memo(({ item, onClick }) => (
  <Button
    variant="outline"
    className="justify-start h-auto p-4 hover:shadow-md transition-all duration-200"
    onClick={onClick}
  >
    <div className="flex items-center space-x-3 w-full">
      <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
        {item.icon}
      </div>
      <span className="text-sm font-medium">{item.name}</span>
    </div>
  </Button>
));

// ========================================
// DISPLAY NAMES
// ========================================
SimplifiedMainNavigation.displayName = 'SimplifiedMainNavigation';
NavigationItem.displayName = 'NavigationItem';

export default SimplifiedMainNavigation;