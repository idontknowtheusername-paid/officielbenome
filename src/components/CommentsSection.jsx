import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import CommentCard from '@/components/CommentCard';
import CommentForm from '@/components/CommentForm';
import RatingStars from '@/components/ui/RatingStars';
import { 
  MessageSquare, 
  Star, 
  Filter, 
  SortAsc, 
  SortDesc,
  Plus,
  X,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CommentsSection = ({ 
  listingId, 
  listing, 
  className = '',
  showStats = true,
  showFilters = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    rating: null,
    verifiedOnly: false,
    sort: 'created_at',
    order: 'desc'
  });

  const {
    comments,
    loading,
    error,
    pagination,
    stats,
    addComment,
    updateComment,
    deleteComment,
    reportComment,
    changeFilters,
    changePage,
    refresh
  } = useComments(listingId, filters);

  const handleAddComment = async (commentData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter un commentaire.",
        variant: "destructive",
      });
      return;
    }

    const result = await addComment({
      ...commentData,
      user_id: user.id
    });

    if (result.error) {
      return result;
    }

    setShowForm(false);
    return result;
  };

  const handleUpdateComment = async (commentId, updates) => {
    const result = await updateComment(commentId, updates);
    return result;
  };

  const handleDeleteComment = async (commentId) => {
    const result = await deleteComment(commentId);
    return result;
  };

  const handleReplyComment = async (commentData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour répondre.",
        variant: "destructive",
      });
      return { error: "Connexion requise" };
    }

    const result = await addComment({
      ...commentData,
      user_id: user.id
    });

    return result;
  };

  const handleReportComment = async (commentId, reportData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour signaler un commentaire.",
        variant: "destructive",
      });
      return { error: "Connexion requise" };
    }

    const result = await reportComment(commentId, {
      ...reportData,
      reporter_id: user.id
    });

    return result;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    changeFilters({ ...filters, ...newFilters });
  };

  const getRatingDistribution = () => {
    if (!stats?.rating_distribution) return null;
    
    const total = stats.total_comments;
    if (total === 0) return null;

    return Object.entries(stats.rating_distribution).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  const getAverageRating = () => {
    return stats?.average_rating ? parseFloat(stats.average_rating.toFixed(1)) : 0;
  };

  if (error) {
    return (
      <Card className={cn('mt-8', className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Impossible de charger les commentaires</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Commentaires et avis</h2>
          {stats?.total_comments > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stats.total_comments} commentaire{stats.total_comments > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {user && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                <span>Annuler</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Ajouter un commentaire</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Statistiques */}
      {showStats && stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Statistiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {getAverageRating()}
                </div>
                <div className="text-sm text-muted-foreground">Note moyenne</div>
                <RatingStars rating={Math.round(getAverageRating())} readonly size="sm" />
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.total_comments}
                </div>
                <div className="text-sm text-muted-foreground">Total commentaires</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.verified_purchases}
                </div>
                <div className="text-sm text-muted-foreground">Achats vérifiés</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.rating_distribution?.[5] || 0}
                </div>
                <div className="text-sm text-muted-foreground">5 étoiles</div>
              </div>
            </div>

            {/* Distribution des notes */}
            {getRatingDistribution() && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Répartition des notes</h4>
                <div className="space-y-1">
                  {getRatingDistribution().reverse().map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-xs">{rating}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'ajout */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <CommentForm
                  listingId={listingId}
                  onSubmit={handleAddComment}
                  onCancel={() => setShowForm(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres :</span>
              </div>

              {/* Filtre par note */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Note :</span>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => handleFilterChange({ 
                    rating: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="">Toutes</option>
                  <option value="5">5 étoiles</option>
                  <option value="4">4 étoiles</option>
                  <option value="3">3 étoiles</option>
                  <option value="2">2 étoiles</option>
                  <option value="1">1 étoile</option>
                </select>
              </div>

              {/* Toggle achats vérifiés */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onChange={(e) => handleFilterChange({ verifiedOnly: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="verifiedOnly" className="text-sm text-muted-foreground">
                  Achats vérifiés uniquement
                </label>
              </div>

              {/* Tri */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Tri :</span>
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleFilterChange({ sort, order });
                  }}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="created_at-desc">Plus récents</option>
                  <option value="created_at-asc">Plus anciens</option>
                  <option value="rating-desc">Meilleures notes</option>
                  <option value="rating-asc">Moins bonnes notes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-muted-foreground">Chargement des commentaires...</p>
          </div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun commentaire</h3>
              <p className="text-muted-foreground mb-4">
                Soyez le premier à laisser un commentaire sur cette annonce !
              </p>
              {user && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un commentaire
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onReply={handleReplyComment}
                onReport={handleReportComment}
              />
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Précédent
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message de connexion */}
      {!user && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour ajouter un commentaire et noter cette annonce.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentsSection;
