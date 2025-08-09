import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  MessageSquare, 
  Heart, 
  Settings, 
  TrendingUp,
  Eye,
  Users,
  Bell,
  Star,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  HelpCircle
} from 'lucide-react';

const QuickActions = ({ stats = {} }) => {
  const actions = [
    {
      id: 'new-listing',
      title: 'Nouvelle Annonce',
      description: 'Publier une nouvelle annonce',
      icon: Plus,
      color: 'from-primary to-blue-600',
      href: '/creer-annonce',
      badge: null
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Voir vos conversations',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      href: '/messages',
      badge: stats.unreadMessages || 0
    },
    {
      id: 'favorites',
      title: 'Mes Favoris',
      description: 'Annonces sauvegardées',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      href: '/favorites',
      badge: stats.totalFavorites || 0
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Voir vos statistiques',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/analytics', // Redirige vers admin analytics
      badge: null
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configurer votre compte',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      href: '/profile',
      badge: null
    },
    {
      id: 'support',
      title: 'Support',
      description: 'Besoin d\'aide ?',
      icon: HelpCircle,
      color: 'from-orange-500 to-orange-600',
      href: '/aide',
      badge: null
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Actions Rapides</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-12 bg-gradient-to-r ${action.color} hover:from-primary/90 hover:to-blue-600/90 text-white border-0 transition-all duration-200 hover:scale-105`}
              asChild
            >
              <Link to={action.href} className="flex items-center space-x-2">
                <action.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.title}</span>
                {action.badge && action.badge > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
                    {action.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 