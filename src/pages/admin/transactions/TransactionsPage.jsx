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
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { transactionService } from '@/services';
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
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch transactions with filters and pagination
  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ['adminTransactions', { searchTerm, statusFilter, typeFilter, sortBy, sortOrder, page, perPage }],
    queryFn: async () => {
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      
      return await transactionService.getAllTransactions(filters);
    }
  });

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
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
      case 'refund':
        return <Badge variant="outline">Remboursement</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Calculate stats
  const stats = transactions ? {
    totalRevenue: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    totalTransactions: transactions.length,
    successRate: transactions.length > 0 
      ? Math.round((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100)
      : 0,
    averageOrderValue: transactions.filter(t => t.status === 'completed').length > 0
      ? transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.filter(t => t.status === 'completed').length
      : 0
  } : {
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    averageOrderValue: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Gérez et surveillez toutes les transactions de la plateforme
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires total</p>
              <p className="text-2xl font-bold">{formatAmount(stats.totalRevenue)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-400">↑ 12% </span>
            vs période précédente
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-400">↑ 8% </span>
            vs période précédente
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
              <CheckCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
              <p className="text-2xl font-bold">{stats.successRate}%</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-400">↑ 2% </span>
            vs période précédente
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/50">
              <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valeur moyenne</p>
              <p className="text-2xl font-bold">{formatAmount(stats.averageOrderValue)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-400">↑ 5% </span>
            vs période précédente
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-md border bg-card p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une transaction..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
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
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Complétée</SelectItem>
                  <SelectItem value="failed">Échouée</SelectItem>
                  <SelectItem value="refunded">Remboursée</SelectItem>
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
                  <SelectItem value="refund">Remboursements</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trier par</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="amount">Montant</SelectItem>
                  <SelectItem value="reference">Référence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Utilisateur</TableHead>
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
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Chargement des transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center text-destructive">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Erreur lors du chargement des transactions
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Aucune transaction trouvée</p>
                    <p className="text-sm text-muted-foreground">
                      Les transactions apparaîtront ici une fois qu'elles seront créées.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.payment_reference || transaction.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {transaction.users?.first_name} {transaction.users?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.users?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(transaction.type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    {transaction.created_at ? format(new Date(transaction.created_at), 'PP', { locale: fr }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Affichage de <span className="font-medium">{(page - 1) * perPage + 1}</span> à{' '}
          <span className="font-medium">
            {Math.min(page * perPage, transactions?.length || 0)}
          </span>{' '}
          sur <span className="font-medium">{transactions?.length || 0}</span> transactions
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
            Page {page} sur {Math.ceil((transactions?.length || 0) / perPage)}
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
              onClick={() => setPage(Math.min(Math.ceil((transactions?.length || 0) / perPage), page + 1))}
              disabled={page === Math.ceil((transactions?.length || 0) / perPage)}
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(Math.ceil((transactions?.length || 0) / perPage))}
              disabled={page === Math.ceil((transactions?.length || 0) / perPage)}
            >
              <span className="sr-only">Aller à la dernière page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;