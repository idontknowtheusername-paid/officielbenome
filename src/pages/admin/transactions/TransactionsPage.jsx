import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink
} from 'lucide-react';
import { getAdminTransactions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function TransactionsPage() {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch transactions with filters and pagination
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminTransactions', { searchTerm, statusFilter, typeFilter, sortBy, sortOrder, page, perPage }],
    queryFn: () => 
      getAdminTransactions({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sortBy,
        sortOrder,
        page,
        limit: perPage
      })
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

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
        return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> Complétée</Badge>;
      case 'pending':
        return <Badge variant="warning"><Clock className="mr-1 h-3 w-3" /> En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Échouée</Badge>;
      case 'refunded':
        return <Badge variant="outline"><CreditCard className="mr-1 h-3 w-3" /> Remboursée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case 'purchase':
        return <Badge variant="default">Achat</Badge>;
      case 'subscription':
        return <Badge variant="secondary">Abonnement</Badge>;
      case 'withdrawal':
        return <Badge variant="outline">Retrait</Badge>;
      case 'refund':
        return <Badge variant="outline">Remboursement</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Transactions</h2>
          <p className="text-muted-foreground">
            Suivez et gérez toutes les transactions de la plateforme
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exporter les données
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires total</p>
              <p className="text-2xl font-bold">{formatAmount(data?.stats?.totalRevenue || 0)}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className={data?.stats?.revenueChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {data?.stats?.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(data?.stats?.revenueChange || 0)}% 
            </span>
            vs période précédente
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{data?.stats?.totalTransactions || 0}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className={data?.stats?.transactionsChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {data?.stats?.transactionsChange >= 0 ? '↑' : '↓'} {Math.abs(data?.stats?.transactionsChange || 0)}%
            </span>{' '}
            vs période précédente
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
              <p className="text-2xl font-bold">{data?.stats?.successRate || 0}%</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
              <CheckCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className={data?.stats?.successRateChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {data?.stats?.successRateChange >= 0 ? '↑' : '↓'} {Math.abs(data?.stats?.successRateChange || 0)}%
            </span>{' '}
            vs période précédente
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valeur moyenne</p>
              <p className="text-2xl font-bold">{formatAmount(data?.stats?.averageOrderValue || 0)}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/50">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className={data?.stats?.aovChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {data?.stats?.aovChange >= 0 ? '↑' : '↓'} {Math.abs(data?.stats?.aovChange || 0)}%
            </span>{' '}
            vs période précédente
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-md border bg-card p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher une transaction..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Complétées</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="failed">Échouées</SelectItem>
                  <SelectItem value="refunded">Remboursées</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="purchase">Achats</SelectItem>
                  <SelectItem value="subscription">Abonnements</SelectItem>
                  <SelectItem value="withdrawal">Retraits</SelectItem>
                  <SelectItem value="refund">Remboursements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Trier par</label>
              <div className="flex space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="amount">Montant</SelectItem>
                    <SelectItem value="reference">Référence</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <Button type="submit" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Appliquer les filtres
            </Button>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                  Erreur lors du chargement des transactions
                </TableCell>
              </TableRow>
            ) : data?.transactions?.length > 0 ? (
              data.transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{transaction.reference}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.paymentMethod || 'Carte bancaire'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.user?.name || 'Anonyme'}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.user?.email || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatAmount(transaction.amount, transaction.currency)}
                    {transaction.fee > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Frais: {formatAmount(transaction.fee, transaction.currency)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(transaction.type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(transaction.createdAt), 'PPp', { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Voir les détails</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Affichage de <span className="font-medium">{(page - 1) * perPage + 1}</span> à{' '}
            <span className="font-medium">
              {Math.min(page * perPage, data.totalCount)}
            </span>{' '}
            sur <span className="font-medium">{data.totalCount}</span> transactions
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Lignes par page</p>
              <Select
                value={`${perPage}`}
                onValueChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={perPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {page} sur {data.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <span className="sr-only">Aller à la première page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <span className="sr-only">Page précédente</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                disabled={page === data.totalPages}
              >
                <span className="sr-only">Page suivante</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(data.totalPages)}
                disabled={page === data.totalPages}
              >
                <span className="sr-only">Aller à la dernière page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;