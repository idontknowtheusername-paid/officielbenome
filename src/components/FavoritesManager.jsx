import React, { useState, useEffect } from 'react';
import { Heart, HeartOff, Tag, Search, Filter, Grid, List, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from './ListingCard';

const FavoritesManager = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Charger les favoris
  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      // Recuperer les annonces correspondantes
      const listingIds = favoritesData.map(f => f.listing_id);
      if (listingIds.length > 0) {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select(`
            *,
            user:users(id, full_name, avatar_url),
            category:categories(name, slug)
          `)
          .in('id', listingIds)
          .eq('status', 'approved');

        if (listingsError) throw listingsError;

        // Combiner les donnees
        const combinedData = favoritesData.map(favorite => {
          const listing = listingsData.find(l => l.id === favorite.listing_id);
          return {
            ...favorite,
            listing
          };
        }).filter(item => item.listing); // Filtrer les annonces supprimees

        setFavorites(combinedData);
        setListings(listingsData);
      } else {
        setFavorites([]);
        setListings([]);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter aux favoris
  const addToFavorites = async (listingId, notes = '', tags = []) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          listing_id: listingId,
          notes,
          tags
        }])
        .select()
        .single();

      if (error) throw error;

      // Recharger les favoris
      await loadFavorites();
      return data;
    } catch (error) {
      console.error('Erreur ajout favoris:', error);
      throw error;
    }
  };

  // Supprimer des favoris
  const removeFromFavorites = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Erreur suppression favoris:', error);
    }
  };

  // Mettre a jour les notes
  const updateNotes = async (favoriteId, notes) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .update({ notes })
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => 
        prev.map(f => 
          f.id === favoriteId ? { ...f, notes } : f
        )
      );
      setEditingNote(null);
      setNoteText('');
    } catch (error) {
      console.error('Erreur mise à jour notes:', error);
    }
  };

  // Mettre a jour les tags
  const updateTags = async (favoriteId, tags) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .update({ tags })
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => 
        prev.map(f => 
          f.id === favoriteId ? { ...f, tags } : f
        )
      );
    } catch (error) {
      console.error('Erreur mise à jour tags:', error);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // Filtrer les favoris
  const filteredFavorites = favorites.filter(favorite => {
    const listing = favorite.listing;
    if (!listing) return false;

    // Filtre par recherche
    const matchesSearch = searchTerm === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par tags
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => favorite.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Obtenir tous les tags uniques
  const allTags = [...new Set(
    favorites.flatMap(f => f.tags || [])
  )].sort();

  // Obtenir les statistiques
  const stats = {
    total: favorites.length,
    withNotes: favorites.filter(f => f.notes).length,
    withTags: favorites.filter(f => f.tags && f.tags.length > 0).length,
    categories: [...new Set(favorites.map(f => f.listing?.category?.name).filter(Boolean))]
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connectez-vous pour voir vos favoris</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
            <p className="text-gray-600 mt-2">
              {stats.total} annonce(s) sauvegardée(s)
            </p>
          </div>
          
          {/* Statistiques */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{stats.withNotes} avec notes</span>
            <span>{stats.withTags} avec tags</span>
            <span>{stats.categories.length} catégories</span>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher dans vos favoris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedTags.length > 0 ? selectedTags[0] : ''}
              onChange={(e) => setSelectedTags(e.target.value ? [e.target.value] : [])}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Mode d'affichage */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos favoris...</p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm || selectedTags.length > 0 ? 'Aucun résultat' : 'Aucun favori'}
          </h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || selectedTags.length > 0 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez à ajouter des annonces à vos favoris'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Annonce */}
              <div className="p-4">
                <ListingCard listing={favorite.listing} compact={viewMode === 'list'} />
              </div>

              {/* Notes et tags */}
              <div className="px-4 pb-4">
                {/* Tags */}
                {favorite.tags && favorite.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {favorite.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div className="mb-3">
                  {editingNote === favorite.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Ajouter une note..."
                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                        rows="2"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateNotes(favorite.id, noteText)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(null);
                            setNoteText('');
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-600 flex-1">
                        {favorite.notes || 'Aucune note'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingNote(favorite.id);
                          setNoteText(favorite.notes || '');
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Ajouté le {new Date(favorite.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <HeartOff size={14} />
                    <span>Retirer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesManager; 