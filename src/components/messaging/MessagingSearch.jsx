import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  MessageSquare, 
  Star, 
  Archive,
  Clock,
  User,
  Home
} from 'lucide-react';

const MessagingSearch = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  onClear,
  totalCount = 0,
  unreadCount = 0,
  starredCount = 0,
  archivedCount = 0
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'Toutes', icon: MessageSquare, count: totalCount },
    { key: 'unread', label: 'Non lues', icon: Clock, count: unreadCount },
    { key: 'starred', label: 'Favoris', icon: Star, count: starredCount },
    { key: 'archived', label: 'Archivées', icon: Archive, count: archivedCount }
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Barre de recherche */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher des conversations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtres compacts */}
      <div className="flex space-x-2 mb-3">
        {filterOptions.map((filter) => (
          <Button
            key={filter.key}
            variant={filterType === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className="flex-1 flex items-center justify-center space-x-1"
          >
            <filter.icon className="h-3 w-3" />
            <span className="text-xs">{filter.label}</span>
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Filtres avancés (optionnels) */}
      {showFilters && (
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              Par utilisateur
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Home className="h-3 w-3 mr-1" />
              Par annonce
            </Button>
          </div>
        </div>
      )}

      {/* Bouton pour afficher/masquer les filtres avancés */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <Filter className="h-3 w-3 mr-1" />
          {showFilters ? 'Masquer' : 'Plus de filtres'}
        </Button>
      </div>
    </div>
  );
};

export default MessagingSearch;
