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
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Save,
  X
} from 'lucide-react';
import { 
  categoryService
} from '@/services';
import { useToast } from '@/components/ui/use-toast';
import { quickExport } from '@/utils/exportUtils';
import { categorySchema, validateWithCustomErrors } from '@/utils/validationSchemas';
import { FieldValidationError, useValidationErrors } from '@/components/ui/ValidationError';
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State pour les filtres et pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // State pour le formulaire de création/édition
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_category: 'marketplace',
    description: '',
    icon: '',
    sort_order: 0
  });
  
  // State pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({});
  const { getFieldError, hasFieldError, clearFieldError } = useValidationErrors(validationErrors);

  // Récupérer les catégories avec filtres et pagination
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['adminCategories', { searchTerm, typeFilter, statusFilter, sortBy, sortOrder, page, perPage }],
    queryFn: async () => {
      return await categoryService.getAllCategories();
    }
  });

  // Mutation pour créer une catégorie
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => categoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCategories']);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Succès',
        description: 'Catégorie créée avec succès',
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

  // Mutation pour mettre à jour une catégorie
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCategories']);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({
        title: 'Succès',
        description: 'Catégorie mise à jour avec succès',
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

  // Mutation pour supprimer une catégorie
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => categoryService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCategories']);
      toast({
        title: 'Succès',
        description: 'Catégorie supprimée avec succès',
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

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Gérer le tri
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Gérer la pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Gérer le changement de page
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Ouvrir le dialogue d'édition
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_category: category.parent_category,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order || 0
    });
    setValidationErrors({});
    setIsEditDialogOpen(true);
  };

  // Ouvrir le dialogue de création
  const handleCreate = () => {
    resetForm();
    setValidationErrors({});
    setIsCreateDialogOpen(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      parent_category: 'marketplace',
      description: '',
      icon: '',
      sort_order: 0
    });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valider les données avec Zod
    const validation = validateWithCustomErrors(categorySchema, formData);
    
    if (!validation.success) {
      // Afficher les erreurs de validation
      Object.values(validation.errors).forEach(error => {
        toast({
          title: 'Erreur de validation',
          description: error,
          variant: 'destructive',
        });
      });
      return;
    }
    
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: validation.data
      });
    } else {
      createCategoryMutation.mutate(validation.data);
    }
  };

  // Gérer la suppression
  const handleDelete = (categoryId) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  // Fonction d'export des catégories
  const handleExport = () => {
    try {
      if (!categories || categories.length === 0) {
        toast({
          title: 'Aucune donnée',
          description: 'Aucune catégorie à exporter',
          variant: 'destructive',
        });
        return;
      }

      quickExport.categories(categories, 'categories-maximarket');
      toast({
        title: 'Export réussi',
        description: 'Liste des catégories exportée en CSV',
      });
    } catch (error) {
      toast({
        title: 'Erreur d\'export',
        description: error.message || 'Impossible d\'exporter les données',
        variant: 'destructive',
      });
    }
  };

  // Filtrer et trier les catégories
  const filteredCategories = categories ? categories
    .filter(category => {
      if (searchTerm && !category.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (typeFilter !== 'all' && category.parent_category !== typeFilter) return false;
      if (statusFilter !== 'all' && category.is_active !== (statusFilter === 'active')) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }) : [];

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Générer le slug automatiquement
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  // Mettre à jour le slug quand le nom change
  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
    
    // Valider le champ en temps réel
    const validation = validateWithCustomErrors(categorySchema, { ...formData, name });
    if (!validation.success) {
      setValidationErrors(prev => ({
        ...prev,
        name: validation.errors.name
      }));
    } else {
      clearFieldError('name', setValidationErrors);
    }
  };

  // Valider un champ en temps réel
  const validateField = (fieldName, value) => {
    const fieldData = { ...formData, [fieldName]: value };
    const validation = validateWithCustomErrors(categorySchema, fieldData);
    
    if (!validation.success && validation.errors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: validation.errors[fieldName]
      }));
    } else {
      clearFieldError(fieldName, setValidationErrors);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erreur lors du chargement des catégories</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Catégories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les catégories et sous-catégories de votre marketplace
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleExport()}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
          
          <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Catégorie
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Recherche</Label>
            <Input
              id="search"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={handleSearch}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="typeFilter">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="real_estate">Immobilier</SelectItem>
                <SelectItem value="automobile">Automobile</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="statusFilter">Statut</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="perPage">Par page</Label>
            <Select value={perPage.toString()} onValueChange={(value) => handlePerPageChange(parseInt(value))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tableau des catégories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Nom
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('parent_category')}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Type
                    {sortBy === 'parent_category' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('sort_order')}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Ordre
                    {sortBy === 'sort_order' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {category.icon && <span className="text-lg">{category.icon}</span>}
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.parent_category === 'real_estate' && 'Immobilier'}
                      {category.parent_category === 'automobile' && 'Automobile'}
                      {category.parent_category === 'services' && 'Services'}
                      {category.parent_category === 'marketplace' && 'Marketplace'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-500">
                    {category.slug}
                  </TableCell>
                  <TableCell>{category.sort_order || 0}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "success" : "secondary"}>
                      {category.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredCategories.length)} sur {filteredCategories.length} résultats
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} sur {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogue de création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer une nouvelle catégorie
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                              <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder="Nom de la catégorie"
                    required
                    className={hasFieldError('name') ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <FieldValidationError error={getFieldError('name')} />
                </div>
              
                              <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    onBlur={(e) => validateField('slug', e.target.value)}
                    placeholder="slug-categorie"
                    required
                    className={hasFieldError('slug') ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <FieldValidationError error={getFieldError('slug')} />
                </div>
            </div>
            
            <div>
              <Label htmlFor="parent_category">Type parent *</Label>
              <Select 
                value={formData.parent_category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_estate">Immobilier</SelectItem>
                  <SelectItem value="automobile">Automobile</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                onBlur={(e) => validateField('description', e.target.value)}
                placeholder="Description de la catégorie"
                rows={3}
                className={hasFieldError('description') ? 'border-red-500 focus:border-red-500' : ''}
              />
              <FieldValidationError error={getFieldError('description')} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🏠"
                />
              </div>
              
              <div>
                <Label htmlFor="sort_order">Ordre de tri</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  onBlur={(e) => validateField('sort_order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={hasFieldError('sort_order') ? 'border-red-500 focus:border-red-500' : ''}
                />
                <FieldValidationError error={getFieldError('sort_order')} />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isLoading}>
                {createCategoryMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nom de la catégorie"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="slug-categorie"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-parent_category">Type parent *</Label>
              <Select 
                value={formData.parent_category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_estate">Immobilier</SelectItem>
                  <SelectItem value="automobile">Automobile</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la catégorie"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-icon">Icône</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🏠"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-sort_order">Ordre de tri</Label>
                <Input
                  id="edit-sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isLoading}>
                {updateCategoryMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
