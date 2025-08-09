
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
import { userService, listingService, favoriteService, messageService } from '@/services/supabase.service';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/ui/Pagination';
import { ListingCardSkeleton, MessageCardSkeleton, StatsCardSkeleton } from '@/components/ui/Skeleton';
import { DeleteConfirmDialog, EditConfirmDialog, RefreshConfirmDialog, BoostConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  Search,
  LogOut
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { Link } from 'react-router-dom';

// Import des nouveaux composants dashboard
import { 
  StatsCard, 
  ListingCard, 
  MessageCard, 
  ActivityFeed, 
  QuickActions 
} from '@/components/dashboard';

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  
  // États pour les confirmations
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  const [editDialog, setEditDialog] = useState({ isOpen: false, item: null });
  const [refreshDialog, setRefreshDialog] = useState({ isOpen: false, item: null });
  const [boostDialog, setBoostDialog] = useState({ isOpen: false, item: null });
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    }
  });

  // Charger les vraies donnees de l'utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Charger les annonces de l'utilisateur
          const userListings = await listingService.getUserListings();
          setListings(userListings);

          // Charger les favoris de l'utilisateur (gestion d'erreur gracieuse)
          let userFavorites = [];
          try {
            userFavorites = await favoriteService.getUserFavorites();
          } catch (favoriteError) {
            console.warn('Erreur lors du chargement des favoris:', favoriteError);
          }
          setFavorites(userFavorites);

          // Charger les messages de l'utilisateur (gestion d'erreur gracieuse)
          let userMessages = [];
          try {
            userMessages = await messageService.getUserConversations();
          } catch (messageError) {
            console.warn('Erreur lors du chargement des messages:', messageError);
          }
          setMessages(userMessages);

          // Calculer les statistiques reelles
          const activeListings = userListings.filter(l => l.status === 'approved').length;
          const totalViews = userListings.reduce((sum, l) => sum + (l.views_count || 0), 0);
          const unreadMessages = userMessages.filter(m => !m.read).length;

          setStats({
            totalListings: userListings.length,
            activeListings,
            totalViews,
            totalContacts: userMessages.length,
            unreadMessages,
            totalFavorites: userFavorites.length
          });
          
          // Calculer la pagination
          setTotalPages(Math.ceil(userListings.length / itemsPerPage));

        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger vos données",
            variant: "destructive",
          });
        }
      }
    };

    loadUserData();
  }, [user, toast]);

  const onUpdateProfile = async (data) => {
    try {
      setIsUpdating(true);
      await userService.updateProfile(data);
      
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
      await userService.updatePassword(data.newPassword);
      
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

  // Handlers pour les actions des annonces avec confirmations
  const handleEditListing = (listing) => {
    setEditDialog({ isOpen: true, item: listing });
  };

  const handleDeleteListing = (listing) => {
    setDeleteDialog({ isOpen: true, item: listing });
  };

  const handleBoostListing = (listing) => {
    setBoostDialog({ isOpen: true, item: listing });
  };

  const handleRefreshListing = (listing) => {
    setRefreshDialog({ isOpen: true, item: listing });
  };

  // Actions confirmees
  const confirmEdit = async () => {
    try {
      const listing = editDialog.item;
      navigate(`/editer-annonce/${listing.id}`);
      setEditDialog({ isOpen: false, item: null });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'annonce",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    try {
      const listing = deleteDialog.item;
      await listingService.deleteListing(listing.id);
      
      // Recharger les donnees
      const updatedListings = listings.filter(l => l.id !== listing.id);
      setListings(updatedListings);
      
      toast({
        title: "Annonce supprimée",
        description: `"${listing.title}" a été supprimée`,
      });
      
      setDeleteDialog({ isOpen: false, item: null });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  const confirmBoost = async () => {
    try {
      const listing = boostDialog.item;
      await listingService.updateListing(listing.id, { boosted: !listing.boosted });
      
      // Recharger les donnees
      const updatedListings = listings.map(l => 
        l.id === listing.id ? { ...l, boosted: !l.boosted } : l
      );
      setListings(updatedListings);
      
      toast({
        title: "Annonce boostée",
        description: `"${listing.title}" a été boostée`,
      });
      
      setBoostDialog({ isOpen: false, item: null });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de booster l'annonce",
        variant: "destructive",
      });
    }
  };

  const confirmRefresh = async () => {
    try {
      const listing = refreshDialog.item;
      await listingService.updateListing(listing.id, { updated_at: new Date().toISOString() });
      
      toast({
        title: "Annonce actualisée",
        description: `"${listing.title}" a été actualisée`,
      });
      
      setRefreshDialog({ isOpen: false, item: null });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser l'annonce",
        variant: "destructive",
      });
    }
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginatedListings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return listings.slice(startIndex, endIndex);
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

  // Fonction de deconnexion
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <StatsCardSkeleton key={i} />
                ))}
              </div>
            ) : (
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
            )}

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
              <Button asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
                <Link to="/creer-annonce">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Annonce
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedListings().map((listing) => (
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
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  hasNextPage={currentPage < totalPages}
                  hasPrevPage={currentPage > 1}
                  isLoading={loading}
                />
              </>
            )}
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

            {/* Section Déconnexion */}
            <Card>
              <CardHeader>
                <CardTitle>Déconnexion</CardTitle>
                <CardDescription>
                  Déconnectez-vous de votre compte en toute sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Vous serez redirigé vers la page d'accueil après la déconnexion.
                  </p>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogues de confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        itemName={deleteDialog.item?.title}
        isLoading={isUpdating}
      />

      <EditConfirmDialog
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog({ isOpen: false, item: null })}
        onConfirm={confirmEdit}
        itemName={editDialog.item?.title}
        isLoading={isUpdating}
      />

      <RefreshConfirmDialog
        isOpen={refreshDialog.isOpen}
        onClose={() => setRefreshDialog({ isOpen: false, item: null })}
        onConfirm={confirmRefresh}
        itemName={refreshDialog.item?.title}
        isLoading={isUpdating}
      />

      <BoostConfirmDialog
        isOpen={boostDialog.isOpen}
        onClose={() => setBoostDialog({ isOpen: false, item: null })}
        onConfirm={confirmBoost}
        itemName={boostDialog.item?.title}
        isLoading={isUpdating}
      />
    </motion.div>
  );
};

export default ProfilePage;
