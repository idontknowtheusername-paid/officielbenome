
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Shield, 
  BarChart3, 
  Home, 
  MessageSquare, 
  Heart, 
  Settings, 
  LogOut,
  Loader2,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Eye,
  Users,
  Bell,
  Plus,
  Filter,
  Search,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  ListingCard, 
  ConversationCard, 
  ActivityFeed, 
  QuickActions,
  StatsCard,
  SocialLinks
} from '@/components/dashboard';
import { ListingCardSkeleton, MessageCardSkeleton, StatsCardSkeleton } from '@/components/ui/Skeleton';
import { DeleteConfirmDialog, EditConfirmDialog, RefreshConfirmDialog, BoostConfirmDialog } from '@/components/ui/ConfirmDialog';
import { userService, listingService, favoriteService, messageService } from '@/services';
import Pagination from '@/components/ui/Pagination';

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
        variant: "success",
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées.",
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
        variant: "success",
        title: "Mot de passe modifié",
        description: "Votre nouveau mot de passe est actif.",
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
      navigate(`/annonce/${listing.id}/modifier`);
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
        variant: "success",
        title: "Annonce supprimée",
        description: "L'annonce a été retirée de votre compte.",
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
      
      // Redirection vers page boost - pas de notification nécessaire
      
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
      
      // Pas de notification - action mineure
      
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

  // Handlers pour les actions des conversations
  const handleReplyMessage = (conversation) => {
    // Rediriger vers la page de messagerie avec la conversation sélectionnée
    navigate(`/messages?conversation=${conversation.id}`);
  };

  const handleArchiveMessage = async (conversation) => {
    try {
      // Marquer la conversation comme archivée
      await messageService.archiveConversation(conversation.id);
      
      // Mettre à jour l'état local
      const updatedMessages = messages.map(m => 
        m.id === conversation.id ? { ...m, is_archived: true } : m
      );
      setMessages(updatedMessages);
      
      // Feedback visuel suffit
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la conversation",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (conversation) => {
    try {
      // Marquer les messages comme lus
      await messageService.markMessagesAsRead(conversation.id);
      
      // Mettre à jour l'état local
      const updatedMessages = messages.map(m => 
        m.id === conversation.id 
          ? { 
              ...m, 
              messages: m.messages?.map(msg => ({ ...msg, is_read: true }))
            } 
          : m
      );
      setMessages(updatedMessages);
      
      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        unreadMessages: Math.max(0, prev.unreadMessages - 1)
      }));
      
      // Action automatique - pas de notification
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer les messages comme lus",
        variant: "destructive",
      });
    }
  };

  const handleStarMessage = async (conversation) => {
    try {
      // Basculer l'état favori
      const newStarredState = !conversation.starred;
      await messageService.toggleConversationStar(conversation.id, newStarredState);
      
      // Mettre à jour l'état local
      const updatedMessages = messages.map(m => 
        m.id === conversation.id ? { ...m, starred: newStarredState } : m
      );
      setMessages(updatedMessages);
      
      // Feedback visuel suffit (icône étoile)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut favori",
        variant: "destructive",
      });
    }
  };

  // Fonction de deconnexion
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast({
          variant: "success",
          title: "À bientôt !",
          description: "Vous êtes maintenant déconnecté.",
        });
        
        // Redirection vers la page d'accueil
        navigate('/');
      } else {
        throw new Error("Échec de la déconnexion");
      }
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
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
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto py-6 sm:py-8 px-4">
        {/* Header avec photo de profil */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center overflow-hidden shadow-lg">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                )}
              </div>
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {user?.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Compte vérifié
                </Badge>
                {user?.createdAt && (
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets - Mobile First avec scroll horizontal */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="relative">
            <TabsList className="flex overflow-x-auto gap-1 sm:gap-2 pb-2 sm:grid sm:w-full sm:grid-cols-5 sm:gap-1 sm:pb-0 bg-card backdrop-blur-sm border border-border rounded-lg p-1.5 shadow-sm scrollbar-hide">
              <TabsTrigger
                value="dashboard"
                className="flex-shrink-0 min-w-[110px] sm:min-w-0 min-h-[48px] flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
              >
                <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="text-sm">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="listings"
                className="flex-shrink-0 min-w-[130px] sm:min-w-0 min-h-[48px] flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
              >
                <Home className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="text-sm">Annonces</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex-shrink-0 min-w-[100px] sm:min-w-0 min-h-[48px] flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
              >
                <Heart className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="text-sm">Favoris</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex-shrink-0 min-w-[90px] sm:min-w-0 min-h-[48px] flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
              >
                <User className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="text-sm">Profil</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-shrink-0 min-w-[110px] sm:min-w-0 min-h-[48px] flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
              >
                <Shield className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="text-sm">Sécurité</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <StatsCardSkeleton key={i} />
                ))}
              </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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

            <div className="grid grid-cols-1 gap-6">
              <QuickActions stats={stats} />
              <SocialLinks />
            </div>
          </TabsContent>

          {/* Mes Annonces */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mes Annonces</h2>
                <p className="text-muted-foreground">Gérez vos annonces publiées</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white min-h-[44px] w-full sm:w-auto">
                <Link to="/creer-annonce" className="flex items-center justify-center">
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                  Nouvelle Annonce
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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

          {/* Favoris */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mes Favoris</h2>
                <p className="text-muted-foreground">Annonces que vous avez sauvegardées</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n'avez pas encore ajouté d'annonces à vos favoris
                </p>
                <Button asChild>
                  <Link to="/">
                    Découvrir des annonces
                  </Link>
                </Button>
              </div>
            ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {favorites.map((favorite) => (
                      <ListingCard
                        key={favorite.id}
                    listing={favorite.listings}
                    showActions={false}
                  />
                ))}
                  </div>
            )}
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
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          inputMode="text"
                          autoComplete="given-name"
                          className="pl-10 h-12"
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
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          inputMode="text"
                          autoComplete="family-name"
                          className="pl-10 h-12"
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
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        className="pl-10 h-12"
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
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="pl-10 h-12"
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
                    className="w-full min-h-[48px]"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        className="pl-10 h-12"
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
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        className="pl-10 h-12"
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
                    className="w-full min-h-[48px]"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      'Changer le mot de passe'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bouton Déconnexion */}
            <div className="mt-6">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full min-h-[48px]"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Se déconnecter
              </Button>
            </div>
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
