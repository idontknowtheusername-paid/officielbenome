import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Search, 
  X, 
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset,
  categories = [],
  isLoading = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Effacer</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1"
            >
              {isExpanded ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              <span>{isExpanded ? 'Réduire' : 'Filtres'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Recherche */}
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher dans les titres et descriptions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <Label htmlFor="sort">Trier par</Label>
              <Select
                value={filters.sort || ''}
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Plus récent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at_desc">Plus récent</SelectItem>
                  <SelectItem value="created_at_asc">Plus ancien</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="views_desc">Plus de vues</SelectItem>
                  <SelectItem value="updated_at_desc">Dernière modification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres de prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Prix minimum</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Prix maximum</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Aucune limite"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="featured">En vedette</Label>
              <Select
                value={filters.featured || ''}
                onValueChange={(value) => handleFilterChange('featured', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="true">En vedette uniquement</SelectItem>
                  <SelectItem value="false">Non en vedette</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boosted">Boostées</Label>
              <Select
                value={filters.boosted || ''}
                onValueChange={(value) => handleFilterChange('boosted', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value="true">Boostées uniquement</SelectItem>
                  <SelectItem value="false">Non boostées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Période</Label>
              <Select
                value={filters.dateRange || ''}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toute période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toute période</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground mr-2">Filtres actifs :</span>
              {Object.entries(filters).map(([key, value]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="flex items-center space-x-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => clearFilter(key)}
                >
                  <span>{key}: {value}</span>
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters; 