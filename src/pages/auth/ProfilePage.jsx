
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Loader2, 
  Home, 
  MessageSquare, 
  Heart, 
  CreditCard, 
  Settings, 
  Shield, 
  BarChart3, 
  Bell, 
  Plus,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Edit,
  Trash2,
  RefreshCw,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTabNavigation } from '@/hooks/useTabNavigation';

// Import des nouveaux composants dashboard
import { 
  StatsCard, 
  ListingCard, 
  MessageCard, 
  ActivityFeed, 
  QuickActions 
} from '@/components/dashboard';

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const { activeTab, handleTabChange } = useTabNavigation('dashboard');
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalContacts: 0,
    unreadMessages: 0,
    totalFavorites: 0
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    }
  });

  // Simuler le chargement des données
  useEffect(() => {
    if (user) {
      // Simuler les données de l'utilisateur
      setStats({
        totalListings: 12,
        activeListings: 8,
        totalViews: 1247,
        totalContacts: 23,
        unreadMessages: 5,
        totalFavorites: 15
      });

      setListings([
        {
          id: 1,
          title: "Villa moderne à Cocody",
          category: "Immobilier",
          price: "85,000,000 FCFA",
          status: "active",
          views: 156,
          contacts: 8,
          image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
          createdAt: "2024-01-15",
          location: "Cocody, Abidjan",
          featured: true,
          boosted: false
        },
        {
          id: 2,
          title: "Toyota Prado 2021",
          category: "Automobile",
          price: "25,000,000 FCFA",
          status: "active",
          views: 89,
          contacts: 12,
          image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
          createdAt: "2024-01-10",
          location: "Abidjan",
          featured: false,
          boosted: true
        },
        {
          id: 3,
          title: "Service de Plomberie Express",
          category: "Services",
          price: "À partir de 15,000 FCFA",
          status: "pending",
          views: 45,
          contacts: 3,
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
          createdAt: "2024-01-08",
          location: "Toute l'Afrique de l'Ouest",
          featured: false,
          boosted: false
        }
      ]);

      setMessages([
        {
          id: 1,
          sender: "Moussa Diallo",
          message: "Bonjour, votre villa est-elle toujours disponible ?",
          time: "2h",
          unread: true,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
          type: "inquiry",
          listing: "Villa moderne à Cocody",
          location: "Cocody, Abidjan",
          verified: true,
          online: true
        },
        {
          id: 2,
          sender: "Fatou Sall",
          message: "Je suis intéressée par votre Toyota Prado",
          time: "5h",
          unread: true,
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50",
          type: "offer",
          listing: "Toyota Prado 2021",
          location: "Abidjan",
          verified: false,
          online: false
        }
      ]);

      setFavorites([
        {
          id: 1,
          title: "Appartement de luxe à Abidjan",
          category: "Immobilier",
          price: "45,000,000 FCFA",
          image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
        },
        {
          id: 2,
          title: "iPhone 15 Pro Max",
          category: "Marketplace",
          price: "850,000 FCFA",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
        }
      ]);
    }
  }, [user]);

  const onUpdateProfile = async (data) => {
    try {
      setIsUpdating(true);
      // Ici, vous appellerez votre API pour mettre à jour le profil
      // await updateUserProfile(data);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onUpdatePassword = async (data) => {
    try {
      setIsUpdating(true);
      // Ici, vous appellerez votre API pour changer le mot de passe
      // await updatePassword(data);
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handlers pour les actions des annonces
  const handleEditListing = (listing) => {
    toast({
      title: "Modifier l'annonce",
      description: `Modification de "${listing.title}"`,
    });
  };

  const handleDeleteListing = (listing) => {
    toast({
      title: "Supprimer l'annonce",
      description: `Suppression de "${listing.title}"`,
    });
  };

  const handleBoostListing = (listing) => {
    toast({
      title: "Booster l'annonce",
      description: `Boost de "${listing.title}"`,
    });
  };

  const handleRefreshListing = (listing) => {
    toast({
      title: "Actualiser l'annonce",
      description: `Actualisation de "${listing.title}"`,
    });
  };

  // Handlers pour les messages
  const handleReplyMessage = (message) => {
    toast({
      title: "Répondre",
      description: `Réponse à ${message.sender}`,
    });
  };

  const handleArchiveMessage = (message) => {
    toast({
      title: "Archiver",
      description: `Message archivé`,
    });
  };

  const handleMarkAsRead = (message) => {
    toast({
      title: "Marquer comme lu",
      description: `Message marqué comme lu`,
    });
  };

  const handleStarMessage = (message) => {
    toast({
      title: "Favori",
      description: `Message ajouté aux favoris`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/20"
    >
      <div className="container mx-auto py-8 px-4">
        {/* Header avec photo de profil */}
        <div className="mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center overflow-hidden shadow-lg">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 rounded-full shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {user?.email}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Compte vérifié
                </Badge>
                <Badge variant="outline">
                  Membre depuis {new Date(user?.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Mes Annonces</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
              {stats.unreadMessages > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {stats.unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoris</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Annonces Actives"
                value={stats.activeListings}
                icon={Home}
                color="blue"
              />
              <StatsCard 
                title="Total des Vues"
                value={stats.totalViews.toLocaleString()}
                icon={Eye}
                color="green"
              />
              <StatsCard 
                title="Contacts Reçus"
                value={stats.totalContacts}
                icon={Users}
                color="purple"
              />
              <StatsCard 
                title="Messages Non Lus"
                value={stats.unreadMessages}
                icon={Bell}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <QuickActions stats={stats} />
            </div>
          </TabsContent>

          {/* Mes Annonces */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mes Annonces</h2>
                <p className="text-muted-foreground">Gérez vos annonces publiées</p>
              </div>
              <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Annonce
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onEdit={handleEditListing}
                  onDelete={handleDeleteListing}
                  onRefresh={handleRefreshListing}
                  onBoost={handleBoostListing}
                  showActions={true}
                />
              ))}
            </div>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Messages</h2>
                <p className="text-muted-foreground">Gérez vos conversations</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onReply={handleReplyMessage}
                  onArchive={handleArchiveMessage}
                  onDelete={() => {}}
                  onMarkAsRead={handleMarkAsRead}
                  onStar={handleStarMessage}
                  showActions={true}
                />
              ))}
            </div>
          </TabsContent>

          {/* Favoris */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mes Favoris</h2>
                <p className="text-muted-foreground">Annonces que vous avez sauvegardées</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <ListingCard
                  key={favorite.id}
                  listing={favorite}
                  showActions={false}
                />
              ))}
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Transactions</h2>
                <p className="text-muted-foreground">Historique de vos transactions</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore effectué de transactions sur Benome.
                  </p>
                  <Button variant="outline">
                    Découvrir nos services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Informations du profil</h2>
                <p className="text-muted-foreground">Gérez vos informations personnelles</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres du profil</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          className="pl-10"
                          {...register('firstName', {
                            required: 'Le prénom est requis'
                          })}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          className="pl-10"
                          {...register('lastName', {
                            required: 'Le nom est requis'
                          })}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        {...register('email', {
                          required: 'L\'email est requis',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email invalide'
                          }
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        className="pl-10"
                        {...register('phoneNumber', {
                          pattern: {
                            value: /^\+?[1-9]\d{1,14}$/,
                            message: 'Numéro de téléphone invalide'
                          }
                        })}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      'Mettre à jour le profil'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Sécurité</h2>
                <p className="text-muted-foreground">Gérez la sécurité de votre compte</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>
                  Assurez-vous d'utiliser un mot de passe fort et unique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        className="pl-10"
                        {...register('currentPassword', {
                          required: 'Le mot de passe actuel est requis'
                        })}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        className="pl-10"
                        {...register('newPassword', {
                          required: 'Le nouveau mot de passe est requis',
                          minLength: {
                            value: 8,
                            message: 'Le mot de passe doit contenir au moins 8 caractères'
                          }
                        })}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      'Changer le mot de passe'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
