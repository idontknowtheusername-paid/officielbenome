import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { 
  getAdminListings, 
  approveListing, 
  rejectListing,
  deleteListing,
  featureListing
} from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
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

export default function ListingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch listings with filters and pagination
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminListings', { searchTerm, statusFilter, categoryFilter, sortBy, sortOrder, page, perPage }],
    queryFn: () => 
      getAdminListings({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sortBy,
        sortOrder,
        page,
        limit: perPage
      })
  });

  // Approve listing mutation
  const approveMutation = useMutation({
    mutationFn: (listingId) => approveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminListings']);
      toast({
        title: 'Succès',
        description: 'Annonce approuvée avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  // Reject listing mutation
  const rejectMutation = useMutation({
    mutationFn: ({ listingId, reason }) => rejectListing(listingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminListings']);
      toast({
        title: 'Succès',
        description: 'Annonce rejetée avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: (listingId) => deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminListings']);
      toast({
        title: 'Succès',
        description: 'Annonce supprimée avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la suppression',
        variant: 'destructive',
      });
    }
  });

  // Feature listing mutation
  const featureMutation = useMutation({
    mutationFn: (listingId) => featureListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminListings']);
      toast({
        title: 'Succès',
        description: 'Statut de mise en avant mis à jour',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  // Handle approve listing
  const handleApproveListing = (listingId) => {
    approveMutation.mutate(listingId);
  };

  // Handle reject listing
  const handleRejectListing = (listingId) => {
    const reason = prompt('Raison du rejet (optionnel):');
    rejectMutation.mutate({ listingId, reason: reason || 'Non conforme aux règles' });
  };

  // Handle delete listing
  const handleDeleteListing = (listingId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      deleteMutation.mutate(listingId);
    }
  };

  // Handle feature listing
  const handleFeatureListing = (listingId) => {
    featureMutation.mutate(listingId);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Annonces</h2>
          <p className="text-muted-foreground">
            Gérez et modérez les annonces de la plateforme
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Annonce
          </Button>
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
                  placeholder="Rechercher une annonce..."
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
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="real-estate">Immobilier</SelectItem>
                  <SelectItem value="automotive">Automobile</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
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
                    <SelectItem value="createdAt">Date de création</SelectItem>
                    <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="price">Prix</SelectItem>
                    <SelectItem value="views">Vues</SelectItem>
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
            <Button type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </form>
      </div>

      {/* Listings Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Annonce</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">
                  Erreur lors du chargement des annonces
                </TableCell>
              </TableRow>
            ) : data?.listings?.length > 0 ? (
              data.listings.map((listing) => (
                <TableRow key={listing._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center">
                        {listing.images?.[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="text-slate-400">📷</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Par {listing.user?.name || 'Utilisateur'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {listing.category === 'real-estate' ? 'Immobilier' :
                       listing.category === 'automotive' ? 'Automobile' :
                       listing.category === 'services' ? 'Services' : 'Général'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {listing.price ? `${listing.price.toLocaleString()} FCFA` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={listing.status === 'approved' ? 'success' : 
                              listing.status === 'rejected' ? 'destructive' : 'outline'}
                      className="capitalize"
                    >
                      {listing.status === 'pending' ? 'En attente' :
                       listing.status === 'approved' ? 'Approuvé' :
                       listing.status === 'rejected' ? 'Rejeté' :
                       listing.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {listing.createdAt ? format(new Date(listing.createdAt), 'PP', { locale: fr }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Voir les détails</span>
                        </DropdownMenuItem>
                        
                        {listing.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApproveListing(listing._id)}
                              disabled={approveMutation.isLoading}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Approuver</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRejectListing(listing._id)}
                              disabled={rejectMutation.isLoading}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Rejeter</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuItem
                          onClick={() => handleFeatureListing(listing._id)}
                          disabled={featureMutation.isLoading}
                        >
                          {listing.featured ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              <span>Retirer la mise en avant</span>
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              <span>Mettre en avant</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteListing(listing._id)}
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucune annonce trouvée
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
            sur <span className="font-medium">{data.totalCount}</span> annonces
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