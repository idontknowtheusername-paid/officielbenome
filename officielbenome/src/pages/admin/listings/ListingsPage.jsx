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
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Star,
  TrendingUp,
  Tag
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

export function ListingsPage() {
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
    mutationFn: ({ listingId, featured }) => featureListing(listingId, featured),
    onSuccess: (_, { featured }) => {
      queryClient.invalidateQueries(['adminListings']);
      toast({
        title: 'Succès',
        description: featured ? 'Annonce mise en avant' : 'Annonce retirée des mises en avant',
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
  const handleApprove = (listingId) => {
    approveMutation.mutate(listingId);
  };

  // Handle reject listing
  const handleReject = (listingId) => {
    const reason = prompt('Veuillez indiquer la raison du rejet :');
    if (reason) {
      rejectMutation.mutate({ listingId, reason });
    }
  };

  // Handle delete listing
  const handleDelete = (listingId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      deleteMutation.mutate(listingId);
    }
  };

  // Handle feature listing
  const handleFeature = (listingId, currentlyFeatured) => {
    featureMutation.mutate({ listingId, featured: !currentlyFeatured });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Sample categories - replace with your actual categories
  const categories = [
    'Immobilier',
    'Véhicules',
    'Emploi',
    'Mode',
    'Multimédia',
    'Loisirs',
    'Services',
    'Autres'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Annonces</h2>
          <p className="text-muted-foreground">
            Modérez et gérez les annonces de la plateforme
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
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
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
              <TableHead>Vendeur</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
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
                      <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
                        {listing.images?.[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Tag className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium line-clamp-1">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {listing.category} • {listing.views || 0} vues
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{listing.seller?.name || 'Anonyme'}</div>
                      <div className="text-muted-foreground">{listing.seller?.email || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {listing.price ? (
                      <span className="font-medium">{listing.price.toLocaleString()} FCFA</span>
                    ) : (
                      <span className="text-muted-foreground">Non spécifié</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {listing.status === 'pending' ? (
                      <Badge variant="warning">
                        <Clock className="mr-1 h-3 w-3" /> En attente
                      </Badge>
                    ) : listing.status === 'approved' ? (
                      <Badge variant="success">
                        <Check className="mr-1 h-3 w-3" /> Approuvé
                      </Badge>
                    ) : listing.status === 'rejected' ? (
                      <Badge variant="destructive">
                        <X className="mr-1 h-3 w-3" /> Rejeté
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {listing.status}
                      </Badge>
                    )}
                    {listing.featured && (
                      <Badge variant="default" className="ml-2 bg-purple-500">
                        <Star className="mr-1 h-3 w-3" /> À la une
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(listing.createdAt), 'PP', { locale: fr })}</div>
                      <div className="text-muted-foreground">
                        {format(new Date(listing.updatedAt), 'PP', { locale: fr })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {listing.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleApprove(listing._id)}
                                disabled={approveMutation.isLoading}
                              >
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                <span>Approuver</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleReject(listing._id)}
                                disabled={rejectMutation.isLoading}
                              >
                                <X className="mr-2 h-4 w-4 text-red-500" />
                                <span>Rejeter</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleFeature(listing._id, listing.featured)}
                            disabled={featureMutation.isLoading}
                          >
                            {listing.featured ? (
                              <>
                                <X className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Retirer des mises en avant</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Mettre en avant</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(listing._id)}
                            disabled={deleteMutation.isLoading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Supprimer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
