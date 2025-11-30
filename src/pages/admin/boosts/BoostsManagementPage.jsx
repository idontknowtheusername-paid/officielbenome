import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Zap, 
  RefreshCw, 
  XCircle, 
  Calendar,
  User,
  Package,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { boostService } from '@/services';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function BoostsManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tous les boosts
  const { data: boosts, isLoading } = useQuery({
    queryKey: ['adminBoosts'],
    queryFn: async () => {
      // Récupérer tous les boosts via Supabase
      const { data, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (name, price, duration_days),
          listings (id, title, user_id),
          users (id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Mutation pour renouveler un boost
  const renewMutation = useMutation({
    mutationFn: async (boostId) => {
      return await boostService.renewBoost(boostId, null); // null = admin override
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBoosts']);
      toast({
        title: 'Boost renouvelé',
        description: 'Le boost a été prolongé avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour annuler un boost
  const cancelMutation = useMutation({
    mutationFn: async (boostId) => {
      return await boostService.cancelBoost(boostId, null); // null = admin override
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBoosts']);
      toast({
        title: 'Boost annulé',
        description: 'Le boost a été annulé avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-500', label: 'Actif' },
      pending: { color: 'bg-yellow-500', label: 'En attente' },
      expired: { color: 'bg-red-500', label: 'Expiré' },
      cancelled: { color: 'bg-gray-500', label: 'Annulé' }
    };
    const { color, label } = config[status] || config.pending;
    return <Badge className={color}>{label}</Badge>;
  };

  const filteredBoosts = boosts?.filter(boost => {
    const matchesSearch = 
      boost.listings?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boost.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || boost.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: boosts?.length || 0,
    active: boosts?.filter(b => b.status === 'active').length || 0,
    pending: boosts?.filter(b => b.status === 'pending').length || 0,
    expired: boosts?.filter(b => b.status === 'expired').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des Boosts</h1>
        <p className="text-muted-foreground">
          Gérez et prolongez les boosts des annonces
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Expirés</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par annonce ou utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="expired">Expirés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des boosts */}
      <Card>
        <CardHeader>
          <CardTitle>Boosts ({filteredBoosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p>Chargement...</p>
            </div>
          ) : filteredBoosts.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun boost trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBoosts.map((boost) => (
                <div
                  key={boost.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{boost.listings?.title || 'Annonce supprimée'}</h3>
                      {getStatusBadge(boost.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {boost.boost_packages?.name} ({boost.boost_packages?.duration_days}j)
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {boost.users?.first_name} {boost.users?.last_name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Expire: {boost.end_date ? format(new Date(boost.end_date), 'PPp', { locale: fr }) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(boost.status === 'active' || boost.status === 'expired') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => renewMutation.mutate(boost.id)}
                        disabled={renewMutation.isLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Prolonger
                      </Button>
                    )}
                    {boost.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Annuler ce boost ?')) {
                            cancelMutation.mutate(boost.id);
                          }
                        }}
                        disabled={cancelMutation.isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BoostsManagementPage;
