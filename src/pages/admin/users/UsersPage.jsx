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
  UserCheck,
  UserX,
  Shield,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { 
  getAdminUsers, 
  updateUserStatus, 
  deleteUser,
  updateUserRole 
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

function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch users with filters and pagination
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminUsers', { searchTerm, statusFilter, roleFilter, sortBy, sortOrder, page, perPage }],
    queryFn: () => 
      getAdminUsers({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        sortBy,
        sortOrder,
        page,
        limit: perPage
      })
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast({
        title: 'Succès',
        description: 'Statut utilisateur mis à jour avec succès',
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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast({
        title: 'Succès',
        description: 'Utilisateur supprimé avec succès',
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

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast({
        title: 'Succès',
        description: 'Rôle utilisateur mis à jour avec succès',
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

  // Handle status change
  const handleStatusChange = (userId, newStatus) => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  // Handle delete user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      deleteUserMutation.mutate(userId);
    }
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
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les utilisateurs de la plateforme
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
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
                  placeholder="Rechercher un utilisateur..."
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
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="vendor">Vendeur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="moderator">Modérateur</SelectItem>
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
                    <SelectItem value="createdAt">Date d'inscription</SelectItem>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="lastLogin">Dernière connexion</SelectItem>
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

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscrit le</TableHead>
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
                  Erreur lors du chargement des utilisateurs
                </TableCell>
              </TableRow>
            ) : data?.users?.length > 0 ? (
              data.users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-700">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name || 'Utilisateur sans nom'}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user._id?.substring(0, 6)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user._id, value)}
                      disabled={updateRoleMutation.isLoading}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="vendor">Vendeur</SelectItem>
                        <SelectItem value="moderator">Modérateur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === 'active' ? 'success' : 
                              user.status === 'suspended' ? 'destructive' : 'outline'}
                      className="capitalize"
                    >
                      {user.status === 'active' ? 'Actif' : 
                       user.status === 'suspended' ? 'Suspendu' : 
                       user.status === 'pending' ? 'En attente' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'PP', { locale: fr }) : 'N/A'}
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
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Envoyer un message</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(
                            user._id, 
                            user.status === 'active' ? 'suspended' : 'active'
                          )}
                          disabled={updateStatusMutation.isLoading}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              <span>Suspendre</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              <span>Activer</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deleteUserMutation.isLoading}
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
                  Aucun utilisateur trouvé
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
            sur <span className="font-medium">{data.totalCount}</span> utilisateurs
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
export default UsersPage;