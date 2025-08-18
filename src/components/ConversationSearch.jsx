import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Star, 
  MessageSquare,
  User,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Archive
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

const ConversationSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch,
  filters = {},
  onFiltersChange,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Gérer la recherche
  const handleSearch = () => {
    onSearch(localSearchTerm);
  };

  // Gérer la recherche avec Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    const resetFilters = {
      status: 'all',
      type: 'all',
      dateRange: 'all',
      starred: false,
      unread: false
    };
    onFiltersChange(resetFilters);
  };

  // Appliquer les filtres
  const applyFilters = () => {
    onFiltersChange(filters);
    setShowFilters(false);
  };

  // Obtenir le nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.starred) count++;
    if (filters.unread) count++;
    return count;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Rechercher dans les conversations..."
          className="pl-10 pr-4 py-2"
        />
        {localSearchTerm && (
          <button
            onClick={() => {
              setLocalSearchTerm('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Bouton filtres */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter size={16} />
          <span>Filtres</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Panneau des filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border"
          >
            {/* Statut de la conversation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Statut
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Toutes', icon: MessageSquare },
                  { value: 'active', label: 'Actives', icon: MessageSquare },
                  { value: 'archived', label: 'Archivées', icon: Archive },
                  { value: 'blocked', label: 'Bloquées', icon: X }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFiltersChange({ ...filters, status: option.value })}
                    className={`flex items-center space-x-2 p-2 rounded-md text-sm transition-colors ${
                      filters.status === option.value
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                    }`}
                  >
                    <option.icon size={16} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type de conversation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Tous', icon: MessageSquare },
                  { value: 'listing', label: 'Annonces', icon: Tag },
                  { value: 'support', label: 'Support', icon: User },
                  { value: 'general', label: 'Général', icon: MessageSquare }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFiltersChange({ ...filters, type: option.value })}
                    className={`flex items-center space-x-2 p-2 rounded-md text-sm transition-colors ${
                      filters.type === option.value
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                    }`}
                  >
                    <option.icon size={16} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plage de dates */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dernière activité
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Toutes', icon: Calendar },
                  { value: 'today', label: 'Aujourd\'hui', icon: Clock },
                  { value: 'week', label: 'Cette semaine', icon: Calendar },
                  { value: 'month', label: 'Ce mois', icon: Calendar }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFiltersChange({ ...filters, dateRange: option.value })}
                    className={`flex items-center space-x-2 p-2 rounded-md text-sm transition-colors ${
                      filters.dateRange === option.value
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                    }`}
                  >
                    <option.icon size={16} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtres booléens */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.starred || false}
                  onChange={(e) => onFiltersChange({ ...filters, starred: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center space-x-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-foreground">Favoris uniquement</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.unread || false}
                  onChange={(e) => onFiltersChange({ ...filters, unread: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-blue-500" />
                  <span className="text-sm text-foreground">Non lues uniquement</span>
                </div>
              </label>
            </div>

            {/* Actions des filtres */}
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={applyFilters}
                className="flex-1"
                size="sm"
              >
                Appliquer
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
              >
                Réinitialiser
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres actifs affichés */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Statut: {filters.status}</span>
              <button
                onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                className="ml-1 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Type: {filters.type}</span>
              <button
                onClick={() => onFiltersChange({ ...filters, type: 'all' })}
                className="ml-1 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Date: {filters.dateRange}</span>
              <button
                onClick={() => onFiltersChange({ ...filters, dateRange: 'all' })}
                className="ml-1 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {filters.starred && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Star size={12} className="text-yellow-500" />
              <span>Favoris</span>
              <button
                onClick={() => onFiltersChange({ ...filters, starred: false })}
                className="ml-1 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {filters.unread && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <MessageSquare size={12} className="text-blue-500" />
              <span>Non lues</span>
              <button
                onClick={() => onFiltersChange({ ...filters, unread: false })}
                className="ml-1 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationSearch; 