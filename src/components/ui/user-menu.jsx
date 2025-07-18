import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Heart, 
  MessageSquare,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronDown,
  Crown,
  Star,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      href: '/profile',
      description: 'Gérer vos informations'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: TrendingUp,
      href: '/profile',
      description: 'Vue d\'ensemble',
      badge: 'Nouveau'
    },
    {
      id: 'listings',
      label: 'Mes Annonces',
      icon: Eye,
      href: '/profile?tab=listings',
      description: 'Gérer vos annonces'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/profile?tab=messages',
      description: 'Vos conversations',
      badge: user?.unreadMessages || 0
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Heart,
      href: '/profile?tab=favorites',
      description: 'Annonces sauvegardées'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      href: '/profile?tab=transactions',
      description: 'Historique des paiements'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      href: '/profile?tab=profile',
      description: 'Configurer votre compte'
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: Shield,
      href: '/profile?tab=security',
      description: 'Sécurité du compte'
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      href: '/support',
      description: 'Besoin d\'aide ?'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuItemClick = (item) => {
    navigate(item.href);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center overflow-hidden">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
          {user?.unreadMessages > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {user.unreadMessages > 9 ? '9+' : user.unreadMessages}
            </Badge>
          )}
        </div>
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
        
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {user?.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        ✓ Vérifié
                      </Badge>
                    )}
                    {user?.premium && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.badge && (
                        <Badge 
                          variant={typeof item.badge === 'number' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Se déconnecter
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserMenu; 