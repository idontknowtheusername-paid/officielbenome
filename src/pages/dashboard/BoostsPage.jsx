import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  Users,
  ArrowRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { boostService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const BoostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [boosts, setBoosts] = useState([]);
  const [filteredBoosts, setFilteredBoosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (user) {
      loadUserBoosts();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortBoosts();
  }, [boosts, searchTerm, statusFilter, sortBy]);

  const loadUserBoosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await boostService.getBoostHistory(user.id);
      setBoosts(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des boosts');
      console.error('Erreur chargement boosts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBoosts = () => {
    let filtered = [...boosts];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(boost => 
        boost.listings?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boost.listing_boosts?.boost_packages?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(boost => {
        const status = getBoostStatus(boost).status;
        return status === statusFilter;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'price_high':
          return (b.listing_boosts?.boost_packages?.price || 0) - (a.listing_boosts?.boost_packages?.price || 0);
        case 'price_low':
          return (a.listing_boosts?.boost_packages?.price || 0) - (b.listing_boosts?.boost_packages?.price || 0);
        case 'expiring_soon':
          const aDays = getDaysRemaining(a.listing_boosts?.end_date);
          const bDays = getDaysRemaining(b.listing_boosts?.end_date);
          return aDays - bDays;
        default:
          return 0;
      }
    });

    setFilteredBoosts(filtered);
  };

  const handleRenewBoost = async (boostId) => {
    try {
      const result = await boostService.renewBoost(boostId, user.id);
      
      if (result.success) {
        toast({
          title: 'Boost renouvelé !',
          description: 'Votre boost a été prolongé avec succès.',
        });
        
        loadUserBoosts();
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors du renouvellement',
        variant: 'destructive',
      });
    }
  };

  const handleCancelBoost = async (boostId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce boost ?')) return;

    try {
      const result = await boostService.cancelBoost(boostId, user.id);
      
      if (result.success) {
        toast({
          title: 'Boost annulé',
          description: 'Votre boost a été annulé avec succès.',
        });
        
        loadUserBoosts();
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors de l\'annulation',
        variant: 'destructive',
      });
    }
  };

  const getBoostStatus = (boost) => {
    const now = new Date();
    const endDate = new Date(boost.listing_boosts?.end_date);
    
    if (boost.action === 'cancelled') {
      return { status: 'cancelled', label: 'Annulé', color: 'destructive' };
    }
    
    if (endDate < now) {
      return { status: 'expired', label: 'Expiré', color: 'secondary' };
    }
    
    if (boost.action === 'activated' || boost.action === 'renewed') {
      return { status: 'active', label: 'Actif', color: 'default' };
    }
    
    return { status: 'pending', label: 'En attente', color: 'outline' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getActiveBoosts = () => boosts.filter(boost => getBoostStatus(boost).status === 'active');
  const getExpiredBoosts = () => boosts.filter(boost => getBoostStatus(boost).status === 'expired');
  const getCancelledBoosts = () => boosts.filter(boost => getBoostStatus(boost).status === 'cancelled');
  const getPendingBoosts = () => boosts.filter(boost => getBoostStatus(boost).status === 'pending');

  const renderBoostCard = (boost, index) => {
    const status = getBoostStatus(boost);
    const packageData = boost.listing_boosts?.boost_packages;
    const listingData = boost.listings;
    const daysRemaining = getDaysRemaining(boost.listing_boosts?.end_date);

    return (
      <motion.div
        key={boost.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.status)}
                  <Badge variant={status.color} className="text-xs">
                    {status.label}
                  </Badge>
                  {status.status === 'active' && daysRemaining > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-1">
                  {listingData?.title || 'Annonce'}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {listingData?.category || 'Catégorie'} • {packageData?.name || 'Package'}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(packageData?.price || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {packageData?.duration_days || 0} jour{packageData?.duration_days > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Détails du boost */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Début : {formatDate(boost.created_at)}</span>
              </div>
              
              {boost.listing_boosts?.end_date && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Fin : {formatDate(boost.listing_boosts.end_date)}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Prix : {formatPrice(packageData?.price || 0)}</span>
              </div>
              
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Action : {boost.action}</span>
              </div>
            </div>

            {/* Actions selon le statut */}
            {status.status === 'active' && daysRemaining > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRenewBoost(boost.listing_boosts?.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Renouveler
                </Button>
                <Button
                  onClick={() => handleCancelBoost(boost.listing_boosts?.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
              </div>
            )}
            
            {status.status === 'active' && daysRemaining === 0 && (
              <div className="text-center py-2">
                <Badge variant="secondary" className="text-xs">
                  Expire aujourd'hui
                </Badge>
              </div>
            )}
            
            {status.status === 'expired' && (
              <div className="text-center py-2">
                <Button
                  onClick={() => navigate(`/booster-annonce/${boost.listing_id}`)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Booster à nouveau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
        <p className="text-muted-foreground mb-6">
          Vous devez être connecté pour accéder à vos boosts.
        </p>
        <Button onClick={() => navigate('/connexion')}>
          Se connecter
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={loadUserBoosts} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">🚀 Mes Boosts Premium</h1>
          <p className="text-muted-foreground">
            Gérez tous vos boosts et suivez leurs performances
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/marketplace')}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Découvrir des annonces
          </Button>
          
          <Button
            onClick={() => navigate('/creer-annonce')}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une annonce
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {getActiveBoosts().length}
            </div>
            <p className="text-sm text-muted-foreground">Boosts actifs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {getExpiredBoosts().length}
            </div>
            <p className="text-sm text-muted-foreground">Boosts expirés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {boosts.length}
            </div>
            <p className="text-sm text-muted-foreground">Total des boosts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {boosts.reduce((sum, boost) => sum + (boost.listing_boosts?.boost_packages?.price || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">FCFA investis</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre d'annonce ou package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
                <SelectItem value="cancelled">Annulés</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="price_high">Prix élevé</SelectItem>
                <SelectItem value="price_low">Prix bas</SelectItem>
                <SelectItem value="expiring_soon">Expire bientôt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs pour organiser les boosts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tous ({filteredBoosts.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Actifs ({getActiveBoosts().length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            En attente ({getPendingBoosts().length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Expirés ({getExpiredBoosts().length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Annulés ({getCancelledBoosts().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredBoosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBoosts.map((boost, index) => renderBoostCard(boost, index))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Aucun boost trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Aucun boost ne correspond à vos critères de recherche.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('recent');
              }} variant="outline">
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {getActiveBoosts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getActiveBoosts().map((boost, index) => renderBoostCard(boost, index))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Aucun boost actif</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez actuellement aucun boost en cours.
              </p>
              <Button onClick={() => navigate('/marketplace')}>
                Découvrir des annonces à booster
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {getPendingBoosts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getPendingBoosts().map((boost, index) => renderBoostCard(boost, index))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold mb-2">Aucun boost en attente</h3>
              <p className="text-muted-foreground">
                Tous vos boosts sont actifs ou ont été traités.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          {getExpiredBoosts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getExpiredBoosts().map((boost, index) => renderBoostCard(boost, index))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Aucun boost expiré</h3>
              <p className="text-muted-foreground">
                Excellent ! Tous vos boosts sont actifs.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {getCancelledBoosts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCancelledBoosts().map((boost, index) => renderBoostCard(boost, index))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Aucun boost annulé</h3>
              <p className="text-muted-foreground">
                Vous n'avez annulé aucun boost.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BoostsPage;
