import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MessageCenter from '../components/MessageCenter';
import { useConversations, useMessageStats } from '../hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  MessageSquare, 
  Users, 
  Star, 
  Archive,
  Plus,
  Search
} from 'lucide-react';

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 secondes
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Composant de statistiques
const MessageStats = () => {
  const { data: stats, isLoading } = useMessageStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      title: 'Total Conversations',
      value: stats.total,
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Non Lues',
      value: stats.unread,
      icon: Users,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Favoris',
      value: stats.starred,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Archivées',
      value: stats.archived,
      icon: Archive,
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className={`p-2 rounded-full ${item.color}`}>
                <item.icon size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Composant principal de la page
const MessagingPageContent = () => {
  const { data: conversations, isLoading, error } = useConversations();
  const [showStats, setShowStats] = useState(true);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-500">
            Impossible de charger les conversations. Veuillez réessayer.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Recharger
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centre de Messages</h1>
            <p className="text-gray-600">
              Gérez vos conversations et échangez avec d'autres utilisateurs
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? 'Masquer' : 'Afficher'} les statistiques
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Conversation
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {showStats && <MessageStats />}

      {/* Interface de messagerie */}
      <div className="h-[calc(100vh-200px)]">
        <MessageCenter />
      </div>
    </div>
  );
};

// Page principale avec provider React Query
const MessagingPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MessagingPageContent />
    </QueryClientProvider>
  );
};

export default MessagingPage; 