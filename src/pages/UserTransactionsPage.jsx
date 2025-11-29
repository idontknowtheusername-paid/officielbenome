import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ArrowLeft,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { transactionService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function UserTransactionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user transactions
  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ['userTransactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await transactionService.getUserTransactions(user.id);
    },
    enabled: !!user?.id
  });

  // Format amount with currency
  const formatAmount = (amount, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" /> Complétée
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" /> En attente
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Échouée
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="outline">
            <CreditCard className="mr-1 h-3 w-3" /> Remboursée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter transactions by status
  const filterTransactions = (status) => {
    if (!transactions) return [];
    if (status === 'all') return transactions;
    return transactions.filter(t => t.status === status);
  };

  // Calculate stats
  const stats = transactions ? {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    totalSpent: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  } : { total: 0, completed: 0, pending: 0, totalSpent: 0 };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour voir vos transactions.
          </p>
          <Button onClick={() => navigate('/connexion')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">💳 Mes Transactions</h1>
              <p className="text-muted-foreground">
                Historique complet de vos paiements et transactions
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complétées</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/50">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/50">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total dépensé</p>
                  <p className="text-xl font-bold">{formatAmount(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  Toutes ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Complétées ({stats.completed})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  En attente ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  Échouées
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Chargement...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-lg font-medium">Erreur de chargement</p>
                  <p className="text-sm text-muted-foreground">
                    Impossible de charger vos transactions
                  </p>
                </div>
              ) : filterTransactions(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Aucune transaction</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Vous n'avez pas encore effectué de transaction
                  </p>
                  <Button onClick={() => navigate('/premium')}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Découvrir Premium
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterTransactions(activeTab).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="rounded-full bg-primary/10 p-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {transaction.description || 'Transaction'}
                            </p>
                            {getStatusBadge(transaction.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Réf: {transaction.payment_reference || transaction.id.slice(0, 8)}
                            </span>
                            <span>•</span>
                            <span>
                              {transaction.created_at 
                                ? format(new Date(transaction.created_at), 'PPp', { locale: fr })
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Voir détails */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserTransactionsPage;
